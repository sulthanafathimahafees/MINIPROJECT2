import React from 'react';
import { 
  Laptop, 
  Smartphone, 
  Tv, 
  Watch, 
  Tablet, 
  Headphones, 
  Camera, 
  Refrigerator, 
  Wind 
} from 'lucide-react';

const HeroBackground = () => {
  const electronicsIcons = [
    { Icon: Laptop, label: "Laptop", top: "15%", left: "8%", delay: "0s" },
    { Icon: Smartphone, label: "Smartphone", top: "25%", right: "10%", delay: "1.5s" },
    { Icon: Tv, label: "Smart TV", top: "65%", left: "6%", delay: "3s" },
    { Icon: Watch, label: "Smartwatch", top: "72%", right: "12%", delay: "2s" },
    { Icon: Headphones, label: "Headphones", top: "45%", left: "12%", delay: "4s" },
    { Icon: Camera, label: "4K Camera", top: "35%", right: "20%", delay: "0.8s" },
    { Icon: Tablet, label: "Tablet", top: "80%", left: "22%", delay: "2.5s" },
    { Icon: Refrigerator, label: "Smart Fridge", top: "18%", right: "28%", delay: "3.5s" },
    { Icon: Wind, label: "Washing Machine", top: "78%", right: "25%", delay: "1.2s" },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Subtle Background Gradients */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-[#2563EB]/15 via-sky-200/30 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-1/4 -right-40 w-[650px] h-[650px] bg-gradient-to-bl from-[#10B981]/12 via-emerald-100/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-gradient-to-t from-amber-100/30 via-blue-100/20 to-transparent rounded-full blur-3xl" />

      {/* Abstract Circuit Grid Overlay */}
      <div className="absolute inset-0 circuit-grid opacity-60" />

      {/* SVG AI Network Lines & Nodes */}
      <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Network Connections */}
        <path d="M 100 150 Q 300 80 500 200 T 900 120" stroke="url(#grad1)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
        <path d="M 150 450 Q 400 350 700 500 T 1100 380" stroke="url(#grad1)" strokeWidth="1.5" fill="none" strokeDasharray="6 6" />
        <path d="M 50 700 Q 350 600 650 750 T 1050 680" stroke="url(#grad1)" strokeWidth="1" fill="none" />

        {/* Glowing AI Network Nodes */}
        <circle cx="300" cy="80" r="4" fill="#2563EB" className="animate-ping" style={{ animationDuration: '3s' }} />
        <circle cx="500" cy="200" r="5" fill="#10B981" />
        <circle cx="700" cy="500" r="4" fill="#F59E0B" className="animate-ping" style={{ animationDuration: '4s' }} />
        <circle cx="400" cy="350" r="3" fill="#2563EB" />
      </svg>

      {/* Floating Electronics Badges */}
      <div className="hidden lg:block relative w-full h-full max-w-7xl mx-auto">
        {electronicsIcons.map((item, idx) => {
          const IconComponent = item.Icon;
          return (
            <div
              key={idx}
              className="absolute animate-float transition-all duration-700 hover:scale-110"
              style={{
                top: item.top,
                left: item.left,
                right: item.right,
                animationDelay: item.delay,
              }}
            >
              <div className="glass-card px-3 py-2 rounded-2xl shadow-sm border border-white/80 flex items-center gap-2 group cursor-pointer backdrop-blur-md">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-50 to-emerald-50 text-[#2563EB] flex items-center justify-center group-hover:bg-[#2563EB] group-hover:text-white transition-colors duration-300">
                  <IconComponent className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-[#2563EB] transition-colors">
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HeroBackground;
