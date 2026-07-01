import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';

const locations = [
  { id: 1, city: "Vijayawada", state: "Andhra Pradesh", active: true },
  { id: 2, city: "Guntur", state: "Andhra Pradesh", active: true },
  { id: 3, city: "Eluru", state: "Andhra Pradesh", active: true },
  { id: 4, city: "Hyderabad", state: "Telangana", active: true },
  { id: 5, city: "Visakhapatnam", state: "Andhra Pradesh", active: false },
  { id: 6, city: "Rajahmundry", state: "Andhra Pradesh", active: false }
];

export default function LocationsMap() {
  return (
    <section className="py-24 bg-[#f8f8f7] font-sans relative overflow-hidden">
      
      {/* Decorative World Map Background (Abstract) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
        <svg viewBox="0 0 1000 500" className="w-full h-full max-w-[1500px]">
          <path fill="currentColor" d="M100,200 Q200,100 300,200 T500,200 T700,200 T900,200" strokeWidth="2" stroke="black" fillOpacity="0"/>
          {/* A highly simplified dotted pattern simulating a map */}
          <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle fill="currentColor" cx="2" cy="2" r="2"></circle>
          </pattern>
          <rect x="0" y="0" width="1000" height="500" fill="url(#dots)"></rect>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          {/* Left Text */}
          <div className="lg:w-1/3">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-sm font-bold tracking-[0.2em] text-luxury-gold uppercase mb-3 flex items-center gap-2"
            >
              <Navigation size={16} /> Global Standards, Local Presence
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-6"
            >
              Where Do We Operate?
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 leading-relaxed mb-8"
            >
              We are rapidly expanding our luxury interior design services across Andhra Pradesh and Telangana. Currently dominating the market in key smart cities.
            </motion.p>
          </div>

          {/* Right Grid */}
          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((loc, idx) => (
              <motion.div
                key={loc.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.1 }}
                className={`relative p-6 rounded-[24px] border transition-all duration-300 group ${
                  loc.active 
                    ? 'bg-white border-gray-100 shadow-sm hover:shadow-xl hover:border-luxury-gold/30' 
                    : 'bg-transparent border-gray-200/50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    loc.active ? 'bg-luxury-cream text-luxury-gold group-hover:bg-luxury-gold group-hover:text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <MapPin size={20} />
                  </div>
                  {loc.active ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                      Upcoming
                    </span>
                  )}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">{loc.city}</h4>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{loc.state}</p>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
