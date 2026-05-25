import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PropertyDetailsPage } from './pages/PropertyDetailsPage/PropertyDetailsPage';
import { MainPage } from './pages/MainPage/MainPage';
import { SearchPage } from './pages/SearchPage/SearchPage';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { RegisterPage } from './pages/RegisterPage/RegisterPage';
import { ProfilePage } from './pages/ProfilePage/ProfilePage';
import { CreatePropertyPage } from './pages/CreatePropertyPage/CreatePropertyPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path='/search' element={<SearchPage />} />
      <Route path="/property/:id" element={<PropertyDetailsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/profile" element={<ProfilePage/>} />
      <Route path="/create-property" element={<CreatePropertyPage/>} />
    </Routes>
  );
}

export default App;