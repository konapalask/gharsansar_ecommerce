import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MoveHorizontal } from 'lucide-react';

const cases = [
  {
    id: "living-room",
    title: "Living Room Transformation",
    before: "https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    after: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "kitchen",
    title: "Modern Kitchen Upgrade",
    before: "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    after: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  }
];

export default function BeforeAfterSlider() {
  const [activeCase, setActiveCase] = useState(cases[0]);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  return (
    <section className="py-24 bg-luxury-charcoal text-white font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-sm font-bold tracking-[0.2em] text-luxury-gold uppercase mb-3"
          >
            Real Transformations
          </motion.h2>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black tracking-tight mb-8"
          >
            Before & After Showcase
          </motion.h3>

          <div className="flex flex-wrap justify-center gap-4">
            {cases.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCase(c)}
                className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  activeCase.id === c.id 
                    ? 'bg-luxury-gold text-luxury-charcoal shadow-[0_0_15px_rgba(197,168,128,0.5)]' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative max-w-5xl mx-auto h-[400px] sm:h-[600px] rounded-3xl overflow-hidden cursor-ew-resize select-none border border-white/10 shadow-2xl"
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseDown={() => setIsDragging(true)}
          onTouchMove={handleTouchMove}
          onTouchStart={() => setIsDragging(true)}
        >
          {/* After Image (Background) */}
          <div className="absolute inset-0">
            <img 
              src={activeCase.after} 
              alt="After" 
              className="w-full h-full object-cover"
              draggable="false"
            />
            <div className="absolute top-6 right-6 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-widest border border-white/20">
              After
            </div>
          </div>

          {/* Before Image (Clipped overlay) */}
          <div 
            className="absolute inset-0 border-r-2 border-white shadow-[2px_0_10px_rgba(0,0,0,0.5)]"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img 
              src={activeCase.before} 
              alt="Before" 
              className="w-full h-full object-cover grayscale-[30%]"
              draggable="false"
            />
            <div className="absolute top-6 left-6 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-widest border border-white/20">
              Before
            </div>
          </div>

          {/* Slider Handle */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20"
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-luxury-gold text-luxury-charcoal">
              <MoveHorizontal size={20} />
            </div>
          </div>
        </motion.div>

        <p className="text-center text-gray-400 mt-6 text-sm font-medium">Drag the slider to see the transformation.</p>
      </div>
    </section>
  );
}
