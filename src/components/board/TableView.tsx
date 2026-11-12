import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { TaskModal } from './TaskModal';
import { 
  ArrowUpDown, 
  Download, 
  Search, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Building 
} from 'lucide-react';

export const TableView: React.FC = () => {
  const { projectTasks, tenantUsers, moveTaskStatus, activeTenant } = useWorkspace();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Task>('createdAt');
  const [sortAsc, setSortAsc] = useState(false);

  const filteredTasks = projectTasks.filter(t => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.key.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q));
  }).sort((a, b) => {
    const valA = a[sortField] || '';
    const valB = b[sortField] || '';
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (field: keyof Task) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const exportCSV = () => {
    const headers = ['Key', 'Title', 'Status', 'Priority', 'StoryPoints', 'Assignee', 'DueDate', 'ClientRef'];
    const rows = filteredTasks.map(t => {
      const assignee = tenantUsers.find(u => u.id === t.assigneeId)?.name || 'Unassigned';
      return [
        t.key,
        `"${t.title.replace(/"/g, '""')}"`,
        t.status,
        t.priority,
        t.storyPoints,
        `"${assignee}"`,
        t.dueDate,
        `"${t.clientRef || ''}"`
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTenant.slug}-tasks-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 p-6 space-y-4">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search list..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500"
          />
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
        >
          <Download size={13} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 sticky top-0 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('key')}>
                <div className="flex items-center gap-1">Key <ArrowUpDown size={11} /></div>
              </th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('title')}>
                <div className="flex items-center gap-1">Title <ArrowUpDown size={11} /></div>
              </th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-1">Status <ArrowUpDown size={11} /></div>
              </th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('priority')}>
                <div className="flex items-center gap-1">Priority <ArrowUpDown size={11} /></div>
              </th>
              <th className="py-3 px-4">Story Pts</th>
              <th className="py-3 px-4">Assignee</th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('dueDate')}>
                <div className="flex items-center gap-1">Due Date <ArrowUpDown size={11} /></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredTasks.map(task => {
              const assignee = tenantUsers.find(u => u.id === task.assigneeId);
              return (
                <tr 
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                    {task.key}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-200">
                    <div className="flex flex-col">
                      <span>{task.title}</span>
                      {task.clientRef && (
                        <span className="text-[10px] text-cyan-400 font-normal">
                          Client: {task.clientRef}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={task.status}
                      onChange={(e: any) => moveTaskStatus(task.id, e.target.value)}
                      className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[11px] text-slate-200"
                    >
                      <option value="backlog">Backlog</option>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review / QA</option>
                      <option value="done">Done</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-slate-800 text-slate-300">
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {task.storyPoints}
                  </td>
                  <td className="py-3 px-4">
                    {assignee ? (
                      <div className="flex items-center gap-2">
                        <img src={assignee.avatar} alt={assignee.name} className="w-5 h-5 rounded-full object-cover" />
                        <span className="truncate max-w-[120px]">{assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {task.dueDate || '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
