/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Header from './components/Header';
import MenuSection from './components/MenuSection';
import VideoShowcase from './components/VideoShowcase';
import LocationMap from './components/LocationMap';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import { RESTAURANT_DATA } from './constants';
import { motion, useScroll, useSpring } from 'motion/react';
import { Settings, Eye } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'menu' | 'dashboard'>('dashboard');
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  if (view === 'dashboard') {
    return (
      <div className="relative">
        <Dashboard />
        <button 
          onClick={() => setView('menu')}
          className="fixed bottom-8 right-8 bg-brand-gold text-brand-dark p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center gap-2 font-bold"
        >
          <Eye className="w-6 h-6" />
          <span>Bekijk Menu</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen selection:bg-brand-gold/30 relative">
      {/* View Toggle */}
      <button 
        onClick={() => setView('dashboard')}
        className="fixed bottom-8 right-8 bg-brand-dark text-brand-gold p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center gap-2 font-bold border border-brand-gold/20"
      >
        <Settings className="w-6 h-6" />
        <span>Beheer Menu</span>
      </button>

      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-brand-gold z-50 origin-left"
        style={{ scaleX }}
      />

      <Header name={RESTAURANT_DATA.name} tagline={RESTAURANT_DATA.tagline} />

      <main className="max-w-7xl mx-auto px-4 py-24">
        {RESTAURANT_DATA.sections.map((section, index) => (
          <MenuSection key={index} section={section} />
        ))}
      </main>

      <VideoShowcase highlights={RESTAURANT_DATA.highlights} />
      
      <LocationMap address={RESTAURANT_DATA.location.address} />

      <Footer />
    </div>
  );
}

