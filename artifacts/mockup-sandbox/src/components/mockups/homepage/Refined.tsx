import React from "react";
import { ArrowUpRight, Sparkles, Menu } from "lucide-react";

export function Refined() {
  return (
    <div className="min-h-screen bg-[#EBEBEB] font-sans text-[#111111] selection:bg-[#8FE62C] selection:text-[#111111] pb-24">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#EBEBEB]/80 backdrop-blur-md border-b border-[#111111]/5">
        <div className="max-w-[1280px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <a href="#" className="flex items-center gap-3 group">
              <div className="w-[34px] h-[34px] bg-[#111111] rounded-lg flex items-center justify-center text-white font-bold text-lg transition-transform group-hover:scale-105">
                W
              </div>
              <span className="font-bold text-xl tracking-tight">WealthOS</span>
            </a>
            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="text-[#4B5563] hover:text-[#111111] font-medium text-sm transition-colors">Platform</a>
              <a href="#" className="text-[#4B5563] hover:text-[#111111] font-medium text-sm transition-colors">Solutions</a>
              <a href="#" className="text-[#4B5563] hover:text-[#111111] font-medium text-sm transition-colors">Pricing</a>
              <a href="#" className="text-[#4B5563] hover:text-[#111111] font-medium text-sm transition-colors">Resources</a>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <a href="#" className="text-[#111111] font-medium text-sm hover:opacity-70 transition-opacity">Sign In</a>
            <button className="bg-[#111111] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-colors shadow-sm">
              Get Started
            </button>
          </div>
          <button className="md:hidden text-[#111111]">
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-[1280px] mx-auto px-6 pt-28 md:pt-36">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center">
          
          {/* Left Column - Copy (7 columns) */}
          <div className="lg:col-span-7 pr-0 lg:pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-[#111111]/10 mb-10 shadow-sm backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#111111]" />
              <span className="text-[13px] font-medium text-[#111111]">New: AI WealthBot is now live</span>
            </div>

            <h1 className="text-[56px] md:text-[78px] font-[800] leading-[0.95] tracking-[-0.03em] mb-8 text-[#111111]">
              Manage your<br />
              family's wealth<br />
              <span className="relative inline-block">
                intelligently.
                <div className="absolute bottom-[4px] left-0 w-full h-[6px] bg-[#8FE62C] rounded-full -z-10 opacity-90"></div>
              </span>
            </h1>

            <p className="text-[19px] leading-relaxed text-[#4B5563] max-w-[540px] mb-12">
              The first financial planning platform built specifically for Indian families. Track portfolios, plan goals, and budget together.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button className="w-full sm:w-auto bg-[#8FE62C] text-[#111111] px-8 py-4 rounded-full text-[17px] font-semibold hover:bg-[#7bc825] transition-colors shadow-sm flex items-center justify-center gap-2 group">
                Start for free
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 rounded-full text-[17px] font-medium text-[#111111] border border-[#111111]/20 hover:border-[#111111]/40 hover:bg-[#111111]/5 transition-all flex items-center justify-center">
                Log in
              </button>
            </div>
            
            <div className="mt-12 flex items-center gap-4 text-sm text-[#4B5563] font-medium">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#EBEBEB] bg-[#111111]/10" />
                ))}
              </div>
              <p>Join 10,000+ families managing ₹500Cr+</p>
            </div>
          </div>

          {/* Right Column - Preview Cards (5 columns) */}
          <div className="lg:col-span-5 relative">
            {/* Decorative background blur */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#8FE62C]/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

            <div className="flex flex-col gap-3 relative z-10">
              
              {/* Dark Card - Net Worth */}
              <div className="bg-[#111111] rounded-[20px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.15)] relative overflow-hidden group border border-[#222]">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#8FE62C] to-transparent opacity-50"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#8FE62C]/10 blur-[40px] rounded-full group-hover:bg-[#8FE62C]/20 transition-colors duration-500"></div>
                
                <div className="relative z-10">
                  <p className="text-[#9CA3AF] text-[13px] font-medium mb-2 uppercase tracking-wider">Total Family Net Worth</p>
                  <div className="flex items-baseline gap-3 mb-6">
                    <h2 className="text-[42px] font-bold text-white tracking-[-0.02em] leading-none">₹52.4L</h2>
                  </div>
                  
                  <div className="flex items-center justify-between pt-5 border-t border-white/10">
                    <p className="text-[#9CA3AF] text-[13px]">vs last month</p>
                    <div className="flex items-center gap-1.5 text-[#8FE62C] bg-[#8FE62C]/10 px-2.5 py-1 rounded-full">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span className="text-[13px] font-semibold">+ ₹1.2L (2.4%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Cards */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* Monthly Surplus Card */}
                <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_24px_rgba(0,0,0,0.04)] border border-[#E5E7EB] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-8 h-8 rounded-full bg-[#EBEBEB] flex items-center justify-center">
                      <div className="w-3 h-3 bg-[#111111] rounded-sm" />
                    </div>
                    <span className="text-[#4B5563] text-xs font-medium">Surplus</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#111111] mb-1">₹18,450</h3>
                  <p className="text-[#4B5563] text-[13px] mb-4">65% of target</p>
                  
                  <div className="w-full h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div className="h-full bg-[#8FE62C] w-[65%] rounded-full relative">
                      <div className="absolute inset-0 bg-white/20 w-full rounded-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>
                </div>

                {/* Retirement Goal Card */}
                <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_24px_rgba(0,0,0,0.04)] border border-[#E5E7EB] flex flex-col justify-between hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[#4B5563] text-xs font-medium uppercase tracking-wider">Retirement</span>
                    <ArrowUpRight className="w-4 h-4 text-[#111111]/40" />
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center py-4">
                    <div className="relative w-24 h-24">
                      {/* Background circle */}
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#F3F4F6"
                          strokeWidth="8"
                        />
                        {/* Progress circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#111111"
                          strokeWidth="8"
                          strokeDasharray="283"
                          strokeDashoffset="90" /* 283 * (1 - 0.68) ≈ 90 */
                          strokeLinecap="round"
                          className="drop-shadow-sm"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-[#111111]">68%</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-[#4B5563] text-[12px] text-center font-medium">On track for 2045</p>
                </div>

              </div>
              
              {/* Floating Action Button simulation */}
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-white rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[#E5E7EB] flex items-center justify-center z-20 hover:scale-105 transition-transform cursor-pointer">
                <div className="w-12 h-12 bg-[#8FE62C] rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#111111]" />
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
