import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import authClient from '../../services/authService';
import { Music } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast('Please fill all fields', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authClient.post('/login', { email, password });
      const { accessToken, refreshToken } = response.data;
      login(accessToken, refreshToken, { id: 'user', email, name: email.split('@')[0] });
      toast('Logged in successfully!', 'success');
      navigate('/dashboard');
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Failed to login';
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
          <h2 className="text-3xl font-bold text-white text-center">Welcome to CifrAS</h2>
          <p className="text-gray-400 mt-2 text-center">Your modern chord & repertoire manager</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">Email</label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#aa3bff] focus:border-transparent transition-all"
              placeholder="you@example.com"
              data-testid="email-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#aa3bff] focus:border-transparent transition-all"
              placeholder="••••••••"
              data-testid="password-input"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#aa3bff] hover:bg-[#902be6] text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center disabled:opacity-50"
            data-testid="login-btn"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-400 text-sm">
          Don't have an account? <a href="/register" className="text-[#aa3bff] hover:underline">Register</a>
        </p>
      </div>
    </div>
  );
};
