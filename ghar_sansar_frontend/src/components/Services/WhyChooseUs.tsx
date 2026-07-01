import React from 'react';
import { motion } from 'framer-motion';
import { Star, Trophy, Palette, Zap } from 'lucide-react';

const features = [
  {
    id: 1,
    icon: <Star size={32} className="text-luxury-gold" />,
    title: "500+ Happy Projects",
    description: "Successfully delivered hundreds of premium homes with 100% customer satisfaction."
  },
  {
    id: 2,
    icon: <Trophy size={32} className="text-luxury-gold" />,
    title: "10+ Years Experience",
    description: "A decade of expertise in transforming ordinary spaces into extraordinary masterpieces."
  },
  {
    id: 3,
    icon: <Palette size={32} className="text-luxury-gold" />,
    title: "Custom Design Solutions",
    description: "Bespoke interior layouts tailored precisely to your unique lifestyle and taste."
  },
  {
    id: 4,
    icon: <Zap size={32} className="text-luxury-gold" />,
    title: "On-Time Delivery",
    description: "Strict adherence to timelines with our guaranteed 45-day execution promise."
  }
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20
    }
  }
};

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="py-24 bg-white font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-sm font-bold tracking-[0.2em] text-luxury-gold uppercase mb-3"
          >
            The Ghar Sansar Advantage
          </motion.h2>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight"
          >
            Why We Are The Best Choice For Your Home
          </motion.h3>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={cardVariants}
              whileHover={{ 
                y: -10, 
                boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)",
                borderColor: "rgba(197, 168, 128, 0.3)"
              }}
              className="bg-gray-50 border border-gray-100 rounded-[24px] p-8 transition-all duration-300 relative overflow-hidden group"
            >
              {/* Subtle background glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-luxury-cream/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-500 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
