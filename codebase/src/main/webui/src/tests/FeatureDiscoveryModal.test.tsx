import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FeatureDiscoveryModal } from '../components/FeatureDiscoveryModal';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('FeatureDiscoveryModal', () => {
  it('renders the modal with new feature keys and calls onClose when button is clicked', () => {
    const handleClose = vi.fn();
    render(<FeatureDiscoveryModal onClose={handleClose} />);
    
    expect(screen.getByText('featureDiscovery.title')).toBeInTheDocument();
    expect(screen.getByText('🎤 featureDiscovery.singerMode')).toBeInTheDocument();
    expect(screen.getByText('📊 featureDiscovery.playlistExport')).toBeInTheDocument();
    
    const button = screen.getByText('featureDiscovery.button');
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
