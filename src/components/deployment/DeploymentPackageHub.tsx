import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { 
  Package, 
  Server, 
  Database, 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  MessageSquareCode, 
  Mail, 
  PhoneCall, 
  Globe, 
  FileCode,
  HardDrive,
  DollarSign,
  TrendingUp,
  Briefcase,
  Layers,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Cpu,
  CheckCircle2,
  Share2
} from 'lucide-react';

export const DeploymentPackageHub: React.FC = () => {
  const { 
    activeTenant, 
    exportDatabaseJSON, 
    importDatabaseJSON, 
    resetToSampleData, 
    showToast 
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<
    'sales_strategy' | 'compare_matrix' | 'intranet' | 'vercel' | 'supabase' | 'twilio' | 'resend' | 'backup'
  >('sales_strategy');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Commercial ROI & Pricing Calculator state
  const [clientCount, setClientCount] = useState(15);
  const [monthlySaaSPrice, setMonthlySaaSPrice] = useState(39);
  const [onPremSetupPrice, setOnPremSetupPrice] = useState(499);
  const [annualSupportPrice, setAnnualSupportPrice] = useState(588); // $49/mo
  const [businessModel, setBusinessModel] = useState<'saas' | 'onprem' | 'hybrid'>('hybrid');

  // Pitch template sector
  const [pitchSector, setPitchSector] = useState<'it' | 'school' | 'logistics' | 'clinic'>('it');

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          importDatabaseJSON(content);
        }
      };
      reader.readAsText(file);
    }
  };

  // Calculations for revenue
  const monthlySaaSRecurring = clientCount * monthlySaaSPrice;
  const annualSaaSRecurring = monthlySaaSRecurring * 12;
  const onPremInitialRevenue = clientCount * onPremSetupPrice;
  const onPremAnnualMaintenance = clientCount * annualSupportPrice;

  // 1. Dockerfile & docker-compose.yml for private intranet
  const dockerComposeContent = `version: '3.8'

services:
  omniflow-app:
    image: omniflow-enterprise:latest
    build:
      context: .
      dockerfile: Dockerfile
    container_name: omniflow-${activeTenant.slug}
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - TENANT_DOMAIN=${activeTenant.domain}
      - OFFLINE_MODE=true
      - PORT=3000
    volumes:
      - omniflow_data:/app/data
    networks:
      - internal_lan

volumes:
  omniflow_data:
    driver: local

networks:
  internal_lan:
    driver: bridge
`;

  const dockerfileContent = `# Multi-stage lightweight Dockerfile for Air-Gapped Intranet
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3000
CMD ["npx", "serve", "-s", "dist", "-l", "3000"]
`;

  // 2. Vercel vercel.json
  const vercelJsonContent = `{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
`;

  // 3. Supabase SQL Schema
  const supabaseSqlContent = `-- =========================================================
-- OmniFlow Enterprise Database Schema (Supabase / Postgres)
-- Multi-Tenant Isolation with Row Level Security (RLS)
-- Organization: ${activeTenant.name} (${activeTenant.domain})
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tenants Table
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    primary_color TEXT DEFAULT '#4f46e5',
    accent_color TEXT DEFAULT '#06b6d4',
    logo_url TEXT,
    industry TEXT DEFAULT 'software',
    ticket_prefix TEXT DEFAULT 'TC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('manager', 'lead', 'member', 'viewer')) DEFAULT 'member',
    department TEXT,
    title TEXT,
    hourly_capacity INT DEFAULT 40,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    client_name TEXT,
    lead_id UUID REFERENCES public.users(id),
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tasks Table (Jira Board)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('backlog', 'todo', 'in_progress', 'review', 'done', 'blocked')) DEFAULT 'todo',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    assignee_id UUID REFERENCES public.users(id),
    reporter_id UUID REFERENCES public.users(id),
    story_points INT DEFAULT 3,
    due_date DATE,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    client_ref TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Meeting Notes Table
CREATE TABLE IF NOT EXISTS public.meeting_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_contact TEXT,
    date DATE NOT NULL,
    duration_minutes INT DEFAULT 45,
    meeting_type TEXT DEFAULT 'client_discovery',
    attendees TEXT[] DEFAULT ARRAY[]::TEXT[],
    agenda TEXT,
    discussion TEXT,
    decisions TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Row-Level Security Policies (Tenant Isolation)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read their own tenant data"
ON public.tasks
FOR ALL
USING (
  tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
);
`;

  // 4. Twilio SMS Dispatcher
  const twilioSnippetContent = `// Twilio SMS Alert Module for Urgent Task Escalations
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export async function sendUrgentTaskAlert(managerPhone: string, taskKey: string, taskTitle: string) {
  try {
    const message = await client.messages.create({
      body: \`🚨 [OmniFlow Alert] Urgent ticket \${taskKey} assigned: "\${taskTitle}". View board: https://${activeTenant.domain}\`,
      from: fromNumber,
      to: managerPhone,
    });
    console.log(\`Twilio SMS dispatched SID: \${message.sid}\`);
    return { success: true, sid: message.sid };
  } catch (err) {
    console.error('Twilio SMS error:', err);
    throw err;
  }
}
`;

  // 5. Resend Email Snippet
  const resendSnippetContent = `// Resend Transactional Email Notification Pipeline
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTaskAssignedEmail(toEmail: string, userName: string, taskKey: string, taskTitle: string) {
  return await resend.emails.send({
    from: '${activeTenant.name} <notifications@${activeTenant.domain}>',
    to: [toEmail],
    subject: \`[OmniFlow] You have been assigned ticket \${taskKey}\`,
    html: \`
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: ${activeTenant.primaryColor}; margin-top: 0;">New Task Assignment</h2>
        <p>Hi <strong>\${userName}</strong>,</p>
        <p>You were assigned ticket <strong style="color: ${activeTenant.primaryColor};">\${taskKey}</strong>:</p>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid ${activeTenant.primaryColor};">
          <h3 style="margin: 0 0 8px 0; color: #0f172a;">\${taskTitle}</h3>
          <p style="margin: 0; color: #64748b; font-size: 14px;">Organization: ${activeTenant.name}</p>
        </div>
        <a href="https://${activeTenant.domain}" style="display: inline-block; background-color: ${activeTenant.primaryColor}; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
          Open Jira Board
        </a>
      </div>
    \`,
  });
}
`;

  // Ready Client Sales Proposals per sector
  const proposals = {
    it: {
      headline: 'Replace $7–$15/user/mo Jira or Asana with Private Dedicated Boards',
      body: `Subject: Smarter Agile Boards & Meeting Management for [Company Name]

Hi [Decision Maker Name],

Most growing software teams pay $1,200 to $4,000+ per year for bloated Jira or Asana subscriptions, yet still juggle meeting minutes and client notes in scattered Google Docs.

OmniFlow provides your engineering team with:
1. High-speed Kanban, Sprints & Backlog with Story Points.
2. Built-in Meeting Minutes Hub that turns client action items into Jira tickets with 1 click.
3. 100% Data Sovereignty: Host it on your own private server (Docker) or your secure cloud domain ([company].internal).
4. Full Brand Customization: Automatically loads your corporate logo, custom hex colors, and domain login.

We offer a flat team license (no per-seat penalties). Would you be open to a 10-minute demo this Thursday?

Best regards,
[Your Name] | OmniFlow Commercial Solutions`,
    },
    school: {
      headline: 'Campus-Wide Project Boards & Faculty Meeting Tracking',
      body: `Subject: Simplified Faculty Task Tracking & Meeting Minutes for [School Name]

Dear Principal / Department Chair [Name],

Managing curriculum rollouts, STEM lab equipment, and parent-teacher council meeting minutes across different departments is often cumbersome and expensive.

OmniFlow is specifically packaged for schools and colleges:
1. Faculty & Staff Boards: Track lab setups, term milestones, and academic projects.
2. Meeting Minutes & Action Items: Log school board & PTA meetings, and convert agreed deliverables directly into staff tasks with 1 click.
3. Air-Gapped Campus LAN Ready: Runs 100% offline inside your school’s local network without requiring external internet or student privacy risks.
4. Custom School Identity: Features your school emblem, crest, colors, and campus domain.

We provide turn-key installation on your school server for a one-time setup of $499 with no ongoing per-student fees.

Can we set up a brief walkthrough for your administrative team?

Warm regards,
[Your Name]`,
    },
    logistics: {
      headline: 'Field Operations & Fleet Sprints for Non-IT Businesses',
      body: `Subject: Operations & Compliance Task Management for [Business Name]

Hi [Operations Director Name],

Non-IT companies often find Jira too complicated and Trello too basic. OmniFlow gives operations managers a clear command center:

1. Fleet & Field Dispatch Boards: Track DOT inspections, route optimization, and equipment maintenance.
2. Client & Vendor Notes: Document contract reviews and client requirements, turning agreement action points into active dispatch tasks.
3. Works 100% Offline: Operates seamlessly in maritime ports, warehouses, or remote depots without internet.
4. Manager Capacity Balancer: Reassign tasks across drivers and technicians with one click.

We offer a complete turnkey package installed directly on your office hardware or private cloud.

Let's connect for 10 minutes to show you how easy it is to operate.

Sincerely,
[Your Name]`,
    },
    clinic: {
      headline: 'HIPAA / Data-Secure Local Intranet Task Management',
      body: `Subject: Private Intranet Task Tracking & Meeting Minutes for [Clinic Name]

Dear Practice Manager [Name],

Healthcare and professional clinics face stringent data residency requirements and cannot easily store internal staff operations on public US clouds.

OmniFlow solves this with our Air-Gapped Private Local Server package:
1. 100% Local LAN: Zero patient/staff operational data leaves your local office network.
2. Staff & Clinic Workload Balancer: Schedule equipment calibrations, supply restocking, and staff shifts.
3. Meeting Minutes Hub: Log clinical committee decisions and compliance action items.

Installed directly on your local clinic workstation or NAS. Would you like to see a live local demo?

Best regards,
[Your Name]`,
    },
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-950">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package size={22} className="text-emerald-400" />
            Commercial Sales & Deployment Hub
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-semibold">
            Ready to Sell & Scale
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Everything you need to package, host, price, and sell OmniFlow to small businesses, schools, colleges, and enterprise clients.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'sales_strategy', label: 'Commercial Sales Engine & ROI', icon: DollarSign },
          { id: 'compare_matrix', label: 'Hosting & Tech Comparison', icon: Layers },
          { id: 'vercel', label: 'Vercel 1-Click Deploy', icon: Globe },
          { id: 'supabase', label: 'Supabase SQL Schema', icon: Database },
          { id: 'intranet', label: 'Local Intranet (Docker Offline)', icon: HardDrive },
          { id: 'twilio', label: 'Twilio SMS Alerts', icon: PhoneCall },
          { id: 'resend', label: 'Resend Email Templates', icon: Mail },
          { id: 'backup', label: 'Data Backup (JSON)', icon: Download },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-emerald-400' : 'text-slate-500'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: COMMERCIAL SALES STRATEGY & PRICING ENGINE */}
      {activeTab === 'sales_strategy' && (
        <div className="space-y-8 max-w-5xl animate-in fade-in">
          
          {/* Top Pitch Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <TrendingUp size={16} />
              <span>Small Business & Institutional Sales Playbook</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              3 High-Margin Ways to Sell OmniFlow to Small Businesses
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Jira charges $7.75/user/month and lacks meeting minutes, while Asana charges $10.99/user/month. Small businesses (10–50 employees) and schools hate per-seat monthly price gouging. With OmniFlow, you can offer flat-rate pricing with 85%+ net margins.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wide">
                  Model 1: Managed Cloud SaaS
                </div>
                <div className="text-lg font-black text-white font-mono">$29 – $49<span className="text-xs font-normal text-slate-400">/mo per company</span></div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Host it for them on Vercel + Supabase. You handle hosting and charge a flat recurring fee with 0 server maintenance.
                </p>
                <div className="text-[10px] text-emerald-400 font-medium">95% Gross Profit Margin</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                  Model 2: Air-Gapped On-Premise
                </div>
                <div className="text-lg font-black text-white font-mono">$499<span className="text-xs font-normal text-slate-400"> setup</span> + $49<span className="text-xs font-normal text-slate-400">/mo</span></div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  For schools, local clinics, and port/logistics depots. Install via Docker on their local PC or office server.
                </p>
                <div className="text-[10px] text-emerald-400 font-medium">Zero Cloud Egress • 100% Privacy</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-purple-400 uppercase tracking-wide">
                  Model 3: White-Label Agency Package
                </div>
                <div className="text-lg font-black text-white font-mono">$999 – $1,500<span className="text-xs font-normal text-slate-400"> turnkey</span></div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  White-label rebrand with their custom domain, logo, and brand colors. Deliver as their proprietary internal employee portal.
                </p>
                <div className="text-[10px] text-emerald-400 font-medium">High Upfront Cash Flow</div>
              </div>
            </div>
          </div>

          {/* Interactive Pricing & Revenue Calculator */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign size={18} className="text-emerald-400" />
                  Commercial Revenue & Profit Calculator
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Simulate your recurring subscription and setup revenue by selling to local businesses.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {(['hybrid', 'saas', 'onprem'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setBusinessModel(mode)}
                    className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                      businessModel === mode ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Number of Small Business Clients: <strong className="text-emerald-400 font-mono text-sm">{clientCount}</strong>
                </label>
                <input
                  type="range"
                  min="2"
                  max="100"
                  value={clientCount}
                  onChange={(e) => setClientCount(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>2 clients</span>
                  <span>50 clients</span>
                  <span>100 clients</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Monthly SaaS Fee / Client: <strong className="text-cyan-400 font-mono text-sm">${monthlySaaSPrice}/mo</strong>
                </label>
                <input
                  type="range"
                  min="19"
                  max="99"
                  step="5"
                  value={monthlySaaSPrice}
                  onChange={(e) => setMonthlySaaSPrice(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>$19/mo</span>
                  <span>$49/mo</span>
                  <span>$99/mo</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  On-Prem Setup Fee / Client: <strong className="text-amber-400 font-mono text-sm">${onPremSetupPrice}</strong>
                </label>
                <input
                  type="range"
                  min="299"
                  max="1499"
                  step="50"
                  value={onPremSetupPrice}
                  onChange={(e) => setOnPremSetupPrice(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>$299</span>
                  <span>$799</span>
                  <span>$1,499</span>
                </div>
              </div>
            </div>

            {/* Projected Revenue Results */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Monthly Recurring Revenue (MRR)
                </div>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                  ${monthlySaaSRecurring.toLocaleString()}
                  <span className="text-xs font-normal text-slate-400">/mo</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Predictable cash flow</div>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Annual Recurring Revenue (ARR)
                </div>
                <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
                  ${annualSaaSRecurring.toLocaleString()}
                  <span className="text-xs font-normal text-slate-400">/yr</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Recurring SaaS value</div>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Upfront Setup Revenue
                </div>
                <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                  ${onPremInitialRevenue.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Immediate capital generated</div>
              </div>
            </div>
          </div>

          {/* Copy-Paste Outreach & Sales Pitch Templates */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Share2 size={16} className="text-cyan-400" />
                  Ready-to-Send Client Pitch & Cold Email Template
                </h4>
                <p className="text-xs text-slate-400">
                  Select your target niche, copy the email, and send to prospects.
                </p>
              </div>

              {/* Sector selector */}
              <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {[
                  { id: 'it', label: 'Small IT Firms' },
                  { id: 'school', label: 'Schools & Colleges' },
                  { id: 'logistics', label: 'Logistics & Fleets' },
                  { id: 'clinic', label: 'Medical Clinics' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setPitchSector(item.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      pitchSector === item.id ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300">
                  {proposals[pitchSector].headline}
                </span>
                <button
                  onClick={() => handleCopy('pitch', proposals[pitchSector].body)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
                >
                  {copiedKey === 'pitch' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedKey === 'pitch' ? 'Copied' : 'Copy Pitch Email'}</span>
                </button>
              </div>
              <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                {proposals[pitchSector].body}
              </pre>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: HOSTING & TECH COMPARISON MATRIX */}
      {activeTab === 'compare_matrix' && (
        <div className="space-y-6 max-w-5xl animate-in fade-in">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers size={18} className="text-cyan-400" />
              How Should You Host It? Vercel + Supabase vs. VPS vs. Air-Gapped Intranet
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Here is the exact technical breakdown to help you decide which infrastructure to use depending on how you plan to sell and package the software.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Vercel + Supabase */}
            <div className="p-5 rounded-2xl bg-slate-900 border-2 border-indigo-500/50 space-y-4 shadow-xl relative">
              <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">
                Recommended for Fast SaaS
              </div>
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe size={18} className="text-indigo-400" />
                  Vercel + Supabase
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Managed multi-tenant cloud SaaS
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Setup Time:</strong> 5 minutes (zero server config)</span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Hosting Cost:</strong> $0 on free tier, $20/mo Pro for unlimited scaling</span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Security:</strong> Built-in Postgres Row-Level Security (RLS) isolates each tenant automatically</span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Custom Domains:</strong> Instant SSL on <code>board.clientdomain.com</code></span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-300">
                <strong>Best For:</strong> Selling recurring monthly subscriptions to modern IT agencies, startups, and remote teams.
              </div>

              <button
                onClick={() => setActiveTab('vercel')}
                className="w-full py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Vercel & Supabase Config</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Coolify / VPS */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Server size={18} className="text-cyan-400" />
                  Coolify / Hetzner / DigitalOcean
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Self-hosted PaaS on a $5–$10/mo VPS
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Setup Time:</strong> 15 minutes via Coolify 1-click Docker</span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Hosting Cost:</strong> Flat $5 to $10/mo for 100+ clients</span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Data Privacy:</strong> 100% GDPR compliant European or local server location</span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Control:</strong> Full root SSH, automated database backups</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-300">
                <strong>Best For:</strong> Resellers who want maximum profit margins and complete independence from US cloud vendors.
              </div>

              <button
                onClick={() => setActiveTab('intranet')}
                className="w-full py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Docker Compose YAML</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Air-Gapped Local LAN Server */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <HardDrive size={18} className="text-amber-400" />
                  Air-Gapped Local Network
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Synology NAS, Windows PC, or Mac Mini
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Setup Time:</strong> 10 minutes on office LAN</span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Hosting Cost:</strong> $0 recurring cloud bills forever</span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Internet Required:</strong> Zero. Operates 100% offline</span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Compliance:</strong> Meets strictest educational, clinical, and maritime security mandates</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-300">
                <strong>Best For:</strong> Schools, universities, local factories, warehouses, and medical clinics.
              </div>

              <button
                onClick={() => setActiveTab('intranet')}
                className="w-full py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Intranet Package</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LOCAL INTRANET DOCKER */}
      {activeTab === 'intranet' && (
        <div className="space-y-6 max-w-4xl animate-in fade-in">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <ShieldCheck size={18} className="text-emerald-400" />
              Air-Gapped Private LAN Intranet Installation
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designed for schools, colleges, and enterprise companies operating internal servers with strict data residency. No external cloud egress required.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 font-mono">
                docker-compose.yml
              </span>
              <button
                onClick={() => handleCopy('docker-compose', dockerComposeContent)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
              >
                {copiedKey === 'docker-compose' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copiedKey === 'docker-compose' ? 'Copied' : 'Copy Compose YAML'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
              {dockerComposeContent}
            </pre>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 font-mono">
                Dockerfile (Multi-Stage)
              </span>
              <button
                onClick={() => handleCopy('dockerfile', dockerfileContent)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
              >
                {copiedKey === 'dockerfile' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copiedKey === 'dockerfile' ? 'Copied' : 'Copy Dockerfile'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
              {dockerfileContent}
            </pre>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Terminal size={14} className="text-indigo-400" />
              Quick Intranet Terminal Command:
            </span>
            <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-xs text-amber-300 flex items-center justify-between">
              <span>docker compose up -d --build</span>
              <button
                onClick={() => handleCopy('cmd', 'docker compose up -d --build')}
                className="text-slate-400 hover:text-white"
              >
                <Copy size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VERCEL */}
      {activeTab === 'vercel' && (
        <div className="space-y-6 max-w-4xl animate-in fade-in">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Globe size={18} className="text-sky-400" />
              5-Minute Vercel Deployment Checklist
            </div>
            <p className="text-xs text-slate-400">
              Deploy to Vercel with automatic HTTPS, edge CDN, and company custom domain routing (e.g., <code>board.{activeTenant.domain}</code>).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Deployment Steps for Vercel
            </h4>
            <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2 leading-relaxed">
              <li>Push this codebase to a private GitHub / GitLab repository.</li>
              <li>Log in to <strong className="text-white">vercel.com</strong> and click <strong>Add New &gt; Project</strong>.</li>
              <li>Import your repository. Framework preset will automatically detect <strong>Vite</strong>.</li>
              <li>Under <strong>Environment Variables</strong>, enter your Supabase / Twilio / Resend API keys.</li>
              <li>Click <strong>Deploy</strong>. In 45 seconds, your platform will be live with a global CDN!</li>
              <li>Go to <strong>Settings &gt; Domains</strong> to attach your client's custom domain (e.g. <code>work.{activeTenant.domain}</code>).</li>
            </ol>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 font-mono">vercel.json</span>
              <button
                onClick={() => handleCopy('vercel', vercelJsonContent)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
              >
                {copiedKey === 'vercel' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copiedKey === 'vercel' ? 'Copied' : 'Copy vercel.json'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-sky-300 overflow-x-auto leading-relaxed">
              {vercelJsonContent}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 5: SUPABASE SQL */}
      {activeTab === 'supabase' && (
        <div className="space-y-6 max-w-4xl animate-in fade-in">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Database size={18} className="text-emerald-400" />
              Supabase PostgreSQL Migration & RLS Security Script
            </div>
            <p className="text-xs text-slate-400">
              Complete production SQL with Row-Level Security policies ensuring strict tenant data isolation.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 font-mono">
                supabase/migrations/01_omniflow_schema.sql
              </span>
              <button
                onClick={() => handleCopy('supabase', supabaseSqlContent)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
              >
                {copiedKey === 'supabase' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copiedKey === 'supabase' ? 'Copied' : 'Copy SQL Schema'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-96 leading-relaxed">
              {supabaseSqlContent}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 6: TWILIO */}
      {activeTab === 'twilio' && (
        <div className="space-y-6 max-w-4xl animate-in fade-in">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <PhoneCall size={18} className="text-rose-400" />
              Twilio SMS Critical Alerts for Managers
            </div>
            <p className="text-xs text-slate-400">
              Trigger SMS alerts to management when an urgent production blocker is marked or a task deadline is at risk.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 font-mono">server/twilioService.ts</span>
              <button
                onClick={() => handleCopy('twilio', twilioSnippetContent)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
              >
                {copiedKey === 'twilio' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copiedKey === 'twilio' ? 'Copied' : 'Copy Twilio Code'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-300 overflow-x-auto leading-relaxed">
              {twilioSnippetContent}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 7: RESEND */}
      {activeTab === 'resend' && (
        <div className="space-y-6 max-w-4xl animate-in fade-in">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Mail size={18} className="text-purple-400" />
              Resend Transactional Email Templates
            </div>
            <p className="text-xs text-slate-400">
              White-labeled HTML emails styled with your company's primary color ({activeTenant.primaryColor}) for task assignments and meeting digests.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 font-mono">server/resendService.ts</span>
              <button
                onClick={() => handleCopy('resend', resendSnippetContent)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
              >
                {copiedKey === 'resend' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copiedKey === 'resend' ? 'Copied' : 'Copy Resend Code'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-purple-300 overflow-x-auto leading-relaxed">
              {resendSnippetContent}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 8: BACKUP & RESTORE */}
      {activeTab === 'backup' && (
        <div className="space-y-6 max-w-2xl animate-in fade-in">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Download size={16} className="text-indigo-400" />
              Download Database Snapshot
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export all tasks, subtasks, meeting notes, action items, team members, and brand settings for <strong>{activeTenant.name}</strong> as an air-gapped JSON file.
            </p>
            <button
              onClick={exportDatabaseJSON}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-colors"
            >
              <Download size={14} />
              <span>Export Workspace JSON Snapshot</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Upload size={16} className="text-cyan-400" />
              Restore Database Snapshot
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Load an existing snapshot JSON from another server or workstation.
            </p>
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer transition-colors">
              <Upload size={14} />
              <span>Select Backup JSON File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>

          <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/20 space-y-3">
            <h3 className="text-sm font-bold text-red-300 flex items-center gap-2">
              <RotateCcw size={16} />
              Reset Demo Data
            </h3>
            <p className="text-xs text-slate-400">
              Clear local changes and restore original preset data across all 4 industry tenants.
            </p>
            <button
              onClick={() => {
                if (confirm('Reset to initial demo dataset?')) {
                  resetToSampleData();
                }
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-red-300 bg-red-950/40 hover:bg-red-900/40 border border-red-800/40 transition-colors"
            >
              Reset to Factory Demo State
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
