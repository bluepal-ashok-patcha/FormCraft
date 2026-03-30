import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MainLayout from './components/MainLayout';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import FormBuilder from './pages/FormBuilder';
import FormList from './pages/FormList';
import FormViewer from './pages/FormViewer';
import FormResponses from './pages/FormResponses';
import TemplateHub from './pages/TemplateHub';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  return <MainLayout>{children}</MainLayout>;
};

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <ToastContainer theme="light" position="bottom-right" />
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route path="/forgot-password" element={<AuthPage />} />
            <Route path="/f/:slug" element={<FormViewer />} />
            
            {/* Protected Enterprise Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/builder" element={<ProtectedRoute><FormBuilder /></ProtectedRoute>} />
            <Route path="/forms" element={<ProtectedRoute><FormList /></ProtectedRoute>} />
            <Route path="/templates" element={<ProtectedRoute><TemplateHub /></ProtectedRoute>} />
            <Route path="/forms/:id/responses" element={<ProtectedRoute><FormResponses /></ProtectedRoute>} />
            
            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<div className="p-10 text-center font-bold text-slate-400 uppercase tracking-widest">404 | Node Not Found</div>} />
          </Routes>
        </Router>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;