import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-luxury-charcoal text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Service Areas Banner */}
        <div className="text-center mb-12 pb-8 border-b border-white/10">
          <span className="text-[10px] uppercase font-bold tracking-widest text-luxury-gold mb-2 block">Service Areas</span>
          <h3 className="text-xl font-serif italic mb-4 text-white">
            Best Interior Designers serving across Andhra Pradesh & Telangana
          </h3>
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            <span className="px-4 py-2 border border-luxury-gold/30 text-gray-300 rounded-full hover:border-luxury-gold hover:text-white transition duration-300">Vijayawada</span>
            <span className="px-4 py-2 border border-luxury-gold/30 text-gray-300 rounded-full hover:border-luxury-gold hover:text-white transition duration-300">Guntur</span>
            <span className="px-4 py-2 border border-luxury-gold/30 text-gray-300 rounded-full hover:border-luxury-gold hover:text-white transition duration-300">Eluru</span>
            <span className="px-4 py-2 border border-luxury-gold/30 text-gray-300 rounded-full hover:border-luxury-gold hover:text-white transition duration-300">Andhra Pradesh</span>
            <span className="px-4 py-2 border border-luxury-gold/30 text-gray-300 rounded-full hover:border-luxury-gold hover:text-white transition duration-300">Telangana</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="/images/logo.png" // use the correct path relative to public folder
                alt="Logo"
                className="w-12 h-12 rounded-lg"
              />
              <span className="text-lg font-serif font-bold tracking-wider">GHAR SANSAR</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Transform your home with our premium decor items and professional interior design services.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/GharSansarshop/"
                className="w-10 h-10 flex items-center justify-center text-gray-400 border border-white/10 hover:text-white hover:bg-luxury-gold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>

              <a 
                href="https://www.youtube.com/@gharsansar_shop" 
                className="w-10 h-10 flex items-center justify-center text-gray-400 border border-white/10 hover:text-white hover:bg-luxury-gold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a 
                href="https://www.instagram.com/gharsansar_shop/" 
                className="w-10 h-10 flex items-center justify-center text-gray-400 border border-white/10 hover:text-white hover:bg-luxury-gold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm uppercase font-bold tracking-wider mb-6 text-luxury-gold">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/products" className="text-gray-400 hover:text-luxury-gold transition-all duration-200 hover:translate-x-1 inline-block">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-luxury-gold transition-all duration-200 hover:translate-x-1 inline-block">
                  Interior Design
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-luxury-gold transition-all duration-200 hover:translate-x-1 inline-block">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-luxury-gold transition-all duration-200 hover:translate-x-1 inline-block">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm uppercase font-bold tracking-wider mb-6 text-luxury-gold">Categories</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/interior-design" className="text-gray-400 hover:text-luxury-gold transition-all duration-200 hover:translate-x-1 inline-block">
                  ICU Flooring
                </a>
              </li>
              <li>
                <a href="/interior-design" className="text-gray-400 hover:text-luxury-gold transition-all duration-200 hover:translate-x-1 inline-block">
                  Bubble Fountain
                </a>
              </li>
              <li>
                <a href="/interior-design" className="text-gray-400 hover:text-luxury-gold transition-all duration-200 hover:translate-x-1 inline-block">
                  Wallpaper Rolls
                </a>
              </li>
              <li>
                <a href="/interior-design" className="text-gray-400 hover:text-luxury-gold transition-all duration-200 hover:translate-x-1 inline-block">
                  Gym Flooring
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm uppercase font-bold tracking-wider mb-6 text-luxury-gold">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-luxury-gold mt-1 flex-shrink-0" />
                <span className="text-gray-400">D.No: 27-14-60, Near Buckingham Post Office, Rajagopalachari Street, Governerpet-520002</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-luxury-gold flex-shrink-0" />
                <span className="text-gray-400">+91-8121135980</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-luxury-gold flex-shrink-0" />
                <span className="text-gray-400">gharsansarshop@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              © 2025 Gharsansar. All rights reserved.
            </p>
            {/* <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
