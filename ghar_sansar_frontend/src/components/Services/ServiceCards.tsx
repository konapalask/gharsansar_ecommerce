import React from 'react';
import { motion } from 'framer-motion';
import { useServices, Service } from '../../context/ServiceContext';
import { Clock, Users, Wrench, Shield, Wallet, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fixImageUrl = (url: string | undefined) => {
  if (!url) return "";
  let fixed = url
    .replace(/^https?:\/\/https?:\/\//, "https://")
    .replace(/\s/g, "%20")
    .replace(/([^:]\/)\/+/g, "$1");
  if (fixed.startsWith("http://backend.gharsansar.store") || fixed.startsWith("http://lx70r6zsef")) {
    fixed = fixed.replace(/^http:/, "https:");
  }
  return fixed;
};

// Helper to generate premium metadata for a service
const getServiceMetadata = (service: Service) => {
  const isPremium = Number(service.price) > 50000;
  
  return {
    duration: isPremium ? "4-6 Weeks" : "1-2 Weeks",
    suitableFor: "Villas, Apartments & Independent Houses",
    materials: "Premium Plywood, Laminates & Hardware",
    warranty: isPremium ? "10 Years On-site" : "5 Years Limited",
    budget: `Starting from ₹${service.price.toLocaleString()}`
  };
};

export default function ServiceCards() {
  const { services } = useServices();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Small artificial delay to ensure animations trigger properly after data load
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [services]);

  if (loading || services.length === 0) {
    return (
      <section className="py-24 bg-[#f8f8f7]">
        <div className="max-w-7xl mx-auto px-4 flex justify-center">
           <div className="w-12 h-12 border-4 border-luxury-gold/30 border-t-luxury-gold rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  return (
    <section id="services-grid" className="py-24 bg-[#f8f8f7] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold tracking-[0.2em] text-luxury-gold uppercase mb-3">
              Our Expertise
            </h2>
            <h3 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">
              Premium Interior Solutions
            </h3>
          </div>
          <button className="text-sm font-bold uppercase tracking-wider text-luxury-charcoal hover:text-luxury-gold flex items-center gap-2 transition-colors">
            View All Services <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {services.slice(0, 6).map((service, index) => {
            const meta = getServiceMetadata(service);
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 border border-gray-100 flex flex-col sm:flex-row"
              >
                {/* Image Section */}
                <div className="sm:w-2/5 relative overflow-hidden h-64 sm:h-auto">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                  <img 
                    src={fixImageUrl(service.image) || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                    alt={service.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Floating Category Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                      {service.category_name}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="sm:w-3/5 p-6 sm:p-8 flex flex-col">
                  <h4 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-luxury-gold transition-colors">
                    {service.title}
                  </h4>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                    {service.description}
                  </p>

                  {/* Premium Metadata Grid */}
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-8 flex-grow">
                    <div className="flex items-start gap-2">
                      <Clock size={16} className="text-luxury-gold mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase">Duration</div>
                        <div className="text-xs font-semibold text-gray-900">{meta.duration}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Shield size={16} className="text-luxury-gold mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase">Warranty</div>
                        <div className="text-xs font-semibold text-gray-900">{meta.warranty}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Wrench size={16} className="text-luxury-gold mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase">Materials</div>
                        <div className="text-xs font-semibold text-gray-900 line-clamp-1">{meta.materials}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Wallet size={16} className="text-luxury-gold mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase">Est. Budget</div>
                        <div className="text-xs font-semibold text-gray-900">{meta.budget}</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 mt-auto border-t border-gray-100 pt-6">
                    <button 
                      onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}
                      className="flex-1 bg-luxury-charcoal hover:bg-luxury-gold text-white text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl transition-colors shadow-md text-center"
                    >
                      Book Free Consult
                    </button>
                    <button 
                      onClick={() => navigate(`/services/${service.id}`)}
                      className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-900 text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl border border-gray-200 transition-colors text-center"
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
