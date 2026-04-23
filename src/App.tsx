import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './components/Landing';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './components/DashboardHome';
import ProtectAsset from './components/ProtectAsset';
import History from './components/History';
import Settings from './components/Settings';
import CodeShieldDashboard from './components/CodeShieldDashboard';

// Custom Auth Wrapper to Redirect Correctly
const AuthRedirect = ({ user }: { user: User }) => {
  const targetApp = localStorage.getItem('activeProduct') || 'neuroglaze';
  return <Navigate to={targetApp === 'codeshield' ? '/codeshield-dashboard' : '/neuroglaze-dashboard'} replace />;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('activeProduct');
    auth.signOut();
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route 
          path="/" 
          element={user ? <AuthRedirect user={user} /> : <Landing />} 
        />

        {/* Protected Routes */}
        {user ? (
          <>
            {/* NeuroGlaze Routes */}
            <Route element={<DashboardLayout user={user} onLogout={handleLogout} />}>
              {/* Alias /neuroglaze-dashboard to DashboardHome to meet URL requirements */}
              <Route path="/neuroglaze-dashboard" element={<DashboardHome />} />
              <Route path="/dashboard" element={<Navigate to="/neuroglaze-dashboard" replace />} />
              <Route path="/protect" element={<ProtectAsset />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* CodeShield Routes */}
            <Route path="/codeshield-dashboard" element={<CodeShieldDashboard user={user} onLogout={handleLogout} />} />

            {/* Fallback to root logic */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}
