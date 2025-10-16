

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'
import './index.css'
import './polyfills/globalish';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <HashRouter basename="/">
    <App />
  </HashRouter>
);