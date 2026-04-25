import React from 'react';
import { 
  BarChart3, 
  Wallet, 
  Target, 
  Bot, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  TrendingUp,
  PieChart
} from 'lucide-react';

export function DarkHero() {
  return (
    <div className="min-w-[1280px] font-['Inter'] bg-[#EBEBEB] text-[#111111]">
      
      {/* 1. Navbar */}
      <nav className="bg-[#111111] text-white px-8 py-5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-[#8FE62C] p-1.5 rounded-lg">
            <PieChart size={20} className="text-[#111111]" />
          </div>
          <span className="text-xl font-bold tracking-tight">WealthOS</span>
        </div>
        <div className="flex gap-8 text-sm font-medium text-gray-300">
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">How it Works</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
          <a href="#" className="hover:text-white transition-colors">About</a>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-white hover:text-gray-300 transition-colors">
            Sign In
          </button>
          <button 
            className="text-[#111111] px-5 py-2.5 rounded-full text-sm font-bold transition-transform hover:scale-105"
            style={{ backgroundColor: '#8FE62C' }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* 2. Hero */}
      <section className="bg-[#111111] text-white pt-24 pb-32 px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-[72px] leading-[1.1] font-extrabold tracking-tight max-w-4xl mb-6">
            Your family's <br />
            <span style={{ color: '#8FE62C' }}>financial OS.</span>
          </h1>
          <p className="text-[18px] text-gray-400 max-w-2xl mb-10 leading-relaxed">
            Track portfolios, manage monthly budgets, and plan goals for every family member in one unified platform. Powered by AI.
          </p>
          <div className="flex gap-4 mb-20">
            <button 
              className="text-[#111111] px-8 py-4 rounded-full text-lg font-bold flex items-center gap-2 transition-transform hover:scale-105"
              style={{ backgroundColor: '#8FE62C' }}
            >
              Start for free <ArrowRight size={20} />
            </button>
            <button className="px-8 py-4 rounded-full text-lg font-bold border border-gray-700 hover:bg-gray-800 transition-colors">
              Book a Demo
            </button>
          </div>

          {/* Dashboard Mockup */}
          <div className="w-full max-w-5xl bg-[#1A1A1A] border border-gray-800 rounded-[20px] p-6 shadow-2xl relative z-10">
            <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center font-bold text-xl">
                  S
                </div>
                <div>
                  <h3 className="font-bold text-lg">Sharma Family</h3>
                  <p className="text-sm text-gray-400">Total Net Worth</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">₹52,40,000</div>
                <div style={{ color: '#8FE62C' }} className="text-sm font-medium flex items-center justify-end gap-1">
                  <TrendingUp size={14} /> +12.4% this year
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Left Col */}
              <div className="col-span-2 space-y-6">
                <div className="bg-[#222222] rounded-2xl p-5">
                  <h4 className="text-gray-400 text-sm font-medium mb-4">Portfolio Growth</h4>
                  <div className="h-48 flex items-end gap-2">
                    {[30, 45, 40, 60, 55, 75, 85, 80, 95, 110, 105, 125].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, backgroundColor: i === 11 ? '#8FE62C' : '#333' }}></div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-3">
                    <span>Jan</span>
                    <span>Dec</span>
                  </div>
                </div>
              </div>

              {/* Right Col */}
              <div className="space-y-6">
                <div className="bg-[#222222] rounded-2xl p-5">
                  <h4 className="text-gray-400 text-sm font-medium mb-4">Family Members</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-[#1A1A1A] rounded-xl border border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-xs font-bold text-blue-200">A</div>
                        <span className="text-sm font-medium">Amit</span>
                      </div>
                      <span className="text-sm">₹28L</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-[#1A1A1A] rounded-xl border border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-pink-900 flex items-center justify-center text-xs font-bold text-pink-200">P</div>
                        <span className="text-sm font-medium">Priya</span>
                      </div>
                      <span className="text-sm">₹20L</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-[#1A1A1A] rounded-xl border border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-900 flex items-center justify-center text-xs font-bold text-purple-200">R</div>
                        <span className="text-sm font-medium">Riya</span>
                      </div>
                      <span className="text-sm">₹4.4L</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Feature strip */}
      <section className="py-24 px-8 max-w-7xl mx-auto -mt-16 relative z-20">
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[20px] shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#E8FAD0' }}>
              <BarChart3 size={28} style={{ color: '#5A9615' }} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#111111]">Portfolio View</h3>
            <p className="text-gray-600 leading-relaxed">Consolidate mutual funds, stocks, FD, and EPF in one beautiful dashboard.</p>
          </div>
          
          <div className="bg-white p-8 rounded-[20px] shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#E8FAD0' }}>
              <Wallet size={28} style={{ color: '#5A9615' }} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#111111]">Monthly Tracker</h3>
            <p className="text-gray-600 leading-relaxed">Track income, expenses, and SIPs person-wise across the family.</p>
          </div>

          <div className="bg-white p-8 rounded-[20px] shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#E8FAD0' }}>
              <Target size={28} style={{ color: '#5A9615' }} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#111111]">Goal Planning</h3>
            <p className="text-gray-600 leading-relaxed">Map investments to retirement, education, and home buying goals.</p>
          </div>

          <div className="bg-white p-8 rounded-[20px] shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#E8FAD0' }}>
              <Bot size={28} style={{ color: '#5A9615' }} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#111111]">AI WealthBot</h3>
            <p className="text-gray-600 leading-relaxed">Ask Claude-powered AI about your spending habits and portfolio health.</p>
          </div>
        </div>
      </section>

      {/* 4. How it works */}
      <section className="bg-[#111111] text-white py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How WealthOS works</h2>
            <p className="text-gray-400 text-lg">Three simple steps to financial clarity for your family.</p>
          </div>
          
          <div className="grid grid-cols-3 gap-12">
            <div className="relative">
              <div className="text-[120px] font-black opacity-10 absolute -top-16 -left-4 pointer-events-none" style={{ color: '#8FE62C' }}>1</div>
              <h3 className="text-2xl font-bold mb-4 relative z-10 text-white">Add family members</h3>
              <p className="text-gray-400 leading-relaxed relative z-10">Create profiles for your spouse, children, and parents to track wealth collectively or individually.</p>
            </div>
            <div className="relative">
              <div className="text-[120px] font-black opacity-10 absolute -top-16 -left-4 pointer-events-none" style={{ color: '#8FE62C' }}>2</div>
              <h3 className="text-2xl font-bold mb-4 relative z-10 text-white">Connect assets & budget</h3>
              <p className="text-gray-400 leading-relaxed relative z-10">Input your current portfolio values and set up monthly budget tracking for expenses and SIPs.</p>
            </div>
            <div className="relative">
              <div className="text-[120px] font-black opacity-10 absolute -top-16 -left-4 pointer-events-none" style={{ color: '#8FE62C' }}>3</div>
              <h3 className="text-2xl font-bold mb-4 relative z-10 text-white">Watch wealth grow</h3>
              <p className="text-gray-400 leading-relaxed relative z-10">Monitor progress towards goals and let our AI WealthBot provide personalized actionable insights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Stats bar */}
      <section className="bg-white py-20 px-8 border-b border-gray-200">
        <div className="max-w-5xl mx-auto flex justify-between items-center text-center">
          <div>
            <div className="text-5xl font-extrabold text-[#111111] mb-2">₹500Cr+</div>
            <div className="text-gray-500 font-medium text-lg">Wealth Tracked</div>
          </div>
          <div className="w-px h-16 bg-gray-200"></div>
          <div>
            <div className="text-5xl font-extrabold text-[#111111] mb-2">12,000+</div>
            <div className="text-gray-500 font-medium text-lg">Indian Families</div>
          </div>
          <div className="w-px h-16 bg-gray-200"></div>
          <div>
            <div className="text-5xl font-extrabold text-[#111111] mb-2">4.9★</div>
            <div className="text-gray-500 font-medium text-lg">User Rating</div>
          </div>
        </div>
      </section>

      {/* 6. Pricing */}
      <section className="py-24 px-8 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#111111] mb-4">Simple, transparent pricing</h2>
          <p className="text-gray-600 text-lg">Choose the plan that fits your family's needs.</p>
        </div>

        <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Card */}
          <div className="bg-white rounded-[20px] p-10 shadow-sm border border-gray-200 flex flex-col">
            <h3 className="text-2xl font-bold mb-2">Basic</h3>
            <div className="text-5xl font-extrabold mb-6">₹0<span className="text-lg font-medium text-gray-500">/mo</span></div>
            <p className="text-gray-600 mb-8 border-b border-gray-100 pb-8">Perfect for individuals starting their wealth journey.</p>
            
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-gray-700">
                <CheckCircle2 size={20} className="text-gray-400" /> Up to 2 family members
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <CheckCircle2 size={20} className="text-gray-400" /> Basic portfolio tracking
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <CheckCircle2 size={20} className="text-gray-400" /> 1 Financial Goal
              </li>
            </ul>
            
            <button className="w-full py-4 rounded-xl font-bold bg-gray-100 text-[#111111] hover:bg-gray-200 transition-colors">
              Get Started
            </button>
          </div>

          {/* Pro Card */}
          <div className="bg-white rounded-[20px] p-10 shadow-xl border-2 flex flex-col relative" style={{ borderColor: '#8FE62C' }}>
            <div className="absolute top-0 right-8 transform -translate-y-1/2 px-4 py-1 rounded-full text-sm font-bold text-[#111111]" style={{ backgroundColor: '#8FE62C' }}>
              MOST POPULAR
            </div>
            <h3 className="text-2xl font-bold mb-2">Family Pro</h3>
            <div className="text-5xl font-extrabold mb-6">₹499<span className="text-lg font-medium text-gray-500">/mo</span></div>
            <p className="text-gray-600 mb-8 border-b border-gray-100 pb-8">Everything a family needs to build generational wealth.</p>
            
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-gray-800 font-medium">
                <CheckCircle2 size={20} style={{ color: '#5A9615' }} /> Unlimited family members
              </li>
              <li className="flex items-center gap-3 text-gray-800 font-medium">
                <CheckCircle2 size={20} style={{ color: '#5A9615' }} /> Advanced portfolio analytics
              </li>
              <li className="flex items-center gap-3 text-gray-800 font-medium">
                <CheckCircle2 size={20} style={{ color: '#5A9615' }} /> Unlimited Goals Planning
              </li>
              <li className="flex items-center gap-3 text-gray-800 font-medium">
                <CheckCircle2 size={20} style={{ color: '#5A9615' }} /> AI WealthBot Access
              </li>
            </ul>
            
            <button className="w-full py-4 rounded-xl font-bold text-[#111111] transition-transform hover:scale-105" style={{ backgroundColor: '#8FE62C' }}>
              Upgrade to Pro
            </button>
          </div>
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="bg-[#111111] text-white py-32 px-8 text-center border-b border-gray-800">
        <div className="max-w-3xl mx-auto">
          <ShieldCheck size={64} style={{ color: '#8FE62C' }} className="mx-auto mb-8" />
          <h2 className="text-5xl font-extrabold mb-6 tracking-tight">Start your family's financial journey</h2>
          <p className="text-xl text-gray-400 mb-10">Join thousands of Indian families taking control of their collective wealth.</p>
          <button className="px-10 py-5 rounded-full text-xl font-bold text-[#111111] transition-transform hover:scale-105 inline-flex items-center gap-3" style={{ backgroundColor: '#8FE62C' }}>
            Create Free Account <ArrowRight size={24} />
          </button>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-[#111111] text-gray-400 py-12 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-white">
            <div className="bg-[#8FE62C] p-1.5 rounded-lg">
              <PieChart size={20} className="text-[#111111]" />
            </div>
            <span className="text-xl font-bold tracking-tight">WealthOS</span>
          </div>
          
          <div className="flex gap-8 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>

          <div className="text-sm flex items-center gap-2">
            <span>Made for Indian families</span>
            <span role="img" aria-label="India flag">🇮🇳</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default DarkHero;
