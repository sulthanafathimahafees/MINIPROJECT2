import React from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  MessageSquare, 
  Scale, 
  Heart, 
  Boxes, 
  UserCheck, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const featuresList = [
  {
    icon: Sparkles,
    title: 'AI Product Recommendation',
    desc: 'Intelligent algorithms evaluate customer budget, specs, and preferences to suggest ideal electronics.',
    color: 'from-blue-500 to-blue-600',
    badge: 'Core Feature'
  },
  {
    icon: BrainCircuit,
    title: 'AI Product Insight Engine',
    desc: 'Synthesizes thousands of verified buyer reviews into concise pros, cons, and sentiment summaries.',
    color: 'from-emerald-500 to-teal-600',
    badge: 'NLP Insights'
  },
  {
    icon: MessageSquare,
    title: 'Natural Language Shopping',
    desc: 'Express requirements in natural human language, such as "Best laptop for 4K video editing under $1500".',
    color: 'from-purple-500 to-indigo-600',
    badge: 'Conversational'
  },
  {
    icon: Scale,
    title: 'Smart Product Comparison',
    desc: 'Side-by-side feature matrix that highlights key differences, power consumption, and value scores.',
    color: 'from-amber-500 to-orange-600',
    badge: 'Matrix View'
  },
  {
    icon: Heart,
    title: 'Wishlist & Favorites',
    desc: 'Bookmark potential electronics during showroom visits and share curated lists with family or advisors.',
    color: 'from-rose-500 to-pink-600',
    badge: 'Personalized'
  },
  {
    icon: Boxes,
    title: 'Real-Time Inventory',
    desc: 'Live stock sync with showroom inventory databases so customers only choose readily available models.',
    color: 'from-cyan-500 to-blue-600',
    badge: 'Live Sync'
  },
  {
    icon: UserCheck,
    title: 'Personalized Shopping',
    desc: 'Tailors choices according to household size, energy efficiency priorities, and tech skill level.',
    color: 'from-[#10B981] to-emerald-600',
    badge: 'Tailored'
  },
  {
    icon: HelpCircle,
    title: 'Explainable Recommendations',
    desc: 'Clear transparent explanations for *why* a specific product was recommended over alternative choices.',
    color: 'from-[#2563EB] to-indigo-600',
    badge: 'Transparent'
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-24 relative bg-slate-50 overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20 mb-4">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Showroom Intelligence Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E293B] tracking-tight">
            Engineered for Intelligent Electronics Shopping
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#64748B] leading-relaxed">
            OptiBuy combines natural language processing, automated sentiment extraction, and real-time inventory matching to empower buyers.
          </p>
        </div>

        {/* 8 Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuresList.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ y: -6 }}
                className="glass-card rounded-3xl p-6 border border-white shadow-sm hover:shadow-xl hover:border-[#2563EB]/30 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {feat.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-[#1E293B] group-hover:text-[#2563EB] transition-colors duration-200">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] mt-2.5 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                {/* Subtle Hover Footer */}
                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] group-hover:translate-x-1 transition-transform duration-200">
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;
