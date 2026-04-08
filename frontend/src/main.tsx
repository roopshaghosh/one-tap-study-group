// FILE PATH: frontend/src/main.tsx
// ============================================================================
// REACT ENTRY POINT
// ============================================================================
// This file is the very first file that runs in React. 
// It looks for the <div id="root"> inside our index.html file and "injects" 
// our entire React application (the <App /> component) into it.

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  // StrictMode runs components twice in development to catch bugs
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
