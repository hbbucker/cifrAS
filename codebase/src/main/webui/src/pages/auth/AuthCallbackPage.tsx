import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Music } from 'lucide-react';
import { acceptShareLink, getShareLinkInfo } from '../../api/shareLinks';

export const AuthCallbackPage: React.FC = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Supabase returns the tokens in the hash (e.g., #access_token=...&refresh_token=...)
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    // It can also return error parameters
    const error = hashParams.get('error') || new URLSearchParams(location.search).get('error');
    const errorDescription = hashParams.get('error_description') || new URLSearchParams(location.search).get('error_description');

    if (error) {
      toast(`Login failed: ${errorDescription || error}`, 'error');
      navigate('/login', { replace: true });
      return;
    }

    if (accessToken && refreshToken) {
      const processLogin = async () => {
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          const rawName = payload.user_metadata?.full_name || payload.user_metadata?.name || payload.name;
          let displayName = rawName;
          if (!displayName && payload.email) {
            const prefix = payload.email.split('@')[0];
            displayName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
          }

          login(accessToken, refreshToken, {
            id: payload.sub || 'user',
            email: payload.email || 'user@example.com',
            name: displayName || 'Musician'
          });
          
          toast('Logged in successfully!', 'success');
          
          const pendingToken = localStorage.getItem('pendingShareToken');
          if (pendingToken) {
            localStorage.removeItem('pendingShareToken');
            try {
              // Note: Need to make sure apiClient uses the new token, but authContext's login sets it to localStorage synchronously, so apiClient might pick it up correctly. 
              // Better to just redirect to /invite/token where the flow handles it properly with the updated token, BUT the prompt explicitly says:
              // "verifique o localStorage. Se houver token, chame POST /api/share-links/{token}/accept e redirecione para o recurso"
              // So I will try to call it here.
              await acceptShareLink(pendingToken);
              const info = await getShareLinkInfo(pendingToken);
              if (info.type === 'SONG') {
                navigate(`/song/${info.resourceId}`, { replace: true });
                return;
              } else if (info.type === 'GROUP') {
                navigate(`/groups/${info.resourceId}`, { replace: true });
                return;
              }
            } catch (err) {
              console.error('Failed to accept share link', err);
            }
          }
          navigate('/dashboard', { replace: true });
        } catch (err) {
          console.error('Error parsing token in callback', err);
          toast('Error processing login token', 'error');
          navigate('/login', { replace: true });
        }
      };
      
      processLogin();
    } else {
      toast('Invalid login callback URL', 'error');
      navigate('/login', { replace: true });
    }
  }, [location, login, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 bg-[#aa3bff]/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
          <Music className="w-8 h-8 text-[#aa3bff]" />
        </div>
        <h2 className="text-xl font-medium text-white text-center">Completing login...</h2>
      </div>
    </div>
  );
};
