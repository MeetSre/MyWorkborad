import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Tenant,
  User,
  Project,
  Sprint,
  Task,
  MeetingNote,
  ActiveView,
  FilterState,
  TaskStatus,
  TaskPriority,
  ActionItem,
  UserRole,
} from '../types';
import {
  INITIAL_TENANTS,
  INITIAL_USERS,
  INITIAL_PROJECTS,
  INITIAL_SPRINTS,
  INITIAL_TASKS,
  INITIAL_MEETINGS,
} from '../data/initialData';

interface WorkspaceContextType {
  // Tenant & Branding
  tenants: Tenant[];
  activeTenant: Tenant;
  updateTenantBrand: (updated: Partial<Tenant>) => void;
  switchTenantByDomain: (domainOrSlug: string) => boolean;
  createTenant: (tenantData: Omit<Tenant, 'id' | 'createdAt'>) => Tenant;

  // Auth / Current User
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  tenantUsers: User[];
  addUser: (userData: Omit<User, 'id'>) => User;
  updateUserRole: (userId: string, role: UserRole) => void;
  reassignAllTasks: (fromUserId: string, toUserId: string) => void;
  loginWithDomain: (emailOrDomain: string) => boolean;
  logout: () => void;

  // Navigation & View
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  activeProject: Project;
  setActiveProject: (proj: Project) => void;
  tenantProjects: Project[];
  createProject: (name: string, description: string, clientName?: string) => Project;

  // Sprints
  sprints: Sprint[];
  activeSprint?: Sprint;
  createSprint: (name: string, goal: string, startDate: string, endDate: string) => Sprint;
  updateSprintStatus: (sprintId: string, status: 'planning' | 'active' | 'completed') => void;

  // Tasks (Jira Board)
  tasks: Task[];
  tenantTasks: Task[];
  projectTasks: Task[];
  createTask: (taskData: Omit<Task, 'id' | 'key' | 'createdAt' | 'updatedAt' | 'tenantId' | 'projectId'>) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  moveTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addComment: (taskId: string, content: string) => void;

  // Meeting Notes & Client Interactions
  meetingNotes: MeetingNote[];
  tenantMeetingNotes: MeetingNote[];
  createMeetingNote: (noteData: Omit<MeetingNote, 'id' | 'createdAt' | 'tenantId' | 'projectId'>) => MeetingNote;
  updateMeetingNote: (noteId: string, updates: Partial<MeetingNote>) => void;
  deleteMeetingNote: (noteId: string) => void;
  convertActionItemToTask: (meetingId: string, actionItem: ActionItem, targetSprintId?: string) => Task;

  // Filtering & Search
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;

