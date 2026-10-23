import { useState } from 'react';
import {
  Boxes,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Key,
  Copy,
  Send,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  category: 'LMS' | 'VCS' | 'AUTOGRADER';
  description: string;
  connected: boolean;
  lastSync?: string;
  iconBg: string;
}

export function IntegrationsScreen() {
  const [copiedKey, setCopiedKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [sendingPing, setSendingPing] = useState(false);

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'canvas',
      name: 'Canvas LMS by Instructure',
      category: 'LMS',
      description: 'Automatically synchronizes enrolled roster and pulls zip submissions at assignment deadlines.',
      connected: true,
      lastSync: '12 minutes ago',
      iconBg: 'bg-red-500',
    },
    {
      id: 'github',
      name: 'GitHub Classroom',
      category: 'VCS',
      description: 'Ingests commit trees, diff histories, and branch commits to identify commit-level code duplication.',
      connected: true,
      lastSync: '1 hour ago',
      iconBg: 'bg-slate-900',
    },
    {
      id: 'blackboard',
      name: 'Blackboard Learn Ultra',
      category: 'LMS',
      description: 'Direct REST integration with course modules and grade pushback on flagged integrity reviews.',
      connected: false,
      iconBg: 'bg-amber-600',
    },
    {
      id: 'moodle',
      name: 'Moodle Open LMS',
      category: 'LMS',
      description: 'Supports modular LTI 1.3 assignments and student cohort groupings.',
      connected: false,
      iconBg: 'bg-orange-500',
    },
    {
      id: 'gradescope',
      name: 'Gradescope Autograder',
      category: 'AUTOGRADER',
      description: 'Runs parallel integrity verification alongside standard unit test suites.',
      connected: true,
      lastSync: '3 hours ago',
      iconBg: 'bg-blue-600',
    },
  ]);

  const toggleConnection = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStatus = !item.connected;
          setSuccessToast(
            `${item.name} is now ${newStatus ? 'connected and syncing' : 'disconnected'}.`
          );
          setTimeout(() => setSuccessToast(null), 3500);
          return {
            ...item,
            connected: newStatus,
            lastSync: newStatus ? 'Just now' : undefined,
          };
        }
        return item;
      })
    );
  };

  const handleCopyKey = () => {
    navigator.clipboard?.writeText('zx_live_84f90112c8e31a89bd44');
    setCopiedKey(true);
    setSuccessToast('API Secret Token copied to clipboard!');
    setTimeout(() => {
      setCopiedKey(false);
      setSuccessToast(null);
    }, 3000);
  };

  const handleSendPing = () => {
    setSendingPing(true);
    setTimeout(() => {
      setSendingPing(false);
      setSuccessToast('Test Webhook payload dispatched! Status: 200 OK (38ms)');
      setTimeout(() => setSuccessToast(null), 4000);
    }, 700);
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
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-700">
              ECOSYSTEM &amp; CONNECTORS
            </span>
            <span className="text-xs text-slate-500">LMS, VCS &amp; Automated Hooks</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-blue-600" />
            <span>Integrations &amp; Webhooks Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Connect Canvas, GitHub Classroom, and institutional grading pipelines for automatic submission sync.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>3 Connected Services</span>
          </span>
        </div>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${item.iconBg} text-white font-bold flex items-center justify-center text-sm shadow-xs`}
                  >
                    {item.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    item.connected
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {item.connected ? 'ACTIVE' : 'READY'}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

              {item.lastSync && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                  <RefreshCw className="w-3 h-3 text-slate-400" />
                  <span>Last synced {item.lastSync}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => toggleConnection(item.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  item.connected
                    ? 'bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                }`}
              >
                {item.connected ? 'Disconnect' : 'Connect Account'}
              </button>

              <button
                type="button"
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Docs</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Webhooks & Developer API Keys Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600" />
            <span>Developer API Keys &amp; Webhook Endpoints</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Integrate custom autograders, CI/CD runners, and institutional data pipelines with Zixie.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* API Key Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Production REST API Key</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-mono font-bold">
                READ/WRITE
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                readOnly
                value="zx_live_84f90112c8e31a89bd44"
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-xs select-all"
              />
              <button type="button" onClick={() => setShowKey((visible) => !visible)} aria-label={showKey ? 'Hide API key' : 'Show API key'} title={showKey ? 'Hide key' : 'Show key'} className="rounded-md border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-800">
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={handleCopyKey}
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedKey ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              Do not share this key in client-side code. Use environment variables in your server-side evaluation scripts.
            </p>
          </div>

          {/* Webhook Dispatcher */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Webhook Dispatch URL</span>
              <span className="text-[10px] text-emerald-600 font-mono font-semibold">
                ENDPOINT HEALTHY
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value="https://autograder.berkeley.edu/api/v1/zixie-callback"
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-xs select-all"
              />
              <button
                type="button"
                onClick={handleSendPing}
                disabled={sendingPing}
                className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingPing ? 'Pinging...' : 'Test Ping'}</span>
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-600">
              <label className="flex items-center gap-1.5">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span>On Ingest</span>
              </label>
              <label className="flex items-center gap-1.5">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span>On Collusion Ring</span>
              </label>
              <label className="flex items-center gap-1.5">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span>On High AI Score</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
