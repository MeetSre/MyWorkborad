import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import { 
  X, 
  Trash2, 
  Calendar, 
  CheckSquare, 
  Plus, 
  MessageSquare, 
  User as UserIcon, 
  Sparkles,
  Layers,
  Flag,
  Send,
  Building
} from 'lucide-react';

interface TaskModalProps {
  task: Task | null; // null if creating a new task
  initialStatus?: TaskStatus;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, initialStatus = 'todo', onClose }) => {
  const {
    activeTenant,
    tenantUsers,
    sprints,
    currentUser,
    createTask,
    updateTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    addComment,
    activeSprint,
  } = useWorkspace();

  // Form states
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<TaskStatus>(task?.status || initialStatus);
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium');
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId || currentUser?.id || tenantUsers[0]?.id || '');
  const [storyPoints, setStoryPoints] = useState(task?.storyPoints || 3);
  const [sprintId, setSprintId] = useState(task?.sprintId || activeSprint?.id || '');
  const [dueDate, setDueDate] = useState(
    task?.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [tagsStr, setTagsStr] = useState(task?.tags.join(', ') || 'Frontend, Architecture');
  const [clientRef, setClientRef] = useState(task?.clientRef || '');

  // Subtask & Comment inputs
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  const isEditing = !!task;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tagsStr
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (isEditing && task) {
      updateTask(task.id, {
        title,
        description,
        status,
        priority,
        assigneeId,
        storyPoints: Number(storyPoints),
        sprintId: sprintId || undefined,
        dueDate,
        tags: parsedTags,
        clientRef: clientRef || undefined,
      });
      onClose();
    } else {
      createTask({
        title,
        description,
        status,
        priority,
        assigneeId,
        reporterId: currentUser?.id || tenantUsers[0]?.id || '',
        storyPoints: Number(storyPoints),
        sprintId: sprintId || undefined,
        dueDate,
        tags: parsedTags,
        subtasks: [],
        comments: [],
        clientRef: clientRef || undefined,
      });
      onClose();
    }
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !task) return;
    addSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !task) return;
    addComment(task.id, newCommentText.trim());
    setNewCommentText('');
  };

  const handleDelete = () => {
    if (!task) return;
    if (confirm(`Are you sure you want to delete ${task.key}?`)) {
      deleteTask(task.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div 
        className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <span 
              className="text-xs font-mono font-bold px-2 py-0.5 rounded border"
              style={{
                borderColor: `${activeTenant.primaryColor}55`,
                color: activeTenant.primaryColor,
                backgroundColor: `${activeTenant.primaryColor}15`,
              }}
            >
              {task?.key || `${activeTenant.ticketPrefix}-NEW`}
            </span>
            <span className="text-xs text-slate-400">
              {isEditing ? 'Ticket Details' : 'Create Task'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                title="Delete Ticket"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Audit Postgres Row-Level Security policies"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Grid Settings: Status, Priority, Assignee, Story Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review / QA</option>
                <option value="done">Done</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {tenantUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Story Points (Est.)
              </label>
              <input
                type="number"
                min="1"
                max="21"
                value={storyPoints}
                onChange={(e) => setStoryPoints(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Sprint, Due Date, Client Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Sprint
              </label>
              <select
                value={sprintId}
                onChange={(e) => setSprintId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">No Sprint (Backlog)</option>
                {sprints.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Client / Department Ref
              </label>
              <input
                type="text"
                value={clientRef}
                onChange={(e) => setClientRef(e.target.value)}
                placeholder="e.g. Vanguard Logistics or Room 302"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Description / Specifications
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add comprehensive acceptance criteria, technical details, or notes..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Labels / Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="e.g. Architecture, Security, Backend"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Subtasks (if editing existing task) */}
          {isEditing && task && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <CheckSquare size={14} className="text-indigo-400" />
                  Subtasks Checklist
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} Completed
                </span>
              </div>

              {/* Subtask list */}
              <div className="space-y-1.5">
                {task.subtasks.map(st => (
                  <div
                    key={st.id}
                    onClick={() => toggleSubtask(task.id, st.id)}
                    className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => {}} // handled by parent onClick
                      className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0"
                    />
                    <span className={st.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                      {st.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add subtask input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add a new checklist subtask..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1"
                >
                  <Plus size={13} />
                  <span>Add</span>
                </button>
              </div>
            </div>
          )}

          {/* Activity / Comments Stream (if editing) */}
          {isEditing && task && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MessageSquare size={14} className="text-cyan-400" />
                Comments & Activity ({task.comments.length})
              </span>

              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {task.comments.map(c => (
                  <div key={c.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <div className="flex items-center gap-2">
                        <img src={c.userAvatar} alt={c.userName} className="w-4 h-4 rounded-full object-cover" />
                        <span className="font-semibold text-white">{c.userName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300 pl-6 leading-relaxed">
                      {c.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Add comment box */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Leave a comment or update for the team..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddComment(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddComment}
                  className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Send size={13} />
                  <span>Send</span>
                </button>
              </div>
            </div>
          )}

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-lg transition-all hover:opacity-90"
              style={{
                background: `linear-gradient(135deg, ${activeTenant.primaryColor}, ${activeTenant.accentColor || activeTenant.primaryColor})`,
              }}
            >
              {isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
