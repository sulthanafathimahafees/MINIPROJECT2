import React from 'react';
import { 
  MessageSquarePlus, 
  Brain, 
  Sparkles, 
  BarChart3, 
  ShoppingBag, 
  ArrowRight, 
  ChevronRight 
} from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    step: '01',
    title: 'Tell us your requirements',
    desc: 'Share your budget, room size, preferred brands, or daily usage habits with OptiBuy.',
    icon: MessageSquarePlus,
    color: 'border-blue-500 text-blue-600 bg-blue-50',
  },
  {
    step: '02',
    title: 'AI understands your needs',
    desc: 'Our NLP engine processes your criteria against technical product specs and sentiments.',
    icon: Brain,
    color: 'border-emerald-500 text-emerald-600 bg-emerald-50',
  },
  {
    step: '03',
    title: 'Receive personalized recommendations',
    desc: 'Get a curated top 3 list of showroom electronics ranked by match confidence score.',
    icon: Sparkles,
    color: 'border-amber-500 text-amber-600 bg-amber-50',
  },
  {
    step: '04',
    title: 'View AI Product Insights',
    desc: 'Explore synthesized review summaries, pros/cons, and explainable AI match reasons.',
    icon: BarChart3,
    color: 'border-purple-500 text-purple-600 bg-purple-50',
  },
  {
    step: '05',
    title: 'Purchase with confidence',
    desc: 'Make a zero-regret buying decision directly at the showroom with complete transparency.',
    icon: ShoppingBag,
    color: 'border-emerald-500 text-emerald-600 bg-emerald-50',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-[#10B981] border border-emerald-200 mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Simple 5-Step Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E293B] tracking-tight">
            How OptiBuy Elevates Shopping
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#64748B]">
            From initial requirement to confident showroom checkout in 5 simple, AI-guided steps.
          </p>
        </div>

        {/* 5 Horizontal Cards connected by Arrows */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            const isLast = idx === steps.length - 1;

            return (
              <div key={idx} className="relative flex flex-col">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                  className="h-full bg-slate-50 rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:bg-white transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Number + Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-extrabold text-slate-300 font-mono">
                        {item.step}
                      </span>
                      <div className={`w-10 h-10 rounded-2xl ${item.color} border flex items-center justify-center shadow-xs`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Step Title & Description */}
                    <h3 className="text-base font-bold text-[#1E293B] mb-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  {/* Flow Arrow indicator inside step */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <span>Step {idx + 1} of 5</span>
                    {!isLast && (
                      <ChevronRight className="w-4 h-4 text-[#2563EB] hidden lg:block" />
                    )}
                  </div>
                </motion.div>

                {/* Connecting arrow icon for desktop */}
                {!isLast && (
                  <div className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white border border-slate-300 shadow-md items-center justify-center text-[#2563EB]">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
