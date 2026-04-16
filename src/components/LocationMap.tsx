import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';

interface LocationMapProps {
  address: string;
}

export default function LocationMap({ address }: LocationMapProps) {
  // Using a stylized placeholder for the map
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-serif mb-6 italic">Vind Ons</h2>
            <p className="text-brand-dark/60 text-lg mb-8 leading-relaxed">
              Gelegen in het hart van de stad, verwelkomen wij u in een sfeer van rust en culinaire verfijning. 
              Kom langs en ervaar de kunst van het tafelen.
            </p>
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-white shadow-sm border border-brand-gold/10">
              <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center">
                <MapPin className="text-brand-gold w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-brand-dark">Adres</p>
                <p className="text-brand-dark/60">{address}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative aspect-video rounded-3xl overflow-hidden shadow-xl border-4 border-white"
          >
            {/* Stylized Map Placeholder using iframe for real feel */}
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={`https://maps.google.com/maps?width=100%25&height=600&hl=nl&q=${encodeURIComponent(address)}&t=&z=14&ie=UTF8&iwloc=B&output=embed`}
              className="grayscale contrast-125 opacity-80"
              style={{ filter: 'invert(90%) hue-rotate(180deg)' }}
            />
            <div className="absolute inset-0 pointer-events-none border-[12px] border-brand-cream/20 rounded-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
