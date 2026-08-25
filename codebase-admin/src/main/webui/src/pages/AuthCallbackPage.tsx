import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { isTokenAdmin } from '../utils/adminAuthUtils';

export const AuthCallbackPage: React.FC = () => {
  const { t } = useTranslation();
  const { login, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Check for error in hash or search query params
    const hashString = location.hash.startsWith('#') ? location.hash.substring(1) : location.hash;
    const hashParams = new URLSearchParams(hashString);
    const searchParams = new URLSearchParams(location.search);

    const error = hashParams.get('error') || searchParams.get('error');
    if (error) {
      logout();
      navigate('/login?error=login_failed', { replace: true });
      return;
    }

    // 2. Extract access_token
    const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
    if (!accessToken) {
      logout();
      navigate('/login?error=invalid_callback', { replace: true });
      return;
    }

    // 3. Verify admin role before granting access
    if (!isTokenAdmin(accessToken)) {
      logout();
      navigate('/login?error=not_admin', { replace: true });
      return;
    }

    // 4. Authenticate and redirect to dashboard
    const success = login(accessToken);
    if (success) {
      navigate('/', { replace: true });
    } else {
      logout();
      navigate('/login?error=not_admin', { replace: true });
    }
  }, [location, login, logout, navigate]);

  return (
    <div className="min-h-screen bg-[#f6f6f3] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-lg p-8 border border-[#dadad3] shadow-md text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-[#aa3bff]/10 border border-[#aa3bff]/20 flex items-center justify-center mx-auto animate-pulse">
          <ShieldCheck className="w-8 h-8 text-[#aa3bff]" />
        </div>
        <h2 className="text-lg font-black text-black">{t('auth.loginTitle')}</h2>
        <p className="text-xs text-[#62625b]">{t('auth.verifying')}</p>
      </div>
    </div>
  );
};
