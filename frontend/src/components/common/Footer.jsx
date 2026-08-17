import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, Shield, Sparkles, ArrowUpRight } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 relative overflow-hidden pt-16 pb-12">
      {/* Soft AI background glow in footer */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2563EB]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 box-border relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Logo showTagline={false} size="large" className="text-white" />
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              OptiBuy is an AI-powered customer decision support platform for consumer electronics showrooms. We help shoppers discover, compare, and choose electronics with intelligent AI insights.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-[#2563EB] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-[#2563EB] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@optibuy.ai"
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-[#10B981] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Navigation</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-[#2563EB] transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#2563EB] transition-colors">About OptiBuy</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#2563EB] transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#2563EB] transition-colors">Sign In</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#2563EB] transition-colors">Create Account</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Legal & Policy</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#privacy" className="hover:text-[#10B981] transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms" className="hover:text-[#10B981] transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#security" className="hover:text-[#10B981] transition-colors">AI Ethics & Security</a>
              </li>
              <li>
                <a href="#cookies" className="hover:text-[#10B981] transition-colors">Cookie Policy</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} OptiBuy AI Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with precision for Modern Showroom Decision Support
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
