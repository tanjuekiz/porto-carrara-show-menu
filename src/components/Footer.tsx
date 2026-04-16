import { Instagram, Facebook, MapPin, Phone, Mail } from 'lucide-react';
import { RestaurantData } from '../types';

interface FooterProps {
  data: RestaurantData;
}

export default function Footer({ data }: FooterProps) {
  return (
    <footer className="bg-brand-dark text-brand-cream py-20 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <h3 className="text-2xl font-serif mb-6 text-brand-gold">Contact</h3>
          <ul className="space-y-4 text-brand-cream/70">
            <li className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-brand-gold" />
              <span>{data.location.address}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-brand-gold" />
              <span>{data.phone}</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-brand-gold" />
              <span>{data.email}</span>
            </li>
          </ul>
        </div>
        
        <div className="text-center">
          <h2 className="text-4xl font-serif mb-4">{data.name}</h2>
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
            <li>Ma - Do: {data.openingHours.weekdays}</li>
            <li>Vr - Za: {data.openingHours.weekend}</li>
            <li>Zondag: {data.openingHours.sunday}</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-20 pt-8 border-t border-white/10 text-center text-brand-cream/30 text-xs uppercase tracking-widest">
        &copy; 2024 {data.name}. Gemaakt met AI-revolutie.
      </div>
    </footer>
  );
}
