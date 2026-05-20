import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white border-t-4 border-primary-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Service Areas Banner */}
        <div className="text-center mb-12 pb-8 border-b border-gray-700">
          <h3 className="text-2xl font-display font-bold mb-4 text-white">Service Areas</h3>
          <p className="text-gray-300 text-lg mb-4">
            Best Interior Designers serving across Andhra Pradesh & Telangana
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="px-4 py-2 bg-primary-600 rounded-full font-semibold">Vijayawada</span>
            <span className="px-4 py-2 bg-primary-700 rounded-full font-semibold">Guntur</span>
            <span className="px-4 py-2 bg-primary-700 rounded-full font-semibold">Eluru</span>
            <span className="px-4 py-2 bg-primary-700 rounded-full font-semibold">Andhra Pradesh</span>
            <span className="px-4 py-2 bg-primary-700 rounded-full font-semibold">Telangana</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="/images/logo.png" // use the correct path relative to public folder
                alt="Logo"
                className="w-12 h-12"
              />
              <span className="text-xl font-bold">GHAR SANSAR</span>
            </div>
            <p className="text-gray-400 mb-4">
              Transform your home with our premium decor items and professional interior design services.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/GharSansarshop/"
                className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary-600 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>

              <a 
                href="https://www.youtube.com/@gharsansar_shop" 
                className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary-600 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/gharsansar_shop/" 
                className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary-600 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-display font-bold mb-6 text-primary-400">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/products" className="text-gray-400 hover:text-blue-400 transition-all duration-200 hover:translate-x-1 inline-block">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-blue-400 transition-all duration-200 hover:translate-x-1 inline-block">
                  Interior Design
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-blue-400 transition-all duration-200 hover:translate-x-1 inline-block">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-blue-400 transition-all duration-200 hover:translate-x-1 inline-block">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xl font-display font-bold mb-6 text-primary-400">Categories</h3>
            <ul className="space-y-3">
              <li>
                <a href="/interior-design" className="text-gray-400 hover:text-blue-400 transition-all duration-200 hover:translate-x-1 inline-block">
                  ICU Flooring
                </a>
              </li>
              <li>
                <a href="/interior-design" className="text-gray-400 hover:text-blue-400 transition-all duration-200 hover:translate-x-1 inline-block">
                  Bubble Fountain
                </a>
              </li>
              <li>
                <a href="/interior-design" className="text-gray-400 hover:text-blue-400 transition-all duration-200 hover:translate-x-1 inline-block">
                  Wallpaper Rolls
                </a>
              </li>
              <li>
                <a href="/interior-design" className="text-gray-400 hover:text-blue-400 transition-all duration-200 hover:translate-x-1 inline-block">
                  Gym Flooring
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-display font-bold mb-6 text-primary-400">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary-400 mt-1 flex-shrink-0" />
                <span className="text-gray-400">D.No: 27-14-60, Near Buckingham Post Office, Rajagopalachari Street, Governerpet-520002</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-gray-400">+91-8121135980</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-400 flex-shrink-0" />
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
