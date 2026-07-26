import React from 'react';
import { motion } from 'framer-motion';

interface EmojiFloatingProps {
  emoji: string;
  xPos: number; // percentage from 10 to 90
}

export const EmojiFloating = ({ emoji, xPos }: EmojiFloatingProps) => {
  return (
    <motion.div
      initial={{ y: 50, x: 0, opacity: 0, scale: 0.5 }}
      animate={{
        y: -400,
        x: [0, -30, 20, -15, 10, 0], // sway left and right
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1.5, 1, 1]
      }}
      transition={{
        duration: 2.5,
        ease: 'easeOut',
      }}
      className="absolute pointer-events-none z-50 text-4xl filter drop-shadow-md"
      style={{ left: `${xPos}%`, bottom: '15%' }}
    >
      {emoji}
    </motion.div>
  );
};
