import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter as BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './index.css';

// Detect when a new build is deployed and force a clean reload.
// build-time.json is never precached, so the old SW always fetches it fresh
// from the network — which means this works even when the old SW is still active.
async function checkForNewBuild() {
  try {
    const res = await fetch('/my-workout-app/build-time.json', { cache: 'no-store' });
    if (!res.ok) return;
    const { version } = await res.json() as { version: string };
    const stored = localStorage.getItem('__build_version');
    if (stored && stored !== version) {
      localStorage.setItem('__build_version', version);
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      window.location.reload();
      return;
    }
    localStorage.setItem('__build_version', version);
  } catch {
    // offline – ignore
  }
}

function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/my-workout-app/sw.js', {
        scope: '/my-workout-app/',
        updateViaCache: 'none', // always revalidate sw.js from network
      });
      // Actively poll for updates every 60 s so long-lived sessions self-update
      setInterval(() => reg.update(), 60_000);
    } catch {
      // SW not supported or blocked
    }

    // Reload as soon as a new SW takes control so users get the new bundle
    let seenController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (seenController) window.location.reload();
      seenController = true;
    });
  });
}

checkForNewBuild();
registerSW();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
