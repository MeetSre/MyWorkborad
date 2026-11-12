import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { MeetingNote, MeetingType, ActionItem } from '../../types';
import { 
  FileText, 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Building, 
  Share2, 
  Printer, 
  Tag, 
  Trash2,
  ExternalLink,
  Search
} from 'lucide-react';

interface MeetingMinutesHubProps {
  initialOpenCreate?: boolean;
}

export const MeetingMinutesHub: React.FC<MeetingMinutesHubProps> = ({ initialOpenCreate = false }) => {
  const { 
    tenantMeetingNotes, 
    activeProject, 
    activeTenant, 
    tenantUsers, 
    createMeetingNote, 
    updateMeetingNote, 
    deleteMeetingNote,
    convertActionItemToTask,
    currentUser,
    activeSprint,
    showToast
  } = useWorkspace();

  const [selectedNote, setSelectedNote] = useState<MeetingNote | null>(
    tenantMeetingNotes[0] || null
  );
  const [isCreating, setIsCreating] = useState(initialOpenCreate);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Form states for creating a new meeting note
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState(activeProject?.clientName || '');
  const [clientContact, setClientContact] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [meetingType, setMeetingType] = useState<MeetingType>('client_discovery');
  const [attendeesStr, setAttendeesStr] = useState(
    `${currentUser?.name || 'Manager'}, ${tenantUsers[1]?.name || 'Tech Lead'}, Client Stakeholder`
  );
  const [agenda, setAgenda] = useState('1. Project timeline & key deliverables\n2. Technical scope & compliance requirements\n3. Client sign-off criteria');
  const [discussion, setDiscussion] = useState('');
  const [decisionsStr, setDecisionsStr] = useState('Approved initial specifications and agreed on sprint review timeline.');
  const [actionItemInputs, setActionItemInputs] = useState<string[]>([
    'Package deployment instructions for local offline server',
    'Verify client branding color codes and logo assets'
  ]);
  const [tagsStr, setTagsStr] = useState('Client, Review, Sprint');

  const filteredNotes = tenantMeetingNotes.filter(n => {
    if (filterType !== 'all' && n.meetingType !== filterType) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.clientName.toLowerCase().includes(q) ||
      n.discussion.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    );
  });

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const attendees = attendeesStr.split(',').map(s => s.trim()).filter(Boolean);
    const decisions = decisionsStr.split('\n').map(s => s.trim()).filter(Boolean);
    const tags = tagsStr.split(',').map(s => s.trim()).filter(Boolean);

    const actionItems: ActionItem[] = actionItemInputs
      .filter(text => text.trim())
      .map((text, idx) => ({
        id: `ai-${Date.now()}-${idx}`,
        text: text.trim(),
        assigneeId: tenantUsers[idx % tenantUsers.length]?.id,
        assigneeName: tenantUsers[idx % tenantUsers.length]?.name,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: 'pending',
      }));

    const newNote = createMeetingNote({
      title,
      clientName: clientName || 'Internal Client',
      clientContact,
      date,
      durationMinutes: Number(durationMinutes),
      meetingType,
      attendees,
      agenda,
      discussion,
      decisions,
      actionItems,
      tags,
    });

    setSelectedNote(newNote);
    setIsCreating(false);
    // Reset form
    setTitle('');
    setDiscussion('');
  };

  const handleConvertActionItem = (actionItem: ActionItem) => {
    if (!selectedNote) return;
    convertActionItemToTask(selectedNote.id, actionItem, activeSprint?.id);
    // Refresh selected note view
    setTimeout(() => {
      setSelectedNote(prev => {
        if (!prev) return null;
        return {
          ...prev,
          actionItems: prev.actionItems.map(ai => 
            ai.id === actionItem.id 
              ? { ...ai, status: 'converted_to_task', taskKeyRef: `${activeTenant.ticketPrefix}-NEW` } 
              : ai
          ),
        };
      });
    }, 100);
  };

  const printMeetingMinutes = () => {
    window.print();
  };

  const copyMarkdownRecap = () => {
    if (!selectedNote) return;
    const md = `# Meeting Minutes: ${selectedNote.title}
**Date:** ${selectedNote.date} | **Duration:** ${selectedNote.durationMinutes} min
**Client / Stakeholder:** ${selectedNote.clientName} ${selectedNote.clientContact ? `(${selectedNote.clientContact})` : ''}
**Attendees:** ${selectedNote.attendees.join(', ')}

## Agenda
${selectedNote.agenda}

## Discussion & Meeting Notes
${selectedNote.discussion}

## Key Decisions
${selectedNote.decisions.map(d => `- ${d}`).join('\n')}

## Action Items
${selectedNote.actionItems.map(a => `- [${a.status === 'completed' ? 'x' : ' '}] ${a.text} (Assignee: ${a.assigneeName || 'Unassigned'})`).join('\n')}
`;
    navigator.clipboard.writeText(md);
    showToast('Copied formatted Markdown recap to clipboard!');
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-slate-950">
      
      {/* Left Column: Meeting Notes List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0">
        
        {/* Header & New Note Button */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <FileText size={16} className="text-cyan-400" />
                <span>Meeting Minutes & Notes</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Client interactions & meeting outcomes
              </p>
            </div>

            <button
              onClick={() => setIsCreating(true)}
              className="p-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition-colors"
              title="Log New Meeting Minutes"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by title, client, or tag..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Type filter */}
          <div className="flex gap-1 overflow-x-auto pb-1 text-[10px]">
            {['all', 'client_discovery', 'sprint_planning', 'academic_review'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2 py-1 rounded-lg capitalize whitespace-nowrap transition-colors ${
                  filterType === type 
                    ? 'bg-slate-800 text-cyan-400 font-semibold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Scrollable List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
          {filteredNotes.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No meeting logs match search criteria.
            </div>
          ) : (
            filteredNotes.map(note => {
              const isSelected = selectedNote?.id === note.id;
              const pendingActions = note.actionItems.filter(a => a.status === 'pending').length;

              return (
                <div
                  key={note.id}
                  onClick={() => {
                    setSelectedNote(note);
                    setIsCreating(false);
                  }}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500/50 shadow-md'
                      : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                    <span className="font-mono flex items-center gap-1">
                      <Calendar size={11} />
                      {note.date}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 capitalize text-[9px] font-mono">
                      {note.meetingType.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white line-clamp-1 mb-1">
                    {note.title}
                  </h3>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-2">
                    <Building size={11} className="text-cyan-400 shrink-0" />
                    <span className="truncate">{note.clientName}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800/60">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock size={10} />
                      {note.durationMinutes}m
                    </span>

                    {pendingActions > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono text-[9px]">
                        {pendingActions} action item{pendingActions > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Note Detail or Creator Form */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
        {isCreating ? (
          /* Form for creating new meeting note */
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <FileText size={20} className="text-cyan-400" />
                  Log Meeting Minutes & Client Interaction
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Document conversation, key decisions, and action items that turn into Jira tickets.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q4 SLA Review & Air-Gapped Deployment Sign-off"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Client / Organization Name
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Vanguard Logistics"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Meeting Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Meeting Type
                  </label>
                  <select
                    value={meetingType}
                    onChange={(e: any) => setMeetingType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="client_discovery">Client Discovery / Demo</option>
                    <option value="sprint_planning">Sprint Planning / Standup</option>
                    <option value="academic_review">Academic Committee / Lab</option>
                    <option value="contract_negotiation">Contract & Terms</option>
                    <option value="general">General Team Sync</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Attendees (comma separated)
                </label>
                <input
                  type="text"
                  value={attendeesStr}
                  onChange={(e) => setAttendeesStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Meeting Agenda
                </label>
                <textarea
                  rows={2}
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Discussion Notes & Client Feedback
                </label>
                <textarea
                  rows={4}
                  value={discussion}
                  onChange={(e) => setDiscussion(e.target.value)}
                  placeholder="Summarize key points discussed, client feedback, technical constraints..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Key Decisions (one per line)
                </label>
                <textarea
                  rows={2}
                  value={decisionsStr}
                  onChange={(e) => setDecisionsStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              {/* Action items */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400">
                  Action Items (Turn these into Jira tasks later)
                </label>
                {actionItemInputs.map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const copy = [...actionItemInputs];
                        copy[idx] = e.target.value;
                        setActionItemInputs(copy);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setActionItemInputs(prev => prev.filter((_, i) => i !== idx))}
                      className="px-2 text-slate-500 hover:text-red-400 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setActionItemInputs(prev => [...prev, ''])}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-1"
                >
                  <Plus size={12} />
                  <span>Add Action Item</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md"
                >
                  Save Meeting Minutes
                </button>
              </div>
            </form>
          </div>
        ) : selectedNote ? (
          /* View details of selected meeting note */
          <div className="max-w-3xl space-y-6 animate-in fade-in">
            
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize">
                    {selectedNote.meetingType.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedNote.date} • {selectedNote.durationMinutes} min
                  </span>
                </div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  {selectedNote.title}
                </h1>
                <div className="text-xs text-cyan-400 flex items-center gap-1.5 mt-1">
                  <Building size={14} />
                  <span>{selectedNote.clientName}</span>
                  {selectedNote.clientContact && (
                    <span className="text-slate-400">({selectedNote.clientContact})</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyMarkdownRecap}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                  title="Copy formatted Markdown recap"
                >
                  <Share2 size={13} />
                  <span>Copy Markdown</span>
                </button>
                <button
                  onClick={printMeetingMinutes}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
                  title="Print / Save PDF"
                >
                  <Printer size={14} />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this meeting note?')) {
                      deleteMeetingNote(selectedNote.id);
                      setSelectedNote(null);
                    }
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Attendees */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Users size={14} className="text-indigo-400" />
                Attendees ({selectedNote.attendees.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedNote.attendees.map(a => (
                  <span key={a} className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Agenda */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Agenda
              </h3>
              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-300 whitespace-pre-line leading-relaxed font-mono">
                {selectedNote.agenda}
              </div>
            </div>

            {/* Discussion & Summary */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Discussion & Meeting Notes
              </h3>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                {selectedNote.discussion}
              </div>
            </div>

            {/* Key Decisions */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Key Decisions Made
              </h3>
              <div className="space-y-1.5">
                {selectedNote.decisions.map((d, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Items with 1-Click "Convert to Jira Task" */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles size={16} className="text-cyan-400" />
                    Action Items & Deliverables
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click <strong>Convert to Task</strong> to dispatch any action item directly into your Jira Kanban board!
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {selectedNote.actionItems.map(item => {
                  const isConverted = item.status === 'converted_to_task' || item.taskKeyRef;

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <CheckCircle2
                          size={16}
                          className={isConverted ? 'text-cyan-400 shrink-0 mt-0.5' : 'text-slate-500 shrink-0 mt-0.5'}
                        />
                        <div>
                          <div className={`text-xs font-medium ${isConverted ? 'text-white' : 'text-slate-300'}`}>
                            {item.text}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>Assignee: {item.assigneeName || 'Team Member'}</span>
                            {item.dueDate && <span>• Due: {item.dueDate}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                        {isConverted ? (
                          <span className="flex items-center gap-1.5 text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-cyan-950/40 text-cyan-400 border border-cyan-800/40">
                            <span>{item.taskKeyRef || 'JIRA-LINKED'}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleConvertActionItem(item)}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-md transition-all cursor-pointer"
                          >
                            <span>Convert to Jira Task</span>
                            <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-3">
            <FileText size={40} className="text-slate-700" />
            <div>
              <h3 className="text-sm font-semibold text-slate-300">No Meeting Selected</h3>
              <p className="text-xs text-slate-500 mt-1">
                Choose a meeting from the left sidebar or log a new interaction.
              </p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors"
            >
              Log New Meeting
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
