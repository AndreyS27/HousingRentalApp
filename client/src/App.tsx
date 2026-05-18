import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage/HomePage';
import { PropertyDetailsPage } from './pages/PropertyDetailsPage/PropertyDetailsPage';
import { MainPage } from './pages/MainPage/MainPage';
import { SearchPage } from './pages/SearchPage/SearchPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path='/search' element={<SearchPage />} />
      <Route path="/property/:id" element={<PropertyDetailsPage />} />
    </Routes>
  );
}

export default App;