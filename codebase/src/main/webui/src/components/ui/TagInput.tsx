import React, { useState, useRef, useEffect } from 'react';
import { X, Tag as TagIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  availableSuggestions?: string[];
  placeholder?: string;
  maxTags?: number;
  label?: string;
  disabled?: boolean;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  availableSuggestions = [],
  placeholder,
  maxTags = 20,
  label,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultPlaceholder = placeholder || t('tags.inputPlaceholder', 'Adicione uma tag...');

  // Filter available suggestions (case-insensitive, exclude already selected)
  const filteredSuggestions = availableSuggestions
    .filter(
      (s) =>
        !tags.includes(s) &&
        s.toLowerCase().includes(inputValue.trim().toLowerCase())
    )
    .slice(0, 8);

  const addTag = (rawTag: string) => {
    const trimmed = rawTag.trim();
    if (!trimmed) return;
    if (tags.length >= maxTags) return;
    if (tags.includes(trimmed)) {
      setInputValue('');
      return;
    }
    onChange([...tags, trimmed.substring(0, 30)]);
    setInputValue('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const removeTag = (tagToRemove: string) => {
    if (disabled) return;
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
        addTag(filteredSuggestions[highlightedIndex]);
      } else if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      e.preventDefault();
      removeTag(tags[tags.length - 1]);
    } else if (e.key === 'ArrowDown' && filteredSuggestions.length > 0) {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp' && filteredSuggestions.length > 0) {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full flex flex-col gap-1.5" ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-text-main flex items-center gap-1.5">
          <TagIcon className="w-4 h-4 text-[#8629cc]" />
          {label}
        </label>
      )}

      <div
        onClick={() => inputRef.current?.focus()}
        className={`relative min-h-[44px] w-full bg-bg-card border border-border-main rounded-xl px-3 py-1.5 flex flex-wrap items-center gap-1.5 focus-within:border-[#8629cc] focus-within:ring-2 focus-within:ring-[#8629cc]/20 transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'
        }`}
        data-testid="tag-input-container"
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-[#8629cc]/10 dark:bg-[#8629cc]/20 text-[#8629cc] dark:text-[#c084fc] px-2.5 py-0.5 rounded-full text-xs font-semibold animate-fadeIn"
            data-testid={`tag-chip-${tag}`}
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className="hover:bg-[#8629cc]/20 rounded-full p-0.5 transition-colors focus:outline-none"
                aria-label={t('tags.remove', { tag, defaultValue: `Remover tag ${tag}` })}
                data-testid={`remove-tag-${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}

        {!disabled && tags.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? defaultPlaceholder : ''}
            className="flex-1 min-w-[120px] bg-transparent text-sm text-text-main placeholder:text-text-mute focus:outline-none"
            data-testid="tag-input-field"
          />
        )}

        {isOpen && filteredSuggestions.length > 0 && !disabled && (
          <ul
            className="absolute left-0 top-full mt-1.5 w-full bg-bg-card border border-border-main rounded-xl shadow-xl z-50 py-1 max-h-48 overflow-y-auto"
            role="listbox"
            data-testid="tag-suggestions-list"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <li
                key={suggestion}
                role="option"
                aria-selected={index === highlightedIndex}
                onClick={() => addTag(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between transition-colors ${
                  index === highlightedIndex
                    ? 'bg-[#8629cc]/15 text-[#8629cc] font-medium'
                    : 'text-text-main hover:bg-bg-elevated'
                }`}
                data-testid={`tag-suggestion-${suggestion}`}
              >
                <span>{suggestion}</span>
                <span className="text-xs text-text-mute">{t('tags.suggested', 'Sugerida')}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
