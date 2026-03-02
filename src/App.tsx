import { Routes, Route } from 'react-router-dom'
import { CursorBackground } from './components/CursorBackground'
import Index from './pages/Index'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

export default function App() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <CursorBackground />
            <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </div>
    )
}
