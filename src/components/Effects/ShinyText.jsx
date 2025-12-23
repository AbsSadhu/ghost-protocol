import { motion } from 'framer-motion';
import './ShinyText.css';

export default function ShinyText({ text, className = '' }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`shiny-text ${className}`}
    >
      {text}
    </motion.span>
  );
}
