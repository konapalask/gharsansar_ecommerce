import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, MapPin, Cuboid, Layers, Hammer, KeyRound } from 'lucide-react';

const steps = [
  { id: 1, title: "Consultation", description: "Understand your vision, requirements, and budget.", icon: <MessageSquare size={24} /> },
  { id: 2, title: "Site Visit", description: "Detailed measurement and structural analysis of your space.", icon: <MapPin size={24} /> },
  { id: 3, title: "3D Design", description: "Photorealistic 3D renders of your future home for approval.", icon: <Cuboid size={24} /> },
  { id: 4, title: "Material Selection", description: "Curating premium finishes, fabrics, and hardware.", icon: <Layers size={24} /> },
  { id: 5, title: "Execution", description: "Precision crafting and installation by expert artisans.", icon: <Hammer size={24} /> },
  { id: 6, title: "Final Handover", description: "Deep cleaning, final inspection, and key handover.", icon: <KeyRound size={24} /> },
];

export default function DesignProcess() {
  return (
    <section className="py-24 bg-[#f8f8f7] font-sans relative overflow-hidden">
      
      {/* Background Graphic */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-luxury-cream/30 skew-x-12 transform origin-top translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-sm font-bold tracking-[0.2em] text-luxury-gold uppercase mb-3"
          >
            How We Work
          </motion.h2>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight"
          >
            Our Proven 6-Step Design Process
          </motion.h3>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gray-200 transform -translate-y-1/2 z-0">
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-luxury-gold origin-left"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-4 relative z-10">
            {steps.map((step, index) => (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="flex flex-col items-center text-center group"
              >
                {/* Number Indicator */}
                <div className="text-luxury-gold font-black text-4xl mb-4 opacity-20 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300">
                  0{step.id}
                </div>

                {/* Icon Circle */}
                <div className="w-20 h-20 bg-white rounded-full border-[4px] border-[#f8f8f7] shadow-xl flex items-center justify-center text-luxury-charcoal mb-6 group-hover:bg-luxury-gold group-hover:text-white group-hover:scale-110 transition-all duration-300 relative z-10">
                  {step.icon}
                </div>

                <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-luxury-gold transition-colors">
                  {step.title}
                </h4>
                <p className="text-gray-500 text-xs leading-relaxed max-w-[200px]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
