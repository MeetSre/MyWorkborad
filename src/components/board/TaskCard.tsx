import React, { useState } from 'react';
import { Task, TaskStatus } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import { 
  AlertCircle, 
  Clock, 
  CheckSquare, 
  MessageSquare, 
  MoreHorizontal, 
  ArrowRight,
  Flame,
  Tag,
  Building
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const { tenantUsers, moveTaskStatus, activeTenant } = useWorkspace();
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const assignee = tenantUsers.find(u => u.id === task.assigneeId);
  const completedSubtasks = task.subtasks.filter(st => st.completed).length;

  const priorityConfig = {
    urgent: { bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40', icon: Flame },
    high: { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: AlertCircle },
    medium: { bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40', icon: Clock },
    low: { bg: 'bg-slate-500/20 text-slate-300 border-slate-500/40', icon: Clock },
  };

  const statusOptions: { id: TaskStatus; label: string }[] = [
    { id: 'backlog', label: 'Backlog' },
    { id: 'todo', label: 'To Do' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'review', label: 'Review / QA' },
    { id: 'done', label: 'Done' },
    { id: 'blocked', label: 'Blocked' },
  ];

  // Overdue check
  const isOverdue = task.dueDate && task.status !== 'done' && new Date(task.dueDate) < new Date();

  return (
    <div 
      className="group relative bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all cursor-pointer select-none"
      onClick={onClick}
    >
      {/* Top Header: Key, Priority, Quick Move */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span 
            className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border"
            style={{
              borderColor: `${activeTenant.primaryColor}55`,
              color: activeTenant.primaryColor,
              backgroundColor: `${activeTenant.primaryColor}15`,
            }}
          >
            {task.key}
          </span>

          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border flex items-center gap-1 ${priorityConfig[task.priority].bg}`}>
            {task.priority.toUpperCase()}
          </span>
        </div>

        {/* Quick Status Mover Dropdown Button */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
            title="Quick Move Column"
          >
            <MoreHorizontal size={14} />
          </button>

          {showStatusMenu && (
            <div 
              className="absolute right-0 top-full mt-1 w-40 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl p-1 z-30 animate-in fade-in"
              onMouseLeave={() => setShowStatusMenu(false)}
            >
              <div className="px-2 py-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Move to Status
              </div>
              {statusOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    moveTaskStatus(task.id, opt.id);
                    setShowStatusMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs text-left transition-colors ${
                    opt.id === task.status 
                      ? 'bg-slate-800 text-cyan-400 font-semibold' 
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{opt.label}</span>
                  {opt.id === task.status && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xs font-semibold text-slate-100 group-hover:text-white line-clamp-2 leading-relaxed mb-2.5">
        {task.title}
      </h3>

      {/* Client Reference / Tag badge */}
      {task.clientRef && (
        <div className="mb-2 flex items-center gap-1 text-[10px] text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded-md w-fit">
          <Building size={10} />
          <span className="truncate max-w-[170px]">{task.clientRef}</span>
        </div>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {task.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] text-slate-400 bg-slate-800/70 px-1.5 py-0.5 rounded border border-slate-800">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Subtasks Progress Bar (if any) */}
      {task.subtasks.length > 0 && (
        <div className="mb-2.5 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <CheckSquare size={11} className="text-slate-400" />
              <span>Subtasks</span>
            </span>
            <span className="font-mono">{completedSubtasks}/{task.subtasks.length}</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-400 h-full rounded-full transition-all"
              style={{ width: `${Math.round((completedSubtasks / task.subtasks.length) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer: Due date, comments count, story points, assignee */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          {/* Story Points */}
          <span 
            className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] bg-slate-800 text-slate-200 border border-slate-700" 
            title={`${task.storyPoints} Story Points`}
          >
            {task.storyPoints}
          </span>

          {/* Comments count */}
          {task.comments.length > 0 && (
            <span className="flex items-center gap-1 text-[10px]">
              <MessageSquare size={11} />
              <span>{task.comments.length}</span>
            </span>
          )}

          {/* Due date */}
          {task.dueDate && (
            <span className={`text-[10px] font-mono flex items-center gap-1 ${isOverdue ? 'text-rose-400 font-semibold' : 'text-slate-400'}`}>
              <Clock size={10} />
              <span>{task.dueDate.slice(5)}</span>
            </span>
          )}
        </div>

        {/* Assignee Avatar */}
        {assignee ? (
          <div 
            className="relative group/avatar" 
            title={`${assignee.name} (${assignee.role}) - ${assignee.title}`}
          >
            <img
              src={assignee.avatar}
              alt={assignee.name}
              className="w-6 h-6 rounded-full object-cover border border-slate-700"
            />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full border border-dashed border-slate-600 flex items-center justify-center text-[10px] text-slate-500">
            ?
          </div>
        )}
      </div>
    </div>
  );
};
