import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './VariableProximity.css';

export default function VariableProximity({ 
  label, 
  className = '',
  radius = 100,
}) {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getLetterStyle = (index, totalLetters) => {
    if (!containerRef.current) return {};
    
    const letterWidth = containerRef.current.offsetWidth / totalLetters;
    const letterX = letterWidth * index + letterWidth / 2;
    const letterY = containerRef.current.offsetHeight / 2;
    
    const distance = Math.sqrt(
      Math.pow(mousePos.x - letterX, 2) + 
      Math.pow(mousePos.y - letterY, 2)
    );
    
    const proximity = Math.max(0, 1 - distance / radius);
    const weight = 300 + (proximity * 700); // 300 to 1000
    
    return {
      fontVariationSettings: `'wght' ${weight}`,
      transition: 'font-variation-settings 0.1s ease'
    };
  };

  return (
    <div ref={containerRef} className={`variable-proximity ${className}`}>
      {label.split('').map((char, index) => (
        <motion.span
          key={index}
          style={getLetterStyle(index, label.length)}
          className="variable-proximity-letter"
        >
          {char}
        </motion.span>
      ))}
    </div>
  );
}
