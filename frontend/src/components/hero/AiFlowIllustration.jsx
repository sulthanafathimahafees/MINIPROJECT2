import React, { useState } from 'react';
import { 
  User, 
  BrainCircuit, 
  Cpu, 
  ShoppingBag, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  ArrowRight,
  ThumbsUp,
  Award,
  Layers
} from 'lucide-react';
import { motion } from 'framer-motion';

const AiFlowIllustration = () => {
  const [activeStep, setActiveStep] = useState(2);

  const steps = [
    {
      id: 1,
      title: "1. Customer Need",
      desc: "Expresses budget & specific requirements",
      icon: User,
      color: "from-blue-500 to-indigo-600",
      badge: "User Input"
    },
    {
      id: 2,
      title: "2. AI Brain Engine",
      desc: "Processes 500+ specs & sentiment reviews",
      icon: BrainCircuit,
      color: "from-blue-600 to-emerald-500",
      badge: "Deep AI Analysis"
    },
    {
      id: 3,
      title: "3. Showroom Inventory",
      desc: "Filters live store electronics database",
      icon: Layers,
      color: "from-emerald-500 to-teal-600",
      badge: "Catalog Match"
    },
    {
      id: 4,
      title: "4. Recommendation Cards",
      desc: "Generates ranked choices with pros/cons",
      icon: Sparkles,
      color: "from-emerald-600 to-amber-500",
      badge: "98% Match Score"
    },
    {
      id: 5,
      title: "5. Confident Purchase",
      desc: "Customer decides with total clarity",
      icon: CheckCircle2,
      color: "from-amber-500 to-emerald-500",
      badge: "Zero Regret"
    }
  ];

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Outer Glow Card */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#2563EB]/30 via-[#10B981]/30 to-[#F59E0B]/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
      
      {/* Main Illustration Glass Board */}
      <div className="relative glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-2xl backdrop-blur-xl">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200/80 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="ml-2 text-xs font-mono font-semibold text-slate-500 uppercase tracking-widest">
              OptiBuy AI Decision Architecture
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Live Flow Simulation</span>
          </div>
        </div>

        {/* 5 Vertical Flow Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;

            return (
              <div key={step.id} className="relative">
                {/* Connecting vertical line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-gradient-to-b from-[#2563EB]/40 to-[#10B981]/40 -z-0" />
                )}

                <motion.div
                  whileHover={{ scale: 1.02, x: 4 }}
                  onClick={() => setActiveStep(step.id)}
                  className={`relative z-10 p-4 rounded-2xl cursor-pointer transition-all duration-300 flex items-center gap-4 ${
                    isActive 
                      ? 'bg-white shadow-lg border border-[#2563EB]/30 ring-2 ring-[#2563EB]/20' 
                      : 'bg-slate-50/80 hover:bg-white border border-slate-200/60'
                  }`}
                >
                  {/* Icon Node */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${step.color} text-white flex items-center justify-center shadow-md flex-shrink-0 relative`}>
                    <Icon className="w-6 h-6" />
                    {isActive && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-white animate-ping" />
                    )}
                  </div>

                  {/* Step Description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-800 truncate">
                        {step.title}
                      </h4>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isActive 
                          ? 'bg-[#2563EB] text-white' 
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {step.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Preview Footer Box */}
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-inner flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-400">OptiBuy Precision Outcome</p>
              <p className="text-[11px] text-slate-300">99.4% Customer Satisfaction Rate in Showrooms</p>
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-white/10 text-slate-200">
              Latency: &lt;150ms
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AiFlowIllustration;
