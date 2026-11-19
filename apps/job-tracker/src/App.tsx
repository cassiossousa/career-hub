import { CssBaseline } from '@mui/material';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { EmptyState } from './components/AsyncStatus/AsyncStatus';
import { Layout } from './components/Layout/Layout';
import { ManualJobForm } from './components/ManualJobForm/ManualJobForm';
import { ApplicationList } from './features/applications/ApplicationList';
import { Dashboard } from './features/dashboard/Dashboard';
import { JobDetail } from './features/jobs/JobDetail';
import { JobList } from './features/jobs/JobList';
import { PortfolioEditor } from './features/portfolio/PortfolioEditor';
import { useTranslation } from './i18n/Provider';

function NotFound() {
  const { messages } = useTranslation();
  return <EmptyState title={messages.common.notFound} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <CssBaseline />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/applications" element={<ApplicationList />} />
          <Route path="/portfolio" element={<PortfolioEditor />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
      <ManualJobForm />
    </BrowserRouter>
  );
}
