import React from "react";
import { 
  ArrowRight, 
  BarChart3, 
  CheckCircle2, 
  ChevronRight, 
  LineChart, 
  PieChart, 
  ShieldCheck, 
  Smartphone, 
  Star, 
  Target, 
  Wallet 
} from "lucide-react";

export function LightGrid() {
  return (
    <div 
      className="min-w-[1280px] font-['Inter'] text-[#111111]"
      style={{ backgroundColor: "#EBEBEB" }}
    >
      {/* 1. Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-12 py-6 backdrop-blur-md" style={{ backgroundColor: "rgba(235, 235, 235, 0.8)" }}>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "#111111" }}>
            <Wallet className="h-5 w-5" style={{ color: "#8FE62C" }} />
          </div>
          <span className="text-xl font-bold tracking-tight">WealthOS</span>
        </div>
        <div className="flex items-center gap-8 text-sm font-medium">
          <a href="#" className="relative font-semibold">
            Features
            <span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full" style={{ backgroundColor: "#8FE62C" }} />
          </a>
          <a href="#" className="text-gray-500 hover:text-[#111111]">How it Works</a>
          <a href="#" className="text-gray-500 hover:text-[#111111]">Pricing</a>
          <a href="#" className="text-gray-500 hover:text-[#111111]">About Us</a>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
          <a href="#" className="text-[#111111]">Sign In</a>
          <button 
            className="rounded-full px-6 py-3 text-white transition-transform hover:scale-105"
            style={{ backgroundColor: "#111111" }}
          >
            Get Started
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-12 pb-24 pt-12">
        {/* 2. Hero */}
        <section className="mb-32 grid grid-cols-12 gap-12 items-center">
          <div className="col-span-7">
            <div className="mb-6 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium" style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(17,17,17,0.1)" }}>
              <span className="mr-2 flex h-2 w-2 rounded-full" style={{ backgroundColor: "#8FE62C" }}></span>
              New: AI WealthBot is now live
            </div>
            <h1 className="mb-8 text-[80px] font-bold leading-[0.95] tracking-tight">
              Manage your <br />
              family's wealth <br />
              <span className="relative inline-block px-4 py-1" style={{ backgroundColor: "#8FE62C" }}>
                intelligently.
              </span>
            </h1>
            <p className="mb-10 max-w-lg text-xl text-gray-600 leading-relaxed">
              The first financial planning platform built specifically for Indian families. Track portfolios, plan goals, and budget together.
            </p>
            <div className="flex items-center gap-4">
              <button 
                className="flex items-center gap-2 rounded-full px-8 py-4 text-lg font-medium text-white transition-transform hover:scale-105"
                style={{ backgroundColor: "#111111" }}
              >
                Start for free <ArrowRight className="h-5 w-5" />
              </button>
              <button 
                className="flex items-center gap-2 rounded-full px-8 py-4 text-lg font-medium transition-colors hover:bg-gray-200"
                style={{ backgroundColor: "transparent" }}
              >
                View demo
              </button>
            </div>
          </div>
          
          <div className="col-span-5 grid grid-cols-2 gap-4">
            {/* Dark Card */}
            <div className="col-span-2 rounded-[20px] p-6 text-white" style={{ backgroundColor: "#111111" }}>
              <p className="mb-2 text-sm text-gray-400">Total Family Net Worth</p>
              <h3 className="mb-6 text-5xl font-bold tracking-tight">₹52.4L</h3>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">vs last month</p>
                  <p className="text-sm font-medium" style={{ color: "#8FE62C" }}>+ ₹1.2L (2.4%)</p>
                </div>
                <LineChart className="h-10 w-10" style={{ color: "#8FE62C", opacity: 0.8 }} />
              </div>
            </div>
            
            {/* White Card 1 */}
            <div className="rounded-[20px] p-6" style={{ backgroundColor: "#FFFFFF" }}>
              <p className="mb-2 text-sm text-gray-500">Monthly Surplus</p>
              <h3 className="mb-4 text-2xl font-bold">₹18,450</h3>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full" style={{ width: "65%", backgroundColor: "#8FE62C" }} />
              </div>
              <p className="mt-2 text-xs text-gray-400">65% of target</p>
            </div>
            
            {/* White Card 2 */}
            <div className="rounded-[20px] p-6" style={{ backgroundColor: "#FFFFFF" }}>
              <p className="mb-2 text-sm text-gray-500">Retirement Goal</p>
              <h3 className="mb-4 text-2xl font-bold">68%</h3>
              <div className="relative flex h-12 w-12 items-center justify-center">
                <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    style={{ color: "#8FE62C" }}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray="68, 100"
                  />
                </svg>
                <Target className="h-5 w-5 text-[#111111]" />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Social proof bar */}
        <section className="mb-32 border-y border-gray-300 py-12">
          <p className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-gray-500">
            Trusted by modern Indian families
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {["Zerodha Sync", "HDFC Linked", "Groww Import", "SBI Secure"].map((brand, i) => (
              <div key={i} className="flex items-center gap-2 rounded-full px-6 py-2" style={{ backgroundColor: "#FFFFFF" }}>
                <ShieldCheck className="h-4 w-4" style={{ color: "#8FE62C" }} />
                <span className="font-medium text-gray-600">{brand}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Bento features grid */}
        <section className="mb-32">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight">Everything you need to grow.</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">Powerful tools designed for the complexities of family finance.</p>
          </div>
          
          <div className="grid grid-cols-12 gap-6">
            {/* Large Dark Card */}
            <div className="col-span-8 flex flex-col justify-between overflow-hidden rounded-[20px] p-10 text-white" style={{ backgroundColor: "#111111" }}>
              <div className="mb-12 max-w-md">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: "rgba(143, 230, 44, 0.1)" }}>
                  <PieChart className="h-6 w-6" style={{ color: "#8FE62C" }} />
                </div>
                <h3 className="mb-4 text-3xl font-bold">Consolidated Portfolio View</h3>
                <p className="text-gray-400">See your entire family's assets in one place. Stocks, mutual funds, FDs, real estate, and EPF automatically synced and categorized.</p>
              </div>
              <div className="flex gap-4">
                {['Dad\'s PF', 'Mom\'s Stocks', 'Joint FD'].map((tag, i) => (
                  <span key={i} className="rounded-full px-4 py-2 text-sm font-medium" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Small White Card 1 */}
            <div className="col-span-4 flex flex-col justify-between rounded-[20px] p-8" style={{ backgroundColor: "#FFFFFF" }}>
              <div>
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: "#EBEBEB" }}>
                  <BarChart3 className="h-6 w-6 text-[#111111]" />
                </div>
                <h3 className="mb-4 text-xl font-bold">Monthly Budgeting</h3>
                <p className="text-sm text-gray-600">Track income and expenses across multiple accounts. Set rules to categorize automatically.</p>
              </div>
            </div>

            {/* Small White Card 2 */}
            <div className="col-span-4 flex flex-col justify-between rounded-[20px] p-8" style={{ backgroundColor: "#FFFFFF" }}>
              <div>
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: "#EBEBEB" }}>
                  <Target className="h-6 w-6 text-[#111111]" />
                </div>
                <h3 className="mb-4 text-xl font-bold">Goal Planning</h3>
                <p className="text-sm text-gray-600">Plan for children's education, home down payment, or early retirement with tax-aware calculators.</p>
              </div>
            </div>

            {/* Small Dark Card with Lime accent */}
            <div className="col-span-8 flex items-center justify-between overflow-hidden rounded-[20px] p-8" style={{ backgroundColor: "#111111" }}>
              <div className="max-w-sm text-white">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "#8FE62C" }}>
                  <Smartphone className="h-5 w-5 text-[#111111]" />
                </div>
                <h3 className="mb-2 text-2xl font-bold">AI WealthBot</h3>
                <p className="text-gray-400">Ask questions about your finances in plain English or Hindi. Powered by Claude 3.5.</p>
              </div>
              <div className="relative h-32 w-64 rounded-xl border border-gray-800 bg-[#1A1A1A] p-4 shadow-2xl">
                <div className="mb-3 w-3/4 rounded-lg p-2 text-xs text-white" style={{ backgroundColor: "#333" }}>
                  How much is our surplus this month?
                </div>
                <div className="ml-auto w-5/6 rounded-lg p-2 text-xs text-[#111111]" style={{ backgroundColor: "#8FE62C" }}>
                  You have a surplus of ₹18,450. I recommend investing ₹10k in Nifty50.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Product walkthrough (Fake UI Dashboard) */}
        <section className="mb-32">
          <div className="overflow-hidden rounded-[20px] shadow-sm border border-gray-200" style={{ backgroundColor: "#FFFFFF" }}>
            <div className="border-b border-gray-100 p-4">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
            </div>
            <div className="flex h-[500px]">
              {/* Sidebar */}
              <div className="w-64 border-r border-gray-100 p-6 flex flex-col gap-2" style={{ backgroundColor: "#FAFAFA" }}>
                <div className="mb-6 flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-[#111111]" />
                  <div className="h-4 w-24 rounded bg-gray-200" />
                </div>
                {['Dashboard', 'Portfolio', 'Transactions', 'Goals', 'Tax Planning'].map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 rounded-lg px-3 py-2 ${i === 0 ? 'bg-white shadow-sm font-medium' : 'text-gray-500'}`}>
                    <div className={`h-4 w-4 rounded ${i === 0 ? 'bg-[#8FE62C]' : 'bg-gray-300'}`} />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
              
              {/* Content Area */}
              <div className="flex-1 p-8" style={{ backgroundColor: "#FFFFFF" }}>
                <div className="mb-8 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Overview</h2>
                  <div className="flex gap-4">
                    <div className="h-8 w-32 rounded-full bg-gray-100" />
                    <div className="h-8 w-8 rounded-full bg-gray-200" />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-6 mb-8">
                  {[
                    { label: 'Total Portfolio', val: '₹42,50,000', chg: '+5.2%' },
                    { label: 'Monthly Income', val: '₹2,45,000', chg: '+0.0%' },
                    { label: 'Monthly Expenses', val: '₹1,28,000', chg: '-12.4%' }
                  ].map((stat, i) => (
                    <div key={i} className="rounded-xl border border-gray-100 p-5">
                      <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                      <h4 className="text-xl font-bold mb-2">{stat.val}</h4>
                      <span className="text-xs font-medium" style={{ color: i === 2 ? '#8FE62C' : '#111111' }}>{stat.chg}</span>
                    </div>
                  ))}
                </div>
                
                <div className="h-48 rounded-xl border border-gray-100 p-5 flex items-end gap-4">
                  {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, backgroundColor: i === 6 ? '#8FE62C' : '#EBEBEB' }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Testimonials */}
        <section className="mb-32">
          <h2 className="mb-12 text-center text-4xl font-bold tracking-tight">Loved by families</h2>
          <div className="grid grid-cols-3 gap-6">
            {[
              { text: "Finally an app that understands Indian family dynamics. I can track my parents' FDs alongside my mutual funds without confusion.", author: "Rahul Sharma", city: "Bengaluru" },
              { text: "The AI WealthBot helped me optimize my tax saving investments under the new regime in 5 minutes flat. Insane value.", author: "Priya Patel", city: "Mumbai" },
              { text: "Cleanest interface I've seen in a fintech app. No clutter, no ads for loans, just pure tracking and planning features.", author: "Vikram Singh", city: "Delhi" }
            ].map((t, i) => (
              <div key={i} className="flex flex-col justify-between rounded-[20px] p-8" style={{ backgroundColor: "#FFFFFF" }}>
                <div>
                  <div className="mb-4 flex">
                    {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-current" style={{ color: "#8FE62C" }} />)}
                  </div>
                  <p className="mb-6 text-gray-700 leading-relaxed">"{t.text}"</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-500">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t.author}</p>
                    <p className="text-xs text-gray-500">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Pricing */}
        <section className="mb-32">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight">Simple, transparent pricing.</h2>
            <p className="text-gray-600">Start free, upgrade when you need family features.</p>
          </div>
          
          <div className="mx-auto max-w-4xl grid grid-cols-2 gap-8">
            {/* Free Tier */}
            <div className="rounded-[20px] p-10" style={{ backgroundColor: "#FFFFFF" }}>
              <h3 className="mb-2 text-2xl font-bold">Individual</h3>
              <p className="mb-6 text-sm text-gray-500">Perfect for single professionals starting out.</p>
              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-5xl font-bold">₹0</span>
                <span className="text-gray-500">/ forever</span>
              </div>
              <ul className="mb-10 space-y-4">
                {['Single user profile', 'Basic portfolio tracking', 'Monthly budgeting', '1 Financial Goal'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5" style={{ color: "#8FE62C" }} />
                    {feat}
                  </li>
                ))}
              </ul>
              <button className="w-full rounded-full py-4 font-medium border-2 border-[#111111] transition-colors hover:bg-gray-50">
                Get Started
              </button>
            </div>
            
            {/* Pro Tier */}
            <div className="rounded-[20px] p-10 text-white relative overflow-hidden" style={{ backgroundColor: "#111111" }}>
              <div className="absolute top-6 right-6 rounded-full px-3 py-1 text-xs font-bold text-[#111111]" style={{ backgroundColor: "#8FE62C" }}>
                POPULAR
              </div>
              <h3 className="mb-2 text-2xl font-bold">Family Pro</h3>
              <p className="mb-6 text-sm text-gray-400">For managing wealth across generations.</p>
              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-5xl font-bold">₹499</span>
                <span className="text-gray-400">/ month</span>
              </div>
              <ul className="mb-10 space-y-4">
                {['Up to 6 family members', 'Advanced portfolio analytics', 'Unlimited financial goals', 'AI WealthBot Access', 'Tax optimization insights'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5" style={{ color: "#8FE62C" }} />
                    {feat}
                  </li>
                ))}
              </ul>
              <button className="w-full rounded-full py-4 font-bold text-[#111111] transition-transform hover:scale-105" style={{ backgroundColor: "#8FE62C" }}>
                Start 14-Day Free Trial
              </button>
            </div>
          </div>
        </section>

        {/* 8. CTA */}
        <section className="mb-32">
          <div className="rounded-[20px] p-16 text-center text-white" style={{ backgroundColor: "#111111" }}>
            <h2 className="mb-6 text-5xl font-bold tracking-tight">Ready to take control?</h2>
            <p className="mx-auto mb-10 max-w-xl text-lg text-gray-400">
              Join thousands of families securing their financial future with WealthOS. Setup takes less than 5 minutes.
            </p>
            <button className="mb-4 inline-flex items-center gap-2 rounded-full px-10 py-5 text-lg font-bold text-[#111111] transition-transform hover:scale-105" style={{ backgroundColor: "#8FE62C" }}>
              Create Free Account <ChevronRight className="h-5 w-5" />
            </button>
            <p className="text-sm text-gray-500">No credit card required. Cancel anytime.</p>
          </div>
        </section>
      </main>

      {/* 9. Footer */}
      <footer className="border-t border-gray-300 py-16" style={{ backgroundColor: "#EBEBEB" }}>
        <div className="mx-auto max-w-7xl px-12 grid grid-cols-5 gap-12">
          <div className="col-span-2">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "#111111" }}>
                <Wallet className="h-5 w-5" style={{ color: "#8FE62C" }} />
              </div>
              <span className="text-xl font-bold tracking-tight">WealthOS</span>
            </div>
            <p className="max-w-xs text-sm text-gray-500">
              Building the financial operating system for the modern Indian family.
            </p>
          </div>
          
          <div>
            <h4 className="mb-4 font-bold">Product</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-[#111111]">Portfolio</a></li>
              <li><a href="#" className="hover:text-[#111111]">Budgeting</a></li>
              <li><a href="#" className="hover:text-[#111111]">Goals</a></li>
              <li><a href="#" className="hover:text-[#111111]">WealthBot AI</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 font-bold">Company</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-[#111111]">About</a></li>
              <li><a href="#" className="hover:text-[#111111]">Careers</a></li>
              <li><a href="#" className="hover:text-[#111111]">Blog</a></li>
              <li><a href="#" className="hover:text-[#111111]">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 font-bold">Legal</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-[#111111]">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#111111]">Terms of Service</a></li>
              <li><a href="#" className="hover:text-[#111111]">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-16 max-w-7xl px-12 text-sm text-gray-400">
          © {new Date().getFullYear()} WealthOS. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
