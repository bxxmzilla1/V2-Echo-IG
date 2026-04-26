import React, { useCallback, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { EditorPage } from './pages/EditorPage';
import { PublishedSitesPage } from './pages/PublishedSitesPage';
import { PublishedProfilePage } from './pages/PublishedProfilePage';
import { PasswordPage } from './pages/PasswordPage';
import { isAppUnlocked, pathRequiresAppAuth, setAppUnlocked } from './lib/appAuth';
import { APP_NAME } from './lib/appName';

export default function App() {
  const location = useLocation();
  const [unlocked, setUnlocked] = useState(() => isAppUnlocked());

  const handleUnlock = useCallback(() => {
    setAppUnlocked();
    setUnlocked(true);
  }, []);

  const showingPassword = pathRequiresAppAuth(location.pathname) && !unlocked;

  useEffect(() => {
    if (showingPassword) {
      document.title = APP_NAME;
      return;
    }
    const p = location.pathname.replace(/\/$/, '') || '/';
    document.title = p === '/published' ? `${APP_NAME} · Published` : APP_NAME;
  }, [location.pathname, showingPassword]);

  if (showingPassword) {
    return <PasswordPage onSuccess={handleUnlock} />;
  }

  return (
    <Routes>
      <Route path="/" element={<EditorPage />} />
      <Route path="/published" element={<PublishedSitesPage />} />
      <Route path="/:slug" element={<PublishedProfilePage />} />
    </Routes>
  );
}
