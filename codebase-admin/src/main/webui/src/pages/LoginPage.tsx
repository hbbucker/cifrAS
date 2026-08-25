import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [isLoading, setIsLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const errorParam = searchParams.get('error');
  let urlErrorMessage: string | null = null;
  if (errorParam === 'not_admin') {
    urlErrorMessage = t('auth.notAdmin');
  } else if (errorParam === 'invalid_callback') {
    urlErrorMessage = t('auth.invalidCallback');
  } else if (errorParam === 'login_failed') {
    urlErrorMessage = t('auth.loginFailed');
  } else if (errorParam === 'unauthorized') {
    urlErrorMessage = t('auth.unauthorized');
  }

  const errorMessage = actionError || urlErrorMessage;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      const redirectUrl = encodeURIComponent(window.location.origin + '/auth/callback');
      const response = await axios.get<{ url: string }>(`/api/admin/auth/google-url?redirectTo=${redirectUrl}`);
      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('No OAuth URL returned');
      }
    } catch {
      setActionError(t('auth.loginFailed'));
      setIsLoading(false);
    }
  };

  const handleQuickDevLogin = () => {
    login('admin-dev-token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#f6f6f3] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg p-8 border border-[#dadad3] shadow-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-md bg-[#aa3bff] flex items-center justify-center text-white font-black text-2xl mx-auto shadow-sm">
            C
          </div>
          <h1 className="text-2xl font-black text-black">{t('auth.loginTitle')}</h1>
          <p className="text-xs text-[#62625b]">{t('auth.loginSubtitle')}</p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="p-4 bg-red-50 border border-red-200 rounded-md text-xs text-[#9e0a0a] flex items-start space-x-2.5"
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{errorMessage}</span>
          </div>
        )}

        <div className="space-y-4 pt-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-white hover:bg-[#f6f6f3] text-[#33332e] border border-[#dadad3] hover:border-[#91918c] font-bold rounded-md text-sm flex items-center justify-center space-x-3 transition-colors shadow-sm disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
            data-testid="google-admin-login-btn"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#aa3bff]" />
                <span>{t('auth.redirecting')}</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>{t('auth.googleSignIn')}</span>
              </>
            )}
          </button>
        </div>

        <div className="border-t border-[#dadad3] pt-4 text-center">
          <button
            type="button"
            onClick={handleQuickDevLogin}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#aa3bff] hover:underline"
          >
            <ShieldCheck size={14} />
            <span>Acesso Rápido de Teste / Dev</span>
          </button>
        </div>
      </div>
    </div>
  );
};
