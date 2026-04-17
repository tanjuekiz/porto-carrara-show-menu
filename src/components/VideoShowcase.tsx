import { motion } from 'motion/react';
import { VideoHighlight } from '../types';

interface VideoShowcaseProps {
  highlights: VideoHighlight[];
}

export default function VideoShowcase({ highlights }: VideoShowcaseProps) {
  return (
    <section className="py-24 bg-brand-dark text-brand-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-7xl font-display mb-4 italic">De Beleving</h2>
          <p className="text-brand-gold uppercase tracking-[0.3em] text-sm">Sfeer & Passie</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlights.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative aspect-[9/16] rounded-3xl overflow-hidden group shadow-2xl"
            >
              <video
                src={video.url}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8">
                <h3 className="text-2xl font-display italic text-brand-gold">{video.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
