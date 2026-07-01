import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, ArrowRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Floating particles
  const particles = Array.from({ length: 20 });

  return (
    <div className="relative h-screen w-full overflow-hidden bg-luxury-charcoal flex items-center justify-center font-sans">
      {/* Background with Parallax */}
      <motion.div 
        style={{ y, opacity }}
        className="absolute inset-0 z-0"
      >
        <motion.div
          animate={{
            x: mousePosition.x * -1,
            y: mousePosition.y * -1,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          className="absolute inset-[-5%] w-[110%] h-[110%]"
        >
          <img 
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2500&q=100" 
            alt="Luxury Interior Design" 
            className="w-full h-full object-cover object-center"
          />
          {/* 60% Dark Overlay */}
          <div className="absolute inset-0 bg-black/60 bg-gradient-to-t from-luxury-charcoal via-transparent to-transparent" />
        </motion.div>
      </motion.div>

      {/* Floating Particles */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {particles.map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-luxury-gold rounded-full opacity-30"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [null, Math.random() * -500],
              opacity: [0.2, 0.8, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-luxury-gold/30 bg-black/20 backdrop-blur-md mb-8"
        >
          <span className="w-2 h-2 bg-luxury-gold rounded-full animate-pulse" />
          <span className="text-luxury-gold font-bold text-xs uppercase tracking-[0.2em]">World Class Interiors</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.1] mb-6"
        >
          Transforming Spaces <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-cream via-luxury-gold to-luxury-bronze">
            Into Timeless Experiences
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 font-medium leading-relaxed"
        >
          Elevate your living experience with bespoke, premium interior design solutions crafted specifically for your lifestyle and aesthetic vision.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <button 
            onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto px-8 py-4 bg-luxury-gold hover:bg-white text-luxury-charcoal rounded-full font-bold uppercase tracking-wider text-sm transition-all duration-300 shadow-[0_0_20px_rgba(197,168,128,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] flex items-center justify-center gap-2 group"
          >
            Book Free Consultation
            <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/30 text-white hover:bg-white/10 rounded-full font-bold uppercase tracking-wider text-sm transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm"
          >
            <Play size={16} className="fill-current" />
            Explore Portfolio
          </button>
        </motion.div>
      </div>

      {/* Smooth Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-2 cursor-pointer"
        onClick={() => document.getElementById('why-us')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold">Scroll Down</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-8 h-12 border-2 border-white/20 rounded-full flex justify-center p-1"
        >
          <motion.div className="w-1 h-3 bg-luxury-gold rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  );
}
