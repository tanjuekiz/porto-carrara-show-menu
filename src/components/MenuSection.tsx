import { motion } from 'motion/react';
import { MenuSection as MenuSectionType } from '../types';
import MenuItem from './MenuItem';

interface MenuSectionProps {
  section: MenuSectionType;
  key?: string | number;
}

export default function MenuSection({ section }: MenuSectionProps) {
  return (
    <section className="mb-20">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-4 mb-10"
      >
        <h2 className="text-4xl md:text-5xl font-display text-white italic">
          {section.title}
        </h2>
        <div className="h-[1px] flex-1 bg-brand-gold/30" />
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
        {section.items.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
