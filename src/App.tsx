import { useDashboard, state } from './hooks/dashboardStore';
import { useDashboardActions } from './hooks/useDashboardActions';
import { Header } from './components/Header';
import { OrganizationFilters } from './components/OrganizationFilters';
import { TooltipSurface } from './components/Tooltip';
import { TrendDialog } from './components/TrendDialog';
import {
  KpiGrid,
  CargoAnalysis,
  TceAnalysis,
  OwnershipAnalysis,
  RiverSeaAnalysis,
  OverdueAnalysis,
  RankingAnalysis,
  TrendAnalysis,
  TceDetailPage,
  RankingDetailPage,
} from './pages/OverviewPage';
import { ShipsPage, ShipDetailPage } from './pages/ShipsPage';
import { MultidimensionalPage } from './pages/MultidimensionalPage';
import { SelfAnalysisPage } from './pages/SelfAnalysisPage';
export function RevenueOverview() {
  return (
    <>
      <KpiGrid />
      <div className="grid analysis-grid">
        <CargoAnalysis />
        <TceAnalysis />
        <OwnershipAnalysis />
        <RiverSeaAnalysis />
      </div>
      <div
        className="grid bottom"
        style={{
          marginTop: 18,
        }}
      >
        <OverdueAnalysis />
        <RankingAnalysis />
      </div>
      <TrendAnalysis />
      <footer>
        统计月份：{state.month}　｜　{state.org}　｜　示例数据
      </footer>
    </>
  );
}
export function App() {
  useDashboard();
  const actions = useDashboardActions();
  return (
    <div className="dashboard-shell">
      <Header />
      {state.page !== 'self' && <OrganizationFilters />}
      {state.page === 'self' ? (
        <main id="app" className="self-mode">
          <SelfAnalysisPage />
        </main>
      ) : (
        <TooltipSurface>
          <main
            id="app"
            onClick={actions.onClick}
            onChange={actions.onChange}
            onSubmit={actions.onSubmit}
            onKeyDown={actions.onKeyDown}
          >
            {state.page === 'home' ? (
              <RevenueOverview />
            ) : state.page === 'ships' ? (
              <ShipsPage />
            ) : state.page === 'shipDetail' ? (
              <ShipDetailPage />
            ) : state.page === 'multi' ? (
              <MultidimensionalPage />
            ) : state.page === 'tce' ? (
              <TceDetailPage />
            ) : (
              <RankingDetailPage />
            )}
          </main>
        </TooltipSurface>
      )}
      {actions.trend && <TrendDialog {...actions.trend} onClose={actions.closeTrend} />}
    </div>
  );
}
