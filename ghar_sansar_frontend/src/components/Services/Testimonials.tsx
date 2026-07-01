import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Jubilee Hills, Hyderabad",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    projectImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    review: "Ghar Sansar completely transformed our 4BHK villa. Their attention to detail, premium material selection, and adherence to timelines were exceptional. It truly feels like a luxury hotel now.",
    rating: 5
  },
  {
    id: 2,
    name: "Rahul & Sneha",
    location: "Benz Circle, Vijayawada",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    projectImage: "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    review: "The modular kitchen they designed for us is a masterpiece. We loved their 3D design process which gave us an exact idea before execution. Highly professional team!",
    rating: 5
  },
  {
    id: 3,
    name: "Dr. Vikram Reddy",
    location: "Guntur",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    projectImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    review: "We hired them for our clinic interiors and the result is stunning. It's calming for the patients and highly functional for the staff. Delivered exactly on the 45th day as promised.",
    rating: 5
  }
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  return (
    <section className="py-24 bg-white font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-sm font-bold tracking-[0.2em] text-luxury-gold uppercase mb-3"
          >
            Client Stories
          </motion.h2>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight"
          >
            Don't Just Take Our Word For It
          </motion.h3>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -left-4 sm:-left-12 transform -translate-y-1/2 z-20">
            <button 
              onClick={prevSlide}
              className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-luxury-gold hover:scale-110 transition-all"
            >
              <ChevronLeft size={24} />
            </button>
          </div>
          <div className="absolute top-1/2 -right-4 sm:-right-12 transform -translate-y-1/2 z-20">
            <button 
              onClick={nextSlide}
              className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-luxury-gold hover:scale-110 transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Carousel */}
          <div className="bg-gray-50 rounded-[32px] overflow-hidden border border-gray-100 relative shadow-sm">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 md:grid-cols-2"
              >
                {/* Image Section */}
                <div className="relative h-64 md:h-auto">
                  <img 
                    src={testimonials[currentIndex].projectImage} 
                    alt="Project"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <span className="text-xs font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                      Actual Project Photo
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8 sm:p-12 flex flex-col justify-center relative bg-white">
                  <Quote className="absolute top-8 right-8 text-luxury-cream w-20 h-20 opacity-50" />
                  
                  <div className="flex gap-1 mb-6 relative z-10">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} size={20} className="fill-luxury-gold text-luxury-gold" />
                    ))}
                  </div>

                  <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-medium mb-8 relative z-10 italic">
                    "{testimonials[currentIndex].review}"
                  </p>

                  <div className="flex items-center gap-4 relative z-10 mt-auto">
                    <img 
                      src={testimonials[currentIndex].image} 
                      alt={testimonials[currentIndex].name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-luxury-gold"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonials[currentIndex].name}</h4>
                      <p className="text-xs text-gray-500 font-semibold">{testimonials[currentIndex].location}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>
          
          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === idx ? 'w-8 h-2 bg-luxury-gold' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
