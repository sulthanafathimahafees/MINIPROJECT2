import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  BrainCircuit, 
  Zap, 
  SlidersHorizontal, 
  Star, 
  ArrowRight,
  TrendingUp,
  Cpu,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const sampleProducts = [
  {
    id: 1,
    category: 'laptop',
    name: 'Asus ZenBook Pro Duo 16 AI',
    specs: 'Intel Core Ultra 9 • 32GB RAM • 1TB SSD • OLED Touch',
    price: '$1,899',
    aiScore: 98,
    matchReason: 'Perfect fit for high-performance creative multitasking & gaming with dual screen support.',
    pros: ['Dual OLED Display', 'Extreme AI Processing', 'Sublime Build Quality'],
    cons: ['Battery usage on max brightness'],
    sentimentSummary: '96% Positive from 1,420 customer reviews. Users praise fast rendering & color accuracy.'
  },
  {
    id: 2,
    category: 'tv',
    name: 'Samsung Neo QLED 65" 8K AI',
    specs: 'NQ8 AI Gen3 Processor • 8K Quantum Matrix • 120Hz',
    price: '$2,499',
    aiScore: 96,
    matchReason: 'Top choice for bright living rooms with AI upscaling for non-8K content.',
    pros: ['Industry-leading AI Upscaling', 'Zero glare panel', 'Object Tracking Sound+'],
    cons: ['Premium price tier'],
    sentimentSummary: '98% Positive from 890 reviews. Acclaimed for sports & motion clarity.'
  },
  {
    id: 3,
    category: 'fridge',
    name: 'LG InstaView Door-in-Door AI Smart Fridge',
    specs: '675L Capacity • Linear Inverter • Craft Ice • Wi-Fi AI',
    price: '$1,650',
    aiScore: 95,
    matchReason: 'Best energy efficiency for families of 4-6 with smart inventory alerts.',
    pros: ['Energy Savings (5 Star)', 'InstaView Knock-Knock panel', 'Dual Ice Maker'],
    cons: ['Requires dedicated water line'],
    sentimentSummary: '94% Positive from 2,100 reviews. Appreciated for quiet operation and freshness retention.'
  },
  {
    id: 4,
    category: 'smartphone',
    name: 'Samsung Galaxy S24 Ultra AI',
    specs: 'Snapdragon 8 Gen 3 • 12GB RAM • 200MP Camera • Circle to Search',
    price: '$1,299',
    aiScore: 99,
    matchReason: 'Matches your requirement for top-tier low light photography and live call translation.',
    pros: ['Titanium frame', 'Built-in S-Pen', '7 Years OS Updates'],
    cons: ['Slightly heavy in hand'],
    sentimentSummary: '97% Positive from 4,500 reviews. Celebrated for camera zoom & battery longevity.'
  }
];

const ShowroomSimulator = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(sampleProducts[0]);

  const filteredProducts = activeCategory === 'all' 
    ? sampleProducts 
    : sampleProducts.filter(p => p.category === activeCategory);

  return (
    <section className="py-20 relative bg-slate-900 text-[#1E293B] text-white overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#2563EB]/15 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#10B981]/15 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#2563EB]/20 text-sky-400 border border-sky-500/30 mb-4">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Interactive Showroom Demo</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Experience OptiBuy AI in Action
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            See how OptiBuy analyzes consumer electronics specs, customer sentiment, and budget constraints to deliver instant explainable recommendations.
          </p>
        </div>

        {/* Interactive Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'laptop', label: 'Laptops' },
            { id: 'tv', label: 'Smart TVs' },
            { id: 'fridge', label: 'Refrigerators' },
            { id: 'smartphone', label: 'Smartphones' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-[#2563EB] to-[#10B981] text-white shadow-lg shadow-[#2563EB]/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Demo Interface Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Product Selection Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Showroom Catalog</span>
              <span>{filteredProducts.length} Items Evaluated</span>
            </div>

            {filteredProducts.map(product => {
              const isSelected = selectedProduct.id === product.id;
              return (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedProduct(product)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${
                    isSelected
                      ? 'bg-slate-800 border-[#2563EB] ring-1 ring-[#2563EB]'
                      : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-white">{product.name}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{product.specs}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        {product.aiScore}% AI Match
                      </span>
                      <p className="text-sm font-extrabold text-white mt-1">{product.price}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right Column: AI Deep Insight Card */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedProduct.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl backdrop-blur-xl space-y-6"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-800">
                        Top AI Recommendation
                      </span>
                      <span className="text-xs text-slate-400 font-mono">ID: OPTI-{selectedProduct.id}982</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mt-2">{selectedProduct.name}</h3>
                    <p className="text-xs text-slate-300 mt-1">{selectedProduct.specs}</p>
                  </div>
                  <div className="text-left sm:text-right bg-slate-900/80 p-3 rounded-2xl border border-slate-700">
                    <span className="text-xs text-slate-400">Match Confidence</span>
                    <div className="text-2xl font-extrabold text-emerald-400 flex items-center gap-1 sm:justify-end">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      <span>{selectedProduct.aiScore}%</span>
                    </div>
                  </div>
                </div>

                {/* AI Explanation Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/50 to-slate-900 border border-blue-500/30">
                  <div className="flex items-center gap-2 text-sm font-semibold text-sky-300 mb-1">
                    <BrainCircuit className="w-4 h-4 text-[#2563EB]" />
                    <span>Explainable AI Reason</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    "{selectedProduct.matchReason}"
                  </p>
                </div>

                {/* Pros & Cons Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-emerald-950/30 p-4 rounded-2xl border border-emerald-500/20">
                    <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Key Advantages
                    </h5>
                    <ul className="space-y-1.5">
                      {selectedProduct.pros.map((pro, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-amber-950/30 p-4 rounded-2xl border border-amber-500/20">
                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      Things to Consider
                    </h5>
                    <ul className="space-y-1.5">
                      {selectedProduct.cons.map((con, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* AI Review Sentiment Summary */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300">Aggregated Review Insights</span>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedProduct.sentimentSummary}
                  </p>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
};

export default ShowroomSimulator;
