import React from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle } from 'lucide-react';

export default function CtaSection() {
  return (
    <section id="cta" className="relative py-32 bg-luxury-charcoal text-white font-sans overflow-hidden">
      
      {/* Abstract luxury background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-luxury-gold/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="w-20 h-20 mx-auto bg-gradient-to-br from-luxury-gold to-luxury-bronze rounded-full p-0.5 mb-10 shadow-[0_0_40px_rgba(197,168,128,0.4)]"
        >
          <div className="w-full h-full bg-luxury-charcoal rounded-full flex items-center justify-center">
            <span className="text-luxury-gold font-bold tracking-widest text-xs uppercase">G.S</span>
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] mb-6"
        >
          Ready To Transform <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-cream to-luxury-gold">
            Your Home?
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto font-medium"
        >
          Book a free consultation with our award-winning design experts today. Let's build the home of your dreams.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          {/* Main CTA */}
          <a
            href="tel:+918121135980"
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-luxury-gold text-luxury-charcoal hover:bg-white rounded-full font-bold uppercase tracking-widest text-sm transition-all duration-300 shadow-[0_0_20px_rgba(197,168,128,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:-translate-y-1"
          >
            <Phone size={20} />
            Call Now
          </a>
          
          {/* WhatsApp CTA */}
          <a
            href="https://wa.me/918121135980?text=Hello%20Ghar%20Sansar!%20I%20would%20like%20to%20book%20a%20free%20interior%20design%20consultation."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-green-600/20 border border-green-500/50 text-green-400 hover:bg-green-500 hover:text-white hover:border-green-500 rounded-full font-bold uppercase tracking-widest text-sm transition-all duration-300 hover:-translate-y-1"
          >
            <MessageCircle size={20} />
            WhatsApp Enquiry
          </a>
        </motion.div>
      </div>
    </section>
  );
}
