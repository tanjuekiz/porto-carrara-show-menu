/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Header from './components/Header';
import MenuSection from './components/MenuSection';
import VideoShowcase from './components/VideoShowcase';
import LocationMap from './components/LocationMap';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import { RESTAURANT_DATA as INITIAL_DATA } from './constants';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import { Settings, Eye, Tv, Monitor, Play, X } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'menu' | 'dashboard' | 'tv'>('dashboard');
  const [restaurantData, setRestaurantData] = useState(() => {
    const saved = localStorage.getItem('porto_carrara_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved data", e);
        return INITIAL_DATA;
      }
    }
    return INITIAL_DATA;
  });

  // Persist data to localStorage
  useEffect(() => {
    localStorage.setItem('porto_carrara_data', JSON.stringify(restaurantData));
  }, [restaurantData]);

  const [tvState, setTvState] = useState<'film' | 'menu'>('film');
  const [menuPageIndex, setMenuPageIndex] = useState(0);
  const [currentFilmUrl, setCurrentFilmUrl] = useState('');
  const [highlightProduct, setHighlightProduct] = useState<any>(null);

  const SECTIONS_PER_PAGE = 3;
  const totalMenuPages = Math.ceil(restaurantData.sections.length / SECTIONS_PER_PAGE);

  // TV Mode Product Cycling
  useEffect(() => {
    if (view !== 'tv' || tvState !== 'film') return;

    const allItems = restaurantData.sections.flatMap(s => s.items);
    const cycleProduct = () => {
      const pool = allItems.length > 0 ? allItems : [];
      if (pool.length === 0) return;
      const randomItem = pool[Math.floor(Math.random() * pool.length)];
      setHighlightProduct(randomItem);
    };

    cycleProduct();
    const interval = setInterval(cycleProduct, 5000); // Wissel elke 5 seconden van product
    return () => clearInterval(interval);
  }, [view, tvState, restaurantData.sections]);
  
  // TV Mode Logic
  useEffect(() => {
    if (view !== 'tv') return;

    let timer: NodeJS.Timeout;

    if (tvState === 'film') {
      // Kies een willekeurige video uit de geselecteerde bioscoop films
      const activeFilms = restaurantData.highlights.filter(h => h.activeOnTv);
      const pool = activeFilms.length > 0 ? activeFilms : restaurantData.highlights;
      const randomVideo = pool[Math.floor(Math.random() * pool.length)].url;
      setCurrentFilmUrl(randomVideo);
      
      // We vertrouwen nu op onEnded van de video, maar voegen een veiligheidstimer toe van 60s
      timer = setTimeout(() => {
        setTvState('menu');
        setMenuPageIndex(0);
      }, 60000);
    } else {
      // Menu Pagina timer (2 minuten per pagina)
      timer = setTimeout(() => {
        if (menuPageIndex + 1 < totalMenuPages) {
          setMenuPageIndex(prev => prev + 1);
        } else {
          setTvState('film');
          setMenuPageIndex(0);
        }
      }, 120000); // 2 minuten per pagina
    }

    return () => clearTimeout(timer);
  }, [view, tvState, menuPageIndex, totalMenuPages, restaurantData.highlights]);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  if (view === 'tv') {
    return (
      <div className="fixed inset-0 bg-brand-dark z-[100] overflow-hidden">
        <AnimatePresence mode="wait">
          {tvState === 'film' ? (
            <motion.div
              key="film"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <video
                src={currentFilmUrl}
                autoPlay
                muted
                playsInline
                preload="auto"
                crossOrigin="anonymous"
                className="w-full h-full object-cover"
                onEnded={() => {
                  setTvState('menu');
                  setMenuPageIndex(0);
                }}
                onError={() => {
                  console.error("Video failed to load:", currentFilmUrl);
                  setTvState('menu');
                  setMenuPageIndex(0);
                }}
              />
              
              {/* Product Highlight Overlay */}
              <AnimatePresence mode="wait">
                {highlightProduct && (
                  <motion.div
                    key={highlightProduct.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="absolute top-12 right-12 bg-black/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 flex items-center gap-8 max-w-xl"
                  >
                    <div className="w-32 h-32 rounded-3xl overflow-hidden border border-brand-gold/20 shadow-2xl">
                      <img 
                        src={highlightProduct.image} 
                        className="w-full h-full object-cover" 
                        alt={highlightProduct.name}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h3 className="text-3xl font-serif italic text-brand-gold mb-2">{highlightProduct.name}</h3>
                      <p className="text-white/60 text-sm mb-4 line-clamp-2">{highlightProduct.description}</p>
                      <span className="text-2xl font-serif text-white">€{highlightProduct.price.toFixed(2)}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute bottom-12 left-12 bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                <h2 className="text-4xl font-serif italic text-brand-gold mb-2">{restaurantData.name}</h2>
                <p className="text-white/60 tracking-widest uppercase text-xs">{restaurantData.tagline}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-brand-dark"
            >
              <div className="w-full max-w-[95vw] px-12 py-12 h-screen flex flex-col">
                <div className="text-center mb-16 flex-shrink-0">
                  <h1 className="text-7xl md:text-9xl font-serif mb-6 text-white uppercase tracking-tighter drop-shadow-2xl">
                    {restaurantData.name}
                  </h1>
                  <div className="w-48 h-2 bg-brand-gold mx-auto rounded-full shadow-lg shadow-brand-gold/20" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-20 gap-y-16 flex-1 overflow-hidden">
                  {restaurantData.sections
                    .slice(menuPageIndex * SECTIONS_PER_PAGE, (menuPageIndex + 1) * SECTIONS_PER_PAGE)
                    .map((section, sIdx) => (
                    <div key={sIdx} className="space-y-10">
                      <h2 className="text-5xl font-serif italic text-brand-gold border-b-2 border-brand-gold/30 pb-4 mb-8 flex items-center gap-4">
                        <span className="w-12 h-[1px] bg-brand-gold/30" />
                        {section.title}
                      </h2>
                      <div className="space-y-8">
                        {section.items.map((item, iIdx) => (
                          <div key={iIdx} className="flex justify-between items-start group">
                            <div className="flex-1 pr-10">
                              <h3 className="text-3xl font-medium mb-2 group-hover:text-brand-gold transition-colors text-white/90">
                                {item.name}
                              </h3>
                              <p className="text-lg text-white/40 line-clamp-1 italic font-light">
                                {item.description}
                              </p>
                            </div>
                            <span className="text-3xl font-serif text-brand-gold font-bold">
                              €{item.price.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Page Indicator */}
                {totalMenuPages > 1 && (
                  <div className="flex justify-center gap-4 mt-8">
                    {Array.from({ length: totalMenuPages }).map((_, i) => (
                      <div 
                        key={i}
                        className={`w-3 h-3 rounded-full transition-all duration-500 ${
                          menuPageIndex === i ? 'bg-brand-gold w-12' : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setView('dashboard')}
          className="fixed top-8 right-8 bg-white/5 hover:bg-white/10 p-4 rounded-full border border-white/10 transition-colors z-[110]"
        >
          <X className="w-6 h-6 text-white/40" />
        </button>
      </div>
    );
  }

  if (view === 'dashboard') {
    return (
      <div className="relative">
        <Dashboard data={restaurantData} onUpdate={setRestaurantData} />
        <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
          <button 
            onClick={() => setView('tv')}
            className="bg-brand-dark text-brand-gold p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 font-bold border border-brand-gold/20"
          >
            <Tv className="w-6 h-6" />
            <span>TV Modus</span>
          </button>
          <button 
            onClick={() => setView('menu')}
            className="bg-brand-gold text-brand-dark p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 font-bold"
          >
            <Eye className="w-6 h-6" />
            <span>Bekijk Menu</span>
          </button>
        </div>
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

      <Header name={restaurantData.name} tagline={restaurantData.tagline} />

      <main className="max-w-7xl mx-auto px-4 py-24">
        {restaurantData.sections.map((section, index) => (
          <MenuSection key={index} section={section} />
        ))}
      </main>

      <VideoShowcase highlights={restaurantData.highlights} />
      
      <LocationMap address={restaurantData.location.address} />

      <Footer data={restaurantData} />
    </div>
  );
}

