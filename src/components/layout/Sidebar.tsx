import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ActiveView } from '../../types';
import { 
  Kanban, 
  ListTodo, 
  Table, 
  FileText, 
  Users, 
  Palette, 
  Package, 
  Flame, 
  Download, 
  HardDrive,
  CalendarCheck
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    activeTenant, 
    tenantTasks, 
    tenantMeetingNotes, 
    activeSprint,
    exportDatabaseJSON
  } = useWorkspace();

  const navItems: { id: ActiveView; label: string; icon: React.FC<{ size?: number; className?: string }>; count?: number }[] = [
    { id: 'board', label: 'Kanban Board', icon: Kanban, count: tenantTasks.length },
    { id: 'backlog', label: 'Backlog & Sprints', icon: ListTodo },
    { id: 'table', label: 'Table / List', icon: Table },
    { id: 'notes', label: 'Meeting Minutes', icon: FileText, count: tenantMeetingNotes.length },
    { id: 'team', label: 'Team & Workload', icon: Users },
    { id: 'brand', label: 'Brand & Logo', icon: Palette },
    { id: 'deployment', label: 'Package & Deploy', icon: Package },
  ];

  // Calculate active sprint progress
  const sprintTasks = activeSprint ? tenantTasks.filter(t => t.sprintId === activeSprint.id) : [];
  const doneSprintTasks = sprintTasks.filter(t => t.status === 'done');
  const sprintPercent = sprintTasks.length > 0 ? Math.round((doneSprintTasks.length / sprintTasks.length) * 100) : 0;

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col justify-between shrink-0 select-none hidden md:flex">
      
      {/* Top Navigation Links */}
      <div className="p-4 space-y-6">
        
        {/* Navigation Section */}
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Workspaces & Execution
          </div>
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                  style={{
                    backgroundColor: isActive ? `${activeTenant.primaryColor}25` : undefined,
                    borderColor: isActive ? `${activeTenant.primaryColor}66` : undefined,
                    borderWidth: isActive ? '1px' : '0px',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Icon 
                      size={16} 
                      className={isActive ? 'text-white' : 'text-slate-400'} 
                    />
                    <span className={isActive ? 'text-white font-semibold' : ''}>
                      {item.label}
                    </span>
                  </div>

                  {item.count !== undefined && (
                    <span 
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Active Sprint Widget */}
        {activeSprint && (
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Flame size={12} />
                Active Sprint
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {doneSprintTasks.length}/{sprintTasks.length} Done
              </span>
            </div>

            <div className="text-xs font-semibold text-slate-200 truncate" title={activeSprint.name}>
              {activeSprint.name}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${sprintPercent}%`,
                  backgroundColor: activeTenant.accentColor || '#06b6d4'
                }}
              />
            </div>

            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>Goal: {sprintPercent}%</span>
              <span>Ends: {activeSprint.endDate}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Information & Private Intranet Package Info */}
      <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-950/40">
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <HardDrive size={13} className="text-indigo-400" />
              Private Local Server
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
              Ready
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Works offline on local company networks without external cloud dependency.
          </p>
          <button
            onClick={exportDatabaseJSON}
            className="w-full mt-2 flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition-colors"
          >
            <Download size={12} />
            <span>Download Local JSON Backup</span>
          </button>
        </div>

        <div className="text-[10px] text-slate-500 flex items-center justify-between px-1">
          <span>{activeTenant.domain}</span>
          <span className="font-mono">v2.4.0</span>
        </div>
      </div>
    </aside>
  );
};
