import { motion } from 'motion/react';
import { MenuItem as MenuItemType } from '../types';

interface MenuItemProps {
  item: MenuItemType;
  key?: string | number;
}

export default function MenuItem({ item }: MenuItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative flex flex-col md:flex-row gap-6 p-4 rounded-2xl transition-all hover:bg-white/50"
    >
      <div className="relative w-full md:w-32 h-48 md:h-32 overflow-hidden rounded-xl shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
      </div>
      
      <div className="flex flex-col justify-center flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-xl font-medium text-brand-dark group-hover:text-brand-gold transition-colors">
            {item.name}
          </h3>
          <span className="text-lg font-serif font-semibold text-brand-gold">
            €{item.price.toFixed(2)}
          </span>
        </div>
        
        <p className="text-brand-dark/60 text-sm leading-relaxed mb-3">
          {item.description}
        </p>
        
        {item.tags && (
          <div className="flex gap-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] uppercase tracking-widest font-semibold px-2 py-1 rounded-full bg-brand-gold/10 text-brand-gold"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
