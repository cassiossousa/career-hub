import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import NavbarClient from './components/NavbarClient';
import { TranslationProvider } from './i18n/provider';
import type { Locale } from './types/i18n';
import HomePage from './pages/home/HomePage';
import ProjectPage from './pages/projects/ProjectPage';
import ProjectsPage from './pages/projects/ProjectsList';
import ResumePage from './pages/resume/ResumePage';
import WorkExperiencePage from './pages/work-experience/WorkExperiencePage';
import './styles.css';

function initialLocale() {
  const match = document.cookie.match(/(?:^|;\s*)lang=(en|pt-BR)(?:;|$)/);
  return match?.[1] === 'pt-BR' ? 'pt-BR' : 'en';
}

function App({ initialLocale }: { initialLocale: Locale }) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  function changeLocale(nextLocale: Locale) {
    document.cookie = `lang=${nextLocale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    setLocale(nextLocale);
  }

  return (
    <TranslationProvider locale={locale} onLocaleChange={changeLocale}>
      <NavbarClient />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:slug" element={<ProjectPage />} />
          <Route path="/work-experience" element={<WorkExperiencePage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </TranslationProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App initialLocale={initialLocale()} />
    </BrowserRouter>
  </React.StrictMode>,
);
