import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Smartphone, 
  Laptop, 
  Tv, 
  Headphones, 
  CheckCircle2,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  Zap,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { formatCurrencyINR } from '../../utils/currencyFormatter';

const categoryPreviews = [
  {
    id: 'smartphones',
    name: 'Smartphones',
    icon: Smartphone,
    matchScore: 96,
    samplePrice: 79999,
    sentiment: '96% Positive Sentiment',
    highlights: ['Camera Zoom Performance', '120Hz OLED Display', 'All-day Battery Life'],
    matchCriteria: 'Matches High Display Quality & Fast Charging preferences'
  },
  {
    id: 'laptops',
    name: 'Laptops & PCs',
    icon: Laptop,
    matchScore: 98,
    samplePrice: 129999,
    sentiment: '98% Positive Sentiment',
    highlights: ['Neural Processing Engine', 'CNC Aluminum Build', '240Hz Refresh Rate'],
    matchCriteria: 'Matches Creative Workstation & Heavy Multitasking intent'
  },
  {
    id: 'tvs',
    name: 'Smart TVs',
    icon: Tv,
    matchScore: 94,
    samplePrice: 149999,
    sentiment: '94% Positive Sentiment',
    highlights: ['Anti-Glare OLED Panel', 'Cognitive Audio Screen', 'HDMI 2.1 120Hz Gaming'],
    matchCriteria: 'Matches Bright Living Room & Console Gaming requirements'
  },
  {
    id: 'audio',
    name: 'Audio & ANC',
    icon: Headphones,
    matchScore: 97,
    samplePrice: 29990,
    sentiment: '97% Positive Sentiment',
    highlights: ['Active Noise Cancellation', 'LDAC Hi-Res Wireless', 'Multi-Device Pairing'],
    matchCriteria: 'Matches Commute Noise Reduction & Acoustic Clarity priority'
  }
];

const OptiBuyDecisionInterface = () => {
  const [activeCategory, setActiveCategory] = useState(categoryPreviews[0]);

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Outer Glow Backdrop */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#2563EB]/30 via-cyan-500/20 to-blue-600/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative bg-slate-900/95 text-white border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-2xl space-y-6">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white tracking-wide">OptiBuy Decision Engine</h3>
              <p className="text-[11px] text-slate-400 font-mono">Interactive Decision Support Preview</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            Zero-Bias Engine
          </span>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-4 gap-2 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/80">
          {categoryPreviews.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory.id === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat)}
                className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  isSelected
                    ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] truncate max-w-full">{cat.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Decision Score & Preference Match Grid */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Decision Score Metric Card */}
          <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono font-semibold">
              <span>Decision Score</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{activeCategory.matchScore}</span>
              <span className="text-xs text-emerald-400 font-bold">/ 100</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">Normalized rating based on technical specs & reliability</p>
          </div>

          {/* Sentiment Intelligence Card */}
          <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono font-semibold">
              <span>Review Sentiment</span>
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            </div>
            <div className="text-sm font-extrabold text-cyan-300 pt-1">
              {activeCategory.sentiment}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">Synthesized pros & cons from verified buyers</p>
          </div>

        </div>

        {/* Match Breakdown List */}
        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>Key Evaluated Attributes</span>
            <span className="text-emerald-400 text-[11px] font-mono font-semibold">Sample Range: {formatCurrencyINR(activeCategory.samplePrice)}</span>
          </div>

          <div className="space-y-2">
            {activeCategory.highlights.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-700/60 text-[11px] text-slate-400 font-medium italic">
            💡 {activeCategory.matchCriteria}
          </div>
        </div>

        {/* Action Prompt CTAs */}
        <div className="pt-1 flex flex-col sm:flex-row items-center gap-3">
          <Link
            to="/products"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-md shadow-blue-600/30 transition-all"
          >
            <span>Explore Electronics Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OptiBuyDecisionInterface;
