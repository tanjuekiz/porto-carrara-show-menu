import React, { useState, useEffect } from 'react';
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
  Tv,
  TrendingUp,
  Upload,
  Settings,
  Sparkles,
  Loader2,
  Globe,
  FileText,
  Code,
  RotateCcw,
  Database,
  History,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RestaurantData, MenuItem, MenuSection } from '../types';
import { generateProductImage } from '../services/geminiService';
import { GoogleGenAI, Type } from "@google/genai";
import Papa from 'papaparse';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const StatCard = ({ icon, label, value }: StatCardProps) => (
  <div className="bg-[#1A1A1A] p-4 md:p-6 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center">
    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center mb-4 text-brand-gold">
      {icon}
    </div>
    <div className="text-2xl md:text-3xl font-bold text-white mb-1">{value}</div>
    <div className="text-white/40 text-[10px] md:text-sm uppercase tracking-wider">{label}</div>
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [selectedVideoItems, setSelectedVideoItems] = useState<string[]>([]);
  const [videoMode, setVideoMode] = useState<'single' | 'category' | 'custom'>('single');
  const [selectedCategory, setSelectedCategory] = useState(data?.sections?.[0]?.title || '');

  const [editingProduct, setEditingProduct] = useState<{ item: MenuItem, sectionTitle: string } | null>(null);
  const [editingCategory, setEditingCategory] = useState<MenuSection | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [selectedTargetCategory, setSelectedTargetCategory] = useState(data?.sections?.[0]?.title || '');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(data.logo || null);
  const [heroPreview, setHeroPreview] = useState<string | null>(data.heroImage || null);
  const [isGeneratingAiImage, setIsGeneratingAiImage] = useState(false);
  const [aiFormValues, setAiFormValues] = useState({ name: '', description: '' });
  const [importUrl, setImportUrl] = useState('');
  const [importText, setImportText] = useState('');
  const [isImportingData, setIsImportingData] = useState(false);
  const [isSmartImporting, setIsSmartImporting] = useState(false);
  const [isTextImporting, setIsTextImporting] = useState(false);
  const [isCsvImporting, setIsCsvImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [backupSections, setBackupSections] = useState<MenuSection[] | null>(() => {
    const saved = localStorage.getItem('menu_backup');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleUrlImport = async () => {
    if (!importUrl) {
      alert('Voer een geldige URL in.');
      return;
    }

    setIsImportingData(true);
    try {
      const response = await fetch(importUrl);
      if (!response.ok) throw new Error('Kon data niet ophalen van URL');
      const importedData = await response.json();

      // Basic validation
      if (!importedData.sections || !Array.isArray(importedData.sections)) {
        throw new Error('Ongeldig menu formaat. "sections" array ontbreekt.');
      }

      onUpdate({
        ...data,
        ...importedData
      });
      
      alert('Menu succesvol geïmporteerd!');
      setImportUrl('');
      setActiveTab('Dashboard');
    } catch (error) {
      console.error('Import error:', error);
      alert(`Fout bij importeren: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
    } finally {
      setIsImportingData(false);
    }
  };

  const handleSmartImport = async () => {
    if (!importUrl) {
      alert('Voer een website URL in.');
      return;
    }

    setIsSmartImporting(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey: apiKey! });
      
      const prompt = `Extract the full restaurant menu from this URL: ${importUrl}. 
      Return the menu structured exactly as a JSON object with a "sections" array. 
      Each section MUST have a "title" (string) and "items" (array of objects).
      Each item MUST have "id" (unique string), "name" (string), "price" (number), "description" (string), and "image" (string - use a placeholder from picsum or similar if not found).
      Focus on Voorgerechten, Hoofdgerechten, Desserts, and Drinks.
      Return ONLY the valid JSON object.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ urlContext: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    items: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          name: { type: Type.STRING },
                          price: { type: Type.NUMBER },
                          description: { type: Type.STRING },
                          image: { type: Type.STRING }
                        },
                        required: ["id", "name", "price", "description", "image"]
                      }
                    }
                  },
                  required: ["title", "items"]
                }
              }
            },
            required: ["sections"]
          }
        }
      });

      const importedData = JSON.parse(response.text);
      
      if (!importedData.sections || !Array.isArray(importedData.sections)) {
        throw new Error('De AI kon geen geldige menu-structuur vinden op deze pagina.');
      }

      // Merge with current data
      onUpdate({
        ...data,
        sections: importedData.sections
      });
      
      alert('AI heeft het menu succesvol van de website ' + importUrl + ' gelezen!');
      setImportUrl('');
      setActiveTab('Dashboard');
    } catch (error) {
      console.error('Smart Import error:', error);
      alert(`AI Import fout: ${error instanceof Error ? error.message : 'Kon de website niet lezen'}`);
    } finally {
      setIsSmartImporting(false);
    }
  };

  const handleTextImport = async () => {
    if (!importText || importText.trim().length < 10) {
      alert('Plak a.u.b. de menu tekst of lijst met gerechten.');
      return;
    }

    setIsTextImporting(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey: apiKey! });
      
      const prompt = `Convert the following unstructured restaurant menu text into a structured JSON:
      
      MENU TEXT:
      ${importText}
      
      REQUIREMENTS:
      Return a JSON object with a "sections" array. 
      Each section MUST have a "title" (string) and "items" (array of objects).
      Each item MUST have "id" (unique string), "name" (string), "price" (number), "description" (string), and "image" (string - use a placeholder from unsplash/picsum).
      Format the response ONLY as valid JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    items: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          name: { type: Type.STRING },
                          price: { type: Type.NUMBER },
                          description: { type: Type.STRING },
                          image: { type: Type.STRING }
                        },
                        required: ["id", "name", "price", "description", "image"]
                      }
                    }
                  },
                  required: ["title", "items"]
                }
              }
            },
            required: ["sections"]
          }
        }
      });

      const importedData = JSON.parse(response.text);
      
      if (!importedData.sections || !Array.isArray(importedData.sections)) {
        throw new Error('AI kon de tekst niet vertalen naar een menu.');
      }

      onUpdate({
        ...data,
        sections: importedData.sections
      });
      
      alert('AI heeft je tekst succesvol omgezet naar een menu!');
      setImportText('');
      setActiveTab('Dashboard');
    } catch (error) {
      console.error('Text Import error:', error);
      alert(`AI Tekst Import fout: ${error instanceof Error ? error.message : 'Kon de tekst niet verwerken'}`);
    } finally {
      setIsTextImporting(false);
    }
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCsvImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data as any[];
          const sectionsMap: { [key: string]: MenuItem[] } = {};

          rows.forEach((row, index) => {
            const category = row.category || row.Categorie || 'Overig';
            const item: MenuItem = {
              id: row.id || `csv-${index}-${Date.now()}`,
              name: row.name || row.Naam || 'Naamloos Gerecht',
              price: parseFloat(row.price || row.Prijs) || 0,
              description: row.description || row.Beschrijving || '',
              image: row.image || row.Afbeelding || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800'
            };

            if (!sectionsMap[category]) {
              sectionsMap[category] = [];
            }
            sectionsMap[category].push(item);
          });

          const sections: MenuSection[] = Object.keys(sectionsMap).map(title => ({
            title,
            items: sectionsMap[title]
          }));

          onUpdate({
            ...data,
            sections
          });

          alert(`CSV succesvol geïmporteerd! ${rows.length} gerechten toegevoegd.`);
          setActiveTab('Dashboard');
        } catch (error) {
          console.error('CSV Parsing error:', error);
          alert('Fout bij het verwerken van het CSV-bestand. Controleer de kolomnamen (category, name, price, description, image).');
        } finally {
          setIsCsvImporting(false);
          e.target.value = '';
        }
      },
      error: (error) => {
        console.error('Papa Parse error:', error);
        alert('Fout bij het lezen van het CSV-bestand.');
        setIsCsvImporting(false);
      }
    });
  };

  const handleResetMenu = () => {
    if (confirm('Weet je zeker dat je ALLE categorieën en producten wilt verwijderen? Dit kan niet ongedaan worden gemaakt, tenzij je een backup hebt.')) {
      onUpdate({
        ...data,
        sections: []
      });
      alert('Menu is volledig leeggemaakt.');
    }
  };

  const handleCreateBackup = () => {
    localStorage.setItem('menu_backup', JSON.stringify(data.sections));
    setBackupSections(data.sections);
    alert('Backup succesvol opgeslagen in je browser!');
  };

  const handleRestoreBackup = () => {
    if (!backupSections) return;
    if (confirm('Weet je zeker dat je de backup wilt terugzetten? Je huidige (niet-opgeslagen) wijzigingen gaan verloren.')) {
      onUpdate({
        ...data,
        sections: backupSections
      });
      alert('Backup succesvol teruggezet!');
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data.sections, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `menu_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.removeChild(downloadAnchorNode);
  };

  const fileToBase64 = (file: File, maxWidth = 800, maxHeight = 800): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setImagePreview(base64);
        e.target.value = '';
      } catch (err) {
        alert("Fout bij het verwerken van de afbeelding. Probeer een kleiner bestand.");
      }
    }
  };

  const handleAiPhotoGenerate = async () => {
    if (!aiFormValues.name) {
      alert("Vul eerst een naam in voor het product om een AI foto te genereren.");
      return;
    }

    setIsGeneratingAiImage(true);
    try {
      const imageUrl = await generateProductImage(aiFormValues.name, aiFormValues.description, data.name);
      setImagePreview(imageUrl);
    } catch (err) {
      alert("AI Foto genereren mislukt. Controleer je internetverbinding of probeer het later opnieuw.");
    } finally {
      setIsGeneratingAiImage(false);
    }
  };

  const [showStockGallery, setShowStockGallery] = useState(false);
  const stockImages = [
    { url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800", label: "Gezond" },
    { url: "https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?auto=format&fit=crop&q=80&w=800", label: "Margarita" },
    { url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800", label: "Diavola" },
    { url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800", label: "Peperoni" },
    { url: "https://images.unsplash.com/photo-1571217711202-3932782e4695?auto=format&fit=crop&q=80&w=800", label: "Lasagne" },
    { url: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80&w=800", label: "Carbonara" },
    { url: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800", label: "Bolonese" },
    { url: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?auto=format&fit=crop&q=80&w=800", label: "Burrata" },
    { url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800", label: "Carpaccio" },
    { url: "https://images.unsplash.com/photo-1571877227200-af0b380eabbb?auto=format&fit=crop&q=80&w=800", label: "Tiramisu" },
    { url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800", label: "Mixed Grill" },
    { url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=800", label: "Salade" },
    { url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800", label: "Vegan" },
    { url: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&q=80&w=800", label: "Schotel" },
    { url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800", label: "Zalm" },
  ];

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'product' | 'category';
    sectionTitle: string;
    productId?: string;
  } | null>(null);

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Categorieën', icon: <Grid2X2 className="w-5 h-5" /> },
    { name: 'Producten', icon: <ShoppingBag className="w-5 h-5" /> },
    { name: 'Import', icon: <Upload className="w-5 h-5" /> },
    { name: 'Videos', icon: <Video className="w-5 h-5" /> },
    { name: 'Instellingen', icon: <Settings className="w-5 h-5" /> },
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
    const allItems = (data?.sections || []).flatMap(s => s.items || []);
    if (videoMode === 'single') {
      return allItems.filter(i => selectedVideoItems.includes(i.id));
    }
    if (videoMode === 'category') {
      return (data?.sections || []).find(s => s.title === selectedCategory)?.items || [];
    }
    return allItems.filter(i => selectedVideoItems.includes(i.id));
  };

  const toggleTvFilm = (id: string) => {
    const newData = { ...data };
    const highlight = newData.highlights.find(h => h.id === id);
    if (!highlight) return;

    const currentlyActiveCount = newData.highlights.filter(h => h.activeOnTv).length;

    // Als we willen activeren en we zitten al aan 7, mag het niet
    if (!highlight.activeOnTv && currentlyActiveCount >= 7) {
      return; // Max 7 bereikt
    }

    highlight.activeOnTv = !highlight.activeOnTv;
    onUpdate(newData);
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
    const priceRaw = formData.get('price') as string;
    const price = parseFloat(priceRaw.replace(',', '.'));
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

  const handleSaveBusinessSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newData = {
      ...data,
      name: formData.get('name') as string,
      tagline: formData.get('tagline') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      location: {
        ...data.location,
        address: formData.get('address') as string
      },
      isSiteOpen: formData.get('isSiteOpen') === 'on',
      activeAnnouncement: formData.get('activeAnnouncement') as string,
      logo: logoPreview || data.logo,
      heroImage: heroPreview || data.heroImage,
      openingHours: {
        weekdays: formData.get('weekdays') as string,
        weekend: formData.get('weekend') as string,
        sunday: formData.get('sunday') as string,
      },
      highlights: [...Array(7)].map((_, i) => ({
        id: data.highlights[i]?.id || `highlight_${i}`,
        title: data.highlights[i]?.title || `Video ${i + 1}`,
        activeOnTv: true,
        url: formData.get(`video_${i}`) as string || (data.highlights[i]?.url || '')
      }))
    };
    onUpdate(newData);
    alert('Instellingen succesvol opgeslagen!');
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file, 400, 400);
      setLogoPreview(base64);
    }
  };

  const handleHeroChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file, 1920, 1080);
      setHeroPreview(base64);
    }
  };

  const handleDownload = () => {
    const videoUrl = data.highlights[0].url;
    
    // Probeer directe download
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `${data.name.replace(/\s+/g, '_')}_Promo_${videoMode}.mp4`;
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
      const nameSlug = data.name.replace(/\s+/g, '_');
      link.download = `${nameSlug}_Film_${new Date().getTime()}.webm`;
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
      ctx.fillText(data.name.toUpperCase(), 80, 80);

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
              <h2 className="text-4xl font-display italic">Categorieën Beheren</h2>
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
                      <h3 className="text-3xl font-display italic mb-1">{section.title}</h3>
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
              <h2 className="text-4xl font-display italic">Producten Beheren</h2>
              <button 
                onClick={() => {
                  setIsAddingProduct(true);
                  setAiFormValues({ name: '', description: '' });
                }}
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
                  {(data?.sections || []).flatMap(s => (s.items || []).map(item => ({ ...item, category: s.title }))).map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <img src={item.image} className="w-24 h-24 rounded-2xl object-cover border border-white/5" referrerPolicy="no-referrer" />
                          <div>
                            <p className="font-medium text-lg">{item.name}</p>
                            <p className="text-xs text-white/40 line-clamp-2 max-w-sm">{item.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10">{item.category}</span>
                      </td>
                      <td className="px-8 py-4 font-display text-brand-gold">€{item.price.toFixed(2)}</td>
                      <td className="px-8 py-4">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => {
                              setEditingProduct({ item, sectionTitle: item.category });
                              setAiFormValues({ name: item.name, description: item.description });
                            }}
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
          <div className="space-y-12">
            <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-[2rem] p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-display italic text-brand-gold">TV Modus Cinema Films</h3>
                  <p className="text-white/40 text-sm">
                    Selecteer maximaal 7 films. 
                    <span className="ml-2 text-brand-gold font-bold">({data.highlights.filter(h => h.activeOnTv).length}/7 geselecteerd)</span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      const videos = document.querySelectorAll('.cinema-preview-video');
                      videos.forEach((v: any) => v.play().catch(() => {}));
                    }}
                    className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border border-white/10 transition-colors hidden md:block"
                  >
                    Test Alle Video's
                  </button>
                  <Tv className="w-8 h-8 text-brand-gold" />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {data.highlights.map((film) => (
                  <div 
                    key={film.id}
                    onClick={() => toggleTvFilm(film.id)}
                    className={`relative aspect-[9/16] rounded-3xl overflow-hidden cursor-pointer border-2 transition-all ${
                      film.activeOnTv ? 'border-brand-gold shadow-lg shadow-brand-gold/20' : 'border-white/5 opacity-50'
                    }`}
                  >
                    <video 
                      src={film.url} 
                      className="cinema-preview-video w-full h-full object-cover"
                      muted
                      preload="auto"
                      onMouseOver={e => {
                        e.currentTarget.play().catch(() => {});
                      }}
                      onMouseOut={e => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent && !parent.querySelector('.video-error')) {
                          const errorDiv = document.createElement('div');
                          errorDiv.className = 'video-error absolute inset-0 flex items-center justify-center bg-red-500/20 text-red-500 text-[10px] font-bold p-2 text-center';
                          errorDiv.innerText = 'Video link werkt niet';
                          parent.appendChild(errorDiv);
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 pointer-events-none">
                      <div className="flex items-center gap-2 mb-1">
                        <Play className="w-3 h-3 text-brand-gold" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Preview</p>
                      </div>
                      <p className="text-xs font-medium line-clamp-2 leading-tight">{film.title}</p>
                    </div>
                    {film.activeOnTv && (
                      <div className="absolute top-3 right-3 w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-5 h-5 text-brand-dark" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-display italic mb-2">Pro Video Creator</h2>
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
                  <h3 className="text-xl font-display italic mb-6">Stap 1: Selectie</h3>
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
                              <h4 className="text-xl font-display italic">{s.title}</h4>
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
                    <h3 className="text-xl font-display italic mb-6">Stap 2: Genereren</h3>
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
                        <p className="text-brand-gold font-display italic text-xl mb-2">Video wordt gemaakt...</p>
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
                              <h4 className="text-4xl font-display italic mb-2 text-white leading-tight">
                                {selectedItemsForVideo[currentSlideIndex]?.name}
                              </h4>
                              <p className="text-brand-gold font-medium tracking-wide text-sm uppercase">
                              Nu te bestellen bij {data.name}
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
                        <p className="text-white/40 font-display italic text-lg">Selecteer je producten en klik op de knop om de preview te genereren.</p>
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

      case 'Import':
        return (
          <div className="space-y-8 max-w-4xl pb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Website Import */}
              <div className="bg-[#1A1A1A] rounded-[2rem] border border-white/5 p-8 flex flex-col h-full">
                <div className="mb-8">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                    <Globe className="w-6 h-6 text-blue-500" />
                  </div>
                  <h2 className="text-3xl font-display italic mb-3">Website Import</h2>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Geef de URL op van een website (bijv. TheFork of je eigen site) en de AI leest het menu uit.
                  </p>
                </div>

                <div className="space-y-6 mt-auto">
                  <div className="space-y-3">
                    <label className="text-[10px] text-white/40 uppercase tracking-widest block font-bold">Link naar website</label>
                    <input 
                      type="url"
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      placeholder="https://www.thefork.nl/..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:border-brand-gold outline-none transition-all text-sm"
                    />
                  </div>

                  <button 
                    onClick={handleSmartImport}
                    disabled={isSmartImporting || isTextImporting || isImportingData || !importUrl}
                    className="w-full bg-brand-gold text-brand-dark py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-gold/20 disabled:opacity-50"
                  >
                    {isSmartImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {isSmartImporting ? 'AI Leest Site...' : 'Lees Website'}
                  </button>
                </div>
              </div>

              {/* CSV Import */}
              <div className="bg-[#1A1A1A] rounded-[2rem] border border-white/5 p-8 flex flex-col h-full">
                <div className="mb-8">
                  <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 border border-green-500/20">
                    <FileText className="w-6 h-6 text-green-500" />
                  </div>
                  <h2 className="text-3xl font-display italic mb-3">CSV Upload</h2>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Upload een CSV-bestand met kolommen: <code className="text-brand-gold">category, name, price, description, image</code>.
                  </p>
                </div>

                <div className="space-y-6 mt-auto">
                  <div className="relative">
                    <input 
                      type="file"
                      accept=".csv"
                      onChange={handleCsvImport}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      disabled={isCsvImporting}
                    />
                    <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 flex items-center justify-center gap-3 text-sm text-white/60">
                      {isCsvImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      {isCsvImporting ? 'Verwerken...' : 'Selecteer CSV bestand'}
                    </div>
                  </div>
                  <p className="text-[10px] text-white/20 text-center uppercase tracking-widest font-bold italic">Bestaande data wordt vervangen</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Text Import */}
              <div className="bg-[#1A1A1A] rounded-[2rem] border border-white/5 p-8 flex flex-col h-full">
                <div className="mb-8">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
                    <FileText className="w-6 h-6 text-purple-500" />
                  </div>
                  <h2 className="text-3xl font-display italic mb-3">Tekst Import</h2>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Plak hier de lijst met gerechten of een rommelige tekst. AI maakt er een perfect menu van.
                  </p>
                </div>

                <div className="space-y-6 mt-auto">
                  <div className="space-y-3">
                    <label className="text-[10px] text-white/40 uppercase tracking-widest block font-bold">Plak hier je tekst</label>
                    <textarea 
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      placeholder="Bijv: Pizza Margherita 12.50, Pasta Carbonara 15.00..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:border-brand-gold outline-none transition-all h-32 text-sm resize-none"
                    />
                  </div>

                  <button 
                    onClick={handleTextImport}
                    disabled={isTextImporting || isSmartImporting || isImportingData || !importText}
                    className="w-full bg-white/10 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-white/20 transition-all disabled:opacity-50"
                  >
                    {isTextImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {isTextImporting ? 'AI Schrijft Menu...' : 'Zet Tekst Om'}
                  </button>
                </div>
              </div>

              {/* Advanced Developer Import / JSON */}
              <div className="bg-[#1A1A1A] rounded-[2rem] border border-white/5 p-8 flex flex-col h-full">
                <div className="mb-8">
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-6 border border-yellow-500/20">
                    <Code className="w-6 h-6 text-yellow-500" />
                  </div>
                  <h2 className="text-3xl font-display italic mb-3">JSON URL Import</h2>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Importeer direct een JSON bestand vanaf een URL. Formaat moet exact overeenkomen met de menu-structuur.
                  </p>
                </div>

                <div className="space-y-6 mt-auto">
                  <div className="space-y-3">
                    <label className="text-[10px] text-white/40 uppercase tracking-widest block font-bold">Link naar JSON</label>
                    <input 
                      type="url"
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      placeholder="https://server.com/menu.json"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:border-brand-gold outline-none transition-all text-sm"
                    />
                  </div>

                  <button 
                    onClick={handleUrlImport}
                    disabled={isImportingData || isSmartImporting || isTextImporting || !importUrl}
                    className="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 border border-white/10 transition-all disabled:opacity-50"
                  >
                    {isImportingData ? <Loader2 className="w-5 h-5 animate-spin" /> : 'JSON Laden'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Instellingen':
        return (
          <div className="space-y-8 max-w-5xl pb-24">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-3xl lg:text-4xl font-display italic">Website & Bedrijfsinstellingen</h2>
              <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                {deferredPrompt && (
                  <button 
                    onClick={handleInstallClick}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-brand-gold text-brand-dark px-6 py-3 rounded-2xl font-bold shadow-lg shadow-brand-gold/20"
                  >
                    <Download className="w-5 h-5" />
                    Installeer App
                  </button>
                )}
                <div className="flex-1 sm:flex-none flex items-center justify-center gap-4 bg-white/5 px-4 md:px-6 py-2 md:py-3 rounded-2xl border border-white/10">
                  <span className={`w-3 h-3 rounded-full ${data.isSiteOpen ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`} />
                  <span className="text-sm font-bold uppercase tracking-widest">{data.isSiteOpen ? 'Website Live' : 'Website Gesloten'}</span>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSaveBusinessSettings} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Kolom 1: Status & Identiteit */}
                <div className="space-y-6 md:space-y-8">
                  <div className="bg-[#1A1A1A] rounded-[2rem] border border-white/5 p-5 md:p-8 space-y-6">
                    <h3 className="text-brand-gold font-display italic text-xl">Website Status</h3>
                    
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div>
                        <p className="font-bold text-sm">Online Bereikbaarheid</p>
                        <p className="text-xs text-white/40">Zet de site aan of uit voor klanten</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input name="isSiteOpen" type="checkbox" defaultChecked={data.isSiteOpen} className="sr-only peer" />
                        <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-gold"></div>
                      </label>
                    </div>

                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Actuele Mededeling</label>
                      <textarea 
                        name="activeAnnouncement" 
                        placeholder="bijv. Vandaag 10% korting op alle pizza's!" 
                        defaultValue={data.activeAnnouncement}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold outline-none transition-colors h-24 text-sm" 
                      />
                      <p className="text-[10px] text-white/20 mt-2 italic">Deze tekst verschijnt bovenaan je website.</p>
                    </div>
                  </div>

                  <div className="bg-[#1A1A1A] rounded-[2rem] border border-white/5 p-5 md:p-8 space-y-6">
                    <h3 className="text-brand-gold font-display italic text-xl">Identiteit</h3>
                    
                    <div className="space-y-4">
                      <p className="text-xs text-white/40 uppercase tracking-widest">Logo</p>
                      <div className="w-full aspect-square bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative group">
                        {logoPreview ? (
                          <img src={logoPreview} className="w-full h-full object-contain p-4" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20 uppercase text-[10px] font-bold">Geen Logo</div>
                        )}
                        <input type="file" accept="image/*" onChange={handleLogoChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                          <Upload className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kolom 2: Algemene Info & Hero */}
                <div className="lg:col-span-2 space-y-6 md:space-y-8">
                  <div className="bg-[#1A1A1A] rounded-[2rem] border border-white/5 p-5 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h3 className="text-brand-gold font-display italic text-xl">Algemene Informatie</h3>
                        <div>
                          <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Restaurant Naam</label>
                          <input name="name" defaultValue={data.name} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold outline-none transition-colors h-14" />
                        </div>
                        <div>
                          <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Slogan / Tagline</label>
                          <input name="tagline" defaultValue={data.tagline} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold outline-none transition-colors h-14" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-brand-gold font-display italic text-xl">Contact & Locatie</h3>
                        <div>
                          <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Telefoonnummer</label>
                          <input name="phone" defaultValue={data.phone} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold outline-none transition-colors h-14" />
                        </div>
                        <div>
                          <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">E-mailadres</label>
                          <input name="email" type="email" defaultValue={data.email} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold outline-none transition-colors h-14" />
                        </div>
                        <div>
                          <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Adres (België/Nederland)</label>
                          <input name="address" defaultValue={data.location.address} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold outline-none transition-colors h-14" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 space-y-4">
                      <h3 className="text-brand-gold font-display italic text-xl">Website Hero Afbeelding</h3>
                      <div className="w-full aspect-video bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative group">
                        {heroPreview ? (
                          <img src={heroPreview} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20 uppercase text-[10px] font-bold">Geen Hero Image</div>
                        )}
                        <input type="file" accept="image/*" onChange={handleHeroChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                          <Upload className="w-8 h-8" />
                        </div>
                      </div>
                      <p className="text-[10px] text-white/20 italic">Dit is de grote afbeelding bovenaan je homepage.</p>
                    </div>

                    <div className="mt-8 space-y-4">
                      <h3 className="text-brand-gold font-display italic text-xl">Openingsuren</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Ma - Do</label>
                          <input name="weekdays" defaultValue={data.openingHours.weekdays} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold outline-none transition-colors" />
                        </div>
                        <div>
                          <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Vr - Za</label>
                          <input name="weekend" defaultValue={data.openingHours.weekend} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold outline-none transition-colors" />
                        </div>
                        <div>
                          <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Zondag</label>
                          <input name="sunday" defaultValue={data.openingHours.sunday} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold outline-none transition-colors" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 space-y-4 pt-8 border-t border-white/5">
                      <h3 className="text-brand-gold font-display italic text-xl">TV Cinema Video's (7 stuks)</h3>
                      <p className="text-white/40 text-xs mb-4">Hier kun je de directe links naar de 7 video's voor de TV-modus aanpassen.</p>
                      <div className="grid grid-cols-1 gap-4">
                        {[...Array(7)].map((_, index) => {
                          const highlight = data.highlights[index] || { id: `new_${index}`, url: '', title: `Video ${index + 1}` };
                          return (
                            <div key={highlight.id || index} className="space-y-2">
                              <label className="text-[10px] text-white/40 uppercase tracking-widest block">Video {index + 1}: {highlight.title}</label>
                              <input 
                                name={`video_${index}`} 
                                defaultValue={highlight.url} 
                                placeholder="https://domein.com/video.mp4" 
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold outline-none transition-colors text-xs font-mono" 
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="pt-8 border-t border-white/5 mt-8">
                      <button type="submit" className="w-full py-5 rounded-2xl bg-brand-gold text-brand-dark font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-gold/10 text-lg">
                        Alle Wijzigingen Opslaan
                      </button>
                    </div>

                    {/* Data Management Section */}
                    <div className="pt-12 border-t border-white/5 mt-12 space-y-6">
                      <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-brand-gold" />
                        <h3 className="text-brand-gold font-display italic text-xl">Data & Backup Beheer</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button 
                          type="button"
                          onClick={handleCreateBackup}
                          className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-[1.5rem] hover:bg-white/10 transition-all group"
                        >
                          <Database className="w-6 h-6 mb-3 text-blue-400 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-bold">Maak Backup</span>
                          <span className="text-[10px] text-white/40 mt-1">Slaat menu op in browser</span>
                        </button>

                        <button 
                          type="button"
                          onClick={handleRestoreBackup}
                          disabled={!backupSections}
                          className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-[1.5rem] hover:bg-white/10 transition-all group disabled:opacity-30 disabled:grayscale"
                        >
                          <History className="w-6 h-6 mb-3 text-green-400 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-bold">Herstel Backup</span>
                          <span className="text-[10px] text-white/40 mt-1">Zet laatste backup terug</span>
                        </button>

                        <button 
                          type="button"
                          onClick={handleExportJson}
                          className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-[1.5rem] hover:bg-white/10 transition-all group"
                        >
                          <Download className="w-6 h-6 mb-3 text-purple-400 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-bold">Exporteer JSON</span>
                          <span className="text-[10px] text-white/40 mt-1">Download backup bestand</span>
                        </button>

                        <button 
                          type="button"
                          onClick={handleResetMenu}
                          className="flex flex-col items-center justify-center p-6 bg-red-500/10 border border-red-500/20 rounded-[1.5rem] hover:bg-red-500/20 transition-all group"
                        >
                          <RotateCcw className="w-6 h-6 mb-3 text-red-500 group-hover:rotate-180 transition-transform duration-500" />
                          <span className="text-sm font-bold text-red-500">Reset Menu</span>
                          <span className="text-[10px] text-red-500/40 mt-1 italic">Verwijdert alles!</span>
                        </button>
                      </div>
                      
                      {!backupSections && (
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
                          <AlertTriangle className="w-4 h-4 text-blue-400" />
                          <p className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">Tip: Maak een backup voordat je grote wijzigingen doet of data importeert.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </form>
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
                  <h3 className="text-xl font-display italic">Verkoop Tactieken</h3>
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
    <div className="flex min-h-screen bg-[#0F0F0F] text-white font-sans relative">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-[100] w-72 border-r border-white/5 p-8 flex flex-col bg-[#0F0F0F] transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-xl font-display italic text-brand-gold">{data.name} Manager</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-white/40">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setActiveTab(item.name);
                setIsSidebarOpen(false);
              }}
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

      <main className="flex-1 p-6 lg:p-12 overflow-y-auto w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-3 rounded-xl bg-white/5 border border-white/10"
            >
              <LayoutDashboard className="w-6 h-6 text-brand-gold" />
            </button>
            <div>
              <h2 className="text-3xl lg:text-4xl font-display mb-1 md:mb-2 italic">{activeTab}</h2>
              <p className="text-white/40 text-xs md:text-sm">
                {activeTab === 'Dashboard' ? 'Welkom bij jouw content studio.' : `Beheer je ${activeTab.toLowerCase()}.`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-brand-gold transition-colors" />
              <input 
                type="text" 
                placeholder="Gerechten zoeken..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // Logic for search could go here, for now it's visual
                    console.log('Searching for:', searchQuery);
                  }
                }}
                className="bg-white/5 border border-white/10 rounded-l-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-brand-gold/50 transition-all w-48 md:w-64"
              />
              <button 
                onClick={() => console.log('Searching for:', searchQuery)}
                className="bg-brand-gold text-brand-dark px-4 py-2.5 rounded-r-xl font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors"
              >
                Zoek
              </button>
            </div>
            <button className="hidden sm:flex p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-brand-gold transition-colors">
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
              onAnimationComplete={() => {
                if (editingProduct) {
                  setAiFormValues({ name: editingProduct.item.name, description: editingProduct.item.description });
                } else {
                  setAiFormValues({ name: '', description: '' });
                }
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <h3 className="text-2xl font-display italic mb-6">
                {editingProduct ? 'Product Bewerken' : 'Nieuw Product Toevoegen'}
              </h3>
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div className="flex gap-6 mb-6">
                      <div>
                        <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Afbeelding</label>
                        <div className="flex gap-4">
                          <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center relative group">
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
                              <p className="text-[10px] font-bold uppercase tracking-widest text-center">Upload</p>
                            </div>
                          </div>
                          
                          <div className="flex-1 flex flex-col gap-2">
                            <button 
                              type="button"
                              onClick={() => setShowStockGallery(true)}
                              className="flex-1 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                            >
                              <Grid2X2 className="w-4 h-4 text-brand-gold" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Map</span>
                            </button>
                            <button 
                              type="button"
                              onClick={handleAiPhotoGenerate}
                              disabled={isGeneratingAiImage}
                              className="flex-1 bg-brand-gold/10 border border-brand-gold/30 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-gold/20 transition-all text-brand-gold disabled:opacity-50"
                            >
                              {isGeneratingAiImage ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span className="text-[10px] font-bold uppercase tracking-widest">Zoeken...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4" />
                                  <span className="text-[10px] font-bold uppercase tracking-widest">AI Foto</span>
                                </>
                              )}
                            </button>
                          </div>
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
                      <input 
                        name="name" 
                        type="text" 
                        defaultValue={editingProduct?.item.name} 
                        onChange={(e) => setAiFormValues(prev => ({ ...prev, name: e.target.value }))}
                        required 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold outline-none transition-colors" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Prijs (€)</label>
                    <input 
                      name="price" 
                      type="text" 
                      inputMode="decimal"
                      pattern="[0-9]*[.,]?[0-9]*"
                      defaultValue={editingProduct?.item.price} 
                      required 
                      placeholder="bijv. 12.50"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold outline-none transition-colors" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Beschrijving</label>
                  <textarea 
                    name="description" 
                    defaultValue={editingProduct?.item.description} 
                    onChange={(e) => setAiFormValues(prev => ({ ...prev, description: e.target.value }))}
                    required 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold outline-none transition-colors h-24" 
                  />
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
              className="bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <h3 className="text-2xl font-display italic mb-6">
                {editingCategory ? 'Categorie Bewerken' : 'Nieuwe Categorie Toevoegen'}
              </h3>
              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex-col flex gap-2 w-24">
                    <label className="text-xs text-white/40 uppercase tracking-widest block">Afbeelding</label>
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
                        <p className="text-[10px] font-bold uppercase tracking-widest">Upload</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-xs text-white/40 uppercase tracking-widest block">Of kies map</label>
                    <button 
                      type="button"
                      onClick={() => setShowStockGallery(true)}
                      className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-all border-dashed"
                    >
                      <Grid2X2 className="w-6 h-6 text-brand-gold" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Galerij</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Titel van de Categorie</label>
                  <input name="title" defaultValue={editingCategory?.title} required placeholder="bijv. Hoofdgerechten" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-gold outline-none transition-colors" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => { setEditingCategory(null); setIsAddingCategory(false); setImagePreview(null); }} className="flex-1 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">Annuleren</button>
                  <button type="submit" className="flex-1 py-4 rounded-xl bg-brand-gold text-brand-dark font-bold hover:scale-105 transition-transform">Opslaan</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showStockGallery && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1A1A1A] border border-white/10 rounded-[3rem] p-10 w-full max-w-4xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-3xl font-display italic text-brand-gold">Fotogalerij</h3>
                  <p className="text-white/40 text-sm">Kies een professionele sfeerfoto uit de map</p>
                </div>
                <button onClick={() => setShowStockGallery(false)} className="p-4 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                {stockImages.map((img, i) => (
                  <div 
                    key={i}
                    onClick={() => {
                      setImagePreview(img.url);
                      setShowStockGallery(false);
                    }}
                    className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer group border-2 border-transparent hover:border-brand-gold transition-all"
                  >
                    <img src={img.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute bottom-4 left-4">
                      <p className="text-xs font-bold uppercase tracking-widest bg-brand-gold text-brand-dark px-3 py-1 rounded-full">{img.label}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setShowStockGallery(false)}
                  className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors font-bold"
                >
                  Sluiten
                </button>
              </div>
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
              <h3 className="text-2xl font-display mb-4">Weet je het zeker?</h3>
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
