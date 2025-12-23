import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Lock, User, LogOut } from 'lucide-react';
import LiquidEther from '../components/Effects/LiquidEther';
import ShinyText from '../components/Effects/ShinyText';
import { useAuthStore } from '../store/authStore';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-ghost-darker">
      <LiquidEther
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        mouseForce={10}
        cursorSize={80}
        resolution={0.3}
        autoDemo={true}
        autoSpeed={0.3}
        className="fixed top-0 left-0 w-full h-full"
      />

      <div className="relative z-10">
        {/* Nav */}
        <nav className="glass-dark border-b border-white/5">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Lock className="w-8 h-8 text-ghost-purple" />
              <span className="text-2xl font-bold">
                <ShinyText text="Ghost Protocol" />
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-400">Welcome, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="cursor-target px-4 py-2 rounded-lg glass hover:bg-red-500/20 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-6xl font-black mb-6">
              <ShinyText text="Your Dashboard" />
            </h1>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-12">
              <button
                onClick={() => navigate('/chat')}
                className="cursor-target glass-dark rounded-2xl p-8 hover:bg-white/10 transition-all group"
              >
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-ghost-purple group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-2">Start Chatting</h3>
                <p className="text-gray-400">Send encrypted messages</p>
              </button>

              <button
                className="cursor-target glass-dark rounded-2xl p-8 hover:bg-white/10 transition-all group"
              >
                <User className="w-16 h-16 mx-auto mb-4 text-ghost-pink group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-2">Profile</h3>
                <p className="text-gray-400">Manage your account</p>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
