import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { store } from './store';
import App from './App';
import './index.css';
import './config/dayjs';

// Импорт стилей Mantine
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

// Импорт стилей Leaflet
import 'leaflet/dist/leaflet.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  
    <Provider store={store}>
      <BrowserRouter>
        <MantineProvider>
          <Notifications />
          <App />
        </MantineProvider>
      </BrowserRouter>
    </Provider>
  
);