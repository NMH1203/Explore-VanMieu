// Mount React into HTML DOM - Application bootstrap entry point

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import './styles/heritage.css'

// Mount the root React component tree into the '#root' element in index.html
// Wraps with StrictMode for development checks and LanguageProvider for i18n support
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider><App /></LanguageProvider>
  </StrictMode>,
)