  // Offline & Deployment helpers
  isOffline: boolean;
  lastSyncedAt: Date;
  exportDatabaseJSON: () => void;
  importDatabaseJSON: (jsonStr: string) => boolean;
  resetToSampleData: () => void;

  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const STORAGE_KEY = 'omniflow_workspace_state_v1';

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from local storage or fallback to initial data
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_tenants`);
      return saved ? JSON.parse(saved) : INITIAL_TENANTS;
    } catch {
      return INITIAL_TENANTS;
    }
  });

  const [activeTenantId, setActiveTenantId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_activeTenantId`);
      return saved || 'tenant-techcorp';
    } catch {
      return 'tenant-techcorp';
    }
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_currentUserId`);
      return saved !== null ? saved : 'user-tc-1';
    } catch {
      return 'user-tc-1';
    }
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_projects`);
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_activeProjectId`);
      return saved || 'proj-tc-cloud';
    } catch {
      return 'proj-tc-cloud';
    }
  });

  const [sprints, setSprints] = useState<Sprint[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_sprints`);
      return saved ? JSON.parse(saved) : INITIAL_SPRINTS;
    } catch {
      return INITIAL_SPRINTS;
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_tasks`);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_meetings`);
      return saved ? JSON.parse(saved) : INITIAL_MEETINGS;
    } catch {
      return INITIAL_MEETINGS;
    }
  });

  const [activeView, setActiveView] = useState<ActiveView>('board');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    assigneeId: '',
    priority: '',
    tag: '',
    status: '',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_tenants`, JSON.stringify(tenants));
      localStorage.setItem(`${STORAGE_KEY}_activeTenantId`, activeTenantId);
      localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
      localStorage.setItem(`${STORAGE_KEY}_currentUserId`, currentUserId || '');
      localStorage.setItem(`${STORAGE_KEY}_projects`, JSON.stringify(projects));
      localStorage.setItem(`${STORAGE_KEY}_activeProjectId`, activeProjectId);
      localStorage.setItem(`${STORAGE_KEY}_sprints`, JSON.stringify(sprints));
      localStorage.setItem(`${STORAGE_KEY}_tasks`, JSON.stringify(tasks));
      localStorage.setItem(`${STORAGE_KEY}_meetings`, JSON.stringify(meetingNotes));
      setLastSyncedAt(new Date());
    } catch (e) {
      console.warn('Local storage write error', e);
    }
  }, [tenants, activeTenantId, users, currentUserId, projects, activeProjectId, sprints, tasks, meetingNotes]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  const activeTenant = tenants.find(t => t.id === activeTenantId) || tenants[0];

  // Apply theme dynamically to document CSS variables
  useEffect(() => {
    if (!activeTenant) return;
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', activeTenant.primaryColor);
    root.style.setProperty('--brand-accent', activeTenant.accentColor);

    // Compute simple tints
    root.style.setProperty('--brand-primary-light', `${activeTenant.primaryColor}dd`);
    root.style.setProperty('--brand-primary-dark', `${activeTenant.primaryColor}bb`);
  }, [activeTenant]);

  const currentUser = users.find(u => u.id === currentUserId) || null;
  const tenantUsers = users.filter(u => u.tenantId === activeTenant.id);
  const tenantProjects = projects.filter(p => p.tenantId === activeTenant.id);
  
  const activeProject =
    tenantProjects.find(p => p.id === activeProjectId) ||
    tenantProjects[0] ||
    projects[0];

  const tenantTasks = tasks.filter(t => t.tenantId === activeTenant.id);
  const projectTasks = tasks.filter(t => t.tenantId === activeTenant.id && t.projectId === activeProject?.id);
  const tenantMeetingNotes = meetingNotes.filter(m => m.tenantId === activeTenant.id);

  const activeSprint = sprints.find(
    s => s.tenantId === activeTenant.id && s.projectId === activeProject?.id && s.status === 'active'
  );

  const updateTenantBrand = (updated: Partial<Tenant>) => {
    setTenants(prev =>
      prev.map(t => (t.id === activeTenant.id ? { ...t, ...updated } : t))
    );
    showToast(`Updated branding for ${activeTenant.name}`);
  };

  const switchTenantByDomain = (domainOrSlug: string): boolean => {
    const cleaned = domainOrSlug.toLowerCase().trim().replace(/^@/, '');
    const matched = tenants.find(
      t =>
        t.domain.toLowerCase() === cleaned ||
        t.slug.toLowerCase() === cleaned ||
        t.name.toLowerCase().includes(cleaned)
    );
    if (matched) {
      setActiveTenantId(matched.id);
      // Auto-set a project for this tenant
      const proj = projects.find(p => p.tenantId === matched.id);
      if (proj) setActiveProjectId(proj.id);
      // Auto-select a manager or first user in tenant
      const user = users.find(u => u.tenantId === matched.id && u.role === 'manager') ||
                   users.find(u => u.tenantId === matched.id);
      if (user) setCurrentUserId(user.id);
      showToast(`Switched workspace to ${matched.name} (${matched.domain})`);
      return true;
    }
    return false;
  };

  const loginWithDomain = (emailOrDomain: string): boolean => {
    const input = emailOrDomain.trim().toLowerCase();
    let domain = input;
    if (input.includes('@')) {
      domain = input.split('@')[1];
    }

    const matchedTenant = tenants.find(t => t.domain.toLowerCase() === domain || t.slug.toLowerCase() === domain);
    if (matchedTenant) {
      setActiveTenantId(matchedTenant.id);
      // If user typed email, check if user exists
      const matchedUser = users.find(u => u.email.toLowerCase() === input);
      if (matchedUser) {
        setCurrentUserId(matchedUser.id);
      } else {
        // Fallback to first manager in tenant
        const defaultUser = users.find(u => u.tenantId === matchedTenant.id && u.role === 'manager') ||
                            users.find(u => u.tenantId === matchedTenant.id);
        if (defaultUser) setCurrentUserId(defaultUser.id);
      }
      const proj = projects.find(p => p.tenantId === matchedTenant.id);
      if (proj) setActiveProjectId(proj.id);
      showToast(`Welcome to ${matchedTenant.name}!`);
      return true;
    }

    // If domain not recognized, create a new workspace automatically
    const companyName = domain.split('.')[0] ? domain.split('.')[0].toUpperCase() + ' Corp' : 'My Company';
    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      name: companyName,
      domain: domain.includes('.') ? domain : `${domain}.internal`,
      slug: domain.split('.')[0] || 'internal',
      primaryColor: '#3b82f6',
      accentColor: '#10b981',
      slogan: 'Private Enterprise Intranet Workspace',
      industry: 'custom',
      tagline: 'Internal Operations & Team Sprints',
      ticketPrefix: domain.substring(0, 3).toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    const newManager: User = {
      id: `user-${Date.now()}`,
      tenantId: newTenant.id,
      name: 'Workspace Administrator',
      email: input.includes('@') ? input : `admin@${newTenant.domain}`,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      role: 'manager',
      department: 'Executive Operations',
      title: 'Company Administrator',
      hourlyCapacity: 40,
      status: 'active',
    };

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      tenantId: newTenant.id,
      key: newTenant.ticketPrefix,
      name: 'Main Operations & Delivery',
      description: 'Primary internal sprint and project board.',
      leadId: newManager.id,
      color: newTenant.primaryColor,
      status: 'active',
    };

    setTenants(prev => [...prev, newTenant]);
    setUsers(prev => [...prev, newManager]);
    setProjects(prev => [...prev, newProject]);
    setActiveTenantId(newTenant.id);
    setCurrentUserId(newManager.id);
    setActiveProjectId(newProject.id);

    showToast(`Provisioned new workspace for ${newTenant.domain}!`);
    return true;
  };

  const createTenant = (tenantData: Omit<Tenant, 'id' | 'createdAt'>): Tenant => {
    const newTenant: Tenant = {
      ...tenantData,
      id: `tenant-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTenants(prev => [...prev, newTenant]);
    setActiveTenantId(newTenant.id);
    showToast(`Created company workspace "${newTenant.name}"`);
    return newTenant;
  };

  const logout = () => {
    setCurrentUserId(null);
    showToast('Signed out of company workspace');
  };

  const addUser = (userData: Omit<User, 'id'>): User => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
    };
    setUsers(prev => [...prev, newUser]);
    showToast(`Added ${newUser.name} to the team roster`);
    return newUser;
  };

  const updateUserRole = (userId: string, role: UserRole) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role } : u)));
    showToast(`Updated user role to ${role}`);
  };

  const reassignAllTasks = (fromUserId: string, toUserId: string) => {
    const toUser = users.find(u => u.id === toUserId);
    setTasks(prev =>
      prev.map(t => (t.assigneeId === fromUserId && t.tenantId === activeTenant.id ? { ...t, assigneeId: toUserId, updatedAt: new Date().toISOString() } : t))
    );
    showToast(`Reassigned tasks to ${toUser?.name || 'new assignee'}`);
  };

  const createProject = (name: string, description: string, clientName?: string): Project => {
    const prefix = name.split(' ').map(w => w[0]).join('').slice(0, 4).toUpperCase() || 'PRJ';
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      tenantId: activeTenant.id,
      key: prefix,
      name,
      description,
      clientName,
      leadId: currentUser?.id || users[0]?.id || '',
      color: activeTenant.primaryColor,
      status: 'active',
    };
    setProjects(prev => [...prev, newProj]);
    setActiveProjectId(newProj.id);
    showToast(`Created project "${newProj.name}" (${prefix})`);
    return newProj;
  };

  const createSprint = (name: string, goal: string, startDate: string, endDate: string): Sprint => {
    const newSprint: Sprint = {
      id: `sprint-${Date.now()}`,
      tenantId: activeTenant.id,
      projectId: activeProject.id,
      name,
      goal,
      startDate,
      endDate,
      status: 'planning',
    };
    setSprints(prev => [...prev, newSprint]);
    showToast(`Created sprint "${name}"`);
    return newSprint;
  };

  const updateSprintStatus = (sprintId: string, status: 'planning' | 'active' | 'completed') => {
    setSprints(prev =>
      prev.map(s => {
        if (s.id === sprintId) return { ...s, status };
        // If activating this sprint, deactivate others for same project
        if (status === 'active' && s.projectId === activeProject.id && s.id !== sprintId && s.status === 'active') {
          return { ...s, status: 'completed' };
        }
        return s;
      })
    );
    showToast(`Sprint is now ${status}`);
  };

  const createTask = (
    taskData: Omit<Task, 'id' | 'key' | 'createdAt' | 'updatedAt' | 'tenantId' | 'projectId'>
  ): Task => {
    const currentTenantTasks = tasks.filter(t => t.tenantId === activeTenant.id);
    const count = currentTenantTasks.length + 101;
    const key = `${activeTenant.ticketPrefix || activeProject.key || 'TASK'}-${count}`;

    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      key,
      tenantId: activeTenant.id,
      projectId: activeProject.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks(prev => [newTask, ...prev]);
    showToast(`Created ticket ${newTask.key}: "${newTask.title.slice(0, 30)}..."`);
    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
    );
  };

  const moveTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t))
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    showToast('Task deleted');
  };

  const addSubtask = (taskId: string, title: string) => {
    const newSub: { id: string; title: string; completed: boolean } = {
      id: `st-${Date.now()}`,
      title,
      completed: false,
    };
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, subtasks: [...t.subtasks, newSub], updatedAt: new Date().toISOString() } : t))
    );
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.map(st => (st.id === subtaskId ? { ...st, completed: !st.completed } : st)),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const addComment = (taskId: string, content: string) => {
    if (!currentUser) return;
    const newComment = {
      id: `c-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, comments: [...t.comments, newComment], updatedAt: new Date().toISOString() } : t))
    );
    showToast('Comment posted');
  };

  // Meeting Notes
  const createMeetingNote = (
    noteData: Omit<MeetingNote, 'id' | 'createdAt' | 'tenantId' | 'projectId'>
  ): MeetingNote => {
    const newNote: MeetingNote = {
      ...noteData,
      id: `meet-${Date.now()}`,
      tenantId: activeTenant.id,
      projectId: activeProject.id,
      createdAt: new Date().toISOString(),
    };
    setMeetingNotes(prev => [newNote, ...prev]);
    showToast(`Meeting logged: "${newNote.title}"`);
    return newNote;
  };

  const updateMeetingNote = (noteId: string, updates: Partial<MeetingNote>) => {
    setMeetingNotes(prev => prev.map(m => (m.id === noteId ? { ...m, ...updates } : m)));
    showToast('Updated meeting minutes');
  };

  const deleteMeetingNote = (noteId: string) => {
    setMeetingNotes(prev => prev.filter(m => m.id !== noteId));
    showToast('Meeting notes deleted');
  };

  // 1-Click Action Item to Jira Task Converter
  const convertActionItemToTask = (
    meetingId: string,
    actionItem: ActionItem,
    targetSprintId?: string
  ): Task => {
    const meeting = meetingNotes.find(m => m.id === meetingId);
    const assignedUser = actionItem.assigneeId
      ? users.find(u => u.id === actionItem.assigneeId)
      : currentUser || users[0];

    const currentTenantTasks = tasks.filter(t => t.tenantId === activeTenant.id);
    const count = currentTenantTasks.length + 101;
    const key = `${activeTenant.ticketPrefix || 'TASK'}-${count}`;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      key,
      tenantId: activeTenant.id,
      projectId: activeProject.id,
      title: actionItem.text,
      description: `Action item generated from meeting: "${meeting?.title || 'Client Meeting'}" on ${meeting?.date || 'today'}.\n\nClient: ${meeting?.clientName || 'N/A'}\nOriginal Action Point: ${actionItem.text}`,
      status: 'todo',
      priority: 'high',
      assigneeId: assignedUser?.id || currentUser?.id || '',
      reporterId: currentUser?.id || '',
      storyPoints: 3,
      sprintId: targetSprintId || activeSprint?.id,
      tags: ['Meeting-Action', meeting?.clientName ? 'Client' : 'Internal'],
      dueDate: actionItem.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      subtasks: [
        { id: `st-m-${Date.now()}`, title: 'Review meeting context & client requirements', completed: false },
        { id: `st-m2-${Date.now()}`, title: 'Implement agreed action deliverable', completed: false },
      ],
      comments: [
        {
          id: `c-m-${Date.now()}`,
          userId: currentUser?.id || 'system',
          userName: currentUser?.name || 'OmniFlow Meeting Bot',
          userAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          content: `Converted from meeting minutes: [${meeting?.title}]. Assigned to ${assignedUser?.name}.`,
          createdAt: new Date().toISOString(),
        },
      ],
      clientRef: meeting?.clientName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update action item in meeting note
    setMeetingNotes(prev =>
      prev.map(m => {
        if (m.id !== meetingId) return m;
        return {
          ...m,
          actionItems: m.actionItems.map(ai =>
            ai.id === actionItem.id
              ? { ...ai, status: 'converted_to_task', taskIdRef: newTask.id, taskKeyRef: newTask.key }
              : ai
          ),
        };
      })
    );

    setTasks(prev => [newTask, ...prev]);
    showToast(`Converted to ticket ${newTask.key} and placed in To Do!`);
    return newTask;
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      assigneeId: '',
      priority: '',
      tag: '',
      status: '',
    });
  };

  // Export / Import
  const exportDatabaseJSON = () => {
    const data = {
      app: 'OmniFlow Enterprise Suite',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      tenant: activeTenant,
      users: tenantUsers,
      projects: tenantProjects,
      sprints: sprints.filter(s => s.tenantId === activeTenant.id),
      tasks: tenantTasks,
      meetingNotes: tenantMeetingNotes,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `omniflow-backup-${activeTenant.slug}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Workspace backup JSON downloaded');
  };

  const importDatabaseJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.tenant) {
        setTenants(prev => {
          const filtered = prev.filter(t => t.id !== data.tenant.id);
          return [...filtered, data.tenant];
        });
        setActiveTenantId(data.tenant.id);
      }
      if (Array.isArray(data.users)) {
        setUsers(prev => {
          const userIds = new Set(data.users.map((u: User) => u.id));
          return [...prev.filter(u => !userIds.has(u.id)), ...data.users];
        });
      }
      if (Array.isArray(data.tasks)) {
        setTasks(prev => {
          const taskIds = new Set(data.tasks.map((t: Task) => t.id));
          return [...prev.filter(t => !taskIds.has(t.id)), ...data.tasks];
        });
      }
      if (Array.isArray(data.meetingNotes)) {
        setMeetingNotes(prev => {
          const noteIds = new Set(data.meetingNotes.map((m: MeetingNote) => m.id));
          return [...prev.filter(m => !noteIds.has(m.id)), ...data.meetingNotes];
        });
      }
      showToast('Workspace snapshot restored successfully!');
      return true;
    } catch (e) {
      console.error('Import failed', e);
      showToast('Failed to import JSON: Invalid file format');
      return false;
    }
  };

  const resetToSampleData = () => {
    localStorage.clear();
    setTenants(INITIAL_TENANTS);
    setActiveTenantId('tenant-techcorp');
    setUsers(INITIAL_USERS);
    setCurrentUserId('user-tc-1');
    setProjects(INITIAL_PROJECTS);
    setActiveProjectId('proj-tc-cloud');
    setSprints(INITIAL_SPRINTS);
    setTasks(INITIAL_TASKS);
    setMeetingNotes(INITIAL_MEETINGS);
    showToast('Reset to demo enterprise data');
  };

  return (
    <WorkspaceContext.Provider
      value={{
        tenants,
        activeTenant,
        updateTenantBrand,
        switchTenantByDomain,
        createTenant,
        currentUser,
        setCurrentUser: (u) => setCurrentUserId(u?.id || null),
        users,
        tenantUsers,
        addUser,
        updateUserRole,
        reassignAllTasks,
        loginWithDomain,
        logout,
        activeView,
        setActiveView,
        activeProject,
        setActiveProject: (p) => setActiveProjectId(p.id),
        tenantProjects,
        createProject,
        sprints,
        activeSprint,
        createSprint,
        updateSprintStatus,
        tasks,
        tenantTasks,
        projectTasks,
        createTask,
        updateTask,
        moveTaskStatus,
        deleteTask,
        addSubtask,
        toggleSubtask,
        addComment,
        meetingNotes,
        tenantMeetingNotes,
        createMeetingNote,
        updateMeetingNote,
        deleteMeetingNote,
        convertActionItemToTask,
        filters,
        setFilters,
        resetFilters,
        isOffline,
        lastSyncedAt,
        exportDatabaseJSON,
        importDatabaseJSON,
        resetToSampleData,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
