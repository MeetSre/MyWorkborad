import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { BrandLogo } from '../common/BrandLogo';
import { 
  Search, 
  Plus, 
  FileText, 
  Wifi, 
  WifiOff, 
  ChevronDown, 
  UserCheck, 
  LogOut, 
  Sparkles,
  ShieldAlert,
  Database,
  Building,
  Check
} from 'lucide-react';

interface HeaderProps {
  onOpenCreateTask: () => void;
  onOpenCreateMeeting: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreateTask, onOpenCreateMeeting }) => {
  const {
    activeTenant,
    tenants,
    switchTenantByDomain,
    currentUser,
    setCurrentUser,
    tenantUsers,
    activeProject,
    tenantProjects,
    setActiveProject,
    filters,
    setFilters,
    isOffline,
    lastSyncedAt,
    logout,
  } = useWorkspace();

  const [showTenantMenu, setShowTenantMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      
      {/* Left: Brand & Workspace Switcher */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setShowTenantMenu(!showTenantMenu)}
            className="flex items-center gap-2 p-1.5 -ml-1.5 rounded-xl hover:bg-slate-800/80 transition-colors text-left group"
            title="Switch Company Workspace"
          >
            <BrandLogo tenant={activeTenant} size="sm" showText={true} />
            <ChevronDown size={14} className="text-slate-400 group-hover:text-white transition-colors" />
          </button>

          {/* Tenant Switcher Dropdown */}
          {showTenantMenu && (
            <div 
              className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2"
              onMouseLeave={() => setShowTenantMenu(false)}
            >
              <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                <span>Switch Company Tenant</span>
                <span className="text-indigo-400 font-mono">Domain Auth</span>
              </div>

              <div className="py-1 space-y-1">
                {tenants.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      switchTenantByDomain(t.domain);
                      setShowTenantMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                      t.id === activeTenant.id
                        ? 'bg-slate-800 text-white font-medium'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div 
                        className="w-3 h-3 rounded-full shrink-0" 
                        style={{ backgroundColor: t.primaryColor }}
                      />
                      <div className="truncate">
                        <div className="font-semibold truncate">{t.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">@{t.domain}</div>
                      </div>
                    </div>
                    {t.id === activeTenant.id && (
                      <Check size={14} className="text-emerald-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-2 border-t border-slate-800 bg-slate-950/40 rounded-b-xl">
                <button
                  onClick={() => {
                    setShowTenantMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Building size={13} />
                  <span>Domain Login Screen</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Project Selector Divider & Dropdown */}
        <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-800">
          <div className="relative">
            <button
              onClick={() => setShowProjectMenu(!showProjectMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/70 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-colors"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeProject?.color || activeTenant.primaryColor }} />
              <span className="truncate max-w-[150px]">{activeProject?.name || 'Project'}</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {showProjectMenu && (
              <div 
                className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-1.5 z-50"
                onMouseLeave={() => setShowProjectMenu(false)}
              >
                <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Tenant Projects
                </div>
                {tenantProjects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveProject(p);
                      setShowProjectMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs ${
                      p.id === activeProject.id ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{p.key}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            placeholder={`Search ${activeTenant.ticketPrefix} tickets, tasks, or notes (Press '/' to focus)...`}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Right Controls: Offline Badge, Role Switcher, Quick Actions */}
      <div className="flex items-center gap-2.5">
        
        {/* Offline & Sync Status Badge */}
        <div 
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400"
          title={`Last local sync: ${lastSyncedAt.toLocaleTimeString()}`}
        >
          {isOffline ? (
            <>
              <WifiOff size={13} className="text-amber-400" />
              <span className="text-amber-400">Air-Gapped Offline</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <Wifi size={13} className="text-emerald-400" />
              <span className="text-slate-300">LAN Intranet Synced</span>
            </>
          )}
        </div>

        {/* Quick User / Role Switcher for Sales & Demo testing */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors"
            title="Switch Logged In Role"
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover border border-slate-600"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                {currentUser?.name?.[0] || 'U'}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-white leading-tight truncate max-w-[100px]">
                {currentUser?.name?.split(' ')[0] || 'User'}
              </div>
              <div className="text-[10px] text-indigo-400 font-mono capitalize leading-tight">
                {currentUser?.role || 'Member'}
              </div>
            </div>
            <ChevronDown size={12} className="text-slate-400" />
          </button>

          {/* User Selector Dropdown */}
          {showUserMenu && (
            <div 
              className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in"
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                <span>Switch Role / Employee</span>
                <span className="text-emerald-400 font-mono">{activeTenant.domain}</span>
              </div>

              <div className="py-1 space-y-1 max-h-60 overflow-y-auto">
                {tenantUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setCurrentUser(user);
                      setShowUserMenu(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs transition-colors ${
                      user.id === currentUser?.id
                        ? 'bg-slate-800 text-white font-medium'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-white truncate flex items-center gap-1.5">
                        {user.name}
                        {user.role === 'manager' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                            Manager
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {user.title}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 mt-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-950/30 rounded-xl transition-colors"
                >
                  <LogOut size={13} />
                  <span>Sign Out of {activeTenant.name}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <button
          onClick={onOpenCreateMeeting}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          title="Document Client Interaction or Meeting Minutes"
        >
          <FileText size={14} className="text-cyan-400" />
          <span>Meeting Note</span>
        </button>

        <button
          onClick={onOpenCreateTask}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white shadow-md transition-all hover:opacity-90 cursor-pointer"
          style={{
            background: `linear-gradient(135deg, ${activeTenant.primaryColor}, ${activeTenant.accentColor || activeTenant.primaryColor})`,
          }}
          title="Create New Jira Task"
        >
          <Plus size={15} />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
};
