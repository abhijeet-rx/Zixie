import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { SidebarNavigationSectionDividers } from '@/components/application/app-navigation/sidebar-navigation/sidebar-section-dividers';
import { navItemsWithDividers } from '@/components/application/app-navigation/SidebarSectionDividersDemo';
import { StitchDiffModal } from '@/components/stitch/StitchDiffModal';
import { fetchComparison } from '@/lib/api';
import type { CohortAnalysisReport, CompareResponse } from '@/lib/types';

// Screens
import { OverviewScreen } from './screens/OverviewScreen';
import { AssessmentsScreen } from './screens/AssessmentsScreen';
import { SubmissionsScreen } from './screens/SubmissionsScreen';
import { SimilarityScreen } from './screens/SimilarityScreen';
import { AiDetectionScreen } from './screens/AiDetectionScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { TeamScreen } from './screens/TeamScreen';
import { IntegrationsScreen } from './screens/IntegrationsScreen';
import { SettingsScreen } from './screens/SettingsScreen';

interface MainWorkspaceProps {
  report: CohortAnalysisReport | null;
  reportId: string | null;
  userName: string;
  isLoading: boolean;
  onReloadBenchmark: () => void;
  onUpload: (files: File[]) => Promise<void>;
  onLogout: () => void;
}

export function MainWorkspace({
  report,
  reportId,
  userName,
  isLoading,
  onReloadBenchmark,
  onUpload,
  onLogout,
}: MainWorkspaceProps) {
  const [activeUrl, setActiveUrl] = useState<string>('/overview');
  const [activeDiff, setActiveDiff] = useState<CompareResponse | null>(null);
  const [loadingDiff, setLoadingDiff] = useState(false);

  const handleOpenDiff = async (candAId: string, candBId: string) => {
    if (!reportId) return;
    setLoadingDiff(true);
    try {
      const data = await fetchComparison(reportId, candAId, candBId);
      setActiveDiff(data);
    } catch (err) {
      console.error('Failed to load comparison diff:', err);
    } finally {
      setLoadingDiff(false);
    }
  };

  const getBreadcrumb = (url: string) => {
    switch (url) {
      case '/overview':
      case '/dashboard':
      case '/':
        return { section: 'Workspace', title: 'Overview' };
      case '/assessments':
        return { section: 'Workspace', title: 'Assessments' };
      case '/submissions':
        return { section: 'Workspace', title: 'Submissions' };
      case '/similarity':
        return { section: 'Workspace', title: 'Similarity Analysis' };
      case '/ai-detection':
        return { section: 'Workspace', title: 'AI Detection' };
      case '/reports':
        return { section: 'Workspace', title: 'Reports' };
      case '/admin/team':
        return { section: 'Administration', title: 'Team & Members' };
      case '/admin/integrations':
        return { section: 'Administration', title: 'Integrations' };
      case '/admin/settings':
        return { section: 'Administration', title: 'Settings' };
      default:
        return { section: 'Workspace', title: 'Overview' };
    }
  };

  const breadcrumb = getBreadcrumb(activeUrl);

  const renderScreen = () => {
    switch (activeUrl) {
      case '/overview':
      case '/dashboard':
      case '/':
        return (
          <OverviewScreen
            report={report}
            onNavigate={(href) => setActiveUrl(href)}
            onReloadBenchmark={onReloadBenchmark}
            isLoading={isLoading}
          />
        );

      case '/assessments':
        return <AssessmentsScreen onNavigate={(href) => setActiveUrl(href)} />;

      case '/submissions':
        return (
          <SubmissionsScreen
            report={report}
            isLoading={isLoading}
            onReloadBenchmark={onReloadBenchmark}
            onUpload={onUpload}
            onOpenDiff={handleOpenDiff}
            loadingDiff={loadingDiff}
          />
        );

      case '/similarity':
        return (
          <SimilarityScreen
            report={report}
            onOpenDiff={handleOpenDiff}
            loadingDiff={loadingDiff}
          />
        );

      case '/ai-detection':
        return <AiDetectionScreen report={report} />;

      case '/reports':
        return <ReportsScreen report={report} />;

      case '/admin/team':
        return <TeamScreen />;

      case '/admin/integrations':
        return <IntegrationsScreen />;

      case '/admin/settings':
        return <SettingsScreen />;

      default:
        return (
          <OverviewScreen
            report={report}
            onNavigate={(href) => setActiveUrl(href)}
            onReloadBenchmark={onReloadBenchmark}
            isLoading={isLoading}
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden">
      {/* ═══════════════════════════════════════════════
          LEFT: UNTITLED UI SIDEBAR WITH SECTION DIVIDERS
          ═══════════════════════════════════════════════ */}
      <SidebarNavigationSectionDividers
        activeUrl={activeUrl}
        items={navItemsWithDividers}
        onNavigate={(href) => setActiveUrl(href)}
        user={{
          name: userName || 'Abhijeet',
          email: 'abhijeet@zixie.io',
          role: 'Head TA & Proctor',
        }}
        onLogout={onLogout}
      />

      {/* ═══════════════════════════════════════════════
          RIGHT: MAIN WORKSPACE CONTENT
          ═══════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto">
        {/* Top Workspace Header */}
        <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-700">{breadcrumb.section}</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-semibold truncate">
                {breadcrumb.title}
              </span>
            </nav>
            {report && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{report.nodes.length} Answers Evaluated</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onReloadBenchmark}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              title="Reload Benchmark Cohort"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
              <span className="hidden sm:inline">Reload Benchmark</span>
            </button>
          </div>
        </header>

        {/* Workspace Body: Dynamic Screen Content */}
        <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {renderScreen()}
        </main>
      </div>

      {/* Side-by-side diff modal */}
      {activeDiff && (
        <StitchDiffModal
          candA={activeDiff.candA}
          candB={activeDiff.candB}
          comparison={activeDiff.comparison}
          onClose={() => setActiveDiff(null)}
        />
      )}
    </div>
  );
}
