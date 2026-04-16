import { Instagram, Facebook, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-brand-cream py-20 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <h3 className="text-2xl font-serif mb-6 text-brand-gold">Contact</h3>
          <ul className="space-y-4 text-brand-cream/70">
            <li className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-brand-gold" />
              <span>Culinairestraat 123, 1000 Brussel</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-brand-gold" />
              <span>+32 2 123 45 67</span>
            </li>
          </ul>
        </div>
        
        <div className="text-center">
          <h2 className="text-4xl font-serif mb-4">L'Artiste</h2>
          <p className="text-brand-cream/50 italic mb-8">Sinds 2024</p>
          <div className="flex justify-center gap-6">
            <a href="#" className="hover:text-brand-gold transition-colors">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="#" className="hover:text-brand-gold transition-colors">
              <Facebook className="w-6 h-6" />
            </a>
          </div>
        </div>
        
        <div className="text-right">
          <h3 className="text-2xl font-serif mb-6 text-brand-gold">Openingsuren</h3>
          <ul className="space-y-2 text-brand-cream/70">
            <li>Ma - Do: 17:00 - 22:00</li>
            <li>Vr - Za: 17:00 - 23:00</li>
            <li>Zondag: Gesloten</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-20 pt-8 border-t border-white/10 text-center text-brand-cream/30 text-xs uppercase tracking-widest">
        &copy; 2024 L'Artiste. Gemaakt met AI-revolutie.
      </div>
    </footer>
  );
}
