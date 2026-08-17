import React from 'react';
import { 
  Target, 
  Eye, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  BarChart3, 
  Sliders, 
  ShoppingBag, 
  ArrowRight 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const platformFeatures = [
  {
    title: 'Explainable AI Decision Scores',
    desc: 'OptiBuy evaluates products on a multi-factor weighting model, providing clear 0-100 scores tailored to user budget, specifications, and preference criteria.',
    icon: BarChart3,
    color: 'text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800'
  },
  {
    title: 'Review Sentiment Intelligence',
    desc: 'Synthesizes thousands of verified buyer reviews into concise pros and cons summaries, saving customers hours of tedious reading.',
    icon: ShieldCheck,
    color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800'
  },
  {
    title: 'Side-by-Side Spec Comparison',
    desc: 'Normalized side-by-side matrices compare displays, processors, memory, battery endurance, and pricing across competing models.',
    icon: Sliders,
    color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800'
  },
  {
    title: 'Smart Showroom Experience',
    desc: 'Bridges physical retail stores with digital decision assistance, offering in-store QR scanning and floor display model comparisons.',
    icon: ShoppingBag,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
  }
];

const AboutPage = () => {
  return (
    <div className="py-12 bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white min-h-screen transition-colors duration-300">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 box-border space-y-16">
        
        {/* About Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider bg-[#2563EB]/10 dark:bg-blue-950/60 text-[#2563EB] dark:text-cyan-400 border border-[#2563EB]/20 dark:border-blue-800">
            <Sparkles className="w-4.5 h-4.5 text-amber-500" />
            <span>Consumer Electronics Platform</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            About <span className="gradient-text">OptiBuy</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            OptiBuy is an intelligent customer decision support platform designed specifically for consumer electronics. It eliminates buyer hesitation through explainable recommendations, side-by-side spec evaluations, and review sentiment intelligence.
          </p>
        </div>

        {/* Mission, Vision & Core Objectives */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <motion.div 
            whileHover={{ y: -6 }}
            className="glass-card rounded-3xl p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-md shadow-blue-500/20">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Our Mission</h3>
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                To eliminate customer confusion in electronics showrooms by transforming complex technical product specifications into instant, human-understandable AI recommendations.
              </p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -6 }}
            className="glass-card rounded-3xl p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-cyan-600 text-white flex items-center justify-center mb-6 shadow-md shadow-cyan-500/20">
                <Eye className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Our Vision</h3>
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                To become the standard decision-support layer across retail electronics showrooms, empowering both customers and sales consultants with zero-bias product insights.
              </p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -6 }}
            className="glass-card rounded-3xl p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-6 shadow-md shadow-emerald-500/20">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Core Objectives</h3>
              <ul className="space-y-3 text-base text-slate-600 dark:text-slate-300 font-medium">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>Streamline electronics selection with Decision Scores</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>Provide transparent explainable rationale</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>Synthesize buyer feedback into pros & cons summaries</span>
                </li>
              </ul>
            </div>
          </motion.div>

        </div>

        {/* Why Choose OptiBuy - Core Capabilities */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-12 border border-slate-200/90 dark:border-slate-700/90 shadow-md space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-sm font-bold uppercase tracking-wider text-[#2563EB] dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/70 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-800">
              Platform Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Why Customers Rely on OptiBuy
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg font-medium">
              Designed to solve real decision paralysis when buying smartphones, laptops, TVs, and smart appliances.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {platformFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="p-7 rounded-3xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-700/70 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${feat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {feat.title}
                    </h3>
                  </div>
                  <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action Banner */}
        <div className="bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#0F172A] text-white rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Experience Zero-Regret Electronics Shopping
            </h2>
            <p className="text-lg text-blue-100 font-medium">
              Explore our decision engine catalog or register your free OptiBuy profile today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full text-base font-bold text-[#2563EB] bg-white hover:bg-slate-100 shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <span>Explore Decision Engine</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full text-base font-bold text-white bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md transition-all"
              >
                Contact Support Team
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
