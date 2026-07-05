import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Praticantes from './pages/Praticantes';
import Planos from './pages/Planos';
import Pagamentos from './pages/Pagamentos';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function PrivateLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />
      <main className="py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/praticantes" element={<Praticantes />} />
          <Route path="/planos" element={<Planos />} />
          <Route path="/pagamentos" element={<Pagamentos />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <PrivateRoute>
              <PrivateLayout />
            </PrivateRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;