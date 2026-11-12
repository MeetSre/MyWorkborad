import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { BrandLogo } from '../common/BrandLogo';
import { 
  Building2, 
  ArrowRight, 
  ShieldCheck, 
  Server, 
  CheckCircle2, 
  Sparkles, 
  Globe, 
  Lock,
  Cpu,
  GraduationCap,
  School,
  Truck,
  Plus
} from 'lucide-react';

export const DomainLoginPage: React.FC = () => {
  const { tenants, loginWithDomain, createTenant, switchTenantByDomain } = useWorkspace();
  const [domainInput, setDomainInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('••••••••');
  const [error, setError] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New company form state
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDomain, setNewOrgDomain] = useState('');
  const [newOrgIndustry, setNewOrgIndustry] = useState<'software' | 'college' | 'school' | 'enterprise'>('software');
  const [newPrimaryColor, setNewPrimaryColor] = useState('#4f46e5');

  // Dynamically resolve preview tenant based on typed domain
  const matchedTenant = useMemo(() => {
    if (!domainInput.trim()) return null;
    const input = domainInput.trim().toLowerCase();
    const domain = input.includes('@') ? input.split('@')[1] : input;
    return tenants.find(
      t => t.domain.toLowerCase() === domain || 
           t.slug.toLowerCase() === domain || 
           t.domain.toLowerCase().includes(domain)
    ) || null;
  }, [domainInput, tenants]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) {
      setError('Please enter your company email or domain (e.g., alex@techcorp.io or techcorp.io)');
      return;
    }
    setError(null);
    loginWithDomain(domainInput);
  };

  const handleQuickSelectTenant = (domain: string) => {
    setDomainInput(domain);
    loginWithDomain(domain);
  };

  const handleCreateNewCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName || !newOrgDomain) {
      setError('Company name and domain are required');
      return;
    }
    const cleanDomain = newOrgDomain.toLowerCase().replace(/https?:\/\//, '').replace(/\/$/, '');
    const prefix = newOrgName.split(' ').map(w => w[0]).join('').slice(0, 4).toUpperCase() || 'ORG';
    
    createTenant({
      name: newOrgName,
      domain: cleanDomain,
      slug: cleanDomain.split('.')[0] || 'corp',
      primaryColor: newPrimaryColor,
      accentColor: '#06b6d4',
      slogan: `${newOrgName} Internal Operations & Team Delivery`,
      industry: newOrgIndustry,
      tagline: 'Private Internal Operations & Jira Workspace',
      ticketPrefix: prefix,
      logoPreset: newOrgIndustry === 'college' ? 'academic' : newOrgIndustry === 'school' ? 'school' : newOrgIndustry === 'enterprise' ? 'logistics' : 'tech',
    });

    loginWithDomain(`admin@${cleanDomain}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Dynamic ambient background glow reflecting matched company color */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] blur-[140px] opacity-25 pointer-events-none transition-all duration-700 rounded-full"
        style={{
          backgroundColor: matchedTenant ? matchedTenant.primaryColor : '#4f46e5',
        }}
      />
      <div 
        className="absolute bottom-0 right-0 w-[500px] h-[400px] blur-[150px] opacity-15 pointer-events-none rounded-full"
        style={{
          backgroundColor: matchedTenant ? matchedTenant.accentColor : '#06b6d4',
        }}
      />

      {/* Top Banner */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-cyan-400 to-sky-400 flex items-center justify-center font-black text-white text-base shadow-lg shadow-indigo-500/20">
            Ω
          </div>
          <div>
            <div className="font-bold tracking-tight text-white flex items-center gap-2">
              OmniFlow Enterprise Suite
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                Self-Host Ready v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Turnkey Jira & Notes Platform for Companies, Colleges & Schools
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60 font-mono">
            <Server size={13} className="text-emerald-400" />
            Local Intranet Host: Active
          </span>
          <button
            onClick={() => setIsCreatingNew(!isCreatingNew)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            {isCreatingNew ? 'Return to Login' : <><Plus size={14} /> New Company Setup</>}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero / Pitch Column */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-300">
              <ShieldCheck size={14} className="text-emerald-400" />
              Air-Gapped & Domain-Isolated
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Single workspace for your entire organization.
              </h1>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Jira-style agile boards, sprint planning, team capacity balancer, and meeting notes with 1-click action item dispatch.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-start gap-3 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Domain-Based Multi-Tenancy:</strong> Employees log in via their corporate or institutional domain.
                </span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Meeting Minutes to Tasks:</strong> Document client interactions and turn action items into Jira tickets with 1 click.
                </span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">100% Offline & Intranet Ready:</strong> Install on private local servers or deploy to Vercel & Supabase.
                </span>
              </div>
            </div>

            {/* Quick Presets Section */}
            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <Sparkles size={13} className="text-indigo-400" />
                Explore Ready Industry Workspaces
              </div>
              <div className="grid grid-cols-2 gap-2">
                {tenants.map(t => {
                  const Icon = t.industry === 'college' ? GraduationCap :
                               t.industry === 'school' ? School :
                               t.industry === 'enterprise' ? Truck : Cpu;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleQuickSelectTenant(t.domain)}
                      className="group flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all hover:scale-[1.02]"
                    >
                      <div 
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 text-xs font-bold"
                        style={{ backgroundColor: t.primaryColor }}
                      >
                        <Icon size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-white truncate group-hover:text-cyan-300">
                          {t.name.split(' ')[0]}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          @{t.domain}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Login / Onboarding Form Card */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative">
              
              {/* Dynamic matched company preview ribbon */}
              {matchedTenant && !isCreatingNew && (
                <div 
                  className="mb-6 p-4 rounded-xl border flex items-center justify-between transition-all duration-300"
                  style={{
                    backgroundColor: `${matchedTenant.primaryColor}15`,
                    borderColor: `${matchedTenant.primaryColor}55`,
                  }}
                >
                  <BrandLogo tenant={matchedTenant} size="md" />
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-950/70 text-slate-300 border border-slate-800">
                    Verified Domain
                  </span>
                </div>
              )}

              {!isCreatingNew ? (
                /* Standard Domain Login Form */
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      <Lock size={18} className="text-indigo-400" />
                      Sign In to Company Portal
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Enter your corporate or school email to access your customized board.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                        <span>Work Email or Company Domain</span>
                        <span className="text-[11px] text-slate-500 font-normal">
                          e.g. name@techcorp.io
                        </span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Globe size={16} />
                        </div>
                        <input
                          type="text"
                          value={domainInput}
                          onChange={(e) => {
                            setDomainInput(e.target.value);
                            setError(null);
                          }}
                          placeholder="elena@techcorp.io or techcorp.io"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                        <span>Internal Password or Single Sign-On Key</span>
                        <span className="text-[11px] text-indigo-400 font-normal">
                          Demo bypass active
                        </span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock size={16} />
                        </div>
                        <input
                          type="password"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="Password"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0" 
                      />
                      <span>Keep logged in on this machine</span>
                    </label>
                    <span className="text-slate-500">Local LAN Mode</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 group hover:opacity-95 cursor-pointer"
                    style={{
                      background: matchedTenant 
                        ? `linear-gradient(135deg, ${matchedTenant.primaryColor}, ${matchedTenant.accentColor || matchedTenant.primaryColor})`
                        : 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                    }}
                  >
                    <span>
                      {matchedTenant ? `Enter ${matchedTenant.name} Portal` : 'Enter Company Workspace'}
                    </span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="pt-2 border-t border-slate-800 text-center">
                    <p className="text-xs text-slate-500">
                      Need a separate board for another division?{' '}
                      <button
                        type="button"
                        onClick={() => setIsCreatingNew(true)}
                        className="text-cyan-400 hover:text-cyan-300 font-medium underline"
                      >
                        Create a company workspace
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                /* Create New Company Workspace Form */
                <form onSubmit={handleCreateNewCompany} className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      <Building2 size={18} className="text-cyan-400" />
                      Provision New Company Workspace
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Instantly configure a white-label workspace for your business, school, or department.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
                      {error}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Company or Institution Name
                      </label>
                      <input
                        type="text"
                        value={newOrgName}
                        onChange={(e) => setNewOrgName(e.target.value)}
                        placeholder="e.g. Horizon Labs, BlueWave Logistics, Crestview High"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Company Domain
                        </label>
                        <input
                          type="text"
                          value={newOrgDomain}
                          onChange={(e) => setNewOrgDomain(e.target.value)}
                          placeholder="e.g. horizonlabs.co or crestview.edu"
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Industry Sector
                        </label>
                        <select
                          value={newOrgIndustry}
                          onChange={(e: any) => setNewOrgIndustry(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="software">IT / Software Company</option>
                          <option value="college">University / College Department</option>
                          <option value="school">K-12 School / Academy</option>
                          <option value="enterprise">Non-IT / Logistics / Services</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Brand Accent Color
                      </label>
                      <div className="flex items-center gap-2">
                        {['#4f46e5', '#06b6d4', '#b91c1c', '#059669', '#ea580c', '#8b5cf6'].map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setNewPrimaryColor(color)}
                            className={`w-7 h-7 rounded-full border-2 transition-transform ${newPrimaryColor === color ? 'scale-110 border-white' : 'border-transparent'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                        <input
                          type="color"
                          value={newPrimaryColor}
                          onChange={(e) => setNewPrimaryColor(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles size={16} />
                      Launch Organization Workspace
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(false)}
                      className="py-2.5 px-4 rounded-xl font-medium text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer info for sales & private intranet packages */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/70 backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <div className="flex items-center gap-4">
          <span>Packaged for Sales: Schools, Colleges, IT & Non-IT Businesses</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">Air-Gapped Intranet Certified</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400">Ready for Vercel, Supabase, Twilio & Resend</span>
        </div>
      </footer>
    </div>
  );
};
