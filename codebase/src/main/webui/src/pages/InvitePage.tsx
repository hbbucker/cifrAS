import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getShareLinkInfo, acceptShareLink } from '../api/shareLinks';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/Spinner';
import { ErrorState } from '../components/ui/ErrorState';

export const InvitePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !token) return;

    const processInvite = async () => {
      try {
        setLoading(true);
        // We first fetch link info to verify it's valid, but actually if unauthenticated,
        // we can just save it and redirect.
        if (!user) {
          localStorage.setItem('pendingShareToken', token);
          navigate('/login', { replace: true });
          return;
        }

        // We are logged in. We can accept directly or show the info and then accept.
        // The prompt says "No arquivo principal de rotas ou App.tsx, após o login... verifique localStorage... Se houver token, chame POST /api/share-links/{token}/accept"
        // But what if the user is ALREADY logged in when they click the link?
        // We can just call accept here directly.
        await acceptShareLink(token);
        
        // After accept, we fetch the info to know where to redirect, or maybe acceptShareLink returns the resource type/id?
        // Let's fetch info first to know where to redirect, or accept and then fetch.
        const info = await getShareLinkInfo(token);
        
        if (info.type === 'SONG') {
          navigate(`/songs/${info.resourceId}`, { replace: true });
        } else if (info.type === 'GROUP') {
          navigate(`/groups/${info.resourceId}`, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 401) {
          localStorage.setItem('pendingShareToken', token);
          navigate('/login', { replace: true });
        } else if (axiosErr.response?.status === 404) {
          setError(t('invite.notFound', 'Convite não encontrado ou expirado.'));
        } else if (axiosErr.response?.status === 400) {
          setError(t('invite.invalid', 'Convite inválido.'));
        } else {
          setError(t('invite.error', 'Ocorreu um erro ao processar o convite.'));
        }
      } finally {
        setLoading(false);
      }
    };

    processInvite();
  }, [token, user, authLoading, navigate, t]);

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" className="text-[#aa3bff]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <ErrorState title={t('common.error', 'Erro')} message={error} onRetry={() => navigate('/')} retryText={t('common.goHome', 'Ir para Home')} />
      </div>
    );
  }

  return null;
};
