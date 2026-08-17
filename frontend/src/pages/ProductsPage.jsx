import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Star, 
  Sparkles, 
  ShieldCheck, 
  ShoppingCart, 
  ArrowUpDown, 
  CheckCircle2, 
  X, 
  Eye, 
  Layers, 
  Smartphone, 
  Laptop, 
  Tv, 
  Headphones, 
  Watch, 
  Zap, 
  ChevronRight,
  TrendingUp,
  Cpu,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { getStoredUser } from '../services/authService';
import { formatCurrencyINR } from '../utils/currencyFormatter';

// Master Product Catalog with INR Pricing Representation
const electronicsProducts = [
  {
    id: 1,
    name: 'Apple iPhone 15 Pro Max',
    brand: 'Apple',
    category: 'Smartphones',
    price: 134900,
    originalPrice: 149900,
    rating: 4.9,
    reviewCount: 3420,
    decisionScore: 97,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
    badge: 'OptiBuy Top Pick',
    specs: {
      processor: 'A17 Pro Chip',
      display: '6.7" Super Retina XDR 120Hz',
      ram: '8GB Unified',
      storage: '256GB NVMe',
      battery: '4422 mAh (29 hrs video)'
    },
    pros: ['Titanium build quality', 'Best-in-class camera zoom', 'Superb battery life'],
    cons: ['Slightly slower charging speed than competitors']
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    category: 'Smartphones',
    price: 129999,
    originalPrice: 144999,
    rating: 4.8,
    reviewCount: 2890,
    decisionScore: 96,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
    badge: 'Galaxy AI Enabled',
    specs: {
      processor: 'Snapdragon 8 Gen 3',
      display: '6.8" Dynamic AMOLED 2X 120Hz',
      ram: '12GB LPDDR5X',
      storage: '512GB UFS 4.0',
      battery: '5000 mAh (45W Fast Charging)'
    },
    pros: ['Integrated S-Pen stylus', 'Anti-reflective display glass', '7 years OS updates'],
    cons: ['Bulky boxy design']
  },
  {
    id: 3,
    name: 'Asus ROG Zephyrus G16 (2024)',
    brand: 'Asus',
    category: 'Laptops',
    price: 189999,
    originalPrice: 209999,
    rating: 4.9,
    reviewCount: 1120,
    decisionScore: 98,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80',
    badge: 'Best OLED Gaming Laptop',
    specs: {
      processor: 'Intel Core Ultra 9 185H',
      display: '16" 2.5K 240Hz ROG Nebula OLED',
      ram: '32GB LPDDR5X',
      storage: '1TB PCIe 4.0 SSD',
      gpu: 'NVIDIA RTX 4080 12GB'
    },
    pros: ['CNC Aluminum unibody', 'Vibrant 240Hz OLED screen', '6-speaker audio system'],
    cons: ['Soldered RAM cannot be upgraded']
  },
  {
    id: 4,
    name: 'Apple MacBook Pro 16" M3 Max',
    brand: 'Apple',
    category: 'Laptops',
    price: 349900,
    originalPrice: 379900,
    rating: 5.0,
    reviewCount: 940,
    decisionScore: 99,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    badge: 'Ultimate Creator Workstation',
    specs: {
      processor: 'Apple M3 Max (16-Core CPU)',
      display: '16.2" Liquid Retina XDR 120Hz',
      ram: '36GB Unified Memory',
      storage: '1TB Superfast SSD',
      battery: 'Up to 22 Hours'
    },
    pros: ['Unmatched performance per watt', 'Liquid Retina XDR panel', 'Dead silent thermal profile'],
    cons: ['High entry price for base configuration']
  },
  {
    id: 5,
    name: 'Sony BRAVIA XR A95L 65" QD-OLED',
    brand: 'Sony',
    category: 'Smart TVs',
    price: 279990,
    originalPrice: 329990,
    rating: 4.9,
    reviewCount: 780,
    decisionScore: 97,
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=80',
    badge: 'Flagship QD-OLED TV',
    specs: {
      processor: 'Cognitive Processor XR',
      display: '65" 4K QD-OLED 120Hz',
      audio: 'Acoustic Surface Audio+ (60W)',
      os: 'Google TV'
    },
    pros: ['Unbeatable peak OLED brightness', 'Acoustic surface audio screen', 'Reference-grade color accuracy'],
    cons: ['Only 2 HDMI 2.1 full bandwidth ports']
  },
  {
    id: 6,
    name: 'LG C3 55" OLED 4K Smart TV',
    brand: 'LG',
    category: 'Smart TVs',
    price: 139990,
    originalPrice: 169990,
    rating: 4.8,
    reviewCount: 1850,
    decisionScore: 95,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80',
    badge: 'Best Value 4K OLED',
    specs: {
      processor: 'α9 AI Processor Gen6',
      display: '55" 4K OLED evo 120Hz',
      audio: '9.1.2 Virtual Surround Sound',
      os: 'webOS 23'
    },
    pros: ['4 full bandwidth HDMI 2.1 ports', 'Excellent gaming input lag', 'Slim gallery design'],
    cons: ['No HDR10+ support']
  },
  {
    id: 7,
    name: 'Sony WH-1000XM5 Wireless ANC',
    brand: 'Sony',
    category: 'Headphones',
    price: 29990,
    originalPrice: 34990,
    rating: 4.8,
    reviewCount: 4210,
    decisionScore: 96,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    badge: 'Top Noise Cancelling',
    specs: {
      processor: 'Integrated Processor V1',
      driver: '30mm Carbon Fiber Unit',
      battery: '30 Hours ANC On'
    },
    pros: ['Class-leading active noise cancellation', 'Extremely comfortable & lightweight', 'Superior voice call quality'],
    cons: ['Non-foldable headband design']
  },
  {
    id: 8,
    name: 'Bose QuietComfort Ultra Headphones',
    brand: 'Bose',
    category: 'Headphones',
    price: 35900,
    originalPrice: 39900,
    rating: 4.7,
    reviewCount: 1640,
    decisionScore: 94,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
    badge: 'Spatial Immersive Audio',
    specs: {
      modes: 'Quiet, Aware, Immersive Audio',
      battery: '24 Hours Playback'
    },
    pros: ['Ultra-plush ear cushions', 'Immersive spatial audio mode', 'Foldable portable case'],
    cons: ['Immersive audio reduces battery life to 18 hrs']
  },
  {
    id: 9,
    name: 'Dyson V15 Detect Extra Cordless Vacuum',
    brand: 'Dyson',
    category: 'Appliances',
    price: 64900,
    originalPrice: 74900,
    rating: 4.8,
    reviewCount: 980,
    decisionScore: 95,
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop&q=80',
    badge: 'Laser Dust Detection',
    specs: {
      motor: 'Dyson Hyperdymium 125,000 RPM',
      suction: '230 AW Suction Power',
      runTime: 'Up to 60 Minutes'
    },
    pros: ['Laser illuminates invisible microscopic dust', 'PIEZO sensor counts particles', 'De-tangling Digital Motorbar'],
    cons: ['Trigger switch must be held while cleaning']
  },
  {
    id: 10,
    name: 'Apple Watch Ultra 2 Cellular',
    brand: 'Apple',
    category: 'Smartwatches',
    price: 89900,
    originalPrice: 94900,
    rating: 4.9,
    reviewCount: 1420,
    decisionScore: 97,
    image: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=600&auto=format&fit=crop&q=80',
    badge: '3000 Nits Brightness',
    specs: {
      case: '49mm Titanium Case',
      display: '3000 Nits Always-On Retina',
      battery: 'Up to 72 Hours in Low Power'
    },
    pros: ['Rugged titanium case & sapphire glass', 'Precision dual-frequency GPS', 'EN13319 certified dive computer'],
    cons: ['Large footprint on smaller wrists']
  },
  {
    id: 11,
    name: 'Samsung Galaxy Watch6 Classic 47mm',
    brand: 'Samsung',
    category: 'Smartwatches',
    price: 39990,
    originalPrice: 44990,
    rating: 4.7,
    reviewCount: 2150,
    decisionScore: 93,
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
    badge: 'Rotating Bezel Control',
    specs: {
      display: '1.5" Sapphire Crystal Super AMOLED',
      sensor: 'BioActive Sensor (ECG, BIA, HR)',
      os: 'Wear OS Powered by Samsung'
    },
    pros: ['Iconic physical rotating bezel', 'Comprehensive sleep & body composition tracking', 'Bright vibrant screen'],
    cons: ['Battery requires daily charging']
  },
  {
    id: 12,
    name: 'Sony PlayStation 5 Slim Digital Edition',
    brand: 'Sony',
    category: 'Gaming',
    price: 44990,
    originalPrice: 49990,
    rating: 4.9,
    reviewCount: 8900,
    decisionScore: 98,
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80',
    badge: '4K 120Hz Next-Gen Gaming',
    specs: {
      processor: 'AMD Zen 2 8-Core 3.5GHz',
      gpu: 'AMD RDNA 2 (10.3 TFLOPS)',
      storage: '1TB Custom High-Speed SSD'
    },
    pros: ['Instant game load times', 'DualSense haptic feedback', '4K 120Hz gaming'],
    cons: ['Requires separate disc drive attachment for physical media']
  }
];

