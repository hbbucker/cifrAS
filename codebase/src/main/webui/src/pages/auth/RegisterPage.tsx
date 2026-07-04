import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useToast } from '../../context/ToastContext';
import authClient from '../../services/authService';
import { Music } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
 const [name, setName] = useState('');
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const { toast } = useToast();
 const navigate = useNavigate();

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!name || !email || !password || !confirmPassword) {
 toast('Please fill all fields', 'warning');
 return;
 }

 if (password !== confirmPassword) {
 toast('Passwords do not match', 'error');
 return;
 }

 setIsLoading(true);
 try {
 await authClient.post('/register', { name, email, password });
 toast('Registered successfully! Please log in.', 'success');
 navigate('/login');
 } catch (error: unknown) {
 const err = error as { response?: { data?: { error?: string } } };
 const msg = err.response?.data?.error || 'Failed to register';
 toast(msg, 'error');
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
 <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
 <div className="flex flex-col items-center mb-8">
 <div className="w-16 h-16 bg-[#aa3bff]/20 rounded-full flex items-center justify-center mb-4">
 <Music className="w-8 h-8 text-[#aa3bff]" />
 </div>
 <h2 className="text-3xl font-bold text-white text-center">{t('auth.createAccount')}</h2>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="name">{t('auth.fullName')}</label>
 <input 
 id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
 className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#aa3bff] focus:border-transparent transition-all"
 placeholder={t('auth.namePlaceholder')} data-testid="name-input"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">{t('auth.email')}</label>
 <input 
 id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
 className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#aa3bff] focus:border-transparent transition-all"
 placeholder={t('auth.emailPlaceholder')} data-testid="reg-email-input"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">{t('auth.password')}</label>
 <input 
 id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
 className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#aa3bff] focus:border-transparent transition-all"
 placeholder="••••••••" data-testid="reg-password-input"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
 <input 
 id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
 className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#aa3bff] focus:border-transparent transition-all"
 placeholder="••••••••" data-testid="reg-confirm-password-input"
 />
 </div>
 <button 
 type="submit" disabled={isLoading}
 className="w-full mt-6 bg-[#aa3bff] hover:bg-[#902be6] text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center disabled:opacity-50"
 data-testid="register-btn"
 >
 {isLoading ? 'Creating account...' : 'Register'}
 </button>
 </form>
 <p className="mt-6 text-center text-gray-400 text-sm">
 {t('auth.hasAccount')} <a href="/login" className="text-[#aa3bff] hover:underline">{t('landing.login')}</a>
 </p>
 <div className="mt-4 flex justify-center space-x-4 text-xs text-gray-500">
  <a href="/privacy?lang=pt" className="hover:text-[#aa3bff] transition-colors">{t('landing.privacy')}</a>
  <span>•</span>
  <a href="/privacy?lang=en" className="hover:text-[#aa3bff] transition-colors">{t('landing.privacy')}</a>
 </div>
 </div>
 </div>
 );
};
