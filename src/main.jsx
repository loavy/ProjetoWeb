// Importa o componente StrictMode do React para verificação de avisos
import { StrictMode } from 'react'
// Importa createRoot para renderizar o React 18
import { createRoot } from 'react-dom/client'
// Importa os estilos globais
import './index.css'
// Importa o componente principal da aplicação
import App from './App.jsx'

// Renderiza a aplicação React no elemento com ID 'root' do HTML
createRoot(document.getElementById('root')).render(
  // StrictMode ajuda a identificar problemas potenciais na aplicação
  <StrictMode>
    <App />
  </StrictMode>,
)
