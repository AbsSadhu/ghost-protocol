import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LiquidEther from '../components/Effects/LiquidEther';
import ShinyText from '../components/Effects/ShinyText';
import VariableProximity from '../components/Effects/VariableProximity';
import { Lock, Eye, Shield, Zap, MessageSquare, Image } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'E2EE Encryption',
      description: 'AES-256 military-grade end-to-end encryption',
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: 'Histogram Shifting',
      description: 'Hilfe-Dunman steganography - invisible to detection',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Zero Detection',
      description: 'Messages hidden in plain sight within images',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Real-time',
      description: 'Instant WebSocket communication',
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'Delivery Tracking',
      description: 'SENT → DELIVERED → READ status',
    },
    {
      icon: <Image className="w-8 h-8" />,
      title: 'Offline Queue',
      description: 'Messages delivered when users come online',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-ghost-darker">
      {/* Animated background */}
      <div className="fixed inset-0 w-full h-full pointer-events-none">
        <LiquidEther
          colors={['#00ff41', '#00d4ff']}
          mouseForce={20}
          cursorSize={100}
          resolution={0.5}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
        />
      </div>

      {/* Content overlay */}
      <div className="relative z-10">{/* Navigation */}
        <nav className="glass-dark border-b border-white/5">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ghost-green to-ghost-blue flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold">
                <ShinyText text="Ghost Protocol" />
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4"
            >
              <button
                onClick={() => navigate('/login')}
                className="cursor-target px-6 py-2 rounded-lg glass hover:bg-white/10 transition-all duration-300"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="cursor-target btn-ghost"
              >
                Get Started
              </button>
            </motion.div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-7xl font-black mb-6">
              <ShinyText text="Ghost Protocol" />
            </h1>
            
            <div className="text-3xl text-gray-300 mb-8">
              <VariableProximity
                label="Secure • Hidden • Untraceable"
                radius={150}
                className="cursor-target"
              />
            </div>

            <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
              The world's most advanced steganography messenger. Hide your messages inside images
              with E2EE encryption. Communicate in the shadows, leave no trace.
            </p>

            <div className="flex gap-6 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="cursor-target btn-ghost text-lg px-8 py-4"
              >
                Start Encrypting
              </button>
              <button
                onClick={() => {
                  document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
                }}
                className="cursor-target px-8 py-4 rounded-lg glass hover:bg-white/10 transition-all duration-300 text-lg"
              >
                Learn More
              </button>
            </div>
          </motion.div>

          {/* Demo Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 relative"
          >
            <div className="glass-dark rounded-2xl p-8 max-w-5xl mx-auto glow-purple">
              <div className="aspect-video bg-gradient-to-br from-ghost-purple/20 to-ghost-pink/20 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Lock className="w-24 h-24 mx-auto mb-4 text-ghost-purple" />
                  <p className="text-2xl font-bold text-gray-300">
                    Your messages, invisible to the world
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-black mb-4">
              <ShinyText text="Military-Grade Security" />
            </h2>
            <p className="text-xl text-gray-400">
              Built with the most advanced cryptography and steganography techniques
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="cursor-target glass-dark rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-ghost-purple to-ghost-pink flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-dark rounded-3xl p-16 text-center glow-purple"
          >
            <h2 className="text-5xl font-black mb-6">
              <ShinyText text="Ready to Go Ghost?" />
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Join the secure messaging revolution. Your communications, your secrets, your control.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="cursor-target btn-ghost text-xl px-12 py-5"
            >
              Create Account - It's Free
            </button>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="glass-dark border-t border-white/5">
          <div className="container mx-auto px-6 py-8 text-center text-gray-500">
            <p>© 2025 Ghost Protocol Messenger. Encrypted and Hidden.</p>
            <p className="mt-2 text-sm">Built with Hilfe-Dunman Steganography & AES-256 Encryption</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
