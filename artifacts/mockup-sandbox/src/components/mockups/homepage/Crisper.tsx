import React from 'react';
import { ArrowRight, TrendingUp } from 'lucide-react';

export function Crisper() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#EBEBEB', color: '#111111' }}>
      {/* Navbar */}
      <nav 
        className="sticky top-0 z-50 backdrop-blur-md flex items-center justify-between px-8 py-4"
        style={{ 
          backgroundColor: 'rgba(235,235,235,0.95)',
          borderBottom: '1px solid rgba(17,17,17,0.1)'
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded bg-[#111111] text-white font-bold text-lg">
            W
          </div>
          <span className="font-bold text-xl tracking-tight">WealthOS</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 font-medium text-sm text-[#4B5563]">
          <a href="#" className="hover:text-[#111111] transition-colors">Features</a>
          <a href="#" className="hover:text-[#111111] transition-colors">Solutions</a>
          <a href="#" className="hover:text-[#111111] transition-colors">Pricing</a>
          <a href="#" className="hover:text-[#111111] transition-colors">About</a>
        </div>
        
        <div className="flex items-center gap-6 text-sm font-medium">
          <a href="#" className="text-[#6B7280] hover:text-[#111111] transition-colors hidden sm:block">Sign In</a>
          <button 
            className="px-5 py-2.5 rounded-full transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#8FE62C', color: '#111111' }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-[1280px] mx-auto px-8 pt-24 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column (Copy) - 7 cols */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Minimal Badge */}
            <div className="flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-[rgba(17,17,17,0.1)]">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#8FE62C' }}></span>
              <span className="text-[13px] font-medium text-[#4B5563]">New: AI WealthBot is now live</span>
            </div>
            
            {/* Headline */}
            <h1 
              className="text-[80px] font-extrabold leading-[0.95] tracking-[-0.05em] mb-8"
              style={{ color: '#111111' }}
            >
              Manage your<br />
              family's wealth<br />
              <span style={{ color: '#8FE62C' }}>intelligently.</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-[19px] leading-relaxed text-[#4B5563] max-w-lg mb-10">
              The first financial planning platform built specifically for Indian families. Track portfolios, plan goals, and budget together.
            </p>
            
            {/* CTAs */}
            <div className="flex items-center gap-8">
              <button 
                className="flex items-center gap-2 px-8 py-4 rounded-full text-[17px] font-medium transition-transform hover:scale-105 active:scale-95 shadow-sm"
                style={{ backgroundColor: '#8FE62C', color: '#111111' }}
              >
                Start for free <ArrowRight className="w-5 h-5" />
              </button>
              <a 
                href="#" 
                className="flex items-center gap-1.5 text-[17px] font-medium text-[#6B7280] hover:text-[#111111] transition-colors"
              >
                Log in <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          {/* Right Column (Cards) - 5 cols */}
          <div className="lg:col-span-5">
            {/* Framing Container */}
            <div 
              className="p-5 rounded-[24px]"
              style={{ 
                border: '1px solid rgba(17,17,17,0.1)',
                backgroundColor: 'rgba(255,255,255,0.4)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="flex flex-col gap-4">
                
                {/* Dark Card */}
                <div 
                  className="rounded-[20px] p-6 shadow-lg"
                  style={{ backgroundColor: '#111111', color: '#FFFFFF' }}
                >
                  <p className="text-[12px] font-medium text-gray-400 mb-2 uppercase tracking-wider">
                    Total Family Net Worth
                  </p>
                  <h3 className="text-[42px] font-bold tracking-tight mb-6">
                    ₹52.4L
                  </h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">vs last month</span>
                    <div className="flex items-center gap-1.5 text-[#8FE62C] font-medium">
                      <TrendingUp className="w-4 h-4" />
                      <span>+ ₹1.2L (2.4%)</span>
                    </div>
                  </div>
                </div>

                {/* 2-col White Cards */}
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Monthly Surplus */}
                  <div 
                    className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 flex flex-col justify-between"
                  >
                    <div>
                      <p className="text-[12px] font-medium text-gray-500 mb-1">Monthly Surplus</p>
                      <p className="text-[24px] font-bold text-[#111111]">₹18,450</p>
                    </div>
                    
                    <div className="mt-6">
                      <div className="flex justify-between text-[11px] font-medium mb-2">
                        <span className="text-[#111111]">65% of target</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div 
                          className="h-1.5 rounded-full" 
                          style={{ width: '65%', backgroundColor: '#8FE62C' }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Retirement Goal */}
                  <div 
                    className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden"
                  >
                    <p className="text-[12px] font-medium text-gray-500 mb-4 self-start w-full text-left">Retirement Goal</p>
                    
                    <div className="relative w-20 h-20 flex items-center justify-center mb-2">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle 
                          cx="40" cy="40" r="36" 
                          stroke="#F3F4F6" strokeWidth="6" fill="none"
                        />
                        <circle 
                          cx="40" cy="40" r="36" 
                          stroke="#8FE62C" strokeWidth="6" fill="none"
                          strokeDasharray="226" strokeDashoffset="72.3"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[20px] font-bold text-[#111111]">68%</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}

export default Crisper;