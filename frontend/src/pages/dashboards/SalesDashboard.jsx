import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Sparkles, 
  SlidersHorizontal, 
  ShieldCheck, 
  ShoppingBag, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  Clock, 
  AlertTriangle, 
  Layers, 
  Eye,
  X,
  Search,
  UserCheck,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getStoredUser } from '../../services/authService';

const SalesDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());
  const [activeTab, setActiveTab] = useState('sessions');
  const [selectedSession, setSelectedSession] = useState(null);

  // Recommendation generator tool state
  const [recCategory, setRecCategory] = useState('Smartphones');
  const [recBudget, setRecBudget] = useState('1200');

  const activeSessions = [
    {
      id: 'SESS-101',
      customerName: 'Marcus Vance',
      category: 'Gaming Laptops',
      budget: '₹1,20,000 - ₹1,80,000',
      preferredBrand: 'Asus / MSI',
      purpose: 'Esports & Video Editing',
      currentStatus: 'Comparing OLED Models',
      timeActive: '14 mins ago'
    },
    {
      id: 'SESS-102',
      customerName: 'Sophia Lin',
      category: 'Smart 4K TVs',
      budget: '₹1,00,000 - ₹1,50,000',
      preferredBrand: 'Sony / LG',
      purpose: 'Home Cinema & PS5 Gaming',
      currentStatus: 'Reviewing Sentiment Summary',
      timeActive: '8 mins ago'
    },
    {
      id: 'SESS-103',
      customerName: 'David Miller',
      category: 'Flagship Smartphones',
      budget: '₹70,000 - ₹1,30,000',
      preferredBrand: 'Apple / Samsung',
      purpose: 'Photography & Long Battery',
      currentStatus: 'Evaluating Camera Specs',
      timeActive: '2 mins ago'
    }
  ];

  const inventoryStock = [
    { model: 'Apple iPhone 15 Pro Max 256GB', stock: 12, status: 'In Stock' },
    { model: 'Samsung Galaxy S24 Ultra 512GB', stock: 8, status: 'In Stock' },
    { model: 'Asus ROG Zephyrus G16 (2024)', stock: 3, status: 'Low Stock' },
    { model: 'Sony BRAVIA XR A95L 65"', stock: 2, status: 'Low Stock' },
    { model: 'Dyson V15 Cordless Vacuum', stock: 0, status: 'Out of Stock' }
  ];

  return (
    <div className="py-8 bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Sales Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-[#2563EB]/40 rounded-3xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-slate-700">
          <div className="max-w-3xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/30 text-cyan-300 border border-cyan-400/40">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>Showroom Sales Intelligence</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
              Sales Intelligence Dashboard
            </h1>
            <p className="text-slate-200 text-base sm:text-lg font-medium">
              Assist showroom customers with real-time preference analysis, side-by-side model comparison matrices, and inventory awareness.
            </p>
          </div>
        </div>

        {/* Section A: KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="glass-card rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase">Assisted Today</span>
            <div className="text-3xl font-extrabold text-[#2563EB] dark:text-cyan-400">18</div>
            <span className="text-[11px] text-emerald-500 font-bold">+4 from yesterday</span>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase">Recommendations</span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">42</div>
            <span className="text-[11px] text-slate-400 font-medium">Generated in showroom</span>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase">Products Compared</span>
            <div className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">29</div>
            <span className="text-[11px] text-slate-400 font-medium">Side-by-side matrices</span>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase">Conversions</span>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">12</div>
            <span className="text-[11px] text-emerald-500 font-bold">66% conversion rate</span>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase">Pending Requests</span>
            <div className="text-3xl font-extrabold text-amber-500">3</div>
            <span className="text-[11px] text-amber-500 font-bold">Showroom kiosk alerts</span>
          </div>
        </div>

        {/* Section B: Active Customer Sessions Table */}
        <div className="glass-card rounded-3xl p-8 border border-slate-200/90 dark:border-slate-800 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] dark:text-cyan-400">
                Showroom Floor Sessions
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Active Customer Assistance Sessions
              </h2>
            </div>
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
              3 Live Showroom Kiosks Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="p-4 rounded-l-xl">Session ID</th>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Budget Range</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                {activeSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-mono font-bold text-[#2563EB] dark:text-cyan-400">{session.id}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{session.customerName}</td>
                    <td className="p-4">{session.category}</td>
                    <td className="p-4 font-semibold text-emerald-600 dark:text-emerald-400">{session.budget}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2563EB]/10 text-[#2563EB] dark:text-cyan-400 border border-[#2563EB]/30">
                        {session.currentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedSession(session)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                      >
                        View Preferences
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section D: Smart Recommendation Assistant Tool */}
        <div className="glass-card rounded-3xl p-8 border border-slate-200/90 dark:border-slate-800 shadow-lg space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Sales Decision Support Tool
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Generate Smart Recommendation for Customer
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Target Category</label>
              <select
                value={recCategory}
                onChange={(e) => setRecCategory(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-sm"
              >
                <option value="Smartphones">Smartphones</option>
                <option value="Laptops">Gaming Laptops</option>
                <option value="Smart TVs">4K Smart TVs</option>
                <option value="Audio">Noise-Canceling Audio</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Customer Budget ($)</label>
              <input
                type="number"
                value={recBudget}
                onChange={(e) => setRecBudget(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-sm"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => alert(`Generated top OptiBuy recommendation for ${recCategory} under $${recBudget}!`)}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#2563EB] to-cyan-600 shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Top Recommendation</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section H: Inventory Awareness (Read-Only) */}
        <div className="glass-card rounded-3xl p-8 border border-slate-200/90 dark:border-slate-800 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] dark:text-cyan-400">
                Showroom Inventory Awareness (Read-Only)
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Live Stock Status Monitor
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {inventoryStock.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 text-sm">
                <span className="font-bold text-slate-900 dark:text-white">{item.model}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-slate-500">Units Available: <strong>{item.stock}</strong></span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.status === 'In Stock' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                    item.status === 'Low Stock' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                    'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Customer Preferences Drawer */}
      <AnimatePresence>
        {selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => setSelectedSession(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <span className="text-xs font-mono font-bold text-[#2563EB] dark:text-cyan-400">
                Session {selectedSession.id}
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {selectedSession.customerName}'s Profile
              </h3>

              <div className="space-y-3 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl">
                <div><strong>Category:</strong> {selectedSession.category}</div>
                <div><strong>Budget:</strong> {selectedSession.budget}</div>
                <div><strong>Preferred Brands:</strong> {selectedSession.preferredBrand}</div>
                <div><strong>Primary Purpose:</strong> {selectedSession.purpose}</div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedSession(null)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8]"
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SalesDashboard;
