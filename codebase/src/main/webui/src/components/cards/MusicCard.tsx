import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, MoreVertical, Edit2, Share2, Trash2 } from 'lucide-react';

export interface MusicCardProps {
 id: string;
 title: string;
 artist: string;
 keySignature: string;
 isFavorite: boolean;
 categories?: string[];
 tags?: string[];
 onToggleFavorite: (id: string) => void;
 onEdit: (id: string) => void;
 onShare: (id: string) => void;
 onDelete: (id: string) => void;
}

export const MusicCard: React.FC<MusicCardProps> = ({
 id, title, artist, keySignature, isFavorite: initialIsFavorite, categories = [], tags = [],
 onToggleFavorite, onEdit, onShare, onDelete
}) => {
  const { t } = useTranslation();
 const [menuOpen, setMenuOpen] = useState(false);
 const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

 const displayTags = tags && tags.length > 0 ? tags : categories;

 const handleToggleFavorite = (e: React.MouseEvent) => {
 e.stopPropagation();
 setIsFavorite(!isFavorite);
 onToggleFavorite(id);
 };

  return (
    <div className="relative bg-bg-card rounded-2xl border border-border-main p-3.5 sm:p-4.5 transition-all hover:shadow-md hover:border-[#8629cc]/50 flex flex-col group min-w-0">
      <div className="flex justify-between items-start gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base sm:text-lg text-text-main truncate">{title}</h3>
          <p className="text-text-mute text-xs sm:text-sm truncate">{artist}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="bg-bg-elevated text-text-main text-xs font-bold px-2 py-1 rounded-md">
            {keySignature}
          </span>
          <button 
            onClick={handleToggleFavorite}
            className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-gray-500 hover:text-[#EC4899] hover:bg-bg-elevated transition-colors"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            data-testid="favorite-btn"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#EC4899] text-[#EC4899]' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-1.5 mb-3">
        {displayTags.map((tag) => (
          <span key={tag} className="text-[11px] sm:text-xs bg-[#8629cc]/10 dark:bg-[#8629cc]/20 text-[#8629cc] dark:text-[#c084fc] px-2 py-0.5 rounded-full font-medium">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex justify-end pt-1">
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-bg-elevated text-text-mute transition-colors"
            aria-label={t('musicCard.actions')}
            aria-expanded={menuOpen}
            data-testid="menu-btn"
          >
            <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 w-48 bg-bg-card rounded-xl shadow-xl border border-border-main z-20 py-1" data-testid="dropdown-menu">
              <button onClick={(e) => { e.stopPropagation(); onEdit(id); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-bg-elevated flex items-center gap-2 text-sm text-text-main">
                <Edit2 className="w-4 h-4" /> {t('musicCard.edit')}
              </button>
              <button onClick={(e) => { e.stopPropagation(); onShare(id); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-bg-elevated flex items-center gap-2 text-sm text-text-main">
                <Share2 className="w-4 h-4" /> {t('musicCard.share')}
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(id); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2 text-sm">
                <Trash2 className="w-4 h-4" /> {t('musicCard.delete')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
