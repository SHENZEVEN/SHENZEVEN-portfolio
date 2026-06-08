import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      const isInteractive = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'circle' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('div.cursor-pointer') ||
        target.classList.contains('cursor-pointer') ||
        target.classList.contains('hover\\:cursor-pointer') ||
        target.classList.contains('interactive-node');
      setIsHovering(isInteractive);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <>
      <style>{`
        * {
          cursor: none !important;
        }
      `}</style>
      
      <AnimatePresence>
        <motion.div
          className="fixed pointer-events-none z-[9999] mix-blend-screen"
          animate={{
            x: position.x - (isHovering ? 24 : 16),
            y: position.y - (isHovering ? 24 : 16),
            scale: isClicking ? 0.8 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 28,
            mass: 0.5,
          }}
        >
          <div
            className={`rounded-full border-2 transition-all duration-300 ${
              isHovering 
                ? 'w-[48px] h-[48px] border-cyber-purple' 
                : 'w-[32px] h-[32px] border-cyber-blue'
            }`}
            style={{
              boxShadow: isHovering
                ? '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3)'
                : '0 0 20px rgba(0, 212, 255, 0.5), 0 0 40px rgba(0, 212, 255, 0.3)',
            }}
          />
        </motion.div>

        <motion.div
          className="fixed pointer-events-none z-[9999] mix-blend-screen"
          animate={{
            x: position.x - 4,
            y: position.y - 4,
            scale: isHovering ? 0.5 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 28,
            mass: 0.5,
          }}
        >
          <div
            className={`rounded-full transition-all duration-300 ${
              isHovering ? 'bg-cyber-purple' : 'bg-cyber-blue'
            }`}
            style={{
              width: '8px',
              height: '8px',
              boxShadow: isHovering
                ? '0 0 10px rgba(139, 92, 246, 0.8)'
                : '0 0 10px rgba(0, 212, 255, 0.8)',
            }}
          />
        </motion.div>
      </AnimatePresence>
    </>
  );
}