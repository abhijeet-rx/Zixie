import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  CheckCircle2,
  Check,
  X,
  Key,
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Instructor' | 'Head TA' | 'Teaching Assistant' | 'Proctor' | 'Honor Council Auditor';
  cohorts: string;
  status: 'ACTIVE' | 'AWAY';
  lastActive: string;
}

export function TeamScreen() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('Teaching Assistant');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: 'mem-1',
      name: 'Abhijeet',
      email: 'abhijeet@zixie.io',
      role: 'Head TA',
      cohorts: 'All Sections (101-104)',
      status: 'ACTIVE',
      lastActive: 'Just now',
    },
    {
      id: 'mem-2',
      name: 'Prof. David Patterson',
      email: 'pattrsn@berkeley.edu',
      role: 'Instructor',
      cohorts: 'All Sections',
      status: 'ACTIVE',
      lastActive: '2h ago',
    },
    {
      id: 'mem-3',
      name: 'Sarah Connor',
      email: 'sconnor@zixie.io',
      role: 'Teaching Assistant',
      cohorts: 'Section 101 & 102',
      status: 'ACTIVE',
      lastActive: '5h ago',
    },
    {
      id: 'mem-4',
      name: 'Marcus Vance',
      email: 'mvance@zixie.io',
      role: 'Teaching Assistant',
      cohorts: 'Section 103',
      status: 'AWAY',
      lastActive: '1d ago',
    },
    {
      id: 'mem-5',
      name: 'Elena Rostova',
      email: 'erostova@zixie.io',
      role: 'Proctor',
      cohorts: 'Midterm Exam Hall A',
      status: 'ACTIVE',
      lastActive: '3d ago',
    },
    {
      id: 'mem-6',
      name: 'Dean Arthur Pendelton',
      email: 'senate-integrity@university.edu',
      role: 'Honor Council Auditor',
      cohorts: 'Formal Misconduct Packets',
      status: 'ACTIVE',
      lastActive: '4d ago',
    },
  ]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;

    const newMem: TeamMember = {
      id: `mem-${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      cohorts: 'Section 101',
      status: 'ACTIVE',
      lastActive: 'Invited',
    };

    setMembers([...members, newMem]);
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteName('');
    setSuccessToast(`Invitation sent to ${inviteEmail} with role ${inviteRole}!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
              ACCESS CONTROL
            </span>
            <span className="text-xs text-slate-500">Course Personnel &amp; Roles</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Team &amp; Members</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage instructors, teaching assistants, proctors, and honor council auditors.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm shadow-blue-600/20 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Staff
          </span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {members.length}
          </span>
          <span className="text-[11px] text-emerald-600 mt-0.5 block">
            All seats active
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Lead Instructors
          </span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">1</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Full administrative signoff</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Teaching Assistants
          </span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">3</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Triage &amp; grading rights</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Honor Council
          </span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">1</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Audit &amp; verification rights</span>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Active Staff Members
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Personnel authorized to inspect code similarities and evaluate submissions.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-slate-600">Member</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">Role</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">Assigned Cohort</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">Status</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">Last Active</th>
                <th className="px-4 py-3 text-right font-bold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block">{member.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono block">{member.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        member.role === 'Instructor'
                          ? 'bg-purple-100 text-purple-800'
                          : member.role === 'Head TA'
                          ? 'bg-blue-100 text-blue-800'
                          : member.role === 'Honor Council Auditor'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {member.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{member.cohorts}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          member.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      <span>{member.status}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{member.lastActive}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-100 cursor-pointer"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permission Matrix Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600" />
            <span>Role Permissions Matrix</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Access privileges enforced across the Zixie academic integrity engine.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-slate-600">Permission Action</th>
                <th className="px-4 py-3 text-center font-bold text-slate-600">Instructor</th>
                <th className="px-4 py-3 text-center font-bold text-slate-600">Head TA</th>
                <th className="px-4 py-3 text-center font-bold text-slate-600">TA / Grader</th>
                <th className="px-4 py-3 text-center font-bold text-slate-600">Council Auditor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-3 text-slate-800 font-medium">Ingest Student Answers &amp; Batch ZIPs</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="px-4 py-3 text-center text-slate-300"><X className="w-4 h-4 mx-auto" /></td>
                <td className="px-4 py-3 text-center text-slate-300"><X className="w-4 h-4 mx-auto" /></td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-800 font-medium">View Side-by-Side AST Diff Workbench</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-800 font-medium">Sign Official Academic Misconduct Packets</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="px-4 py-3 text-center text-slate-300"><X className="w-4 h-4 mx-auto" /></td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-800 font-medium">Modify Algorithmic Sensitivity &amp; Thresholds</td>
                <td className="px-4 py-3 text-center text-emerald-600 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="px-4 py-3 text-center text-slate-300"><X className="w-4 h-4 mx-auto" /></td>
                <td className="px-4 py-3 text-center text-slate-300"><X className="w-4 h-4 mx-auto" /></td>
                <td className="px-4 py-3 text-center text-slate-300"><X className="w-4 h-4 mx-auto" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span>Invite Course Staff Member</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">University Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@university.edu"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                >
                  <option value="Instructor">Instructor (Full Admin)</option>
                  <option value="Head TA">Head TA (Triage &amp; Export)</option>
                  <option value="Teaching Assistant">Teaching Assistant (Reviewer)</option>
                  <option value="Proctor">Proctor (Monitoring Only)</option>
                  <option value="Honor Council Auditor">Honor Council Auditor (FERPA Auditor)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm shadow-blue-600/20"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
