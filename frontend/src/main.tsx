import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { Toaster } from 'react-hot-toast'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode> <BrowserRouter> <ThemeProvider> <AuthProvider> <App /> <Toaster
            position="top-right"
            gutter={8}
            toastOptions={{
              duration: 4000,
              className: '',
              style: {
                fontFamily: 'Roboto, system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '10px',
                padding: '12px 16px',
              },
            }}
          /> </AuthProvider> </ThemeProvider> </BrowserRouter> </React.StrictMode>,
)
