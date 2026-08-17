import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ChevronRight,
  Smartphone,
  Laptop,
  Tv,
  Headphones,
  Tablet,
  Camera,
  Watch,
  Plug,
  CheckCircle2,
  XCircle,
  Star,
  TrendingUp,
  Sliders,
  QrCode,
  ShoppingBag,
  ShieldCheck,
  MessageSquare,
  Layers
} from 'lucide-react';
import { motion } from 'framer-motion';
import OptiBuyDecisionInterface from '../components/hero/OptiBuyDecisionInterface';
import { formatCurrencyINR } from '../utils/currencyFormatter';

// Product Categories
const categories = [
  { name: 'Smartphones', icon: Smartphone, count: '120+ Models', desc: 'Flagships, budget, & gaming phones' },
  { name: 'Laptops', icon: Laptop, count: '95+ Models', desc: 'AI PCs, ultrabooks, & workstations' },
  { name: 'Smart TVs', icon: Tv, count: '60+ Models', desc: '4K/8K QLED, OLED, & Mini-LED' },
  { name: 'Headphones', icon: Headphones, count: '80+ Models', desc: 'ANC wireless, earbuds, & studio' },
  { name: 'Tablets', icon: Tablet, count: '45+ Models', desc: 'Pro creative & entertainment tabs' },
  { name: 'Cameras', icon: Camera, count: '40+ Models', desc: 'Mirrorless, vlogging, & DSLR' },
  { name: 'Smart Watches', icon: Watch, count: '55+ Models', desc: 'Fitness trackers & cellular watches' },
  { name: 'Accessories', icon: Plug, count: '200+ Items', desc: 'Chargers, docks, soundbars, & cases' },
];

// How OptiBuy Works - 4 Steps
const workSteps = [
  {
    step: '01',
    title: 'Tell Us What You Need',
    desc: 'Share your budget, room size, preferred features, or daily usage habits with OptiBuy.',
    color: 'bg-blue-500/10 text-blue-600 dark:text-cyan-400 border-blue-200 dark:border-blue-800'
  },
  {
    step: '02',
    title: 'Explore & Compare Products',
    desc: 'Instantly view normalized spec sheets, side-by-side comparisons, and alternative choices.',
    color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800'
  },
  {
    step: '03',
    title: 'Understand Reviews & Recommendations',
    desc: 'Get synthesized sentiment intelligence, pros & cons summaries, and explainable match scores.',
    color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800'
  },
  {
    step: '04',
    title: 'Make a Confident Decision',
    desc: 'Purchase with complete clarity at your local showroom or online without buyer remorse.',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
  }
];

// Product Recommendations Sample Data
const recommendedProducts = [
  {
    id: 1,
    name: 'Asus ZenBook Pro Duo 16 AI',
    category: 'Laptop',
    price: 189999,
    rating: 4.8,
    matchScore: 92,
    specs: 'Intel Core Ultra 9 • 32GB RAM • 1TB SSD • OLED Touch',
    whyMatches: 'Highest benchmark score for simultaneous video editing & heavy creative multitasking.',
    badge: 'Best for Creators'
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24 Ultra AI',
    category: 'Smartphone',
    price: 129999,
    rating: 4.9,
    matchScore: 94,
    specs: 'Snapdragon 8 Gen 3 • 12GB RAM • 200MP Camera • Titanium',
    whyMatches: 'Unmatched 200MP zoom optics, live translation, and 2-day battery endurance.',
    badge: 'Top Overall Match'
  },
  {
    id: 3,
    name: 'Sony WH-1000XM5 Noise Cancelling',
    category: 'Headphones',
    price: 29990,
    rating: 4.9,
    matchScore: 96,
    specs: 'Integrated V1 Processor • 8 Mics • LDAC • 30h Battery',
    whyMatches: 'Highest sentiment score for active noise cancellation and voice isolation.',
    badge: 'Highest Rated'
  }
];

