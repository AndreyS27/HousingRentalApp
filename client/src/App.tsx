import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage/HomePage';
import { PropertyDetailsPage } from './pages/PropertyDetailsPage/PropertyDetailsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/property/:id" element={<PropertyDetailsPage />} />
    </Routes>
  );
}

export default App;git 