import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Task, Sprint } from '../../types';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { 
  Flame, 
  Play, 
  CheckCircle, 
  Plus, 
  Calendar, 
  Layers, 
  ArrowRight,
  Clock
} from 'lucide-react';

export const BacklogView: React.FC = () => {
  const { 
    projectTasks, 
    sprints, 
    activeSprint, 
    activeProject, 
    activeTenant, 
    createSprint, 
    updateSprintStatus,
    updateTask,
  } = useWorkspace();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreatingSprint, setIsCreatingSprint] = useState(false);
  const [newSprintName, setNewSprintName] = useState('');
  const [newSprintGoal, setNewSprintGoal] = useState('');
  const [newSprintStart, setNewSprintStart] = useState(new Date().toISOString().split('T')[0]);
  const [newSprintEnd, setNewSprintEnd] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );

  const activeSprintTasks = projectTasks.filter(t => t.sprintId === activeSprint?.id);
  const backlogTasks = projectTasks.filter(t => !t.sprintId || t.sprintId === '');

  const handleCreateSprint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSprintName.trim()) return;
    createSprint(newSprintName, newSprintGoal, newSprintStart, newSprintEnd);
    setNewSprintName('');
    setNewSprintGoal('');
    setIsCreatingSprint(false);
  };

  const moveTaskToSprint = (taskId: string, targetSprintId?: string) => {
    updateTask(taskId, { sprintId: targetSprintId });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-950">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers size={20} className="text-indigo-400" />
            Sprint & Backlog Planning
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Plan milestones, allocate story points, and commit tickets to sprint cycles.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingSprint(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
        >
          <Plus size={14} />
          <span>Create Sprint</span>
        </button>
      </div>

      {/* New Sprint Modal */}
      {isCreatingSprint && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-4 max-w-xl animate-in fade-in">
          <h3 className="text-sm font-bold text-white">Create New Sprint Cycle</h3>
          <form onSubmit={handleCreateSprint} className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Sprint Name</label>
              <input
                type="text"
                value={newSprintName}
                onChange={(e) => setNewSprintName(e.target.value)}
                placeholder="e.g. Sprint 25: GraphQL API Federation"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Sprint Goal</label>
              <textarea
                rows={2}
                value={newSprintGoal}
                onChange={(e) => setNewSprintGoal(e.target.value)}
                placeholder="What is the objective of this sprint?"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={newSprintStart}
                  onChange={(e) => setNewSprintStart(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={newSprintEnd}
                  onChange={(e) => setNewSprintEnd(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingSprint(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
              >
                Save Sprint
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Sprint Section */}
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Flame size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{activeSprint?.name || 'No Active Sprint'}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {activeSprint?.goal || 'Assign tasks from backlog below to start work.'}
                </div>
              </div>
            </div>

            {activeSprint && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400">
                  {activeSprint.startDate} → {activeSprint.endDate}
                </span>
                <button
                  onClick={() => updateSprintStatus(activeSprint.id, 'completed')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-700/50 hover:bg-emerald-900/40 transition-colors"
                >
                  <CheckCircle size={14} />
                  <span>Complete Sprint</span>
                </button>
              </div>
            )}
          </div>

          {/* Active Sprint Tasks List */}
          <div className="pt-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Sprint Committed Tasks ({activeSprintTasks.length})</span>
              <span className="font-mono">
                {activeSprintTasks.reduce((s, t) => s + t.storyPoints, 0)} Story Points
              </span>
            </div>

            <div className="space-y-2">
              {activeSprintTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No tasks currently in this sprint. Move tickets from the Backlog pool below!
                </div>
              ) : (
                activeSprintTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 flex items-center justify-between gap-4 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono font-bold text-indigo-400">
                        {task.key}
                      </span>
                      <span className="text-xs font-medium text-slate-200 truncate">
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize">
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-mono text-slate-300">
                        {task.storyPoints}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveTaskToSprint(task.id, undefined);
                        }}
                        className="text-[11px] text-slate-400 hover:text-rose-400 px-2 py-1 rounded hover:bg-slate-800"
                        title="Send back to Backlog"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Backlog Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <span>Backlog Pool ({backlogTasks.length})</span>
            <span className="text-xs font-mono text-slate-400">
              {backlogTasks.reduce((s, t) => s + t.storyPoints, 0)} pts unassigned
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {backlogTasks.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              Backlog is clear! All tickets are assigned to sprints.
            </div>
          ) : (
            backlogTasks.map(task => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 flex items-center justify-between gap-4 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {task.key}
                  </span>
                  <span className="text-xs font-medium text-slate-200 truncate">
                    {task.title}
                  </span>
                  {task.tags.map(tag => (
                    <span key={tag} className="text-[10px] text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 hidden md:inline">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-mono text-slate-300">
                    {task.storyPoints}
                  </span>
                  {activeSprint && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveTaskToSprint(task.id, activeSprint.id);
                      }}
                      className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/40 px-2.5 py-1 rounded-lg border border-cyan-800/40 transition-colors"
                    >
                      <span>Move to Sprint</span>
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};