// Comparison Table Data
const comparisonProducts = [
  {
    name: 'Asus ZenBook Pro Duo 16 AI',
    price: 189999,
    display: '16" 3.2K OLED Touch',
    processor: 'Intel Core Ultra 9',
    ram: '32GB LPDDR5X',
    storage: '1TB Gen4 SSD',
    battery: '11.5 Hours',
    camera: '1080p FHD IR Camera',
    rating: '4.8 / 5',
    sentiment: '94% Positive',
    score: '92 / 100',
    isBestMatch: true
  },
  {
    name: 'MacBook Pro 16" M3 Max',
    price: 349900,
    display: '16.2" Liquid Retina XDR',
    processor: 'Apple M3 Max (14-Core)',
    ram: '36GB Unified Memory',
    storage: '1TB SSD',
    battery: '22 Hours',
    camera: '1080p FaceTime HD',
    rating: '4.9 / 5',
    sentiment: '96% Positive',
    score: '90 / 100',
    isBestMatch: false
  },
  {
    name: 'Dell XPS 16 Laptop',
    price: 174900,
    display: '16.3" 4K+ OLED Touch',
    processor: 'Intel Core Ultra 7',
    ram: '16GB LPDDR5X',
    storage: '512GB SSD',
    battery: '9.5 Hours',
    camera: '1080p FHD Camera',
    rating: '4.5 / 5',
    sentiment: '88% Positive',
    score: '85 / 100',
    isBestMatch: false
  }
];

// Accessory Bundles Data
const accessoryBundles = [
  {
    primary: 'Laptop Setup',
    item: 'Asus ZenBook Pro Duo 16',
    accessories: [
      { name: 'Logitech MX Master 3S Wireless Mouse', price: 9990 },
      { name: 'Keychron K2 Wireless Mechanical Keyboard', price: 8990 },
      { name: 'Water-Resistant Premium Laptop Sleeve', price: 3490 }
    ]
  },
  {
    primary: 'Smartphone Bundle',
    item: 'Samsung Galaxy S24 Ultra',
    accessories: [
      { name: 'Spigen Tough Armor Protective Case', price: 3490 },
      { name: 'Anker 45W USB-C Fast Charger', price: 2490 },
      { name: 'Galaxy Buds2 Pro Wireless Earbuds', price: 15990 }
    ]
  },
  {
    primary: 'Smart TV Setup',
    item: 'Sony BRAVIA 65" QD-OLED TV',
    accessories: [
      { name: 'JBL Bar 5.0 MultiBeam Soundbar', price: 29990 },
      { name: 'Ultra High-Speed HDMI 2.1 Cable (8K)', price: 1990 },
      { name: 'Heavy-Duty Articulating Wall Mount', price: 5490 }
    ]
  }
];

