'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Mail, Lock, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Dummy authentication - just redirect to dashboard
        navigate('/dashboard')
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
            {/* Background Effects */}
            <div className="absolute inset-0" style={{
                background: 'radial-gradient(ellipse at 30% 20%, rgba(66,133,244,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(170,0,255,0.06) 0%, transparent 50%)'
            }} />

            {/* Floating elements */}
            <div className="absolute top-20 left-20 w-4 h-4 bg-accent-blue rounded-full float-gentle opacity-60"></div>
            <div className="absolute top-40 right-32 w-6 h-6 bg-accent-emerald rounded-full drift-left opacity-40"></div>
            <div className="absolute bottom-32 left-1/4 w-5 h-5 bg-accent-purple rounded-full drift-right opacity-50"></div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-md mx-auto"
                >
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-3 mb-4"
                        >
                            <Shield className="w-10 h-10 text-primary" />
                            <span className="font-bold text-3xl text-foreground">NexusGuard</span>
                        </motion.div>
                        <p className="text-muted-foreground">Sign in to your account</p>
                    </div>

                    {/* Login Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-card border border-border rounded-2xl p-8 shadow-xl"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent gentle-animation"
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent gentle-animation"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-border bg-input text-primary focus:ring-2 focus:ring-primary"
                                    />
                                    <span className="text-sm text-muted-foreground">Remember me</span>
                                </label>
                                <a href="#" className="text-sm text-primary hover:underline">
                                    Forgot password?
                                </a>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:opacity-90 gentle-animation flex items-center justify-center gap-2 cyber-glow"
                            >
                                Sign In
                                <ArrowRight className="w-5 h-5" />
                            </motion.button>
                        </form>

                        {/* Register Link */}
                        <div className="mt-6 text-center">
                            <p className="text-muted-foreground">
                                Don't have an account?{' '}
                                <a href="/register" className="text-primary font-semibold hover:underline">
                                    Create Account
                                </a>
                            </p>
                        </div>
                    </motion.div>

                    {/* Back to Home */}
                    <div className="mt-6 text-center">
                        <a href="/" className="text-muted-foreground hover:text-primary gentle-animation">
                            ← Back to Home
                        </a>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
