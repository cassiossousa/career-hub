import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Suspense, useState } from 'react';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
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

function AppShell() {
  return (
    <>
      <Layout>
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </Layout>
      <ManualJobForm />
    </>
  );
}

function createAppRouter() {
  return createBrowserRouter([
    {
      element: <AppShell />,
      children: [
        ...appRoutes.map(({ path, Component }) => ({
          path,
          element: <Component />,
        })),
        { path: '*', element: <NotFound /> },
      ],
    },
  ]);
}

export default function App() {
  const themeMode = useUIStore((state) => state.themeMode);
  const [router] = useState(createAppRouter);

  return (
    <ThemeProvider theme={appThemes[themeMode]}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
