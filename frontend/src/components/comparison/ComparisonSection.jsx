import React from 'react';
import { XCircle, CheckCircle2, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const comparisonPoints = [
  {
    feature: 'Search Experience',
    traditional: 'Endless manual browsing through hundreds of confusing models.',
    optibuy: 'Instant AI recommendations tailored to your exact budget & lifestyle.',
  },
  {
    feature: 'Decision Confidence',
    traditional: 'High confusion & fear of choosing outdated or wrong electronics.',
    optibuy: '100% confidence with transparent AI explanations and pros/cons.',
  },
  {
    feature: 'Review Analysis',
    traditional: 'Reading dozens of conflicting, unverified online buyer reviews.',
    optibuy: 'Automated NLP review summaries distilling key insights in seconds.',
  },
  {
    feature: 'Comparison Depth',
    traditional: 'Basic side-by-side spec sheets with raw jargon numbers.',
    optibuy: 'Smart feature matrix highlighting real-world performance differences.',
  },
  {
    feature: 'Decision Speed',
    traditional: 'Takes days or weeks of stressful showroom visits and research.',
    optibuy: 'Make a confident purchase decision in under 5 minutes.',
  },
];

const ComparisonSection = () => {
  return (
    <section className="py-24 relative bg-slate-900 text-white overflow-hidden">
      
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#10B981]/15 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-4">
            <Zap className="w-4 h-4 fill-current text-amber-400" />
            <span>Why OptiBuy Wins</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Traditional Shopping vs OptiBuy
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            See how OptiBuy eliminates decision fatigue and brings clarity to consumer electronics showrooms.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Traditional Shopping Box */}
          <div className="bg-slate-800/60 rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-6 border-b border-slate-700 mb-6">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-red-400 tracking-wider">Old Way</span>
                <h3 className="text-xl font-bold text-slate-300">Traditional Electronics Shopping</h3>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-red-950/60 text-red-400 flex items-center justify-center border border-red-800/60">
                <XCircle className="w-6 h-6" />
              </div>
            </div>

            <div className="space-y-4">
              {comparisonPoints.map((pt, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{pt.feature}</h4>
                    <p className="text-xs sm:text-sm text-slate-300 mt-0.5">{pt.traditional}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OptiBuy Shopping Box */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#2563EB] to-[#10B981] rounded-3xl blur opacity-30" />
            
            <div className="relative bg-slate-800 rounded-3xl p-6 sm:p-8 border border-blue-500/40 shadow-2xl">
              <div className="flex items-center justify-between pb-6 border-b border-slate-700 mb-6">
                <div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#2563EB] text-white mb-1">
                    AI Powered
                  </div>
                  <h3 className="text-xl font-extrabold text-white">OptiBuy Smart Experience</h3>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center border border-emerald-500/60 shadow-lg">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-4">
                {comparisonPoints.map((pt, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ x: 4 }}
                    className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-emerald-500/30 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-[#10B981] uppercase tracking-wider">{pt.feature}</h4>
                      <p className="text-xs sm:text-sm text-slate-100 font-medium mt-0.5">{pt.optibuy}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default ComparisonSection;
