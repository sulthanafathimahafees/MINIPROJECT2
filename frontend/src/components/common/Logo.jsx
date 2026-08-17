import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ showTagline = true, size = 'normal', className = '' }) => {
  const isLarge = size === 'large';
  
  return (
    <Link to="/" className={`inline-flex items-center gap-3 group focus:outline-none ${className}`}>
      {/* Icon Graphic */}
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#10B981] p-0.5 shadow-md shadow-[#2563EB]/20 transition-transform duration-300 group-hover:scale-105 ${isLarge ? 'w-12 h-12' : 'w-10 h-10'}`}>
        <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center relative overflow-hidden">
          {/* Subtle circuit line overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-20 text-[#2563EB]" viewBox="0 0 40 40" fill="none">
            <path d="M0 20H40M20 0V40" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
          </svg>
          
          {/* Main Logo SVG: Cart + O + Circuit + AI Spark */}
          <svg viewBox="0 0 32 32" className={`${isLarge ? 'w-7 h-7' : 'w-6 h-6'} text-[#2563EB] relative z-10`} fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M7 9H11L14 20H23L26 12H13" 
              stroke="#2563EB" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            <circle cx="15.5" cy="24.5" r="1.8" fill="#2563EB" />
            <circle cx="21.5" cy="24.5" r="1.8" fill="#2563EB" />
            <path 
              d="M23 4L24.2 6.8L27 8L24.2 9.2L23 12L21.8 9.2L19 8L21.8 6.8L23 4Z" 
              fill="#F59E0B" 
            />
            <circle cx="23" cy="8" r="0.8" fill="#10B981" />
          </svg>
        </div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className={`font-extrabold tracking-tight text-[#1E293B] ${isLarge ? 'text-2xl' : 'text-xl'}`}>
            Opti<span className="text-[#2563EB]">Buy</span>
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#2563EB]/10 text-[#2563EB] uppercase tracking-wider border border-[#2563EB]/20">
            AI
          </span>
        </div>
        {showTagline && (
          <span className={`text-[#64748B] font-medium tracking-normal ${isLarge ? 'text-xs' : 'text-[11px]'}`}>
            Smart Choices. Smarter Shopping.
          </span>
        )}
      </div>
    </Link>
  );
};

export default Logo;
