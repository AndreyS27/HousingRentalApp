import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PropertyDetailsPage } from './pages/PropertyDetailsPage/PropertyDetailsPage';
import { MainPage } from './pages/MainPage/MainPage';
import { SearchPage } from './pages/SearchPage/SearchPage';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { RegisterPage } from './pages/RegisterPage/RegisterPage';
import { ProfilePage } from './pages/ProfilePage/ProfilePage';
import { CreatePropertyPage } from './pages/CreatePropertyPage/CreatePropertyPage';
import { EditPropertyPage } from './pages/EditPropertyPage/EditPropertyPage';
import { BookingPage } from './pages/BookingPage/BookingPage';
import { BookingSuccessPage } from './pages/BookingSuccessPage/BookingSuccessPage';
import { Footer } from './components/Layout/Footer/Footer';

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/property/:id" element={<PropertyDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/create-property" element={<CreatePropertyPage />} />
          <Route path="/edit-property/:id" element={<EditPropertyPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/booking-success" element={<BookingSuccessPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;