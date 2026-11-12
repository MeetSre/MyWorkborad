import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { 
  Plus, 
  Filter, 
  X, 
  User as UserIcon, 
  Layers, 
  Flame, 
  CheckCircle2, 
  AlertOctagon, 
  Clock,
  Sparkles
} from 'lucide-react';

export const KanbanBoard: React.FC = () => {
  const { 
    projectTasks, 
    activeProject, 
    activeTenant, 
    tenantUsers, 
    currentUser,
    moveTaskStatus, 
    filters, 
    setFilters, 
    resetFilters 
  } = useWorkspace();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [createColumnStatus, setCreateColumnStatus] = useState<TaskStatus>('todo');

  // Drag and drop state
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const columns: { id: TaskStatus; title: string; color: string; dotColor: string }[] = [
    { id: 'backlog', title: 'Backlog', color: 'border-slate-800 text-slate-400', dotColor: 'bg-slate-500' },
    { id: 'todo', title: 'To Do', color: 'border-sky-500/30 text-sky-400', dotColor: 'bg-sky-400' },
    { id: 'in_progress', title: 'In Progress', color: 'border-indigo-500/30 text-indigo-400', dotColor: 'bg-indigo-500' },
    { id: 'review', title: 'Review / QA', color: 'border-amber-500/30 text-amber-400', dotColor: 'bg-amber-400' },
    { id: 'done', title: 'Done', color: 'border-emerald-500/30 text-emerald-400', dotColor: 'bg-emerald-400' },
    { id: 'blocked', title: 'Blocked', color: 'border-rose-500/30 text-rose-400', dotColor: 'bg-rose-500' },
  ];

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return projectTasks.filter(task => {
      // Search
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesKey = task.key.toLowerCase().includes(query);
        const matchesDesc = task.description.toLowerCase().includes(query);
        const matchesClient = task.clientRef?.toLowerCase().includes(query);
        const matchesTag = task.tags.some(t => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesKey && !matchesDesc && !matchesClient && !matchesTag) {
          return false;
        }
      }

      // Priority
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }

      // Assignee
      if (filters.assigneeId && task.assigneeId !== filters.assigneeId) {
        return false;
      }

      // Tag
      if (filters.tag && !task.tags.includes(filters.tag)) {
        return false;
      }

      return true;
    });
  }, [projectTasks, filters]);

  // Handle Drag & Drop
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggingTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, colStatus: TaskStatus) => {
    e.preventDefault();
    if (dragOverColumn !== colStatus) {
      setDragOverColumn(colStatus);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggingTaskId;
    if (taskId) {
      moveTaskStatus(taskId, targetStatus);
    }
    setDraggingTaskId(null);
    setDragOverColumn(null);
  };

  const hasActiveFilters = filters.search || filters.priority || filters.assigneeId || filters.tag;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
      
      {/* Top Filter Bar */}
      <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Quick "My Tasks" button */}
          <button
            onClick={() => {
              if (currentUser) {
                setFilters(prev => ({
                  ...prev,
                  assigneeId: prev.assigneeId === currentUser.id ? '' : currentUser.id,
                }));
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              filters.assigneeId === currentUser?.id
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <UserIcon size={12} />
            <span>My Tasks</span>
          </button>

          {/* Priority filter */}
          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-800/80 border border-slate-700 text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Assignee filter */}
          <select
            value={filters.assigneeId}
            onChange={(e) => setFilters(prev => ({ ...prev, assigneeId: e.target.value }))}
            className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-800/80 border border-slate-700 text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Assignees ({tenantUsers.length})</option>
            {tenantUsers.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded-lg hover:bg-rose-950/20 transition-colors"
            >
              <X size={12} />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        {/* Board stats badge */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>
            Total: <strong className="text-white font-mono">{filteredTasks.length}</strong> tasks
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">
            Points: <strong className="text-white font-mono">{filteredTasks.reduce((sum, t) => sum + t.storyPoints, 0)}</strong> pts
          </span>
        </div>
      </div>

      {/* Kanban Columns Grid (horizontal scrollable) */}
      <div className="flex-1 overflow-x-auto p-4 sm:p-6 flex gap-4 items-start select-none">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          const colPoints = colTasks.reduce((sum, t) => sum + t.storyPoints, 0);
          const isDragOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`w-72 sm:w-80 shrink-0 bg-slate-900/60 border rounded-2xl flex flex-col max-h-full transition-all duration-200 ${
                isDragOver 
                  ? 'border-cyan-400 ring-2 ring-cyan-500/20 bg-slate-850' 
                  : 'border-slate-800/80'
              }`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                    {col.title}
                  </span>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {colTasks.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-500 mr-1" title="Story Points">
                    {colPoints} pts
                  </span>
                  <button
                    onClick={() => {
                      setCreateColumnStatus(col.id);
                      setIsCreatingTask(true);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title={`Add task to ${col.title}`}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Column Task Cards Stack */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 min-h-[140px]">
                {colTasks.length === 0 ? (
                  <div className="h-28 border border-dashed border-slate-800/80 rounded-xl flex flex-col items-center justify-center text-slate-600 text-xs gap-1">
                    <span>No tasks</span>
                    <button
                      onClick={() => {
                        setCreateColumnStatus(col.id);
                        setIsCreatingTask(true);
                      }}
                      className="text-indigo-400 hover:text-indigo-300 text-[11px] font-medium"
                    >
                      + Add Card
                    </button>
                  </div>
                ) : (
                  colTasks.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <TaskCard
                        task={task}
                        onClick={() => setSelectedTask(task)}
                      />
                    </div>
                  ))
                )}
              </div>

              {/* Bottom Quick Add Button */}
              <div className="p-2 border-t border-slate-800/60">
                <button
                  onClick={() => {
                    setCreateColumnStatus(col.id);
                    setIsCreatingTask(true);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
                >
                  <Plus size={13} />
                  <span>Add Task</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Detail / Edit Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* Create New Task Modal */}
      {isCreatingTask && (
        <TaskModal
          task={null}
          initialStatus={createColumnStatus}
          onClose={() => setIsCreatingTask(false)}
        />
      )}
    </div>
  );
};
