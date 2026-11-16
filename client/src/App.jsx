import React, { useState } from 'react';
import { Routes, Route, NavLink, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  BookOpen, 
  Send, 
  Sparkles, 
  Palette, 
  CheckSquare, 
  BarChart3, 
  History, 
  UserCheck, 
  Sliders, 
  AlertTriangle,
  ChevronRight,
  Bell,
  Search
} from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState('Admin'); // 'Admin' | 'Creator' | 'Reviewer'

  const roles = [
    { name: 'Admin', desc: 'Manage Brand Rules, Guidelines & Governance' },
    { name: 'Creator', desc: 'Draft, Scan & Submit AI Compliant Content' },
    { name: 'Reviewer', desc: 'Audit, Enforce Compliance & Approve Submissions' },
  ];

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Creator', 'Reviewer'] },
    { to: '/guidelines', label: 'Brand Guidelines', icon: BookOpen, roles: ['Admin', 'Reviewer', 'Creator'] },
    { to: '/submit', label: 'Content Studio & Scan', icon: Send, roles: ['Creator', 'Admin'] },
    { to: '/visual-checker', label: 'Visual Brand Checker', icon: Palette, roles: ['Creator', 'Reviewer', 'Admin'] },
    { to: '/reviews', label: 'Review & Approvals', icon: CheckSquare, roles: ['Reviewer', 'Admin'] },
    { to: '/analytics', label: 'Analytics & Reports', icon: BarChart3, roles: ['Admin', 'Reviewer'] },
    { to: '/history', label: 'Content History', icon: History, roles: ['Admin', 'Creator', 'Reviewer'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(currentRole));

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                BrandGuard <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">AI</span>
              </h1>
              <p className="text-xs text-slate-400">Inkloom Governance Engine</p>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-900/50">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Current Active Persona
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {['Admin', 'Creator', 'Reviewer'].map(r => (
                <button
                  key={r}
                  onClick={() => setCurrentRole(r)}
                  className={`text-xs py-1.5 px-2 rounded-md font-medium transition-all ${
                    currentRole === r
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-3 py-1">
              Platform Modules
            </p>
            {filteredNav.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Info & Status */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400">
              {currentRole[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">{currentRole} Workspace</p>
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active Session
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-950/40 backdrop-blur px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 text-slate-400 text-sm">
            <span>Platform</span>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <span className="text-slate-200 font-medium">Brand Governance Engine</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search guidelines, rules, assets..."
                className="bg-slate-800/60 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-64"
              />
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-200 relative">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-blue-500 absolute top-1.5 right-1.5"></span>
            </button>
            <div className="h-6 w-px bg-slate-800"></div>
            <div className="text-xs text-right">
              <p className="text-slate-300 font-semibold">{currentRole} User</p>
              <p className="text-slate-500 text-[10px]">role:{currentRole.toLowerCase()}</p>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/" element={<DashboardView role={currentRole} />} />
            <Route path="/guidelines" element={<PlaceholderModule title="Brand Guidelines Management" role={currentRole} desc="Configure Voice & Tone, Color Palettes, Approved Logos, Prohibited Jargon, and Mandatory Disclaimers." />} />
            <Route path="/submit" element={<PlaceholderModule title="Content Submission & AI Content Analysis" role={currentRole} desc="Submit multi-channel marketing copy and graphics. Instant AI violation detection and auto-rewrite recommendations." />} />
            <Route path="/visual-checker" element={<PlaceholderModule title="Visual Brand Checker" role={currentRole} desc="Verify palette compliance, contrast ratios, and typography standards on creative assets." />} />
            <Route path="/reviews" element={<PlaceholderModule title="Review and Approval Workflow" role={currentRole} desc="Manage the governance queue, approve or reject submissions, and inspect AI compliance audit traces." />} />
            <Route path="/analytics" element={<PlaceholderModule title="Analytics and Reports" role={currentRole} desc="Track brand adherence rates, violation hotspots, team metrics, and export audit-ready compliance reports." />} />
            <Route path="/history" element={<PlaceholderModule title="Content History & Audit Trail" role={currentRole} desc="Search and review the historical record of every asset scanned, updated, and approved." />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function DashboardView({ role }) {
  const cards = [
    { title: 'Brand Adherence Rate', value: '94.2%', change: '+3.1% this week', positive: true },
    { title: 'Pending Reviews', value: '7', change: '2 high priority', positive: false },
    { title: 'AI Auto-Corrected', value: '184', change: 'Saved ~28 reviewer hrs', positive: true },
    { title: 'Violations Prevented', value: '42', change: 'Banned terms & disclaimers', positive: true },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Governance Control Center</h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time compliance surveillance across content, tone, and visual guidelines.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/submit"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Scan New Content
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="bg-slate-950/60 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-medium text-slate-400">{card.title}</p>
            <p className="text-2xl font-bold text-white mt-2">{card.value}</p>
            <p className={`text-xs mt-2 ${card.positive ? 'text-emerald-400' : 'text-amber-400'}`}>
              {card.change}
            </p>
          </div>
        ))}
      </div>

      {/* Architecture & Module Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-950/60 border border-slate-800 rounded-xl p-6">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Core Governance Modules Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {[
              { name: 'Authentication & RBAC', status: 'Ready (Admin, Creator, Reviewer)' },
              { name: 'Brand Guidelines Management', status: 'Architecture Configured' },
              { name: 'Content Submission Studio', status: 'Architecture Configured' },
              { name: 'AI Content Analysis Engine', status: 'Architecture Configured' },
              { name: 'Brand Violation Detection', status: 'Architecture Configured' },
              { name: 'AI Suggestions & Auto-Fix', status: 'Architecture Configured' },
              { name: 'Visual Brand Checker', status: 'Architecture Configured' },
              { name: 'Review & Approval Workflow', status: 'Architecture Configured' },
              { name: 'Analytics & Reports', status: 'Architecture Configured' },
              { name: 'Content History & Audit Trail', status: 'Architecture Configured' },
            ].map((m, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-slate-300 font-medium text-xs">{m.name}</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-6">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            Active Role Capabilities: {role}
          </h3>
          <div className="space-y-3 text-xs text-slate-300">
            {role === 'Admin' && (
              <>
                <p className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  ✓ Full control over brand guidelines and enterprise rulebook
                </p>
                <p className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  ✓ Configure banned terms, mandatory disclaimers & threshold scores
                </p>
                <p className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  ✓ View organization-wide adherence metrics and compliance analytics
                </p>
              </>
            )}
            {role === 'Creator' && (
              <>
                <p className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  ✓ Draft content and perform real-time pre-submission AI scans
                </p>
                <p className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  ✓ Receive instant AI suggestions, auto-fix, and tone rewrites
                </p>
                <p className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  ✓ Track approval progress and past submissions in Content History
                </p>
              </>
            )}
            {role === 'Reviewer' && (
              <>
                <p className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  ✓ Inspect flagged brand violations and AI compliance scorecards
                </p>
                <p className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  ✓ Approve, reject, or request changes with contextual comments
                </p>
                <p className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  ✓ Audit visual assets using the color palette & contrast checker
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlaceholderModule({ title, desc, role }) {
  return (
    <div className="max-w-4xl bg-slate-950/60 border border-slate-800 rounded-2xl p-8 space-y-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">
        <Sparkles className="w-3.5 h-3.5" />
        Module Configured & Scaffolding Ready
      </div>
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300">
        <span className="font-semibold text-cyan-400">Current Role Access:</span> You are viewing this module as <span className="text-white font-bold">{role}</span>.
      </div>
    </div>
  );
}

