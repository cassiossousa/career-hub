import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { appRoutes } from './app/routes';
import { appThemes } from './app/theme';
import { EmptyState, LoadingState } from './components/AsyncStatus/AsyncStatus';
import { Layout } from './components/Layout/Layout';
import { ManualJobForm } from './components/ManualJobForm/ManualJobForm';
import { useTranslation } from './i18n/Provider';
import { useUIStore } from './store/uiStore';

function NotFound() {
  const { messages } = useTranslation();
  return <EmptyState title={messages.common.notFound} />;
}

function RouteFallback() {
  const { messages } = useTranslation();
  return <LoadingState label={messages.common.loading} />;
}

export default function App() {
  const themeMode = useUIStore((state) => state.themeMode);

  return (
    <ThemeProvider theme={appThemes[themeMode]}>
      <CssBaseline />
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {appRoutes.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} />
              ))}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
        <ManualJobForm />
      </BrowserRouter>
    </ThemeProvider>
  );
}
