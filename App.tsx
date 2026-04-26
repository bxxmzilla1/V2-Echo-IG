import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { EditorPage } from './pages/EditorPage';
import { PublishedSitesPage } from './pages/PublishedSitesPage';
import { PublishedProfilePage } from './pages/PublishedProfilePage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EditorPage />} />
      <Route path="/published" element={<PublishedSitesPage />} />
      <Route path="/:slug" element={<PublishedProfilePage />} />
    </Routes>
  );
}
