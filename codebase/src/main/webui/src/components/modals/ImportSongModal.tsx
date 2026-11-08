import React, { useState, useMemo } from 'react';
import { X, Search, Globe, CheckCircle2, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { importSong } from '../../api/songs';

interface ImportSongModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProviderBadge {
  id: string;
  name: string;
  domain: string;
  homeUrl: string;
  getSearchUrl: (query: string) => string;
  matchPattern: RegExp;
}

const SUPPORTED_PROVIDERS: ProviderBadge[] = [
  {
    id: 'cifraclub',
    name: 'Cifra Club',
    domain: 'cifraclub.com.br',
    homeUrl: 'https://www.cifraclub.com.br',
    getSearchUrl: (q) => `https://www.cifraclub.com.br/?q=${encodeURIComponent(q)}`,
    matchPattern: /cifraclub\.com(\.br)?/i,
  },
  {
    id: 'ultimate-guitar',
    name: 'Ultimate Guitar',
    domain: 'ultimate-guitar.com',
    homeUrl: 'https://www.ultimate-guitar.com',
    getSearchUrl: (q) => `https://www.ultimate-guitar.com/search.php?search_type=title&value=${encodeURIComponent(q)}`,
    matchPattern: /ultimate-?guitar\.com/i,
  },
  {
    id: 'lacuerda',
    name: 'LaCuerda.net',
    domain: 'lacuerda.net',
    homeUrl: 'https://lacuerda.net',
    getSearchUrl: (q) => `https://lacuerda.net/busca.php?q=${encodeURIComponent(q)}`,
    matchPattern: /lacuerda\.net/i,
  },
  {
    id: 'chordie',
    name: 'Chordie',
    domain: 'chordie.com',
    homeUrl: 'https://www.chordie.com',
    getSearchUrl: (q) => `https://www.chordie.com/search.php?q=${encodeURIComponent(q)}`,
    matchPattern: /chordie\.com/i,
  },
  {
    id: 'e-chords',
    name: 'e-Chords',
    domain: 'e-chords.com',
    homeUrl: 'https://www.e-chords.com',
    getSearchUrl: (q) => `https://www.e-chords.com/search?q=${encodeURIComponent(q)}`,
    matchPattern: /e-?chords\.com/i,
  },
];

export const ImportSongModal: React.FC<ImportSongModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const trimmedInput = url.trim();
  const isUrl = /^https?:\/\//i.test(trimmedInput);

  const detectedProvider = useMemo(() => {
    if (!trimmedInput || !isUrl) return null;
    return SUPPORTED_PROVIDERS.find((p) => p.matchPattern.test(trimmedInput)) || null;
  }, [trimmedInput, isUrl]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmedInput) return;
    
    setLoading(true);
    try {
      const newSong = await importSong(trimmedInput);
      setUrl('');
      onClose();
      toast(t('songsList.importSuccess', 'Música importada com sucesso!'), 'success');
      navigate(`/songs/edit/${newSong.id}`);
    } catch {
      toast(t('songsList.importError', 'Erro ao importar a música. Verifique a URL e tente novamente.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div 
        className="bg-bg-card rounded-lg w-full max-w-lg p-6 shadow-xl relative"
        role="dialog"
        aria-labelledby="import-modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-main p-1 rounded-md transition-colors"
          disabled={loading}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-6 h-6 text-brand-primary" />
          <h2 id="import-modal-title" className="text-xl font-bold text-text-main">
            {t('songsList.importTitle', 'Importar Cifra da Web')}
          </h2>
        </div>
        
        <p className="text-sm text-text-muted mb-4">
          {t('songsList.importDesc', 'Cole o link de uma música do Cifra Club, Ultimate Guitar, LaCuerda, Chordie ou e-Chords para importá-la diretamente para o seu repertório.')}
        </p>

        {/* Supported Providers Chips / Links */}
        <div className="mb-5">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">
            {t('songsList.supportedProviders', 'Sites suportados (clique para abrir e buscar):')}
          </span>
          <div className="flex flex-wrap gap-2">
            {SUPPORTED_PROVIDERS.map((provider) => {
              const isDetected = detectedProvider?.id === provider.id;
              const linkUrl = !isUrl && trimmedInput.length >= 2 
                ? provider.getSearchUrl(trimmedInput) 
                : provider.homeUrl;

              return (
                <a
                  key={provider.id}
                  href={linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 active:scale-95 group ${
                    isDetected
                      ? 'bg-brand-primary text-white ring-2 ring-brand-primary/30 font-semibold'
                      : 'bg-bg-surface text-text-muted hover:text-text-main hover:bg-bg-elevated border border-border-main'
                  }`}
                  data-testid={`provider-badge-${provider.id}`}
                  title={t('songsList.openSite', { name: provider.name, defaultValue: `Abrir ${provider.name} em nova aba` })}
                >
                  {isDetected ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                  ) : (
                    <ExternalLink className="w-3 h-3 text-text-muted group-hover:text-text-main shrink-0" />
                  )}
                  <span>{provider.name}</span>
                </a>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="url-input" className="sr-only">URL</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                id="url-input"
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Cole o link da cifra (ex: https://tabs.ultimate-guitar.com/...)"
                className="w-full pl-10 pr-4 py-2.5 bg-bg-surface border border-border-main rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary text-text-main placeholder:text-text-muted/60"
                disabled={loading}
              />
            </div>

            {detectedProvider && (
              <p className="text-xs text-brand-primary font-medium mt-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t('songsList.providerDetected', { name: detectedProvider.name, defaultValue: `Provedor detectado: ${detectedProvider.name}` })}
              </p>
            )}

            {/* If user typed words instead of a URL, show quick search suggestion */}
            {!isUrl && trimmedInput.length >= 2 && (
              <div className="mt-2.5 p-2.5 rounded-md bg-bg-surface border border-border-main text-xs flex flex-col gap-1.5 animate-fadeIn">
                <span className="text-text-muted font-medium flex items-center gap-1">
                  <Search className="w-3.5 h-3.5 text-brand-primary" />
                  {t('songsList.searchOnWebHint', 'Clique em um site para buscar uma música:')}
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {SUPPORTED_PROVIDERS.map((p) => (
                    <a
                      key={`search-${p.id}`}
                      href={p.getSearchUrl(trimmedInput)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-bg-card hover:bg-brand-primary hover:text-white text-text-main border border-border-main text-xs font-medium transition-colors"
                      data-testid={`quick-search-${p.id}`}
                    >
                      <ExternalLink className="w-3 h-3" />
                      {p.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 mt-2">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose}
              disabled={loading}
            >
              {t('common.cancel', 'Cancelar')}
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !trimmedInput}
            >
              {loading ? t('common.loading', 'Carregando...') : t('common.import', 'Importar')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
