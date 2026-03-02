from flask import Blueprint, request, jsonify, session
from models import User, Transaction, FlaggedTransaction
from services.fraud_detector import fraud_detector
from services.gemini_service import gemini_service
from utils.helpers import hours_since
from config import Config
from datetime import datetime
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/create', methods=['POST'])
def create_transaction():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
        
    data = request.get_json()
    try:
        amount = float(data.get('amount', 0))
        location = int(data.get('location', 0))
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid amount or location'}), 400
        
    if amount <= 0 or amount > Config.MAX_TX_AMOUNT:
        return jsonify({'error': f'Amount must be between 1 and {Config.MAX_TX_AMOUNT}'}), 400
        
    if not (0 <= location <= 4):
        return jsonify({'error': 'Location must be between 0 and 4'}), 400
        
    user = User.find_by_id(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    if user.get('balance', 0.0) < amount:
        return jsonify({'error': 'Insufficient balance'}), 400
        
    recent = Transaction.get_recent(user_id, limit=9)
    
    # Calculate time_gap
    if recent:
        time_gap = hours_since(recent[-1].get('timestamp'))
    else:
        time_gap = 24.0
        
    current_tx = {
        'amount': amount,
        'hour': datetime.now().hour,
        'location': location,
        'time_gap': time_gap
    }
    
    # Check if we have enough history to run the model
    if len(recent) < Config.MIN_TRANSACTIONS:
        Transaction.create(user_id, amount, location, time_gap, current_tx['hour'], blocked=False)
        User.update_balance(user_id, -amount)
        
        # Fetch updated balance
        user = User.find_by_id(user_id)
        return jsonify({
            'status': 'success',
            'message': 'Transaction successful (building fraud history)',
            'balance': user.get('balance'),
            'blocked': False,
            'fraud_probability': 0.0
        }), 200
    else:
        try:
            is_fraud, probability, risk_factors = fraud_detector.evaluate(recent, current_tx)
        except Exception as e:
            logger.error(f"Fraud detection error: {e}")
            is_fraud, probability, risk_factors = False, 0.0, []
            
        if is_fraud:
            # Count previous flags
            flagged_count = FlaggedTransaction.collection.count_documents({'user_id': user_id})
            
            # Prepare profile for Gemini
            profile = fraud_detector.user_profile_for_gemini(user, recent, flagged_count)
            
            # Generate explanation
            explanation = gemini_service.generate_fraud_explanation(current_tx, profile, risk_factors, probability)
            
            # Create transaction record (blocked)
            tx_id = Transaction.create(
                user_id, amount, location, time_gap, current_tx['hour'],
                blocked=True, explanation=explanation, fraud_probability=probability,
                risk_factors=risk_factors
            )
            
            # Create flagged transaction record
            tx_record = Transaction.collection.find_one({'_id': ObjectId(tx_id)})
            FlaggedTransaction.create(tx_record, probability, explanation, risk_factors)
            
            return jsonify({
                'status': 'blocked',
                'message': '🚨 Transaction blocked',
                'explanation': explanation,
                'fraud_probability': probability,
                'risk_factors': risk_factors,
                'blocked': True
            }), 200
        else:
            Transaction.create(
                user_id, amount, location, time_gap, current_tx['hour'],
                blocked=False, fraud_probability=probability
            )
            User.update_balance(user_id, -amount)
            
            user = User.find_by_id(user_id)
            return jsonify({
                'status': 'success',
                'message': 'Transaction completed successfully ✅',
                'balance': user.get('balance'),
                'fraud_probability': probability,
                'blocked': False
            }), 200

import pandas as pd
import json
import io

@transactions_bp.route('/analyze', methods=['POST'])
def analyze_file():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
        
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
        
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file)
        elif file.filename.endswith('.json'):
            df = pd.DataFrame(json.load(file))
        else:
            return jsonify({'error': 'Unsupported file format'}), 400
            
        required_cols = ['amount', 'location', 'hour']
        for col in required_cols:
            if col not in df.columns:
                return jsonify({'error': f'Missing required column: {col}'}), 400
        
        # Process first 50 rows only for speed if file is large
        process_df = df.head(50).copy()
        
        # Build synthetic history from the file itself for context
        file_history = []
        for _, row in process_df.iterrows():
            file_history.append({
                'amount': float(row['amount']),
                'hour': int(row['hour']),
                'location': int(row['location']),
                'time_gap': 1.0  # Default gap for file-based history
            })
        
        results = []
        fraud_count = 0
        total_risk = 0.0
        max_probability = 0.0
        
        for index, row in process_df.iterrows():
            # Calculate time_gap from previous row in file if available
            if index > 0:
                time_gap = 1.0  # Assume 1 hour between transactions in file
            else:
                time_gap = 24.0  # First transaction
            
            current_tx = {
                'amount': float(row['amount']),
                'hour': int(row['hour']),
                'location': int(row['location']),
                'time_gap': time_gap
            }
            
            # Use file-based history up to current index for context
            context_history = file_history[:min(index, 9)]
            
            is_fraud, prob, risk_factors = fraud_detector.evaluate(context_history, current_tx)
            
            if is_fraud:
                fraud_count += 1
            total_risk += prob
            max_probability = max(max_probability, prob)
            
            results.append({
                'row': index + 1,
                'amount': row['amount'],
                'is_fraud': bool(is_fraud),
                'probability': float(prob),
                'risk_factors': risk_factors
            })
            
        avg_risk = total_risk / len(process_df) if not process_df.empty else 0
        
        # Get the riskiest transaction for explanation
        riskiest = max(results, key=lambda x: x['probability']) if results else None
        
        # Generate dynamic explanation based on actual findings
        explanation = ""
        if fraud_count > 0 and riskiest:
            top_factors = riskiest.get('risk_factors', [])
            if top_factors:
                factor_names = [f['factor'] for f in top_factors[:2]]
                explanation = f"Detected {fraud_count} suspicious transaction(s). Primary concerns: {', '.join(factor_names)}. "
            else:
                explanation = f"Detected {fraud_count} suspicious transaction(s) with elevated risk scores. "
            
            if avg_risk > 0.7:
                explanation += "The dataset shows high-risk spending patterns consistent with fraud attempts."
            elif avg_risk > 0.4:
                explanation += "Moderate risk detected. Review flagged transactions carefully."
            else:
                explanation += "Some transactions show minor anomalies but overall risk is manageable."
        else:
            if avg_risk < 0.2:
                explanation = "No fraud detected. All transactions in the file appear consistent with normal patterns."
            else:
                explanation = f"Low risk overall (avg {avg_risk*100:.1f}%). No transactions exceeded the fraud threshold, but monitor for unusual patterns."

        return jsonify({
            'isFraud': fraud_count > 0,
            'confidence': f"{max_probability*100:.2f}",
            'transactionsAnalyzed': len(process_df),
            'fraudDetected': fraud_count,
            'riskScore': f"{avg_risk:.3f}",
            'explanation': explanation,
            'details': results[:10] # send first 10 for UI if needed
        }), 200
        
    except Exception as e:
        logger.error(f"File analysis error: {e}")
        return jsonify({'error': f"Failed to process file: {str(e)}"}), 500

