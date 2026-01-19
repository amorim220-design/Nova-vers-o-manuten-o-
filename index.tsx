import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

function showError(err: any) {
  const msg =
    (err && (err.stack || err.message)) ? String(err.stack || err.message) : String(err);

  document.body.innerHTML = `
    <div style="padding:16px;font-family:monospace;white-space:pre-wrap;color:#fff;background:#111;min-height:100vh">
      <h2>ERRO NO APP</h2>
      <pre>${msg}</pre>
    </div>
  `;
}

// pega erros síncronos
window.addEventListener('error', (e) => showError(e.error || e.message));
// pega erros de promises
window.addEventListener('unhandledrejection', (e: any) => showError(e.reason));

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error("Could not find root element '#root'");

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
} catch (err) {
  showError(err);
}
