import { motion } from 'motion/react';
import { UtensilsCrossed } from 'lucide-react';

interface HeaderProps {
  name: string;
  tagline: string;
}

export default function Header({ name, tagline }: HeaderProps) {
  return (
    <header className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-brand-dark text-brand-cream">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=2000"
          alt="Restaurant Background"
          className="w-full h-full object-cover opacity-40 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-transparent to-brand-cream" />
      </div>

      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-block p-4 rounded-full border border-brand-gold/30 mb-8 backdrop-blur-sm"
        >
          <UtensilsCrossed className="w-8 h-8 text-brand-gold" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-7xl md:text-9xl font-serif mb-4 tracking-tighter"
        >
          {name}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-brand-gold font-sans uppercase tracking-[0.3em] text-sm md:text-base font-medium"
        >
          {tagline}
        </motion.p>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-brand-gold/50"
      >
        <div className="w-[1px] h-12 bg-gradient-to-b from-brand-gold to-transparent" />
      </motion.div>
    </header>
  );
}