const categories = [
  { name: 'All Electronics', icon: Layers },
  { name: 'Smartphones', icon: Smartphone },
  { name: 'Laptops', icon: Laptop },
  { name: 'Smart TVs', icon: Tv },
  { name: 'Audio', icon: Headphones },
  { name: 'Smartwatches', icon: Watch },
  { name: 'Appliances', icon: Zap },
  { name: 'Gaming', icon: Cpu },
];

const ProductsPage = () => {
  const navigate = useNavigate();
  const currentUser = getStoredUser();

  const [selectedCategory, setSelectedCategory] = useState('All Electronics');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortBy, setSortBy] = useState('decisionScore');
  
  // Side-by-side comparison tray state
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Detail Modal State
  const [activeModalProduct, setActiveModalProduct] = useState(null);

  // Auth Required Guard Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [targetProductForAuth, setTargetProductForAuth] = useState(null);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return electronicsProducts
      .filter((p) => {
        const matchesCategory = selectedCategory === 'All Electronics' || p.category === selectedCategory || (selectedCategory === 'Audio' && p.category === 'Headphones') || (selectedCategory === 'Smartwatches' && p.category === 'Smartwatches');
        const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              p.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesBrand && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'decisionScore') return b.decisionScore - a.decisionScore;
        if (sortBy === 'priceLowHigh') return a.price - b.price;
        if (sortBy === 'priceHighLow') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0;
      });
  }, [selectedCategory, selectedBrand, searchQuery, sortBy]);

  // Auth Protection for Detailed Views
  const handleViewDetails = (product) => {
    if (!currentUser) {
      setTargetProductForAuth(product);
      setShowAuthModal(true);
    } else {
      setActiveModalProduct(product);
    }
  };

  // Auth Protection for Comparisons
  const handleCompareClick = (product) => {
    if (!currentUser) {
      setTargetProductForAuth(product);
      setShowAuthModal(true);
    } else {
      toggleCompare(product);
    }
  };

  const toggleCompare = (product) => {
    if (compareList.some((p) => p.id === product.id)) {
      setCompareList(compareList.filter((p) => p.id !== product.id));
    } else {
      if (compareList.length >= 3) {
        alert('You can compare a maximum of 3 products side-by-side.');
        return;
      }
      setCompareList([...compareList, product]);
    }
  };

  return (
    <div className="py-8 bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white min-h-screen transition-colors duration-300">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 box-border space-y-8">
        
        {/* Marketplace Banner / Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-[#2563EB]/40 rounded-3xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-slate-700">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#06B6D4]/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#2563EB]/30 text-cyan-300 border border-cyan-400/30">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>OptiBuy Public Electronics Catalogue</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Browse Electronics & Models
            </h1>
            <p className="text-slate-200 text-base sm:text-lg leading-relaxed font-medium">
              Explore flagships, laptops, 4K OLED TVs, and ANC audio with clear INR pricing. Sign in to unlock full decision intelligence and specs.
            </p>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-200 shadow-xs ${
                  isSelected
                    ? 'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/30 scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isSelected ? 'text-white' : 'text-[#2563EB] dark:text-cyan-400'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Filter Controls & Search Bar */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Live Search Input */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search iPhone, MacBook, OLED TV, Sony, Asus..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] font-medium transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            
            {/* Brand Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Brand:</span>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              >
                <option value="All">All Brands</option>
                <option value="Apple">Apple</option>
                <option value="Samsung">Samsung</option>
                <option value="Sony">Sony</option>
                <option value="Asus">Asus</option>
                <option value="LG">LG</option>
                <option value="Bose">Bose</option>
                <option value="Dyson">Dyson</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              >
                <option value="decisionScore">Rating & Match Score</option>
                <option value="priceLowHigh">Price (Low to High)</option>
                <option value="priceHighLow">Price (High to Low)</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>

          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-slate-700 dark:text-slate-300">
            Showing <span className="text-[#2563EB] dark:text-cyan-400 font-extrabold">{filteredProducts.length}</span> electronics models
          </span>
          {compareList.length > 0 && currentUser && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 shadow-md hover:shadow-lg transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Compare ({compareList.length}) Selected Models</span>
            </button>
          )}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const isComparing = compareList.some((p) => p.id === product.id);
            return (
              <motion.div
                key={product.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className="glass-card rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-2xl overflow-hidden flex flex-col justify-between group bg-white dark:bg-slate-800/90"
              >
                {/* Card Top Image & Badges */}
                <div className="relative h-64 overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-6">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Category & Badge */}
                  <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-md">
                      {product.brand}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2563EB] text-white shadow-xs">
                      {product.badge}
                    </span>
                  </div>

                  {/* Rating Pill */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-slate-900/90 text-white backdrop-blur-md border border-amber-400/40 shadow-lg">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-extrabold">{product.rating}</span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-slate-500 uppercase">{product.category}</span>
                      <span className="text-xs text-slate-400">• {product.reviewCount} reviews</span>
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#2563EB] dark:group-hover:text-cyan-400 transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  {/* Basic Specifications */}
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold">Processor/Feature:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{product.specs.processor || product.specs.display || product.specs.modes}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold">Key Spec:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{product.specs.display || product.specs.driver || product.specs.motor}</span>
                    </div>
                  </div>

                  {/* Pricing in INR */}
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {formatCurrencyINR(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs font-semibold text-slate-400 line-through">
                        {formatCurrencyINR(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <button
                      onClick={() => handleCompareClick(product)}
                      className={`py-3 px-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        isComparing
                          ? 'bg-cyan-500 text-white border-cyan-500 shadow-md'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>{isComparing ? 'Comparing' : 'Compare'}</span>
                    </button>

                    <button
                      onClick={() => handleViewDetails(product)}
                      className="py-3 px-3 rounded-2xl text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] shadow-md shadow-[#2563EB]/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* Floating Bottom Comparison Bar */}
      <AnimatePresence>
        {compareList.length > 0 && currentUser && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-slate-900 text-white p-4 rounded-3xl shadow-2xl border border-slate-700 max-w-2xl w-[90%] flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Comparing ({compareList.length}/3):
              </span>
              <div className="flex items-center gap-2">
                {compareList.map((p) => (
                  <span key={p.id} className="text-xs font-bold bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 flex items-center gap-1.5">
                    {p.name.split(' ')[0]} {p.name.split(' ')[1]}
                    <button onClick={() => toggleCompare(p)} className="text-slate-400 hover:text-rose-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowCompareModal(true)}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Compare Side-by-Side</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AUTHENTICATION REQUIRED GUARD MODAL */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-5 text-center"
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-cyan-400 flex items-center justify-center mx-auto border border-blue-200 dark:border-blue-800 shadow-md">
                <Lock className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Authentication Required</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  Create an OptiBuy account to view complete product details and use personalized decision-support features.
                </p>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row gap-3">
                <Link
                  to={`/register${targetProductForAuth ? `?redirect=/products` : ''}`}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] shadow-md shadow-blue-500/20 text-center"
                >
                  Create Account
                </Link>
                <Link
                  to={`/login${targetProductForAuth ? `?redirect=/products` : ''}`}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-center border border-slate-200 dark:border-slate-700"
                >
                  Login
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Detail Modal for Authenticated Users */}
      <AnimatePresence>
        {activeModalProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              <button
                onClick={() => setActiveModalProduct(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                <div className="sm:col-span-5 bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 flex items-center justify-center">
                  <img src={activeModalProduct.image} alt={activeModalProduct.name} className="max-h-56 object-cover rounded-xl" />
                </div>
                <div className="sm:col-span-7 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] dark:text-cyan-400">
                    {activeModalProduct.brand} • {activeModalProduct.category}
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {activeModalProduct.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{formatCurrencyINR(activeModalProduct.price)}</span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      OptiBuy Score: {activeModalProduct.decisionScore}/100
                    </span>
                  </div>

                  {/* Pros & Cons */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase">AI Review Sentiment Summary</h4>
                    <div className="space-y-1 text-xs">
                      {activeModalProduct.pros?.map((pro, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>{pro}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  onClick={() => {
                    alert(`Added ${activeModalProduct.name} to wishlist!`);
                    setActiveModalProduct(null);
                  }}
                  className="px-6 py-3 rounded-2xl text-sm font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] shadow-lg"
                >
                  Save to Wishlist
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Side-by-Side Comparison Modal */}
      <AnimatePresence>
        {showCompareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-5xl w-full shadow-2xl relative my-8"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Side-by-Side Spec Comparison
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Comparing specs, ratings, and OptiBuy Decision Scores.
                  </p>
                </div>
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {compareList.map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                    <img src={p.image} alt={p.name} className="w-full h-40 object-cover rounded-xl" />
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">{p.name}</h4>
                    <div className="text-xl font-extrabold text-[#2563EB] dark:text-cyan-400">{formatCurrencyINR(p.price)}</div>
                    <div className="text-xs font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 p-2 rounded-lg text-center">
                      Score: {p.decisionScore}/100
                    </div>
                    <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div><strong>Processor:</strong> {p.specs.processor || 'N/A'}</div>
                      <div><strong>Display:</strong> {p.specs.display || 'N/A'}</div>
                      <div><strong>RAM/Storage:</strong> {p.specs.ram || ''} {p.specs.storage || ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ProductsPage;
