import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [tokenInput, setTokenInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setError(t('common.error'));
      return;
    }
    login(tokenInput.trim());
    navigate('/');
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

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-[#9e0a0a]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#33332e]">
              {t('auth.tokenLabel')}
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-[#91918c]" size={18} />
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => {
                  setTokenInput(e.target.value);
                  setError(null);
                }}
                placeholder={t('auth.tokenPlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 bg-[#f6f6f3] border border-[#dadad3] rounded-md text-sm text-black placeholder-[#91918c] focus:outline-none focus:border-[#aa3bff]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#aa3bff] hover:bg-[#9329e6] text-white font-bold rounded-md text-sm flex items-center justify-center space-x-2 transition-colors shadow-sm"
          >
            <span>{t('auth.enter')}</span>
            <ArrowRight size={16} />
          </button>
        </form>

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
