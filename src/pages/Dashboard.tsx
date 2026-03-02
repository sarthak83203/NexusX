'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, LogOut, Upload, AlertTriangle, CheckCircle, TrendingUp, Database, Activity, Brain, Home, BarChart3, CreditCard, LineChart, Lock, MessageCircle, X, Send, Zap, Sparkles, Target, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
    const navigate = useNavigate()
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [results, setResults] = useState<{
        isFraud: boolean
        confidence: string
        transactionsAnalyzed: number
        fraudDetected: number
        riskScore: string
        explanation: string
    } | null>(null)
    const [activeTab, setActiveTab] = useState('dashboard')
    const [chatOpen, setChatOpen] = useState(false)
    const [chatMessages, setChatMessages] = useState<Array<{type: string, text: string}>>([
        { type: 'bot', text: 'Hello! I\'m your NexusGuard AI assistant. How can I help you today?' }
    ])

    // Live Fraud Simulator State
    const [simulatorData, setSimulatorData] = useState({
        amount: 5000,
        location: 2,
        hour: 14
    })
    const [riskScore, setRiskScore] = useState(0)
    const [simulatorExplanation, setSimulatorExplanation] = useState('')
    const [showSimulatorResult, setShowSimulatorResult] = useState(false)

    // Live Fraud Simulator Logic
    const calculateRisk = useCallback(() => {
        const { amount, location, hour } = simulatorData
        let risk = 0

        // Amount-based risk (higher amounts = higher risk)
        if (amount > 50000) risk += 40
        else if (amount > 20000) risk += 25
        else if (amount > 10000) risk += 15
        else risk += 5

        // Location-based risk (location 0 and 4 are suspicious)
        if (location === 0 || location === 4) risk += 30
        else if (location === 1) risk += 10
        else risk += 5

        // Hour-based risk (late night/early morning = higher risk)
        if (hour >= 0 && hour <= 5) risk += 30
        else if (hour >= 22 && hour <= 23) risk += 25
        else if (hour >= 6 && hour <= 9) risk += 5
        else risk += 10

        return Math.min(risk, 100)
    }, [simulatorData])

    // Auto-update risk score as sliders change
    useEffect(() => {
        if (showSimulatorResult) {
            const risk = calculateRisk()
            setRiskScore(risk)
        }
    }, [simulatorData, showSimulatorResult, calculateRisk])

    const handleLogout = () => {
        navigate('/')
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
            setResults(null)
        }
    }

    const handleAnalyze = () => {
        if (!selectedFile) return

        setAnalyzing(true)

        // Simulate analysis with dummy data
        setTimeout(() => {
            const isFraud = Math.random() > 0.5
            setResults({
                isFraud,
                confidence: (Math.random() * 30 + 70).toFixed(2),
                transactionsAnalyzed: Math.floor(Math.random() * 1000 + 500),
                fraudDetected: Math.floor(Math.random() * 50 + 10),
                riskScore: (Math.random() * 0.4 + (isFraud ? 0.6 : 0.1)).toFixed(3),
                explanation: isFraud
                    ? "Suspicious patterns detected: Multiple high-value transactions from unusual locations within short time intervals. Transaction amounts deviate significantly from user's historical behavior. Location anomaly detected with rapid geographic changes."
                    : "Transaction patterns appear normal. Amounts are consistent with user's historical behavior. Location data shows expected patterns. Time intervals between transactions are within normal range."
            })
            setAnalyzing(false)
        }, 2000)
    }

    const handleSimulate = () => {
        const risk = calculateRisk()
        setRiskScore(risk)
        setShowSimulatorResult(true)

        const { amount, location, hour } = simulatorData
        const locationNames = ['Unknown Location', 'Home', 'Office', 'Mall', 'Foreign Country']

        let explanation = ''
        if (risk > 70) {
            explanation = `⚠️ HIGH RISK DETECTED: Transaction of ₹${amount.toLocaleString()} from ${locationNames[location]} at ${hour}:00 hours shows multiple red flags. The combination of high amount, unusual location, and suspicious timing indicates potential fraudulent activity. Recommend immediate verification.`
        } else if (risk > 40) {
            explanation = `⚡ MODERATE RISK: Transaction of ₹${amount.toLocaleString()} from ${locationNames[location]} at ${hour}:00 hours shows some concerning patterns. While not definitively fraudulent, additional verification is recommended due to the transaction parameters.`
        } else {
            explanation = `✅ LOW RISK: Transaction of ₹${amount.toLocaleString()} from ${locationNames[location]} at ${hour}:00 hours appears normal. Amount, location, and timing are within expected parameters for typical user behavior.`
        }

        setSimulatorExplanation(explanation)
    }

    const navItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'transactions', label: 'Transactions', icon: CreditCard },
        { id: 'analytics', label: 'Analytics', icon: LineChart },
        { id: 'admin', label: 'Admin', icon: Lock },
    ]

    const predefinedResponses: { [key: string]: string } = {
        'How does fraud detection work?': 'NexusGuard uses a 1D CNN neural network to analyze transaction patterns in real-time. The model examines features like amount, location, time, and historical behavior to detect anomalies. Google Gemini AI then generates human-readable explanations for each detection.',
        'What is the accuracy rate?': 'Our fraud detection system achieves 99.2% accuracy with a processing speed of under 200ms per transaction. We\'ve analyzed over 1.2M transactions and successfully detected 12.4K fraudulent activities.',
        'How to upload transaction data?': 'Simply click the file upload button, select your CSV or JSON file containing transaction data, and click "Analyze with AI". Our system will process the data and provide instant fraud detection results with AI-powered explanations.',
        'What data format is supported?': 'We support CSV and JSON formats. Your file should include transaction details like amount, timestamp, location, and user ID. The system automatically processes and analyzes the data structure.',
    }

    const handleChatOption = (option: string) => {
        setChatMessages(prev => [...prev,
            { type: 'user', text: option },
            { type: 'bot', text: predefinedResponses[option] || 'I can help you with fraud detection queries. Please select from the available options.' }
        ])
    }

    const stats = [
        { icon: Database, label: 'Total Transactions', value: '1.2M+', color: 'text-accent-blue' },
        { icon: AlertTriangle, label: 'Fraud Detected', value: '12.4K', color: 'text-accent-pink' },
        { icon: CheckCircle, label: 'Accuracy Rate', value: '99.2%', color: 'text-accent-emerald' },
        { icon: TrendingUp, label: 'Processing Speed', value: '<200ms', color: 'text-accent-purple' },
    ]

    return (
        <div className="min-h-screen bg-background relative">
            {/* Navigation Bar */}
            <nav className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-6">
                    <div className="flex items-center justify-between py-4">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                            >
                                <Shield className="w-8 h-8 text-primary" />
                            </motion.div>
                            <div>
                                <h1 className="font-bold text-xl text-foreground">NexusGuard</h1>
                                <p className="text-xs text-muted-foreground">Fraud Detection Dashboard</p>
                            </div>
                        </div>

                        {/* Navigation Items */}
                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                const isActive = activeTab === item.id
                                return (
                                    <motion.button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`relative flex items-center gap-2 px-4 py-2 rounded-lg gentle-animation ${
                                            isActive
                                                ? 'text-foreground'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="text-sm font-medium">{item.label}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-blue via-accent-purple to-accent-pink"
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            />
                                        )}
                                    </motion.button>
                                )
                            })}
                        </div>

                        {/* Logout Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 gentle-animation"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </motion.button>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 gentle-animation"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                                <Activity className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="text-3xl font-black gradient-text mb-1">{stat.value}</div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Analysis Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Upload Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-2"
                    >
                        <div className="bg-card border border-border rounded-2xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Upload className="w-6 h-6 text-primary" />
                                <h2 className="text-2xl font-bold text-foreground">Upload Transaction Data</h2>
                            </div>

                            {/* File Upload */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-foreground mb-3">
                                    Select CSV or JSON file
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".csv,.json"
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-muted-foreground file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90 file:cursor-pointer cursor-pointer border border-border rounded-lg bg-input"
                                    />
                                </div>
                                {selectedFile && (
                                    <p className="mt-2 text-sm text-accent-emerald flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        {selectedFile.name} selected
                                    </p>
                                )}
                            </div>

                            {/* Analyze Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAnalyze}
                                disabled={!selectedFile || analyzing}
                                className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-lg hover:opacity-90 gentle-animation disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cyber-glow"
                            >
                                {analyzing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Brain className="w-5 h-5" />
                                        Analyze with AI
                                    </>
                                )}
                            </motion.button>

                            {/* Results */}
                            {results && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-8 space-y-4"
                                >
                                    {/* Status Badge */}
                                    <div className={`flex items-center gap-3 p-4 rounded-xl ${
                                        results.isFraud
                                            ? 'bg-destructive/10 border border-destructive/30'
                                            : 'bg-accent-emerald/10 border border-accent-emerald/30'
                                    }`}>
                                        {results.isFraud ? (
                                            <>
                                                <AlertTriangle className="w-6 h-6 text-destructive" />
                                                <div>
                                                    <div className="font-bold text-destructive">Fraud Detected</div>
                                                    <div className="text-sm text-muted-foreground">High risk transaction patterns identified</div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-6 h-6 text-accent-emerald" />
                                                <div>
                                                    <div className="font-bold text-accent-emerald">No Fraud Detected</div>
                                                    <div className="text-sm text-muted-foreground">Transaction patterns appear normal</div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Metrics */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-background/50 p-4 rounded-lg border border-border">
                                            <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                                            <div className="text-2xl font-bold text-primary">{results.confidence}%</div>
                                        </div>
                                        <div className="bg-background/50 p-4 rounded-lg border border-border">
                                            <div className="text-sm text-muted-foreground mb-1">Risk Score</div>
                                            <div className="text-2xl font-bold text-accent-purple">{results.riskScore}</div>
                                        </div>
                                        <div className="bg-background/50 p-4 rounded-lg border border-border">
                                            <div className="text-sm text-muted-foreground mb-1">Transactions</div>
                                            <div className="text-2xl font-bold text-accent-blue">{results.transactionsAnalyzed}</div>
                                        </div>
                                        <div className="bg-background/50 p-4 rounded-lg border border-border">
                                            <div className="text-sm text-muted-foreground mb-1">Fraud Found</div>
                                            <div className="text-2xl font-bold text-accent-pink">{results.fraudDetected}</div>
                                        </div>
                                    </div>

                                    {/* AI Explanation */}
                                    <div className="bg-background/50 p-6 rounded-lg border border-border">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Brain className="w-5 h-5 text-primary" />
                                            <div className="font-bold text-foreground">AI Explanation</div>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {results.explanation}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Info Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-6"
                    >
                        {/* How It Works */}
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <h3 className="font-bold text-lg text-foreground mb-4">How It Works</h3>
                            <div className="space-y-4">
                                {[
                                    { step: '1', text: 'Upload transaction data (CSV/JSON)' },
                                    { step: '2', text: '1D CNN analyzes patterns' },
                                    { step: '3', text: 'AI generates explanation' },
                                    { step: '4', text: 'Get instant results' }
                                ].map((item) => (
                                    <div key={item.step} className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                                            {item.step}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Model Info */}
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <h3 className="font-bold text-lg text-foreground mb-4">Model Info</h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Architecture</div>
                                    <div className="text-sm font-semibold text-foreground">1D CNN + Dense Layers</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Training Data</div>
                                    <div className="text-sm font-semibold text-foreground">100K+ Transactions</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">AI Engine</div>
                                    <div className="text-sm font-semibold text-foreground">Google Gemini</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Database</div>
                                    <div className="text-sm font-semibold text-foreground">MongoDB</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Live Fraud Simulator Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8"
                >
                    <div className="bg-card border border-border rounded-2xl p-8 relative overflow-hidden">
                        {/* Animated background effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-accent-purple/5 to-accent-pink/5 opacity-50"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                >
                                    <Sparkles className="w-6 h-6 text-accent-purple" />
                                </motion.div>
                                <h2 className="text-2xl font-bold gradient-text">Live Fraud Simulator</h2>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Zap className="w-5 h-5 text-accent-emerald" />
                                </motion.div>
                            </div>
                            <p className="text-muted-foreground mb-6">
                                Adjust transaction parameters to see real-time fraud risk analysis
                            </p>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Controls */}
                                <div className="space-y-6">
                                    {/* Amount Slider */}
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="bg-background/50 p-6 rounded-xl border border-border gentle-animation"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                <Database className="w-4 h-4 text-accent-blue" />
                                                Transaction Amount
                                            </label>
                                            <span className="text-lg font-bold text-primary">₹{simulatorData.amount.toLocaleString()}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="100"
                                            max="100000"
                                            step="100"
                                            value={simulatorData.amount}
                                            onChange={(e) => setSimulatorData({ ...simulatorData, amount: parseInt(e.target.value) })}
                                            className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer slider-thumb"
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                            <span>₹100</span>
                                            <span>₹100,000</span>
                                        </div>
                                    </motion.div>

                                    {/* Location Dropdown */}
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="bg-background/50 p-6 rounded-xl border border-border gentle-animation"
                                    >
                                        <label className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                            <Target className="w-4 h-4 text-accent-emerald" />
                                            Transaction Location
                                        </label>
                                        <select
                                            value={simulatorData.location}
                                            onChange={(e) => setSimulatorData({ ...simulatorData, location: parseInt(e.target.value) })}
                                            className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary gentle-animation"
                                        >
                                            <option value={0}>Unknown Location</option>
                                            <option value={1}>Home</option>
                                            <option value={2}>Office</option>
                                            <option value={3}>Mall</option>
                                            <option value={4}>Foreign Country</option>
                                        </select>
                                    </motion.div>

                                    {/* Hour Slider */}
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="bg-background/50 p-6 rounded-xl border border-border gentle-animation"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-accent-purple" />
                                                Hour of Day
                                            </label>
                                            <span className="text-lg font-bold text-accent-purple">{simulatorData.hour}:00</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="23"
                                            value={simulatorData.hour}
                                            onChange={(e) => setSimulatorData({ ...simulatorData, hour: parseInt(e.target.value) })}
                                            className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer slider-thumb"
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                            <span>00:00</span>
                                            <span>23:00</span>
                                        </div>
                                    </motion.div>

                                    {/* Simulate Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSimulate}
                                        className="w-full bg-gradient-to-r from-accent-blue via-accent-purple to-accent-pink text-white font-semibold py-4 rounded-lg hover:opacity-90 gentle-animation flex items-center justify-center gap-2 cyber-glow"
                                    >
                                        <Brain className="w-5 h-5" />
                                        Simulate Fraud Detection
                                    </motion.button>
                                </div>

                                {/* Risk Meter & Results */}
                                <div className="space-y-6">
                                    {/* Risk Meter */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-background/50 p-6 rounded-xl border border-border"
                                    >
                                        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                                            <Activity className="w-4 h-4" />
                                            Risk Assessment
                                        </h3>

                                        {/* Circular Risk Meter */}
                                        <div className="flex items-center justify-center mb-6">
                                            <div className="relative w-48 h-48">
                                                <svg className="transform -rotate-90 w-48 h-48">
                                                    <circle
                                                        cx="96"
                                                        cy="96"
                                                        r="88"
                                                        stroke="currentColor"
                                                        strokeWidth="12"
                                                        fill="none"
                                                        className="text-border"
                                                    />
                                                    <motion.circle
                                                        cx="96"
                                                        cy="96"
                                                        r="88"
                                                        stroke="url(#gradient)"
                                                        strokeWidth="12"
                                                        fill="none"
                                                        strokeLinecap="round"
                                                        initial={{ strokeDasharray: "0 552" }}
                                                        animate={{
                                                            strokeDasharray: `${(riskScore / 100) * 552} 552`,
                                                        }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                    />
                                                    <defs>
                                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="#4285F4" />
                                                            <stop offset="50%" stopColor="#AA00FF" />
                                                            <stop offset="100%" stopColor="#EA4335" />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <motion.div
                                                        key={riskScore}
                                                        initial={{ scale: 0.5, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        className="text-5xl font-black gradient-text"
                                                    >
                                                        {riskScore}%
                                                    </motion.div>
                                                    <div className="text-sm text-muted-foreground mt-1">Risk Score</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Risk Level Indicator */}
                                        <div className={`p-4 rounded-lg text-center font-semibold ${
                                            riskScore > 70 ? 'bg-destructive/10 text-destructive' :
                                            riskScore > 40 ? 'bg-accent-purple/10 text-accent-purple' :
                                            'bg-accent-emerald/10 text-accent-emerald'
                                        }`}>
                                            {riskScore > 70 ? '⚠️ HIGH RISK' :
                                             riskScore > 40 ? '⚡ MODERATE RISK' :
                                             '✅ LOW RISK'}
                                        </div>
                                    </motion.div>

                                    {/* AI Explanation */}
                                    <AnimatePresence>
                                        {showSimulatorResult && simulatorExplanation && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                className="bg-background/50 p-6 rounded-xl border border-border"
                                            >
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Brain className="w-5 h-5 text-primary" />
                                                    <div className="font-bold text-foreground">Gemini AI Analysis</div>
                                                </div>
                                                <motion.p
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.3 }}
                                                    className="text-sm text-muted-foreground leading-relaxed"
                                                >
                                                    {simulatorExplanation}
                                                </motion.p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Chat Assistant Widget */}
            <AnimatePresence>
                {chatOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Chat Header */}
                        <div className="bg-gradient-to-r from-accent-blue via-accent-purple to-accent-pink p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <Brain className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="font-bold text-white">NexusGuard AI</div>
                                    <div className="text-xs text-white/80">Always here to help</div>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setChatOpen(false)}
                                className="text-white hover:bg-white/20 p-2 rounded-lg gentle-animation"
                            >
                                <X className="w-5 h-5" />
                            </motion.button>
                        </div>

                        {/* Chat Messages */}
                        <div className="h-96 overflow-y-auto p-4 space-y-3 bg-background/50">
                            {chatMessages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: msg.type === 'bot' ? -20 : 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] p-3 rounded-lg ${
                                        msg.type === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-card border border-border text-foreground'
                                    }`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Quick Options */}
                        <div className="p-4 border-t border-border bg-card space-y-2">
                            <div className="text-xs text-muted-foreground mb-2">Quick Questions:</div>
                            {Object.keys(predefinedResponses).map((option, index) => (
                                <motion.button
                                    key={option}
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleChatOption(option)}
                                    className="w-full text-left text-sm p-3 bg-background/50 hover:bg-primary/10 border border-border rounded-lg gentle-animation text-foreground"
                                >
                                    {option}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setChatOpen(!chatOpen)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-accent-blue via-accent-purple to-accent-pink rounded-full shadow-2xl flex items-center justify-center z-50 cyber-glow"
                animate={{
                    boxShadow: [
                        '0 0 20px rgba(66, 133, 244, 0.3)',
                        '0 0 40px rgba(170, 0, 255, 0.5)',
                        '0 0 20px rgba(66, 133, 244, 0.3)',
                    ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <AnimatePresence mode="wait">
                    {chatOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <X className="w-7 h-7 text-white" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <MessageCircle className="w-7 h-7 text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    )
}
