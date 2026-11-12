import React, { useState } from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { DomainLoginPage } from './components/auth/DomainLoginPage';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { KanbanBoard } from './components/board/KanbanBoard';
import { BacklogView } from './components/board/BacklogView';
import { TableView } from './components/board/TableView';
import { MeetingMinutesHub } from './components/notes/MeetingMinutesHub';
import { TeamManagement } from './components/team/TeamManagement';
import { BrandCustomizer } from './components/brand/BrandCustomizer';
import { DeploymentPackageHub } from './components/deployment/DeploymentPackageHub';
import { TaskModal } from './components/board/TaskModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const MainWorkspaceContent: React.FC = () => {
  const { currentUser, activeView, toastMessage } = useWorkspace();
  const [isCreatingTaskFromHeader, setIsCreatingTaskFromHeader] = useState(false);
  const [isCreatingMeetingFromHeader, setIsCreatingMeetingFromHeader] = useState(false);

  // If user is not logged into any company domain, render the Domain Login Page
  if (!currentUser) {
    return <DomainLoginPage />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Header */}
      <Header
        onOpenCreateTask={() => setIsCreatingTaskFromHeader(true)}
        onOpenCreateMeeting={() => setIsCreatingMeetingFromHeader(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Center Dynamic View */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeView === 'board' && <KanbanBoard />}
          {activeView === 'backlog' && <BacklogView />}
          {activeView === 'table' && <TableView />}
          {activeView === 'notes' && (
            <MeetingMinutesHub initialOpenCreate={isCreatingMeetingFromHeader} />
          )}
          {activeView === 'team' && <TeamManagement />}
          {activeView === 'brand' && <BrandCustomizer />}
          {activeView === 'deployment' && <DeploymentPackageHub />}
        </main>
      </div>

      {/* Global Quick Create Task Modal */}
      {isCreatingTaskFromHeader && (
        <TaskModal
          task={null}
          initialStatus="todo"
          onClose={() => setIsCreatingTaskFromHeader(false)}
        />
      )}

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-xs text-white backdrop-blur-xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <WorkspaceProvider>
      <MainWorkspaceContent />
    </WorkspaceProvider>
  );
}
