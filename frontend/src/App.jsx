// Archivo: src/App.jsx
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Dashboard from './Dashboard';
import Login from './Login';
import { RutaProtegida } from './components/RutaProtegida'; // 👈 Importamos el guardia

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
        <Routes>
          {/* Ruta Pública (Login) */}
          <Route path="/" element={<Login />} />

          {/* 👇 RUTA PROTEGIDA: Solo se puede entrar si hay login 👇 */}
          <Route 
            path="/dashboard" 
            element={
              <RutaProtegida>
                <Dashboard />
              </RutaProtegida>
            } 
          />
          {/* 👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆 */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;