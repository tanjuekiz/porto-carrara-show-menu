import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Grid2X2, 
  ShoppingBag, 
  Video, 
  ChevronRight,
  Plus,
  Search,
  Bell,
  User,
  Edit2,
  Trash2,
  CheckCircle2,
  Download,
  Play,
  X,
  TrendingUp,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RestaurantData, MenuItem, MenuSection } from '../types';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const StatCard = ({ icon, label, value }: StatCardProps) => (
  <div className="bg-[#1A1A1A] p-6 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center">
    <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center mb-4 text-brand-gold">
      {icon}
    </div>
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    <div className="text-white/40 text-sm uppercase tracking-wider">{label}</div>
  </div>
);

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ActionCard = ({ icon, title, description }: ActionCardProps) => (
  <div className="bg-[#1A1A1A] p-5 rounded-2xl border border-white/5 flex items-center gap-4 group cursor-pointer hover:bg-white/5 transition-colors">
    <div className="w-12 h-12 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
      {icon}
    </div>
    <div className="flex-1">
      <h3 className="text-white font-medium">{title}</h3>
      <p className="text-white/40 text-xs">{description}</p>
    </div>
    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-brand-gold transition-colors" />
  </div>
);

export default function Dashboard({ data, onUpdate }: { data: RestaurantData, onUpdate: (data: RestaurantData) => void }) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedVideoItems, setSelectedVideoItems] = useState<string[]>([]);
  const [videoMode, setVideoMode] = useState<'single' | 'category' | 'custom'>('single');
  const [selectedCategory, setSelectedCategory] = useState(data.sections[0]?.title || '');

  const [editingProduct, setEditingProduct] = useState<{ item: MenuItem, sectionTitle: string } | null>(null);
  const [editingCategory, setEditingCategory] = useState<MenuSection | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [selectedTargetCategory, setSelectedTargetCategory] = useState(data.sections[0]?.title || '');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setImagePreview(base64);
      // Reset input value so same file can be selected again
      e.target.value = '';
    }
  };

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'product' | 'category';
    sectionTitle: string;
    productId?: string;
  } | null>(null);

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Categorieën', icon: <Grid2X2 className="w-5 h-5" /> },
    { name: 'Producten', icon: <ShoppingBag className="w-5 h-5" /> },
    { name: 'Videos', icon: <Video className="w-5 h-5" /> },
  ];

  const toggleVideoItem = (id: string) => {
    setSelectedVideoItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [videoGenerated, setVideoGenerated] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const [isMuted, setIsMuted] = useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const getSelectedItems = () => {
    const allItems = data.sections.flatMap(s => s.items);
    if (videoMode === 'single') {
      return allItems.filter(i => selectedVideoItems.includes(i.id));
    }
    if (videoMode === 'category') {
      return data.sections.find(s => s.title === selectedCategory)?.items || [];
    }
    return allItems.filter(i => selectedVideoItems.includes(i.id));
  };

  const selectedItemsForVideo = getSelectedItems();

  const handleDeleteProduct = (sectionTitle: string, productId: string) => {
    setDeleteConfirmation({ type: 'product', sectionTitle, productId });
  };

  const handleDeleteCategory = (sectionTitle: string) => {
    setDeleteConfirmation({ type: 'category', sectionTitle });
  };

  const confirmDelete = () => {
    if (!deleteConfirmation) return;

    const newData = { ...data };
    if (deleteConfirmation.type === 'product') {
      const section = newData.sections.find(s => s.title === deleteConfirmation.sectionTitle);
      if (section) {
        section.items = section.items.filter(i => i.id !== deleteConfirmation.productId);
      }
    } else {
      newData.sections = newData.sections.filter(s => s.title !== deleteConfirmation.sectionTitle);
      if (selectedCategory === deleteConfirmation.sectionTitle) {
        setSelectedCategory(newData.sections[0]?.title || '');
      }
    }
    onUpdate(newData);
    setDeleteConfirmation(null);
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const description = formData.get('description') as string;
    const fileImage = (e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement)?.files?.[0];
    const targetCategory = formData.get('category') as string;

    let image = editingProduct?.item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800';
    if (fileImage) {
      image = await fileToBase64(fileImage);
    } else if (imagePreview) {
      image = imagePreview;
    }

    const newData = { ...data };
    if (editingProduct) {
      // Als de categorie is gewijzigd, verplaats het product
      if (editingProduct.sectionTitle !== targetCategory) {
        const oldSection = newData.sections.find(s => s.title === editingProduct.sectionTitle);
        const newSection = newData.sections.find(s => s.title === targetCategory);
        if (oldSection && newSection) {
          oldSection.items = oldSection.items.filter(i => i.id !== editingProduct.item.id);
          newSection.items.push({
            ...editingProduct.item,
            name, price, description, image
          });
        }
      } else {
        const section = newData.sections.find(s => s.title === editingProduct.sectionTitle);
        if (section) {
          const item = section.items.find(i => i.id === editingProduct.item.id);
          if (item) {
            item.name = name;
            item.price = price;
            item.description = description;
            item.image = image;
          }
        }
      }
      setEditingProduct(null);
    } else if (isAddingProduct) {
      const section = newData.sections.find(s => s.title === targetCategory);
      if (section) {
        section.items.push({
          id: Math.random().toString(36).substr(2, 9),
          name,
          price,
          description,
          image,
          tags: []
        });
      }
      setIsAddingProduct(false);
    }
    onUpdate(newData);
    setImagePreview(null);
  };

  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const fileImage = (e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement)?.files?.[0];

    let image = '';
    if (fileImage) {
      image = await fileToBase64(fileImage);
    } else if (imagePreview) {
      image = imagePreview;
    }

    const newData = { ...data };
    if (editingCategory) {
      const section = newData.sections.find(s => s.title === editingCategory.title);
      if (section) {
        section.title = title;
        // Als er een nieuwe afbeelding is geüpload, update de eerste item afbeelding (als placeholder voor de categorie)
        if (image && section.items.length > 0) {
          section.items[0].image = image;
        }
      }
      setEditingCategory(null);
    } else if (isAddingCategory) {
      newData.sections.push({
        title,
        items: image ? [{
          id: 'placeholder',
          name: 'Eerste Product',
          description: 'Voeg je eerste product toe',
          price: 0,
          image: image,
          tags: []
        }] : []
      });
      setIsAddingCategory(false);
    }
    onUpdate(newData);
    setImagePreview(null);
  };

  React.useEffect(() => {
    if (videoGenerated && selectedItemsForVideo.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlideIndex(prev => (prev + 1) % selectedItemsForVideo.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [videoGenerated, selectedItemsForVideo.length]);

  const handleDownload = () => {
    const videoUrl = data.highlights[0].url;
    
    // Probeer directe download
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `LArtiste_Promo_${videoMode}.mp4`;
    link.target = '_blank';
    
    // Sommige browsers blokkeren directe download van externe domeinen
    // In dat geval opent het in een nieuw tabblad waar de gebruiker 'Opslaan als' kan doen
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('De video wordt nu geopend in een nieuw venster.\n\nBELANGRIJK: Als je een wit scherm ziet met tekst, ververs dan de pagina (F5) en probeer het opnieuw. De AI heeft de links zojuist vernieuwd naar stabielere versies.');
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleExportVideo = async () => {
    if (selectedItemsForVideo.length === 0) {
      alert('Selecteer eerst producten om een video te maken.');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    // 1. Pre-load alle afbeeldingen om vertraging tijdens opname te voorkomen
    const loadedImages: { [key: string]: HTMLImageElement } = {};
    const loadPromises = selectedItemsForVideo.map(item => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = item.image;
        img.onload = () => {
          loadedImages[item.id] = img;
          resolve(true);
        };
        img.onerror = () => resolve(false);
      });
    });

    await Promise.all(loadPromises);

    const canvas = document.createElement('canvas');
    canvas.width = 1280; // Film breedte (16:9)
    canvas.height = 720; // Film hoogte (16:9)
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Gebruik een stabiele framerate voor de stream
    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { 
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 5000000 // 5Mbps voor goede kwaliteit
    });
    
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `LArtiste_Film_${new Date().getTime()}.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
      setExportProgress(0);
      alert('Film succesvol geëxporteerd in 16:9 breedbeeld formaat!');
    };

    recorder.start();

    // 2. Render loop met echte tijd (Real-time recording)
    const durationPerItem = 5000; // 5 seconden per product
    const totalDuration = selectedItemsForVideo.length * durationPerItem;
    const startTime = Date.now();

    const renderFrame = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      setExportProgress(Math.floor(progress * 100));

      const itemIndex = Math.floor(elapsed / durationPerItem);
      const currentItem = selectedItemsForVideo[itemIndex];
      const itemElapsed = elapsed % durationPerItem;

      // 1. Achtergrond met bewegend verloop
      const time = elapsed / 1000;
      const bgGrad = ctx.createRadialGradient(
        canvas.width / 2 + Math.sin(time) * 100, 
        canvas.height / 2 + Math.cos(time) * 100, 
        0, 
        canvas.width / 2, 
        canvas.height / 2, 
        canvas.width
      );
      bgGrad.addColorStop(0, '#1A1A1A');
      bgGrad.addColorStop(1, '#050505');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Product Foto tekenen met vloeiende beweging
      if (currentItem && loadedImages[currentItem.id]) {
        const img = loadedImages[currentItem.id];
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        
        // Ken Burns effect: langzaam inzoomen en pannen
        const zoom = 1.1 + (itemElapsed / durationPerItem) * 0.15;
        const panX = Math.sin(itemElapsed / durationPerItem * Math.PI) * 20;
        
        ctx.save();
        ctx.translate(canvas.width/2 + panX, canvas.height/2);
        ctx.scale(zoom, zoom);
        ctx.translate(-canvas.width/2, -canvas.height/2);
        
        const x = (canvas.width / 2) - (img.width / 2) * scale;
        const y = (canvas.height / 2) - (img.height / 2) * scale;
        
        ctx.globalAlpha = 0.8;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        ctx.restore();
      }

      // 3. Overlays (Luxe vignet)
      const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width/1.2);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, 'rgba(0,0,0,0.8)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 4. Tekst met animatie
      const textAlpha = Math.min(itemElapsed / 1000, 1) * Math.min((durationPerItem - itemElapsed) / 1000, 1);
      ctx.globalAlpha = textAlpha;

      ctx.fillStyle = '#D4AF37';
      ctx.font = 'italic 32px Georgia';
      ctx.textAlign = 'left';
      ctx.fillText('L\'ARTISTE CULINAIRE', 80, 80);

      if (currentItem) {
        // Product Naam
        ctx.fillStyle = 'white';
        ctx.font = 'italic bold 72px Georgia';
        ctx.textAlign = 'left';
        ctx.fillText(currentItem.name.toUpperCase(), 80, canvas.height - 180);

        // Prijs & Tag
        ctx.fillStyle = '#D4AF37';
        ctx.font = 'bold 48px Georgia';
        ctx.fillText(`€${currentItem.price.toFixed(2)}`, 80, canvas.height - 110);

        const tag = currentItem.tags?.[0] || 'PREMIUM SELECTION';
        ctx.font = 'bold 20px Arial';
        ctx.letterSpacing = '4px';
        ctx.fillText(tag.toUpperCase(), 80, canvas.height - 70);
      }
      ctx.globalAlpha = 1.0;

      if (progress < 1) {
        requestAnimationFrame(renderFrame);
      } else {
        recorder.stop();
      }
    };

    renderFrame();
  };

  const handleGenerateVideo = () => {
    if (videoMode === 'custom' && selectedVideoItems.length === 0) {
      alert('Selecteer eerst minimaal één product.');
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(0);
    setVideoGenerated(false);
    setCurrentSlideIndex(0);

    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setVideoGenerated(true);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Categorieën':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-4xl font-serif italic">Categorieën Beheren</h2>
              <button 
                onClick={() => setIsAddingCategory(true)}
                className="bg-brand-gold text-brand-dark px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <Plus className="w-5 h-5" /> Nieuwe Categorie
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.sections.map((section, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#1A1A1A] rounded-3xl overflow-hidden border border-white/5 group"
                >
                  <div className="relative h-48">
                    <img 
                      src={section.items[0]?.image || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800'} 
                      className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                    <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingCategory(section)}
                        className="p-3 bg-white/10 backdrop-blur-md rounded-xl hover:bg-brand-gold hover:text-brand-dark transition-all"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(section.title)}
                        className="p-3 bg-red-500/20 backdrop-blur-md rounded-xl hover:bg-red-500 text-red-500 hover:text-white transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="absolute bottom-6 left-6">
                      <h3 className="text-3xl font-serif italic mb-1">{section.title}</h3>
                      <p className="text-white/40 text-sm">{section.items.length} Producten</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'Producten':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-4xl font-serif italic">Producten Beheren</h2>
              <button 
                onClick={() => setIsAddingProduct(true)}
                className="bg-brand-gold text-brand-dark px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <Plus className="w-5 h-5" /> Nieuw Product
              </button>
            </div>
            <div className="bg-[#1A1A1A] rounded-3xl border border-white/5 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-widest">
                    <th className="px-8 py-6">Product</th>
                    <th className="px-8 py-6">Categorie</th>
                    <th className="px-8 py-6">Prijs</th>
                    <th className="px-8 py-6 text-right">Acties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.sections.flatMap(s => s.items.map(item => ({ ...item, category: s.title }))).map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <img src={item.image} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-white/40 line-clamp-1">{item.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10">{item.category}</span>
                      </td>
                      <td className="px-8 py-4 font-serif text-brand-gold">€{item.price.toFixed(2)}</td>
                      <td className="px-8 py-4">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setEditingProduct({ item, sectionTitle: item.category })}
                            className="p-2 hover:text-brand-gold transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(item.category, item.id)}
                            className="p-2 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'Videos':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-serif italic mb-2">Pro Video Creator</h2>
                <p className="text-white/40">Selecteer wat je wilt promoten en klik op "Genereer Video".</p>
              </div>
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                {(['single', 'category', 'custom'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setVideoMode(mode);
                      setVideoGenerated(false);
                    }}
                    className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
                      videoMode === mode ? 'bg-brand-gold text-brand-dark' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {mode === 'single' ? 'Product' : mode === 'category' ? 'Categorie' : 'Custom'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-7 space-y-8">
                <div className="bg-[#1A1A1A] p-8 rounded-[2rem] border border-white/5">
                  <h3 className="text-xl font-serif italic mb-6">Stap 1: Selectie</h3>
                  {videoMode === 'single' && (
                    <div className="grid grid-cols-2 gap-4">
                      {data.sections.flatMap(s => s.items).map(item => (
                        <div 
                          key={item.id}
                          onClick={() => {
                            setSelectedVideoItems([item.id]);
                            setVideoGenerated(false);
                          }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                            selectedVideoItems.includes(item.id) ? 'border-brand-gold bg-brand-gold/5' : 'border-white/5 bg-white/[0.02]'
                          }`}
                        >
                          <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />
                          <span className="flex-1 font-medium text-sm">{item.name}</span>
                          {selectedVideoItems.includes(item.id) && <CheckCircle2 className="w-5 h-5 text-brand-gold" />}
                        </div>
                      ))}
                    </div>
                  )}

                  {videoMode === 'category' && (
                    <div className="space-y-4">
                      {data.sections.map(s => (
                        <div 
                          key={s.title}
                          onClick={() => {
                            setSelectedCategory(s.title);
                            setVideoGenerated(false);
                          }}
                          className={`p-6 rounded-3xl border transition-all cursor-pointer flex items-center justify-between ${
                            selectedCategory === s.title ? 'border-brand-gold bg-brand-gold/5' : 'border-white/5 bg-white/[0.02]'
                          }`}
                        >
                          <div className="flex items-center gap-6">
                            <img src={s.items[0]?.image || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800'} className="w-16 h-16 rounded-2xl object-cover" />
                            <div>
                              <h4 className="text-xl font-serif italic">{s.title}</h4>
                              <p className="text-white/40 text-sm">{s.items.length} Producten</p>
                            </div>
                          </div>
                          {selectedCategory === s.title && <CheckCircle2 className="w-6 h-6 text-brand-gold" />}
                        </div>
                      ))}
                    </div>
                  )}

                  {videoMode === 'custom' && (
                    <div className="grid grid-cols-2 gap-4">
                      {data.sections.flatMap(s => s.items).map(item => (
                        <div 
                          key={item.id}
                          onClick={() => {
                            toggleVideoItem(item.id);
                            setVideoGenerated(false);
                          }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                            selectedVideoItems.includes(item.id) ? 'border-brand-gold bg-brand-gold/5' : 'border-white/5 bg-white/[0.02]'
                          }`}
                        >
                          <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />
                          <span className="flex-1 font-medium text-sm">{item.name}</span>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedVideoItems.includes(item.id) ? 'bg-brand-gold border-brand-gold' : 'border-white/10'
                          }`}>
                            {selectedVideoItems.includes(item.id) && <CheckCircle2 className="w-4 h-4 text-brand-dark" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-12">
                    <h3 className="text-xl font-serif italic mb-6">Stap 2: Genereren</h3>
                    <button 
                      onClick={handleGenerateVideo}
                      disabled={isGenerating}
                      className="w-full bg-orange-500 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-orange-500/20 disabled:opacity-50 disabled:scale-100"
                    >
                      {isGenerating ? (
                        <>
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Video className="w-6 h-6" />
                          </motion.div>
                          AI is bezig met renderen... {generationProgress}%
                        </>
                      ) : (
                        <>
                          <Play className="w-6 h-6 fill-brand-dark" />
                          GENEREER VIDEO
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-12">
                <div className="sticky top-12">
                  <div className="bg-[#1A1A1A] aspect-video rounded-[3rem] border-[12px] border-white/5 overflow-hidden relative shadow-2xl">
                    {isGenerating ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-6">
                          <motion.div 
                            className="h-full bg-brand-gold"
                            initial={{ width: 0 }}
                            animate={{ width: `${generationProgress}%` }}
                          />
                        </div>
                        <p className="text-brand-gold font-serif italic text-xl mb-2">Video wordt gemaakt...</p>
                        <p className="text-white/40 text-sm">AI optimaliseert beelden voor social media</p>
                      </div>
                    ) : videoGenerated ? (
                      <>
                        <video 
                          ref={videoRef}
                          src={data.highlights[0].url} 
                          autoPlay loop muted={isMuted} playsInline 
                          className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60" />
                        
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={selectedItemsForVideo[currentSlideIndex]?.id || 'bg'}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0"
                          >
                            <img 
                              src={selectedItemsForVideo[currentSlideIndex]?.image} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                          </motion.div>
                        </AnimatePresence>
                        
                        <div className="absolute top-12 left-8 right-8 flex justify-between items-center z-10">
                          <button 
                            onClick={toggleMute}
                            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
                          >
                            {isMuted ? <X className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 fill-white" />}
                          </button>
                          <span className="text-[10px] font-bold tracking-[0.2em] uppercase bg-brand-gold text-brand-dark px-3 py-1 rounded-full">
                            {videoMode === 'category' ? selectedCategory : 'Chef Selection'}
                          </span>
                        </div>

                        <div className="absolute bottom-12 left-8 right-8 z-10">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={selectedItemsForVideo[currentSlideIndex]?.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                            >
                              <h4 className="text-4xl font-serif italic mb-2 text-white leading-tight">
                                {selectedItemsForVideo[currentSlideIndex]?.name}
                              </h4>
                              <p className="text-brand-gold font-medium tracking-wide text-sm uppercase">
                                Nu te bestellen bij L'Artiste
                              </p>
                              <div className="mt-4 flex items-center gap-2">
                                <div className="h-0.5 flex-1 bg-brand-gold/30 rounded-full overflow-hidden">
                                  <motion.div 
                                    className="h-full bg-brand-gold"
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 3, ease: "linear" }}
                                    key={currentSlideIndex}
                                  />
                                </div>
                                <span className="text-[10px] text-white/40 font-mono">
                                  {currentSlideIndex + 1} / {selectedItemsForVideo.length}
                                </span>
                              </div>
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center opacity-40">
                        <Video className="w-16 h-16 mb-6 text-white/20" />
                        <p className="text-white/40 font-serif italic text-lg">Selecteer je producten en klik op de knop om de preview te genereren.</p>
                      </div>
                    )}
                  </div>
                  
                  {videoGenerated && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 flex flex-col gap-4"
                    >
                      <button 
                        onClick={handleExportVideo}
                        disabled={isExporting}
                        className="w-full bg-white text-brand-dark py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-brand-gold transition-colors shadow-xl disabled:opacity-50"
                      >
                        {isExporting ? (
                          <>
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Video className="w-5 h-5" />
                            </motion.div>
                            Exporteren... {exportProgress}%
                          </>
                        ) : (
                          <>
                            <Download className="w-5 h-5" /> Downloaden voor Instagram
                          </>
                        )}
                      </button>
                      {isExporting && (
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-brand-gold"
                            initial={{ width: 0 }}
                            animate={{ width: `${exportProgress}%` }}
                          />
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <StatCard icon={<Grid2X2 />} label="Categorieën" value="4" />
              <StatCard icon={<ShoppingBag />} label="Producten" value="10" />
              <StatCard icon={<TrendingUp className="text-brand-gold" />} label="Verkoop Potentieel" value="+24%" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-4">
                <div onClick={() => setActiveTab('Categorieën')}>
                  <ActionCard 
                    icon={<Grid2X2 />} 
                    title="Categorieën beheren" 
                    description="Fotos uploaden, aanpassen, verwijderen" 
                  />
                </div>
                <div onClick={() => setActiveTab('Producten')}>
                  <ActionCard 
                    icon={<ShoppingBag />} 
                    title="Producten beheren" 
                    description="Toevoegen met prijs en foto" 
                  />
                </div>
                <div onClick={() => setActiveTab('Videos')}>
                  <ActionCard 
                    icon={<Video />} 
                    title="Social media videos" 
                    description="AI-gedreven promotie videos maken" 
                  />
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-brand-gold" />
                  </div>
                  <h3 className="text-xl font-serif italic">Verkoop Tactieken</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-brand-gold text-xs font-bold uppercase tracking-widest">Kleur Psychologie</p>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Gebruik <span className="text-brand-gold">Goud & Zwart</span> voor een luxe uitstraling. Voeg <span className="text-orange-500">Oranje</span> accenten toe bij acties om eetlust en urgentie te stimuleren.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-brand-gold text-xs font-bold uppercase tracking-widest">Presentatie</p>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Plaats je meest winstgevende gerechten in de <span className="text-white">"Gouden Driehoek"</span> (midden en rechtsboven). Gebruik zintuiglijke woorden zoals 'romig', 'knapperig' en 'vers'.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-brand-gold text-xs font-bold uppercase tracking-widest">Social Proof</p>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Mensen kiezen wat anderen kiezen. Gebruik labels zoals <span className="italic">"Populair"</span> of <span className="italic">"Chef's Choice"</span> om de keuze makkelijker te maken.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveTab('Videos')}
                  className="w-full mt-8 py-4 bg-brand-gold/10 border border-brand-gold/30 text-brand-gold rounded-xl text-sm font-bold hover:bg-brand-gold hover:text-brand-dark transition-all"
                >
                  Pas tactiek toe in video
                </button>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0F0F0F] text-white font-sans">
      <aside className="w-72 border-r border-white/5 p-8 flex flex-col">
        <div className="mb-12">
          <h1 className="text-2xl font-serif italic text-brand-gold">{data.name} Manager</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
                activeTab === item.name 
                ? 'bg-brand-gold text-brand-dark font-semibold shadow-lg shadow-brand-gold/20' 
                : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5">
          <div className="flex items-center gap-4 px-4">
            <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium">{data.name} Admin</p>
              <p className="text-xs text-white/40">Beheerder</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-serif mb-2 italic">{activeTab}</h2>
            <p className="text-white/40">
              {activeTab === 'Dashboard' ? 'Welkom bij jouw content studio.' : `Beheer je ${activeTab.toLowerCase()}.`}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input 
                type="text" 
                placeholder="Zoeken..." 
                className="bg-white/5 border border-white/10 rounded-xl py-2 pl-12 pr-4 text-sm focus:outline-none focus:border-brand-gold/50 transition-colors w-64"
              />
            </div>
            <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-brand-gold transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {renderContent()}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {(editingProduct || isAddingProduct) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-8 w-full max-w-lg"
            >
              <h3 className="text-2xl font-serif italic mb-6">
                {editingProduct ? 'Product Bewerken' : 'Nieuw Product Toevoegen'}
              </h3>
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div className="flex gap-6 mb-6">
                  <div className="w-32 h-32 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center relative group">
                    {(imagePreview || editingProduct?.item.image) ? (
                      <img src={imagePreview || editingProduct?.item.image} className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-8 h-8 text-white/20" />
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                      <p className="text-[10px] font-bold uppercase tracking-widest">Wijzig</p>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Categorie</label>
                      <select 
                        name="category" 
                        defaultValue={editingProduct?.sectionTitle || data.sections[0]?.title}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold outline-none transition-colors"
                      >
                        {data.sections.map(s => (
                          <option key={s.title} value={s.title} className="bg-brand-dark">{s.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Naam</label>
                      <input name="name" type="text" defaultValue={editingProduct?.item.name} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold outline-none transition-colors" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Prijs (€)</label>
                    <input name="price" type="number" step="0.01" defaultValue={editingProduct?.item.price} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold outline-none transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Beschrijving</label>
                  <textarea name="description" defaultValue={editingProduct?.item.description} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold outline-none transition-colors h-24" />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => { setEditingProduct(null); setIsAddingProduct(false); setImagePreview(null); }} className="flex-1 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">Annuleren</button>
                  <button type="submit" className="flex-1 py-4 rounded-xl bg-brand-gold text-brand-dark font-bold hover:scale-105 transition-transform">Opslaan</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {(editingCategory || isAddingCategory) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-8 w-full max-w-lg"
            >
              <h3 className="text-2xl font-serif italic mb-6">
                {editingCategory ? 'Categorie Bewerken' : 'Nieuwe Categorie Toevoegen'}
              </h3>
              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center relative group">
                    {(imagePreview || editingCategory?.items[0]?.image) ? (
                      <img src={imagePreview || editingCategory?.items[0]?.image} className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-6 h-6 text-white/20" />
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                      <p className="text-[10px] font-bold uppercase tracking-widest">Wijzig</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Titel</label>
                    <input name="title" defaultValue={editingCategory?.title} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold outline-none transition-colors" />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => { setEditingCategory(null); setIsAddingCategory(false); setImagePreview(null); }} className="flex-1 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">Annuleren</button>
                  <button type="submit" className="flex-1 py-4 rounded-xl bg-brand-gold text-brand-dark font-bold hover:scale-105 transition-transform">Opslaan</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {deleteConfirmation && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1A1A1A] border border-red-500/20 rounded-[2rem] p-8 w-full max-w-md text-center"
            >
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-6">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-serif italic mb-4">Weet je het zeker?</h3>
              <p className="text-white/60 mb-8">
                {deleteConfirmation.type === 'product' 
                  ? 'Dit product wordt definitief verwijderd uit je menukaart.' 
                  : 'Deze categorie en ALLE producten daarin worden definitief verwijderd.'}
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteConfirmation(null)} 
                  className="flex-1 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                >
                  Annuleren
                </button>
                <button 
                  onClick={confirmDelete} 
                  className="flex-1 py-4 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                >
                  Verwijderen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
