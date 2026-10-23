import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, ArrowUpRight, Bot, Boxes, ChevronDown, ClipboardList, FileChartColumn,
  FileCode2, LayoutDashboard, LogOut, Menu, Network, RefreshCw,
  Search, Settings2, ShieldCheck, Users, X, Moon, Sun, Bookmark, Share2, Type, HelpCircle, Check,
} from 'lucide-react';
import { StitchDiffModal } from './stitch/StitchDiffModal';
import { fetchComparison } from '../lib/api';
import type { CohortAnalysisReport, CompareResponse } from '../lib/types';
import { OverviewScreen } from './screens/OverviewScreen';
import { AssessmentsScreen } from './screens/AssessmentsScreen';
import { SubmissionsScreen } from './screens/SubmissionsScreen';
import { SimilarityScreen } from './screens/SimilarityScreen';
import { AiDetectionScreen } from './screens/AiDetectionScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { TeamScreen } from './screens/TeamScreen';
import { IntegrationsScreen } from './screens/IntegrationsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { useTheme } from '../lib/theme';

interface MainWorkspaceProps {
  report: CohortAnalysisReport | null;
  reportId: string | null;
  userName: string;
  isLoading: boolean;
  onReloadBenchmark: () => void;
  onUpload: (files: File[]) => Promise<void>;
  onLogout: () => void;
}

const workspaceLinks = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/assessments', label: 'Assessments', icon: ClipboardList },
  { to: '/submissions', label: 'Submissions', icon: FileCode2 },
  { to: '/similarity', label: 'Similarity', icon: Network },
  { to: '/ai-detection', label: 'AI signals', icon: Bot },
  { to: '/reports', label: 'Reports', icon: FileChartColumn },
];

const adminLinks = [
  { to: '/team', label: 'Team', icon: Users },
  { to: '/integrations', label: 'Integrations', icon: Boxes },
  { to: '/settings', label: 'Settings', icon: Settings2 },
];

const pageNames: Record<string, string> = {
  '/': 'Overview', '/overview': 'Overview', '/assessments': 'Assessments',
  '/submissions': 'Submissions', '/similarity': 'Similarity analysis',
  '/ai-detection': 'AI signals', '/reports': 'Reports', '/team': 'Team',
  '/integrations': 'Integrations', '/settings': 'Settings',
};

