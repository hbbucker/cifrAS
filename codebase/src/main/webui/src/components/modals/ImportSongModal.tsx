import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { importSong } from '../../api/songs';

interface ImportSongModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportSongModal: React.FC<ImportSongModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    setLoading(true);
    try {
      const newSong = await importSong(url);
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
        className="bg-bg-card rounded-lg w-full max-w-md p-6 shadow-xl relative"
        role="dialog"
        aria-labelledby="import-modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-main"
          disabled={loading}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 id="import-modal-title" className="text-xl font-bold text-text-main mb-4">
          {t('songsList.importTitle', 'Importar do CifraClub')}
        </h2>
        
        <p className="text-sm text-text-muted mb-6">
          {t('songsList.importDesc', 'Cole o link de uma música do CifraClub para importá-la diretamente para o seu repertório.')}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="url-input" className="sr-only">URL</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                id="url-input"
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.cifraclub.com.br/..."
                className="w-full pl-10 pr-4 py-2.5 bg-bg-surface border border-border-main rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary text-text-main"
                disabled={loading}
              />
            </div>
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
              disabled={loading || !url.trim()}
            >
              {loading ? t('common.loading', 'Carregando...') : t('common.import', 'Importar')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
