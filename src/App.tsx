/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import MenuSection from './components/MenuSection';
import VideoShowcase from './components/VideoShowcase';
import LocationMap from './components/LocationMap';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import { RESTAURANT_DATA as INITIAL_DATA } from './constants';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import { Settings, Eye, Tv, Monitor, Play, X, ChevronLeft, ChevronRight, HandMetal } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'menu' | 'dashboard' | 'tv'>('menu');
  const [restaurantData, setRestaurantData] = useState(() => {
    const saved = localStorage.getItem('mission_gastro_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Force update of TV highlights to the final, stable cross-compatible links
        const hasOldIds = parsed.highlights?.some((h: any) => h.id.startsWith('mi') || h.id.startsWith('v1') || h.id.startsWith('new_v'));
        if (!parsed.highlights || parsed.highlights.length < 7 || hasOldIds) {
          parsed.highlights = INITIAL_DATA.highlights;
          parsed.selectedTvHighlightIds = INITIAL_DATA.selectedTvHighlightIds;
        }

        // Validation: ensures sections exists and is an array
        if (!parsed.sections || !Array.isArray(parsed.sections)) {
          throw new Error("Invalid sections data in localStorage");
        }

        // Force HTTPS on all highlights to prevent mixed-content blocks
        if (parsed.highlights) {
          parsed.highlights = parsed.highlights.map((h: any) => ({
            ...h,
            url: h.url ? h.url.replace('http://', 'https://') : ''
          }));
        }
        return parsed;
      } catch (e) {
        console.error("Failed to parse saved data", e);
        return INITIAL_DATA;
      }
    }
    return INITIAL_DATA;
  });

  // Persist data to localStorage
  useEffect(() => {
    localStorage.setItem('mission_gastro_data', JSON.stringify(restaurantData));
  }, [restaurantData]);

  const [tvState, setTvState] = useState<'film' | 'menu'>('film');
  const [menuPageIndex, setMenuPageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [currentFilmUrl, setCurrentFilmUrl] = useState('');
  const [highlightProduct, setHighlightProduct] = useState<any>(null);
  const tvVideoRef = useRef<HTMLVideoElement>(null);

  const SECTIONS_PER_PAGE = 4;
  const totalMenuPages = Math.ceil((restaurantData?.sections?.length || 0) / SECTIONS_PER_PAGE);

  // Force Film mode ONLY when entering TV view from another view
  useEffect(() => {
    if (view === 'tv') {
      setTvState('film');
      setCurrentFilmUrl('');
      setMenuPageIndex(0);
      setLastActivity(Date.now());
    }
  }, [view]);

  // Handle video autoplay
  useEffect(() => {
    if (view === 'tv' && tvState === 'film') {
      const playVideo = async () => {
        if (tvVideoRef.current) {
          try {
            tvVideoRef.current.muted = true;
            await tvVideoRef.current.play();
          } catch (err) {
            console.log("Autoplay failed, retrying...", err);
            setTimeout(async () => {
              if (tvVideoRef.current) {
                tvVideoRef.current.muted = true;
                await tvVideoRef.current.play().catch(e => console.log("Final autoplay attempt failed", e));
              }
            }, 500);
          }
        }
      };

      playVideo();
    }
  }, [view, tvState, currentFilmUrl]);

  // TV Mode Product Cycling
  useEffect(() => {
    if (view !== 'tv' || tvState !== 'film') return;

    const allItems = restaurantData?.sections?.flatMap(s => s.items) || [];
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
      // Film sequence timer (18s)
      const activeFilms = restaurantData.highlights?.filter(h => h.activeOnTv) || [];
      const pool = activeFilms.length > 0 ? activeFilms : (restaurantData.highlights || []);
      
      if (pool.length > 0 && !currentFilmUrl) {
        const randomVideo = pool[Math.floor(Math.random() * pool.length)].url;
        setCurrentFilmUrl(randomVideo);
      }
      
      timer = setTimeout(() => {
        setTvState('menu');
        setMenuPageIndex(0);
        setDirection(1);
        setLastActivity(Date.now());
      }, 18000); // 18 seconds film
    } else {
      // Inactivity or Automatic Menu Cycle
      const elapsedSinceActivity = Date.now() - lastActivity;
      
      if (elapsedSinceActivity >= 30000) {
        // Automatic cycling through menu pages when no interaction
        timer = setTimeout(() => {
          if (menuPageIndex + 1 < totalMenuPages) {
            setDirection(1);
            setMenuPageIndex(prev => prev + 1);
          } else {
            // After last page, go back to film
            setTvState('film');
            setCurrentFilmUrl('');
            setMenuPageIndex(0);
          }
        }, 15000); // 15 seconds per menu page during auto-cycle
      } else {
        // Wait for inactivity to reach 30s before auto-cycling or going to film
        const nextTick = 30000 - elapsedSinceActivity;
        timer = setTimeout(() => {
          // Just triggers a re-render to enter the auto-cycle block above
          setLastActivity(prev => prev - 1); 
        }, nextTick);
      }
    }

    return () => clearTimeout(timer);
  }, [view, tvState, menuPageIndex, totalMenuPages, restaurantData.highlights, lastActivity]);

  const handleTvInteraction = (newDir?: number) => {
    setLastActivity(Date.now());
    
    if (tvState === 'film') {
      setTvState('menu');
      setMenuPageIndex(0);
      setDirection(1);
      return;
    }

    if (newDir !== undefined) {
      if (newDir === 1) { // Forward
        if (menuPageIndex + 1 < totalMenuPages) {
          setDirection(1);
          setMenuPageIndex(prev => prev + 1);
        } else {
          setDirection(1);
          setMenuPageIndex(0);
        }
      } else if (newDir === -1) { // Backward
        if (menuPageIndex > 0) {
          setDirection(-1);
          setMenuPageIndex(prev => prev - 1);
        } else {
          setDirection(-1);
          setMenuPageIndex(totalMenuPages - 1);
        }
      }
    }
  };

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  if (view === 'tv') {
    const slideVariants = {
      enter: (direction: number) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
        rotateY: direction > 0 ? 45 : -45
      }),
      center: {
        x: 0,
        opacity: 1,
        rotateY: 0
      },
      exit: (direction: number) => ({
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0,
        rotateY: direction < 0 ? 45 : -45
      })
    };

    return (
      <div className="fixed inset-0 bg-brand-dark z-[100] overflow-hidden perspective-1000">
        <AnimatePresence mode="wait" custom={direction}>
          {tvState === 'film' ? (
            <motion.div
              key="film"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              whileTap={{ scale: 0.98 }}
              className="absolute inset-0 cursor-pointer"
              onClick={() => handleTvInteraction()}
            >
              <video
                ref={tvVideoRef}
                src={currentFilmUrl || "https://vjs.zencdn.net/v/oceans.mp4"}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-cover"
              />
              
              {/* Product Highlight Overlay */}
              <AnimatePresence mode="wait">
                {highlightProduct && (
                  <motion.div
                    key={highlightProduct.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="absolute top-8 md:top-12 right-4 md:right-12 bg-black/60 backdrop-blur-xl p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-white/10 flex flex-col md:flex-row items-center gap-6 md:gap-12 max-w-[90vw] md:max-w-4xl shadow-2xl"
                  >
                    <div className="w-48 h-48 md:w-80 md:h-80 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border-2 border-brand-gold/20 shadow-2xl flex-shrink-0">
                      <img 
                        src={highlightProduct.image} 
                        className="w-full h-full object-cover" 
                        alt={highlightProduct.name}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="text-center md:text-left">
                      <div className="text-brand-gold uppercase tracking-[0.3em] text-[10px] md:text-xs mb-4 font-bold">Aanbevolen Specialiteit</div>
                      <h3 className="text-4xl md:text-7xl font-display italic text-brand-gold mb-4 leading-tight">{highlightProduct.name}</h3>
                      <p className="text-white/60 text-lg md:text-2xl mb-8 leading-relaxed line-clamp-3 md:line-clamp-none max-w-xl">{highlightProduct.description}</p>
                      <div className="inline-flex items-center gap-4 bg-brand-gold text-brand-dark px-8 py-4 rounded-full font-display text-2xl md:text-4xl">
                        <span>€{highlightProduct.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute bottom-12 left-12 bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex items-end gap-12">
                <div>
                  <h2 className="text-2xl md:text-4xl font-display italic text-brand-gold mb-1 md:mb-2">{restaurantData.name}</h2>
                  <p className="text-white/60 tracking-widest uppercase text-xs">{restaurantData.tagline}</p>
                </div>
                
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="hidden md:flex flex-col items-center gap-2 text-brand-gold bg-brand-gold/10 px-6 py-4 rounded-2xl border border-brand-gold/20"
                >
                  <HandMetal className="w-8 h-8 animate-bounce" />
                  <span className="font-display italic text-xl">Tik om menu te zien</span>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`menu-${menuPageIndex}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.5 },
                rotateY: { duration: 0.8 }
              }}
              className="absolute inset-0 flex items-center justify-center bg-brand-dark preserve-3d"
            >
              <div className="w-full h-full flex items-center justify-center px-6 md:px-12 pt-4 pb-12 relative">
                {/* Navigation Hotspots */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1/4 z-50 cursor-w-resize flex items-center justify-start pl-8 group"
                  onClick={() => handleTvInteraction(-1)}
                >
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 backdrop-blur-sm">
                    <ChevronLeft className="w-8 h-8 text-brand-gold" />
                  </div>
                </div>
                <div 
                  className="absolute right-0 top-0 bottom-0 w-1/4 z-50 cursor-e-resize flex items-center justify-end pr-8 group"
                  onClick={() => handleTvInteraction(1)}
                >
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 backdrop-blur-sm">
                    <ChevronRight className="w-8 h-8 text-brand-gold" />
                  </div>
                </div>

                <div className="w-full max-w-[95vw] h-full flex flex-col pt-safe px-4">
                  <div className="text-center mb-2 md:mb-4 flex-shrink-0">
                    <h1 className="text-4xl sm:text-7xl md:text-8xl font-display mb-1 text-white uppercase tracking-tighter drop-shadow-2xl">
                      {restaurantData.name}
                    </h1>
                    <div className="w-48 h-1 bg-brand-gold mx-auto rounded-full shadow-lg shadow-brand-gold/20 opacity-50" />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 flex-1 min-h-0 overflow-hidden h-full pb-12">
                    {(restaurantData?.sections || [])
                      .slice(menuPageIndex * SECTIONS_PER_PAGE, (menuPageIndex + 1) * SECTIONS_PER_PAGE)
                      .map((section: any, sIdx: number) => (
                      <div key={sIdx} className="bg-white/5 p-8 rounded-[2rem] border border-white/5 flex flex-col h-full backdrop-blur-sm shadow-2xl">
                        <h2 className="text-3xl font-display italic text-brand-gold border-b border-brand-gold/20 pb-4 mb-6 text-center">
                          {section.title}
                        </h2>
                        <div className="space-y-4 overflow-y-auto pr-1 custom-scrollbar flex-1">
                          {(section.items || []).map((item: any, iIdx: number) => (
                            <div key={iIdx} className="flex justify-between items-start gap-4 py-2 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors rounded-lg px-2">
                              <div className="flex-1">
                                <h3 className="text-lg md:text-xl font-medium text-white/90 leading-tight">
                                  {item.name}
                                </h3>
                                <p className="text-xs text-white/40 line-clamp-2 italic mt-1">
                                  {item.description}
                                </p>
                              </div>
                              <span className="text-lg md:text-xl font-display text-brand-gold whitespace-nowrap">
                                €{item.price.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Page Indicator / Book Progress */}
                  <div className="absolute bottom-8 left-12 right-12 flex flex-col items-center gap-2">
                    <div className="w-full max-w-xl h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-brand-gold"
                        initial={false}
                        animate={{ width: `${((menuPageIndex + 1) / totalMenuPages) * 100}%` }}
                      />
                    </div>
                    <div className="text-brand-gold/40 font-mono text-sm tracking-widest uppercase">
                      Pagina {menuPageIndex + 1} / {totalMenuPages}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setView('dashboard')}
          className="fixed top-8 right-8 bg-black/40 hover:bg-black/60 p-4 rounded-full border border-white/10 transition-colors z-[110] backdrop-blur-md"
        >
          <X className="w-6 h-6 text-white/60" />
        </button>
      </div>
    );
  }

  if (view === 'dashboard') {
    return (
      <div className="relative">
        <Dashboard data={restaurantData} onUpdate={setRestaurantData} />
        <div className="fixed bottom-8 right-8 hidden md:flex flex-col gap-4 z-50">
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
        
        {/* Mobile Nav */}
        <div className="fixed bottom-0 left-0 right-0 bg-brand-dark/95 backdrop-blur-xl border-t border-white/5 flex md:hidden z-50 px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] justify-around items-center">
          <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-1 ${view === 'dashboard' ? 'text-brand-gold' : 'text-white/40'}`}>
            <Settings className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Beheer</span>
          </button>
          <button onClick={() => setView('tv')} className={`flex flex-col items-center gap-1 ${view === 'tv' ? 'text-brand-gold' : 'text-white/40'}`}>
            <Tv className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">TV</span>
          </button>
          <button onClick={() => setView('menu')} className={`flex flex-col items-center gap-1 ${view === 'menu' ? 'text-brand-gold' : 'text-white/40'}`}>
            <Eye className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Menu</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen selection:bg-brand-gold/30 relative">
      {/* View Toggle - Desktop Only */}
      <button 
        onClick={() => setView('dashboard')}
        className="fixed bottom-8 right-8 hidden md:flex bg-brand-dark text-brand-gold p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 items-center gap-2 font-bold border border-brand-gold/20"
      >
        <Settings className="w-6 h-6" />
        <span>Beheer Menu</span>
      </button>

      {/* Mobile Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-brand-dark/95 backdrop-blur-xl border-t border-white/5 flex md:hidden z-50 px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] justify-around items-center">
        <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-1 ${view === 'dashboard' ? 'text-brand-gold' : 'text-white/40'}`}>
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Beheer</span>
        </button>
        <button onClick={() => setView('tv')} className={`flex flex-col items-center gap-1 ${view === 'tv' ? 'text-brand-gold' : 'text-white/40'}`}>
          <Tv className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">TV</span>
        </button>
        <button onClick={() => setView('menu')} className={`flex flex-col items-center gap-1 ${view === 'menu' ? 'text-brand-gold' : 'text-white/40'}`}>
          <Eye className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Menu</span>
        </button>
      </div>

      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-brand-gold z-50 origin-left"
        style={{ scaleX }}
      />

      <Header 
        name={restaurantData.name} 
        tagline={restaurantData.tagline} 
        logo={restaurantData.logo}
        heroImage={restaurantData.heroImage}
        announcement={restaurantData.activeAnnouncement}
      />

      <AnimatePresence>
        {restaurantData.isSiteOpen === false && view === 'menu' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-brand-dark/95 backdrop-blur-xl flex items-center justify-center p-8 text-center"
          >
            <div className="max-w-md">
              <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <X className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-4xl font-display italic text-brand-gold mb-4">Wij zijn tijdelijk gesloten</h2>
              <p className="text-white/60 mb-8">Onze online menukaart is momenteel niet live. Kom snel weer terug!</p>
              <button 
                onClick={() => setView('dashboard')}
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors"
              >
                Terug naar beheer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-6 py-24 mb-20 overflow-hidden">
        {(restaurantData?.sections || []).map((section: any, index: number) => (
          <MenuSection key={index} section={section} />
        ))}
      </main>

      <VideoShowcase highlights={restaurantData?.highlights || []} />
      
      <LocationMap address={restaurantData?.location?.address || ''} />

      <Footer data={restaurantData} />
    </div>
  );
}