const HomePage = () => {

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative overflow-hidden circuit-grid">

      {/* ==========================================
          1. HERO SECTION
         ========================================== */}
      <section className="relative pt-8 pb-16 lg:pt-16 lg:pb-28 overflow-hidden">

        {/* Soft Background Ambient Glows */}
        <div className="absolute top-10 left-1/4 w-[450px] h-[450px] bg-[#2563EB]/10 dark:bg-[#2563EB]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-[#06B6D4]/10 dark:bg-[#06B6D4]/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Column: Heading, Subheading & CTAs */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">

              {/* Academic & Platform Pill */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full text-sm font-bold bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-[#2563EB] dark:text-cyan-400 border border-slate-200 dark:border-slate-700 shadow-xs"
              >
                <Sparkles className="w-4.5 h-4.5 text-amber-500" />
                <span>Consumer Electronics Decision Support Platform</span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] dark:text-white tracking-tight leading-[1.12]"
              >
                Find the Right Electronics.{' '}
                <span className="gradient-text">Make Smarter Decisions.</span>
              </motion.h1>

              {/* Supporting Text */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                OptiBuy helps customers compare products, understand real customer experiences, discover suitable alternatives, and make confident electronics purchasing decisions.
              </motion.p>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3"
              >
                <button
                  onClick={() => scrollToSection('explore-products')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-lg font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] shadow-lg shadow-[#2563EB]/25 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <span>Explore Products</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-lg font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs transition-all duration-200"
                >
                  <span>Get Started</span>
                </Link>

                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="inline-flex items-center gap-1.5 text-base font-bold text-[#2563EB] dark:text-cyan-400 hover:underline pt-2 sm:pt-0"
                >
                  <span>How OptiBuy Works</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>

              {/* Key Platform Value Props */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-center lg:text-left"
              >
                <div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white">Multi-Category</div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Smartphones, TVs, Laptops</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-[#2563EB] dark:text-cyan-400">Review Intelligence</div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Synthesized Sentiment Pros/Cons</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">Decision Score</div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Explainable Match Ranking</div>
                </div>
              </motion.div>

            </div>

            {/* Right Column: Interactive OptiBuy Decision Interface */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-6"
            >
              <OptiBuyDecisionInterface />
            </motion.div>

          </div>
        </div>
      </section>

      {/* ==========================================
          2. EXPLORE ELECTRONICS (PRODUCT CATEGORIES)
         ========================================== */}
      <section id="explore-products" className="py-20 bg-slate-100/70 dark:bg-slate-900/70 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">

          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-sm font-bold uppercase tracking-wider text-[#2563EB] dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/70 px-4 py-2 rounded-full border border-blue-200/90 dark:border-blue-800">
              Electronics Catalog
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mt-4">
              Explore Consumer Electronics
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-3 text-base sm:text-lg font-medium">
              Browse top electronics categories evaluated by OptiBuy's decision support framework.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.name}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-700/90 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-slate-700 text-[#2563EB] dark:text-cyan-400 flex items-center justify-center mb-4 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg sm:text-xl group-hover:text-[#2563EB] dark:group-hover:text-cyan-400 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 block mt-1">
                    {cat.count}
                  </span>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {cat.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ==========================================
          3. HOW OPTIBUY WORKS (4 STEPS)
         ========================================== */}
      <section id="how-it-works" className="py-24 bg-white dark:bg-[#0B1120] transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-800">
              Clear 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mt-4">
              How OptiBuy Works
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-3 text-base sm:text-lg font-medium">
              From your initial requirement to a zero-regret buying decision in four simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workSteps.map((item, idx) => (
              <motion.div
                key={item.step}
                whileHover={{ y: -4 }}
                className="bg-slate-50 dark:bg-slate-800/80 p-7 rounded-3xl border border-slate-200/90 dark:border-slate-700/90 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-4xl font-extrabold font-mono text-slate-400 dark:text-slate-500">
                      {item.step}
                    </span>
                    <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${item.color}`}>
                      Step {idx + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between text-sm font-bold text-slate-400">
                  <span>Decision Support</span>
                  <ChevronRight className="w-5 h-5 text-[#2563EB] dark:text-cyan-400" />
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ==========================================
          4. AI REVIEW INTELLIGENCE
         ========================================== */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#2563EB]/15 rounded-full blur-3xl" />

        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 relative z-10">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-4 py-2 rounded-full border border-cyan-800">
              Review Intelligence Engine
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mt-4">
              Understand Thousands of Reviews in Seconds
            </h2>
            <p className="text-slate-300 mt-3 text-base sm:text-lg font-medium">
              OptiBuy synthesizes verified customer feedback into concise, actionable sentiment summaries and pros/cons matrices.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Left Column: Sample Review Insight Summary */}
            <div className="lg:col-span-7 bg-slate-800/95 p-7 sm:p-9 rounded-3xl border border-slate-700 shadow-2xl backdrop-blur-xl space-y-6">

              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-mono font-bold">Sample Product Analysis</span>
                  <h3 className="text-2xl font-bold text-white mt-0.5">Asus ZenBook Pro Duo 16 AI</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Synthesized Reviews</span>
                  <span className="text-sm font-bold text-cyan-400 block">1,420 Customer Ratings</span>
                </div>
              </div>

              {/* AI Review Summary Box */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/40">
                <div className="flex items-center gap-2.5 text-base font-bold text-cyan-400 mb-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span>AI Review Summary</span>
                </div>
                <p className="text-base text-slate-200 leading-relaxed italic font-medium">
                  "Customers frequently appreciate the display quality and battery performance, while some users mention heating during intensive usage."
                </p>
              </div>

              {/* Pros & Cons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Pros */}
                <div className="p-5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-2.5 flex items-center gap-2">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                    Highlighted Pros (+)
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-200 font-medium">
                    <li className="flex items-center gap-2.5"><span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" /> Excellent 3.2K OLED display quality</li>
                    <li className="flex items-center gap-2.5"><span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" /> Reliable battery performance on standard tasks</li>
                    <li className="flex items-center gap-2.5"><span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" /> Fast Intel Core Ultra 9 processing</li>
                  </ul>
                </div>

                {/* Cons */}
                <div className="p-5 rounded-2xl bg-rose-950/50 border border-rose-500/40">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-rose-400 mb-2.5 flex items-center gap-2">
                    <XCircle className="w-4.5 h-4.5 text-rose-400" />
                    Considerations (-)
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-200 font-medium">
                    <li className="flex items-center gap-2.5"><span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" /> Noticeable heat generation under heavy 3D rendering</li>
                    <li className="flex items-center gap-2.5"><span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" /> Slightly heavier chassis weight (2.2 kg)</li>
                  </ul>
                </div>

              </div>

              {/* Sentiment Breakdown Bar */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-700">
                <div className="flex items-center justify-between text-sm text-slate-200 font-bold mb-2.5">
                  <span>Sentiment Breakdown</span>
                  <span className="text-emerald-400">94% Positive Customer Rating</span>
                </div>
                <div className="w-full h-3.5 rounded-full bg-slate-700 overflow-hidden flex">
                  <div className="h-full bg-emerald-500 w-[84%]" title="84% Positive" />
                  <div className="h-full bg-amber-500 w-[10%]" title="10% Neutral" />
                  <div className="h-full bg-rose-500 w-[6%]" title="6% Negative" />
                </div>
                <div className="flex justify-between text-xs text-slate-300 font-semibold mt-2.5">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 84% Positive</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 10% Neutral</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> 6% Negative</span>
                </div>
              </div>

            </div>

            {/* Right Column: Value Narrative */}
            <div className="lg:col-span-5 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-500/40 text-cyan-400 flex items-center justify-center">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Review Intelligence Beyond Star Ratings
              </h3>
              <p className="text-slate-300 text-base leading-relaxed font-medium">
                Rather than forcing buyers to read hundreds of conflicting user reviews, OptiBuy synthesizes sentiment patterns, highlights recurring pros and cons, and explains why a product matches your exact usage requirements.
              </p>
              <div className="space-y-3.5 text-sm font-medium text-slate-200">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>Synthesizes thousands of verified online & showroom reviews</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>Filters out fake or spam ratings automatically</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>Highlights real-world battery life, thermals, and build quality</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ==========================================
          5. PRODUCT RECOMMENDATIONS THAT MATCH YOUR NEEDS
         ========================================== */}
      <section className="py-24 bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-bold uppercase tracking-wider text-[#2563EB] dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/70 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-800">
              Personalized Matching
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mt-4">
              Recommendations That Match Your Needs
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-3 text-base sm:text-lg font-medium">
              Sample electronics ranked by OptiBuy's preference matching and spec evaluation engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommendedProducts.map((prod) => (
              <motion.div
                key={prod.id}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-slate-800 rounded-3xl p-7 border border-slate-200/90 dark:border-slate-700/90 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-white bg-[#2563EB] px-3.5 py-1.5 rounded-full shadow-xs">
                      {prod.badge}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Score: {prod.matchScore}/100
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                    {prod.name}
                  </h3>

                  <div className="flex items-center justify-between text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1.5 mb-4">
                    <span>{prod.category}</span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{prod.rating}</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 dark:text-slate-200 font-medium bg-slate-50 dark:bg-slate-900/70 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700/70 mb-4">
                    {prod.specs}
                  </p>

                  <div className="p-4 rounded-xl bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/60 text-sm text-slate-800 dark:text-slate-200 mb-6">
                    <span className="font-bold text-[#2563EB] dark:text-cyan-400 block mb-1">Why this matches you:</span>
                    {prod.whyMatches}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-700/70">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{formatCurrencyINR(prod.price)}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => scrollToSection('product-comparison')}
                      className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      Compare
                    </button>
                    <Link
                      to="/products"
                      className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] shadow-xs transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ==========================================
          6. PRODUCT COMPARISON MATRIX
         ========================================== */}
      <section id="product-comparison" className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/70 px-4 py-2 rounded-full border border-cyan-200 dark:border-cyan-800">
              Side-by-Side Evaluation
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mt-4">
              Compare Before You Decide
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-3 text-base sm:text-lg font-medium">
              Evaluate specs, review sentiments, and decision scores side-by-side.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200/90 dark:border-slate-700/90 shadow-md">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs sm:text-sm uppercase tracking-wider font-extrabold text-slate-600 dark:text-slate-300">
                  <th className="p-5 sm:p-6">Feature</th>
                  {comparisonProducts.map((p, idx) => (
                    <th key={idx} className={`p-5 sm:p-6 ${p.isBestMatch ? 'bg-blue-50/90 dark:bg-blue-950/50 text-[#2563EB] dark:text-cyan-400' : ''}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold">{p.name}</span>
                        {p.isBestMatch && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#2563EB] text-white">Best Match</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm sm:text-base text-slate-800 dark:text-slate-200 font-medium">
                <tr>
                  <td className="p-5 font-bold text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40">Price</td>
                  {comparisonProducts.map((p, i) => (
                    <td key={i} className={`p-5 font-extrabold text-slate-900 dark:text-white ${p.isBestMatch ? 'bg-blue-50/40 dark:bg-blue-950/30' : ''}`}>{formatCurrencyINR(p.price)}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-5 font-bold text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40">Display</td>
                  {comparisonProducts.map((p, i) => (
                    <td key={i} className={`p-5 ${p.isBestMatch ? 'bg-blue-50/40 dark:bg-blue-950/30' : ''}`}>{p.display}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-5 font-bold text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40">Processor</td>
                  {comparisonProducts.map((p, i) => (
                    <td key={i} className={`p-5 ${p.isBestMatch ? 'bg-blue-50/40 dark:bg-blue-950/30' : ''}`}>{p.processor}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-5 font-bold text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40">RAM & Storage</td>
                  {comparisonProducts.map((p, i) => (
                    <td key={i} className={`p-5 ${p.isBestMatch ? 'bg-blue-50/40 dark:bg-blue-950/30' : ''}`}>{p.ram} / {p.storage}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-5 font-bold text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40">Battery</td>
                  {comparisonProducts.map((p, i) => (
                    <td key={i} className={`p-5 ${p.isBestMatch ? 'bg-blue-50/40 dark:bg-blue-950/30' : ''}`}>{p.battery}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-5 font-bold text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40">Review Sentiment</td>
                  {comparisonProducts.map((p, i) => (
                    <td key={i} className={`p-5 font-bold text-emerald-600 dark:text-emerald-400 ${p.isBestMatch ? 'bg-blue-50/40 dark:bg-blue-950/30' : ''}`}>{p.sentiment}</td>
                  ))}
                </tr>
                <tr className="border-t-2 border-slate-300 dark:border-slate-600 font-bold">
                  <td className="p-5 text-base text-[#2563EB] dark:text-cyan-400 bg-slate-100 dark:bg-slate-800 font-extrabold">OptiBuy Decision Score</td>
                  {comparisonProducts.map((p, i) => (
                    <td key={i} className={`p-5 text-lg sm:text-xl text-[#2563EB] dark:text-cyan-400 ${p.isBestMatch ? 'bg-blue-100/70 dark:bg-blue-950/70 font-extrabold' : ''}`}>{p.score}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* ==========================================
          7. OPTIBUY DECISION SCORE CONCEPT
         ========================================== */}
      <section className="py-24 bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">

          <div className="bg-gradient-to-br from-slate-900 to-[#1E293B] rounded-3xl p-8 sm:p-14 text-white border border-slate-700 shadow-2xl relative overflow-hidden">
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#2563EB]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">

              <div className="lg:col-span-7 space-y-5">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-blue-950/80 px-3.5 py-1.5 rounded-full border border-blue-800">
                  Unique Platform Metric
                </span>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
                  What is the OptiBuy Decision Score?
                </h3>
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-medium">
                  The OptiBuy Decision Score (e.g. 92 / 100) evaluates electronics based on a multi-factor weighting model that combines:
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm text-slate-200 pt-2">
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="font-bold text-cyan-400 block text-base mb-0.5">User Preference Match</span>
                    Budget, size, and brand choices
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="font-bold text-cyan-400 block text-base mb-0.5">Spec Benchmark</span>
                    Processor, RAM, camera, battery
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="font-bold text-cyan-400 block text-base mb-0.5">Sentiment Score</span>
                    Aggregated positive review ratio
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="font-bold text-cyan-400 block text-base mb-0.5">Price Compatibility</span>
                    Value for money ratio
                  </div>
                </div>
              </div>

              {/* Sample Score Card Badge */}
              <div className="lg:col-span-5 text-center">
                <div className="inline-flex flex-col items-center justify-center p-9 rounded-3xl bg-slate-800/90 border border-slate-700 shadow-2xl backdrop-blur-xl">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Sample OptiBuy Score</span>
                  <div className="text-6xl sm:text-7xl font-extrabold text-emerald-400 my-2">92<span className="text-3xl text-slate-400">/100</span></div>
                  <span className="text-sm font-bold text-emerald-400 bg-emerald-950/70 px-4 py-1.5 rounded-full border border-emerald-500/40">
                    High Recommendation Confidence
                  </span>
                  <p className="text-xs text-slate-400 mt-3.5 max-w-xs font-medium">
                    *Sample calculation illustrating multi-factor recommendation confidence.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ==========================================
          8. SMART SHOWROOM EXPERIENCE
         ========================================== */}
      <section className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-bold uppercase tracking-wider text-[#2563EB] dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/70 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-800">
              Physical & Digital Integration
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mt-4">
              Your Smart Showroom Experience
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-3 text-base sm:text-lg font-medium">
              Bridge physical showroom browsing with instant AI decision assistance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">

            <div className="p-7 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/90 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-slate-700 text-[#2563EB] dark:text-cyan-400 flex items-center justify-center">
                <QrCode className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">QR & Model Scan</h3>
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Scan showroom product labels to instantly load full spec breakdowns and verified review summaries.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/90 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Floor Model Comparison</h3>
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Compare showroom floor display models directly against online competitors side-by-side.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/90 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">In-Store Assistant</h3>
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Receive unbiased product insights to guide sales executives towards the exact right match.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ==========================================
          9. ACCESSORY RECOMMENDATIONS ("COMPLETE YOUR SETUP")
         ========================================== */}
      <section className="py-24 bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-800">
              Ecosystem Compatibility
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mt-4">
              Complete Your Setup
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-3 text-base sm:text-lg font-medium">
              Discover verified compatible accessories tailored to your chosen primary device.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {accessoryBundles.map((bundle, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 p-7 rounded-3xl border border-slate-200/90 dark:border-slate-700/90 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-700 mb-4">
                    <span className="text-sm font-bold uppercase tracking-wider text-[#2563EB] dark:text-cyan-400">{bundle.primary}</span>
                    <span className="text-xs text-slate-400 font-mono font-bold">100% Compatible</span>
                  </div>
                  <h4 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">
                    Target: {bundle.item}
                  </h4>

                  <div className="space-y-3">
                    {bundle.accessories.map((acc, i) => (
                      <div key={i} className="flex items-center justify-between text-sm p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-700/70 font-medium">
                        <span className="text-slate-800 dark:text-slate-200">{acc.name}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{acc.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="w-full mt-7 py-3 rounded-xl text-sm font-bold text-[#2563EB] dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition-colors">
                  Add Bundle to Wishlist
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ==========================================
          10. FINAL CALL TO ACTION BANNER
         ========================================== */}
      <section className="py-24 relative bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#0F172A] text-white overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 mx-auto flex items-center justify-center mb-6 shadow-xl">
            <Sparkles className="w-8 h-8 text-amber-300" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Ready for Smarter Showroom Shopping?
          </h2>

          <p className="mt-4 text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed font-medium">
            Transform your consumer electronics discovery process with OptiBuy's decision support platform.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-9 py-4 rounded-full text-lg font-bold text-[#2563EB] bg-white hover:bg-slate-100 shadow-2xl transition-all duration-200 flex items-center justify-center gap-2.5"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/about"
              className="w-full sm:w-auto px-9 py-4 rounded-full text-lg font-bold text-white bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md transition-all duration-200"
            >
              Explore Technology
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
