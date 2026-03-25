import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import ReviewPage from './pages/ReviewPage';
import LoginPage from './pages/LoginPage';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AuthHandler = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('accessToken');
    if (token) {
      // In a real app we'd fetch the user profile here using the token
      // For now we set a dummy user profile
      setAuth({ id: 'oauth', email: null, name: 'OAuth User', avatarUrl: null }, token);
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location, setAuth]);

  return null;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <AuthHandler />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/review" replace />} />
          <Route path="/review" element={
            <ProtectedRoute>
              <ReviewPage />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