export function MainWorkspace({ report, reportId, userName, isLoading, onReloadBenchmark, onUpload, onLogout }: MainWorkspaceProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeDiff, setActiveDiff] = useState<CompareResponse | null>(null);
  const [loadingDiff, setLoadingDiff] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpQuery, setHelpQuery] = useState('');
  const [toast, setToast] = useState('');
  const [fontScale, setFontScale] = useState(() => Number(localStorage.getItem('zixie-font-scale') || 1));
  const [savedPages, setSavedPages] = useState<string[]>(() => JSON.parse(localStorage.getItem('zixie-saved-pages') || '[]'));
  const [language, setLanguage] = useState(() => localStorage.getItem('zixie-language') || 'English');
  const searchRef = useRef<HTMLInputElement>(null);
  const { resolved, toggle } = useTheme();
  const hindi = language === 'हिन्दी';
  const label = (english: string, hindiText: string) => hindi ? hindiText : english;
  const activeUrl = location.pathname;
  const title = pageNames[activeUrl] ?? 'Overview';
  const faqs = [
    ['What does a similarity score mean?', 'It measures structural overlap between two submissions. Treat it as a prompt for review, not a finding of misconduct.'],
    ['How are starter files handled?', 'Starter code should be excluded from comparison when the assignment uses a shared template. Configure this in assessment settings.'],
    ['Can an AI signal prove authorship?', 'No. Signals are heuristic and can be wrong. Review the work and discuss it with the student before drawing conclusions.'],
    ['How do I export a review?', 'Open Reports and export the loaded cohort as CSV or JSON. The export contains computed results for further review.'],
    ['Where are saved pages stored?', 'Saved pages and recent pages stay in this browser on this device. They are not synced to an account.'],
  ];
  const filteredFaqs = faqs.filter(([q, a]) => `${q} ${a}`.toLowerCase().includes(helpQuery.toLowerCase()));

  useEffect(() => {
    document.documentElement.lang = language === 'हिन्दी' ? 'hi' : 'en';
  }, [language]);
  useEffect(() => { document.documentElement.style.setProperty('--z-font-scale', String(fontScale)); }, [fontScale]);
  useEffect(() => {
    const recent = [activeUrl, ...JSON.parse(localStorage.getItem('zixie-recent-pages') || '[]').filter((path: string) => path !== activeUrl)].slice(0, 5);
    localStorage.setItem('zixie-recent-pages', JSON.stringify(recent));
  }, [activeUrl]);
  useEffect(() => {
    const handleKeys = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === '?' ) { event.preventDefault(); setHelpOpen(true); }
      if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName)) { event.preventDefault(); searchRef.current?.focus(); }
      if (event.key.toLowerCase() === 't' && !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName)) toggle();
      if (event.key === 'Escape') setHelpOpen(false);
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [toggle]);
  useEffect(() => {
    const scroller = document.querySelector('.z-main-column');
    const update = () => {
      if (!scroller) return;
      const max = scroller.scrollHeight - scroller.clientHeight;
      const percent = max > 0 ? (scroller.scrollTop / max) * 100 : 0;
      document.documentElement.style.setProperty('--z-reading-progress', `${percent}%`);
    };
    scroller?.addEventListener('scroll', update, { passive: true });
    update();
    return () => scroller?.removeEventListener('scroll', update);
  }, [activeUrl]);

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2200); };
  const toggleSaved = () => {
    const next = savedPages.includes(activeUrl) ? savedPages.filter((path) => path !== activeUrl) : [activeUrl, ...savedPages];
    setSavedPages(next); localStorage.setItem('zixie-saved-pages', JSON.stringify(next));
    notify(next.includes(activeUrl) ? 'Saved for later' : 'Removed from saved pages');
  };
  const sharePage = async () => {
    const data = { title: `Zixie · ${title}`, text: `Review ${title} in Zixie`, url: window.location.href };
    try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(data.url); notify('Page link copied'); } } catch { /* dismissed */ }
  };
  const openDiff = async (firstId: string, secondId: string) => {
    if (!reportId) return;
    setLoadingDiff(true);
    try {
      setActiveDiff(await fetchComparison(reportId, firstId, secondId));
    } catch (error) {
      console.error('Could not load comparison', error);
    } finally {
      setLoadingDiff(false);
    }
  };

  const renderScreen = () => {
    switch (activeUrl) {
      case '/':
      case '/overview':
        return <OverviewScreen report={report} onNavigate={navigate} onReloadBenchmark={onReloadBenchmark} isLoading={isLoading} />;
      case '/assessments': return <AssessmentsScreen onNavigate={navigate} />;
      case '/submissions': return <SubmissionsScreen report={report} isLoading={isLoading} onReloadBenchmark={onReloadBenchmark} onUpload={onUpload} onOpenDiff={openDiff} loadingDiff={loadingDiff} />;
      case '/similarity': return <SimilarityScreen report={report} onOpenDiff={openDiff} loadingDiff={loadingDiff} />;
      case '/ai-detection': return <AiDetectionScreen report={report} />;
      case '/reports': return <ReportsScreen report={report} />;
      case '/team': return <TeamScreen />;
      case '/integrations': return <IntegrationsScreen />;
      case '/settings': return <SettingsScreen />;
      default: return <OverviewScreen report={report} onNavigate={navigate} onReloadBenchmark={onReloadBenchmark} isLoading={isLoading} />;
    }
  };

  const navigation = (
    <>
      <div className="z-brand-lockup">
        <span className="z-mark">z</span>
        <div><strong>zixie</strong><small>{label('Integrity workspace', 'अखंडता कार्यक्षेत्र')}</small></div>
        <button className="z-icon-button z-mobile-close" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><X size={17} /></button>
      </div>
      <div className="z-workspace-switcher">
        <span className="z-workspace-avatar">CS</span>
        <span><strong>CS 401 · Algorithms</strong><small>Spring term</small></span>
        <ChevronDown size={15} />
      </div>
      <nav className="z-sidebar-nav" aria-label="Workspace navigation">
        <span className="z-nav-label">{label('Workspace', 'कार्यक्षेत्र')}</span>
        {workspaceLinks.map(({ to, label: linkLabel, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setMobileNavOpen(false)} className={({ isActive }) => `z-nav-link${isActive ? ' is-active' : ''}`}>
            <Icon size={17} strokeWidth={1.8} /><span>{hindi ? ({ Overview: 'अवलोकन', Assessments: 'मूल्यांकन', Submissions: 'सबमिशन', Similarity: 'समानता', 'AI signals': 'AI संकेत', Reports: 'रिपोर्ट' } as Record<string, string>)[linkLabel] || linkLabel : linkLabel}</span>
            {to === '/submissions' && report ? <em>{report.nodes.length}</em> : null}
          </NavLink>
        ))}
        <span className="z-nav-label z-nav-label-spaced">{label('Manage', 'प्रबंधन')}</span>
        {adminLinks.map(({ to, label: linkLabel, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={() => setMobileNavOpen(false)} className={({ isActive }) => `z-nav-link${isActive ? ' is-active' : ''}`}>
            <Icon size={17} strokeWidth={1.8} /><span>{hindi ? ({ Team: 'टीम', Integrations: 'एकीकरण', Settings: 'सेटिंग' } as Record<string, string>)[linkLabel] || linkLabel : linkLabel}</span>
          </NavLink>
        ))}
      </nav>
      <div className="z-sidebar-bottom">
        <div className="z-engine-status"><span className="z-status-dot" /><span><strong>Analysis engine</strong><small>{report ? 'Ready · cohort loaded' : isLoading ? 'Connecting…' : 'Waiting for data'}</small></span><Activity size={15} /></div>
        <div className="z-profile-row"><span className="z-profile-avatar">{(userName || 'A').slice(0, 1).toUpperCase()}</span><span className="z-profile-copy"><strong>{userName || 'Instructor'}</strong><small>Course administrator</small></span><button className="z-icon-button" onClick={onLogout} aria-label="Sign out"><LogOut size={16} /></button></div>
      </div>
    </>
  );

  return (
    <div className="z-app-shell">
      <aside className="z-sidebar">{navigation}</aside>
      {mobileNavOpen && <button className="z-mobile-backdrop" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation" />}
      <aside className={`z-mobile-sidebar${mobileNavOpen ? ' is-open' : ''}`}>{navigation}</aside>
      <div className="z-main-column">
        <header className="z-topbar">
          <div className="z-topbar-left">
            <button className="z-icon-button z-mobile-menu" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Menu size={19} /></button>
            <div className="z-crumb"><span>CS 401</span><span className="z-crumb-divider">/</span><strong>{hindi ? ({ Overview: 'अवलोकन', Assessments: 'मूल्यांकन', Submissions: 'सबमिशन', 'Similarity analysis': 'समानता विश्लेषण', 'AI signals': 'AI संकेत', Reports: 'रिपोर्ट', Team: 'टीम', Integrations: 'एकीकरण', Settings: 'सेटिंग' } as Record<string, string>)[title] || title : title}</strong></div>
            {report && <span className="z-live-pill"><i /> {report.nodes.length} submissions</span>}
          </div>
          <div className="z-topbar-actions">
            <label className="z-search-box"><Search size={15} /><input ref={searchRef} aria-label={label('Search Zixie', 'Zixie खोजें')} placeholder={label('Search names, pages…', 'नाम या पेज खोजें…')} onKeyDown={(event) => { if (event.key === 'Enter') { const q = event.currentTarget.value.trim(); const found = workspaceLinks.concat(adminLinks).find((item) => item.label.toLowerCase().includes(q.toLowerCase())); navigate(found ? found.to : `/submissions?search=${encodeURIComponent(q)}`); } }} /><kbd>/</kbd></label>
            <div className="z-utility-actions">
              <button className="z-icon-button" title={resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} aria-label="Toggle dark mode" onClick={toggle}>{resolved === 'dark' ? <Sun size={15} /> : <Moon size={15} />}</button>
              <button className="z-icon-button" title="Save this page" aria-label="Save this page for later" onClick={toggleSaved}><Bookmark size={15} fill={savedPages.includes(activeUrl) ? 'currentColor' : 'none'} /></button>
              <button className="z-icon-button" title="Share page" aria-label="Share page" onClick={() => void sharePage()}><Share2 size={15} /></button>
              <button className="z-icon-button" title="Text size" aria-label="Adjust text size" onClick={() => { const next = fontScale >= 1.15 ? 0.9 : Number((fontScale + 0.1).toFixed(2)); setFontScale(next); localStorage.setItem('zixie-font-scale', String(next)); document.documentElement.style.setProperty('--z-font-scale', String(next)); notify(`Text size ${Math.round(next * 100)}%`); }}><Type size={15} /></button>
              <select className="z-language-select" aria-label="Language" value={language} onChange={(event) => { setLanguage(event.target.value); localStorage.setItem('zixie-language', event.target.value); notify(event.target.value === 'हिन्दी' ? 'भाषा बदल दी गई' : 'Language set to English'); }}><option>English</option><option>हिन्दी</option></select>
              <button className="z-icon-button" title="Help and FAQ" aria-label="Help and FAQ" onClick={() => setHelpOpen(true)}><HelpCircle size={15} /></button>
            </div>
            <button className="z-button z-button-secondary" onClick={onReloadBenchmark} disabled={isLoading}><RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /><span className="z-reload-label">Refresh cohort</span></button>
          </div>
        </header>
        <main className="z-page-wrap">
          <div className="z-reading-progress" aria-hidden="true"><span style={{ width: '0%' }} /></div>
          {!report && !isLoading && <div className="z-connection-banner"><ShieldCheck size={16} /><span>Couldn’t load cohort data.</span><button onClick={onReloadBenchmark}>Try again <ArrowUpRight size={13} /></button></div>}
          {renderScreen()}
          <footer className="z-footer"><span>Zixie · Code integrity, with context.</span><span>Local analysis workspace <i /></span></footer>
        </main>
      </div>
      {activeDiff && <StitchDiffModal candA={activeDiff.candA} candB={activeDiff.candB} comparison={activeDiff.comparison} onClose={() => setActiveDiff(null)} />}
      <button className="z-back-top" aria-label="Back to top" title="Back to top" onClick={() => document.querySelector('.z-main-column')?.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>
      {toast && <div className="z-toast"><Check size={15} />{toast}</div>}
      {helpOpen && <div className="z-help-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setHelpOpen(false); }}><section className="z-help-panel" role="dialog" aria-modal="true" aria-label="Zixie help"><header><div><small>HELP CENTER</small><h2>Quick answers</h2></div><button className="z-icon-button" onClick={() => setHelpOpen(false)} aria-label="Close help"><X size={18} /></button></header><input autoFocus value={helpQuery} onChange={(event) => setHelpQuery(event.target.value)} placeholder="Search frequently asked questions" />{filteredFaqs.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}<footer>Keyboard shortcuts: <kbd>/</kbd> search · <kbd>t</kbd> theme · <kbd>?</kbd> help · <kbd>Esc</kbd> close</footer></section></div>}
    </div>
  );
}