@transactions_bp.route('/predict', methods=['POST'])
def predict_transaction():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
        
    data = request.get_json()
    try:
        amount = float(data.get('amount', 0))
        location = int(data.get('location', 0))
        hour = int(data.get('hour', datetime.now().hour))
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid parameters'}), 400
        
    user = User.find_by_id(user_id)
    recent = Transaction.get_recent(user_id, limit=9)
    
    # Calculate time_gap
    if recent:
        time_gap = hours_since(recent[-1].get('timestamp'))
    else:
        time_gap = 24.0
        
    current_tx = {
        'amount': amount,
        'hour': hour,
        'location': location,
        'time_gap': time_gap
    }
    
    try:
        is_fraud, probability, risk_factors = fraud_detector.evaluate(recent, current_tx)
        
        # Count previous flags
        flagged_count = FlaggedTransaction.collection.count_documents({'user_id': user_id})
        
        # Prepare profile for Gemini
        profile = fraud_detector.user_profile_for_gemini(user, recent, flagged_count)
        
        # Generate explanation
        explanation = gemini_service.generate_fraud_explanation(current_tx, profile, risk_factors, probability)
        
        return jsonify({
            'is_fraud': bool(is_fraud),
            'probability': float(probability),
            'risk_factors': risk_factors,
            'explanation': explanation
        }), 200
    except Exception as e:
        logger.error(f"Simulator prediction error: {e}")
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/history', methods=['GET'])
def get_history():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
        
    limit = int(request.args.get('limit', 20))
    txs = Transaction.get_history(user_id, limit)
    
    # Serialize
    for tx in txs:
        tx['_id'] = str(tx['_id'])
        tx['timestamp'] = tx['timestamp'].isoformat()
        
    return jsonify({
        'transactions': txs,
        'count': len(txs)
    }), 200

@transactions_bp.route('/dashboard', methods=['GET'])
def get_dashboard():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
        
    user = User.find_by_id(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    txs = Transaction.get_history(user_id, limit=10)
    
    # Serialize for frontend
    serialized_txs = []
    for tx in txs:
        t = tx.copy()
        t['_id'] = str(t['_id'])
        t['timestamp'] = t['timestamp'].isoformat()
        serialized_txs.append(t)
        
    ai_insight = gemini_service.analyze_spending_pattern(txs, user['username'])
    security_tip = gemini_service.get_daily_security_tip()
    
    # Serialize user for convenience
    user_data = {
        '_id': str(user['_id']),
        'username': user['username'],
        'is_active': user.get('is_active', True),
        'is_admin': session.get('is_admin', False)
    }
    
    return jsonify({
        'user': user_data,
        'balance': user.get('balance', 0.0),
        'transactions': serialized_txs,
        'ai_insight': ai_insight,
        'security_tip': security_tip
    }), 200

@transactions_bp.route('/chat', methods=['POST'])
def chat_with_ai():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
        
    data = request.get_json()
    message = data.get('message')
    if not message:
        return jsonify({'error': 'Message required'}), 400
        
    user = User.find_by_id(user_id)
    txs = Transaction.get_history(user_id, limit=5)
    
    # Context for Gemini
    history_summary = ", ".join([f"₹{t['amount']} ({'Blocked' if t['blocked'] else 'Success'})" for t in txs])
    
    prompt = f"""
    User @{user['username']} is asking: "{message}"
    
    Their recent transaction history: {history_summary}
    Their current balance: ₹{user.get('balance', 0)}
    
    Respond as NexusGuard AI, a helpful security assistant. 
    Keep it concise (max 50 words). 
    If they ask about a specific transaction or their security, use the provided history.
    """
    
    try:
        if gemini_service.enabled:
            response = gemini_service.model.generate_content(prompt)
            answer = response.text.strip()
        else:
            answer = "I'm currently in offline mode. Please contact support for urgent queries."
            
        return jsonify({'answer': answer}), 200
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return jsonify({'answer': "I'm having trouble processing that right now. How else can I help?"}), 200

from bson import ObjectId
