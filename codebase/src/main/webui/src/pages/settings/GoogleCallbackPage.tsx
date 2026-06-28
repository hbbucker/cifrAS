import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { googleDriveApi } from '../../api/googleDrive';
import { Loader2 } from 'lucide-react';

export function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const returnUrl = localStorage.getItem('googleAuthReturnUrl') || '/';

    if (!code) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('Código de autorização não encontrado na URL.');
      return;
    }

    let isMounted = true;

    const exchangeCode = async () => {
      try {
        await googleDriveApi.exchangeCode(code);
        if (isMounted) {
          if (window.opener) {
            window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS' }, window.location.origin);
            window.close();
            return;
          }
          localStorage.removeItem('googleAuthReturnUrl');
          navigate(returnUrl, { replace: true });
        }
      } catch (err) {
        if (isMounted) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setError((err as any).response?.data?.error || (err as any).message || 'Falha ao conectar com o Google Drive.');
        }
      }
    };

    exchangeCode();

    return () => {
      isMounted = false;
    };
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-canvas">
      {error ? (
        <div className="text-center p-8 bg-surfaceCard rounded-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-primary mb-4">Erro na Conexão</h2>
          <p className="text-body mb-6">{error}</p>
          <button
            onClick={() => {
              const returnUrl = localStorage.getItem('googleAuthReturnUrl') || '/';
              navigate(returnUrl, { replace: true });
            }}
            className="w-full bg-surfaceCard hover:bg-gray-200 text-ink font-semibold py-3 px-4 rounded-full transition-colors"
          >
            Voltar
          </button>
        </div>
      ) : (
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-ink">Conectando ao Google Drive...</h2>
          <p className="text-body mt-2">Por favor, aguarde um momento.</p>
        </div>
      )}
    </div>
  );
}
