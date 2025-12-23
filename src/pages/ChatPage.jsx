import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';
import LiquidEther from '../components/Effects/LiquidEther';
import ShinyText from '../components/Effects/ShinyText';

export default function ChatPage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen relative overflow-hidden bg-ghost-darker flex flex-col">
      <LiquidEther
        colors={['#0d0d0d', '#1a1a1a', '#262626']}
        mouseForce={8}
        cursorSize={60}
        resolution={0.3}
        autoDemo={true}
        autoSpeed={0.2}
        className="fixed top-0 left-0 w-full h-full"
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="glass-dark border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="cursor-target flex items-center gap-2 px-4 py-2 rounded-lg glass hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-ghost-purple" />
              <span className="text-xl font-bold">
                <ShinyText text="Secure Chat" />
              </span>
            </div>

            <div className="w-24"></div> {/* Spacer */}
          </div>
        </div>

        {/* Chat area - placeholder */}
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Lock className="w-24 h-24 mx-auto mb-6 text-ghost-purple" />
            <h2 className="text-3xl font-bold mb-4">
              <ShinyText text="Chat Coming Soon" />
            </h2>
            <p className="text-gray-400 max-w-md">
              The full chat interface with steganography encoding/decoding is being built.
              <br />
              Backend API integration in progress...
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
