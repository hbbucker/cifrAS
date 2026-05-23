import React, { useState } from 'react';
import { Heart, MoreVertical, Edit2, Share2, Trash2 } from 'lucide-react';

export interface MusicCardProps {
  id: string;
  title: string;
  artist: string;
  keySignature: string;
  isFavorite: boolean;
  categories: string[];
  onToggleFavorite: (id: string) => void;
  onEdit: (id: string) => void;
  onShare: (id: string) => void;
  onDelete: (id: string) => void;
}

export const MusicCard: React.FC<MusicCardProps> = ({
  id, title, artist, keySignature, isFavorite: initialIsFavorite, categories,
  onToggleFavorite, onEdit, onShare, onDelete
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    onToggleFavorite(id);
  };

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-all hover:shadow-md hover:border-[#aa3bff]/50 flex flex-col group">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">{title}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{artist}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold px-2 py-1 rounded">
            {keySignature}
          </span>
          <button 
            onClick={handleToggleFavorite}
            className="w-12 h-12 flex items-center justify-center rounded-full text-gray-400 hover:text-[#EC4899] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            data-testid="favorite-btn"
          >
            <Heart className={`w-6 h-6 ${isFavorite ? 'fill-[#EC4899] text-[#EC4899]' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-2 mb-4">
        {categories.map((cat) => (
          <span key={cat} className="text-xs bg-[#aa3bff]/10 text-[#aa3bff] px-2 py-0.5 rounded-full font-medium">
            {cat}
          </span>
        ))}
      </div>

      <div className="mt-auto flex justify-end">
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            aria-label="Actions menu"
            aria-expanded={menuOpen}
            data-testid="menu-btn"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10 py-1" data-testid="dropdown-menu">
              <button onClick={(e) => { e.stopPropagation(); onEdit(id); setMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button onClick={(e) => { e.stopPropagation(); onShare(id); setMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <Share2 className="w-4 h-4" /> Share
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(id); setMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2 text-sm">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
