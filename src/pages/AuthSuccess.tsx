import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Store the token in localStorage
      localStorage.setItem('authToken', token);

      const handleAuthSuccess = async () => {
        // Refresh the user's data now that the token is stored
        await refreshUser();
        // Redirect to the dashboard
        navigate('/dashboard', { replace: true });
      };

      handleAuthSuccess();
    } else {
      // If no token is found, redirect to an error page or home
      console.error("No token found in URL.");
      navigate('/', { replace: true });
    }
  }, [navigate, searchParams, refreshUser]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Finalizing Authentication</h2>
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
