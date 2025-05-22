import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css'; // Assuming TailwindCSS is imported here

// Communicate to the plugin backend that the UI is ready
parent.postMessage({ pluginMessage: { type: 'ui-ready' } }, '*');

const root = ReactDOM.createRoot(document.getElementById('react-page')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
