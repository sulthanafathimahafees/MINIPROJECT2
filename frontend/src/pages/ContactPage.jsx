import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Github, Linkedin, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you, ${formData.name}! Your message has been sent.`);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="py-12 bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white min-h-screen transition-colors duration-300">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 box-border space-y-16">
        
        {/* Contact Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#2563EB]/10 dark:bg-blue-950/60 text-[#2563EB] dark:text-cyan-400 border border-[#2563EB]/20 dark:border-blue-800">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Get In Touch</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Contact <span className="gradient-text">OptiBuy</span> Team
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Have questions regarding decision support algorithms, showroom integration, or technical architecture? Reach out to us.
          </p>
        </div>

        {/* Contact Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-3xl p-8 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-xl"
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Send us a message</h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-8">Fill out the form below and our team will get back to you within 24 hours.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-2">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Alex Morgan"
                      className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-2">Your Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="alex@example.com"
                      className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Showroom Integration / Inquiry"
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-2">Message</label>
                  <textarea
                    name="message"
                    rows="5"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] shadow-lg shadow-[#2563EB]/25 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  <span>Send Message</span>
                </button>
              </form>
            </motion.div>
          </div>

          {/* Right Column: Company Info */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-md space-y-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Platform Information</h3>

              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-slate-700 text-[#2563EB] dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Headquarters / Showroom Lab</h4>
                    <p className="text-xs mt-0.5">OptiBuy Electronics Research Lab, Tech Park Tower B, Cyber City</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Email Us</h4>
                    <p className="text-xs mt-0.5">contact@optibuy.ai / support@optibuy.ai</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Phone & Support</h4>
                    <p className="text-xs mt-0.5">+1 (800) 555-OPTI (Mon - Sat, 9am - 7pm)</p>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Connect:</span>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-[#2563EB] text-slate-600 dark:text-slate-300 hover:text-white flex items-center justify-center transition-colors">
                  <Github className="w-4 h-4" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-[#2563EB] text-slate-600 dark:text-slate-300 hover:text-white flex items-center justify-center transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Showroom Location Box */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl overflow-hidden relative min-h-[220px] flex flex-col justify-between">
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Showroom Location</span>
                </div>
                <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded-full">Interactive Kiosk</span>
              </div>

              <div className="relative z-10 my-4 text-center py-6 border border-slate-800 rounded-2xl bg-slate-800/80 backdrop-blur-md">
                <p className="text-sm font-semibold text-slate-200">Consumer Electronics Showroom Kiosk</p>
                <p className="text-xs text-slate-400 mt-1">Lat: 28.6139° N, Lon: 77.2090° E</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ContactPage;
