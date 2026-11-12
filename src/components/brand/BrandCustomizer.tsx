import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { BrandLogo } from '../common/BrandLogo';
import { 
  Palette, 
  Upload, 
  Sparkles, 
  Check, 
  Image as ImageIcon, 
  RefreshCw,
  Building,
  GraduationCap,
  School,
  Truck,
  Layers,
  Eye
} from 'lucide-react';

export const BrandCustomizer: React.FC = () => {
  const { activeTenant, updateTenantBrand, showToast } = useWorkspace();

  const [name, setName] = useState(activeTenant.name);
  const [domain, setDomain] = useState(activeTenant.domain);
  const [ticketPrefix, setTicketPrefix] = useState(activeTenant.ticketPrefix);
  const [slogan, setSlogan] = useState(activeTenant.slogan);
  const [industry, setIndustry] = useState(activeTenant.industry);
  const [primaryColor, setPrimaryColor] = useState(activeTenant.primaryColor);
  const [accentColor, setAccentColor] = useState(activeTenant.accentColor);
  const [logoPreset, setLogoPreset] = useState(activeTenant.logoPreset || 'tech');
  const [logoUrl, setLogoUrl] = useState(activeTenant.logoUrl || '');

  // Pre-configured brand palettes for easy 1-click styling
  const palettePresets = [
    { name: 'Tech Indigo & Cyan', primary: '#4f46e5', accent: '#06b6d4', industry: 'software', preset: 'tech' },
    { name: 'Stanford Cardinal & Gold', primary: '#b91c1c', accent: '#f59e0b', industry: 'college', preset: 'academic' },
    { name: 'Oakridge Emerald & Amber', primary: '#059669', accent: '#d97706', industry: 'school', preset: 'school' },
    { name: 'Apex Logistics Slate & Orange', primary: '#ea580c', accent: '#3b82f6', industry: 'enterprise', preset: 'logistics' },
    { name: 'Deep Cyber Violet', primary: '#7c3aed', accent: '#ec4899', industry: 'software', preset: 'tech' },
    { name: 'Executive Navy & Sky', primary: '#1e40af', accent: '#38bdf8', industry: 'enterprise', preset: 'tech' },
  ];

  const handleApplyPalette = (palette: typeof palettePresets[0]) => {
    setPrimaryColor(palette.primary);
    setAccentColor(palette.accent);
    setIndustry(palette.industry as any);
    setLogoPreset(palette.preset as any);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setLogoUrl(reader.result);
          showToast('Uploaded custom company logo!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantBrand({
      name,
      domain,
      ticketPrefix: ticketPrefix.toUpperCase(),
      slogan,
      industry,
      primaryColor,
      accentColor,
      logoPreset: logoPreset as any,
      logoUrl: logoUrl || undefined,
    });
  };

  // Mock temporary preview tenant object
  const previewTenant = {
    ...activeTenant,
    name: name || 'Your Brand',
    domain: domain || 'company.com',
    ticketPrefix: ticketPrefix || 'TC',
    slogan,
    primaryColor,
    accentColor,
    logoPreset: logoPreset as any,
    logoUrl,
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-950">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Palette size={22} className="text-cyan-400" />
            White-Label Brand & Theme Studio
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
            Real-time CSS Engine
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Apply your unique identity, logo, and color palette across all Jira cards, login portals, and meeting minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: Theme & Logo Editor */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Quick Industry Presets */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Sparkles size={14} className="text-amber-400" />
                Quick Industry Theme Presets
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {palettePresets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPalette(p)}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.primary }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.accent }} />
                    </div>
                    <div className="text-[11px] font-semibold text-white truncate">
                      {p.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* General Brand Details */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Company Identity
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Company / School Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Company Domain Slug
                  </label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Jira Ticket Prefix (e.g. TC, STAN)
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={ticketPrefix}
                    onChange={(e) => setTicketPrefix(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono font-bold text-white uppercase focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Industry Category
                  </label>
                  <select
                    value={industry}
                    onChange={(e: any) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="software">IT & Software Engineering</option>
                    <option value="college">University / Higher Ed College</option>
                    <option value="school">K-12 School / Academy</option>
                    <option value="enterprise">Non-IT Enterprise / Logistics</option>
                    <option value="custom">Custom Organization</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tagline / Mission Slogan
                </label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Custom Logo Upload & Presets */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Company Logo & Iconography
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Upload or URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Upload Custom Logo (PNG / SVG)
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-700 rounded-xl bg-slate-950 hover:bg-slate-800/60 cursor-pointer transition-colors text-center">
                    <Upload size={18} className="text-slate-400 mb-1" />
                    <span className="text-xs text-slate-300 font-medium">Choose image file</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Stored locally in browser cache</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preset Emblem Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Or Select Preset Vector Emblem
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'tech', label: 'Tech Stack', icon: Layers },
                      { id: 'academic', label: 'University', icon: GraduationCap },
                      { id: 'school', label: 'School', icon: School },
                      { id: 'logistics', label: 'Logistics', icon: Truck },
                    ].map(preset => {
                      const Icon = preset.icon;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setLogoPreset(preset.id as any);
                            setLogoUrl('');
                          }}
                          className={`p-2 rounded-xl border flex items-center gap-2 text-xs transition-colors ${
                            logoPreset === preset.id && !logoUrl
                              ? 'bg-slate-800 border-cyan-400 text-white font-medium'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Icon size={14} />
                          <span>{preset.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {logoUrl && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <img src={logoUrl} alt="Logo preview" className="w-7 h-7 object-contain rounded" />
                    <span className="text-xs text-slate-300">Custom logo asset applied</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="text-xs text-rose-400 hover:text-rose-300"
                  >
                    Reset to Icon
                  </button>
                </div>
              )}
            </div>

            {/* Colors */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Brand Palette Customization
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Primary Brand Color (Buttons & Badges)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-32 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-white uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Secondary Accent Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-32 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-white uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white shadow-xl transition-all hover:opacity-90 cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                }}
              >
                Apply Company Branding Live
              </button>
            </div>
          </form>
        </div>

        {/* Right Preview Column: Live Mock Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Eye size={14} className="text-cyan-400" />
                Live Brand Rendering Preview
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Real-time</span>
            </div>

            {/* Mock Header Preview */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <BrandLogo tenant={previewTenant} size="sm" />
                <button
                  type="button"
                  className="px-3 py-1 rounded-lg text-xs font-semibold text-white shadow-sm"
                  style={{
                    backgroundColor: primaryColor,
                  }}
                >
                  + New Task
                </button>
              </div>

              {/* Mock Jira Ticket Card */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span 
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
                    style={{
                      borderColor: `${primaryColor}55`,
                      color: primaryColor,
                      backgroundColor: `${primaryColor}15`,
                    }}
                  >
                    {previewTenant.ticketPrefix}-101
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                    HIGH
                  </span>
                </div>

                <div className="text-xs font-bold text-white">
                  Sprint Milestone for {previewTenant.name}
                </div>

                <div className="text-[11px] text-slate-400">
                  {previewTenant.slogan}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-mono">5 pts</span>
                  <span className="text-cyan-400">@{previewTenant.domain}</span>
                </div>
              </div>

              {/* Mock Meeting Note Card */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Client Interaction</span>
                  <span>45 min</span>
                </div>
                <div className="text-xs font-semibold text-white">
                  Executive Steering Committee
                </div>
                <button
                  type="button"
                  className="w-full py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                  }}
                >
                  Convert to Jira Task
                </button>
              </div>
            </div>

            {/* Notice for Sales */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
              <span className="text-white font-semibold">White-Label Sales Benefit</span>
              <p className="leading-relaxed">
                When selling to schools, colleges, or IT/Non-IT companies, each customer gets their custom corporate logo, subdomain, and signature colors automatically injected on login.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
