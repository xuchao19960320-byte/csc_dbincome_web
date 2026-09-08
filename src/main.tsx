import { createRoot } from 'react-dom/client';
import { App } from './App';
import { state } from './hooks/dashboardStore';
import './styles/dashboard.css';
if (window.location.pathname.endsWith('/self-analysis.html')) state.page = 'self';
createRoot(document.getElementById('root')!).render(<App />);
