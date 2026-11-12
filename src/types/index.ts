export type UserRole = 'manager' | 'lead' | 'member' | 'viewer';

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type MeetingType = 
  | 'client_discovery' 
  | 'sprint_planning' 
  | 'academic_review' 
  | 'status_standup' 
  | 'contract_negotiation' 
  | 'general';

export type ActionItemStatus = 'pending' | 'in_progress' | 'converted_to_task' | 'completed';

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  department: string;
  title: string;
  hourlyCapacity: number; // e.g. 40 hrs/week
  currentStoryPoints?: number;
  phone?: string;
  status: 'active' | 'away' | 'offline';
}

export interface Tenant {
  id: string;
  name: string;
  domain: string; // e.g. techcorp.io, stanford.edu, oakridge.edu
  slug: string;
  logoUrl?: string;
  logoPreset?: 'tech' | 'academic' | 'school' | 'logistics' | 'custom';
  primaryColor: string; // hex
  accentColor: string; // hex
  slogan: string;
  industry: 'software' | 'college' | 'school' | 'enterprise' | 'custom';
  tagline: string;
  ticketPrefix: string; // e.g. "TC", "STAN", "OAK", "APX"
  createdAt: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  assigneeId?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  key: string; // e.g. "TC-101"
  tenantId: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  reporterId: string;
  storyPoints: number;
  sprintId?: string;
  tags: string[];
  dueDate: string; // YYYY-MM-DD
  subtasks: SubTask[];
  comments: Comment[];
  clientRef?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActionItem {
  id: string;
  text: string;
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: string;
  status: ActionItemStatus;
  taskIdRef?: string;
  taskKeyRef?: string;
}

export interface MeetingNote {
  id: string;
  tenantId: string;
  projectId: string;
  title: string;
  clientName: string;
  clientContact?: string;
  date: string;
  durationMinutes: number;
  meetingType: MeetingType;
  attendees: string[]; // names or emails
  agenda: string;
  discussion: string;
  decisions: string[];
  actionItems: ActionItem[];
  tags: string[];
  createdAt: string;
}

export interface Project {
  id: string;
  tenantId: string;
  key: string; // Prefix, e.g. "TC"
  name: string;
  description: string;
  clientName?: string;
  leadId: string;
  color: string;
  status: 'active' | 'archived' | 'planning';
}

export interface Sprint {
  id: string;
  tenantId: string;
  projectId: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed';
}

export type ActiveView = 
  | 'board' 
  | 'backlog' 
  | 'table' 
  | 'notes' 
  | 'team' 
  | 'brand' 
  | 'deployment'
  | 'settings';

export interface FilterState {
  search: string;
  assigneeId: string;
  priority: string;
  tag: string;
  status: string;
}
