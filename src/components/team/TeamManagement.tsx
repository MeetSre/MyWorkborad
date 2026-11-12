import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { User, UserRole } from '../../types';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ArrowRightLeft, 
  Clock, 
  Layers, 
  Mail, 
  Phone, 
  Briefcase,
  AlertTriangle,
  CheckCircle,
  Sparkles
} from 'lucide-react';

export const TeamManagement: React.FC = () => {
  const { 
    tenantUsers, 
    activeTenant, 
    tenantTasks, 
    currentUser, 
    addUser, 
    updateUserRole, 
    reassignAllTasks 
  } = useWorkspace();

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);

  // New user form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const [department, setDepartment] = useState('Engineering');
  const [title, setTitle] = useState('');
  const [hourlyCapacity, setHourlyCapacity] = useState(40);
  const [phone, setPhone] = useState('');

  // Reassign modal states
  const [fromUserId, setFromUserId] = useState(tenantUsers[0]?.id || '');
  const [toUserId, setToUserId] = useState(tenantUsers[1]?.id || '');

  // Calculate workloads per user
  const userWorkloadStats = tenantUsers.map(user => {
    const userTasks = tenantTasks.filter(t => t.assigneeId === user.id && t.status !== 'done');
    const openPoints = userTasks.reduce((sum, t) => sum + t.storyPoints, 0);
    const capacityStatus = openPoints > 15 ? 'overloaded' : openPoints >= 8 ? 'balanced' : 'available';

    return {
      user,
      taskCount: userTasks.length,
      openPoints,
      capacityStatus,
    };
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    addUser({
      tenantId: activeTenant.id,
      name,
      email,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + (tenantUsers.length * 1000000)}?w=150&auto=format&fit=crop&q=80`,
      role,
      department,
      title: title || `${role.toUpperCase()} in ${department}`,
      hourlyCapacity: Number(hourlyCapacity),
      phone,
      status: 'active',
    });

    setIsAddingUser(false);
    setName('');
    setEmail('');
    setTitle('');
  };

  const handleExecuteReassignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromUserId === toUserId) return;
    reassignAllTasks(fromUserId, toUserId);
    setIsReassigning(false);
  };

  const isManager = currentUser?.role === 'manager';

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-950">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Users size={22} className="text-indigo-400" />
              Team Roster & Workload Balancer
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
              Manager Controls
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Manage team assignments, capacity distribution, and employee task workloads for {activeTenant.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsReassigning(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <ArrowRightLeft size={14} className="text-amber-400" />
            <span>Rebalance Tasks</span>
          </button>

          <button
            onClick={() => setIsAddingUser(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-colors"
          >
            <UserPlus size={14} />
            <span>Add Team Member</span>
          </button>
        </div>
      </div>

      {/* Reassign Tasks Modal */}
      {isReassigning && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-4 max-w-lg animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ArrowRightLeft size={16} className="text-amber-400" />
              Reassign Tasks Bulk Balancer
            </h3>
            <button onClick={() => setIsReassigning(false)} className="text-xs text-slate-400 hover:text-white">
              Cancel
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Transfer all active tickets from an overloaded or absent employee to another team member.
          </p>

          <form onSubmit={handleExecuteReassignment} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Transfer From</label>
                <select
                  value={fromUserId}
                  onChange={(e) => setFromUserId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  {tenantUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Transfer To</label>
                <select
                  value={toUserId}
                  onChange={(e) => setToUserId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  {tenantUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                disabled={fromUserId === toUserId}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50"
              >
                Execute Reassignment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add User Modal */}
      {isAddingUser && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700 space-y-4 max-w-xl animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus size={16} className="text-indigo-400" />
              Onboard Team Member to {activeTenant.name}
            </h3>
            <button onClick={() => setIsAddingUser(false)} className="text-xs text-slate-400 hover:text-white">
              Cancel
            </button>
          </div>

          <form onSubmit={handleAddUser} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Work Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`alex@${activeTenant.domain}`}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="manager">Manager / Admin</option>
                  <option value="lead">Tech Lead / Dept Head</option>
                  <option value="member">Team Member</option>
                  <option value="viewer">Client / Viewer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Engineering / STEM / Sales"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Capacity (Hrs/Wk)</label>
                <input
                  type="number"
                  value={hourlyCapacity}
                  onChange={(e) => setHourlyCapacity(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Title / Designation</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer or Physics Lecturer"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingUser(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
              >
                Add Member
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Workload Balancer Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Staff & Assignees
          </span>
          <div className="text-2xl font-extrabold text-white font-mono">
            {tenantUsers.length}
          </div>
          <span className="text-[10px] text-slate-500">
            Active under {activeTenant.domain}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Active Open Story Points
          </span>
          <div className="text-2xl font-extrabold text-indigo-400 font-mono">
            {tenantTasks.filter(t => t.status !== 'done').reduce((s, t) => s + t.storyPoints, 0)} pts
          </div>
          <span className="text-[10px] text-slate-500">
            Across {tenantTasks.filter(t => t.status !== 'done').length} open tickets
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Capacity Health
          </span>
          <div className="text-2xl font-extrabold text-emerald-400 flex items-center gap-2">
            <CheckCircle size={22} />
            <span>Optimal</span>
          </div>
          <span className="text-[10px] text-slate-500">
            Workload balanced across lead & members
          </span>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers size={16} className="text-slate-400" />
          <span>Staff Directory & Workload Loadout</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {userWorkloadStats.map(({ user, taskCount, openPoints, capacityStatus }) => {
            return (
              <div
                key={user.id}
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{user.name}</span>
                        {user.role === 'manager' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                            Manager
                          </span>
                        )}
                        {user.role === 'lead' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                            Lead
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {user.title} • {user.department}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  {/* Role Changer */}
                  <select
                    value={user.role}
                    onChange={(e: any) => updateUserRole(user.id, e.target.value)}
                    className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-300"
                  >
                    <option value="manager">Manager</option>
                    <option value="lead">Lead</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                {/* Workload Progress Bar */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                      <Clock size={12} />
                      <span>{taskCount} assigned tasks ({openPoints} pts)</span>
                    </span>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      capacityStatus === 'overloaded'
                        ? 'bg-rose-500/20 text-rose-300'
                        : capacityStatus === 'balanced'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {capacityStatus.toUpperCase()}
                    </span>
                  </div>

                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        capacityStatus === 'overloaded'
                          ? 'bg-rose-500'
                          : capacityStatus === 'balanced'
                          ? 'bg-emerald-400'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(100, (openPoints / 16) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
