import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import '@testing-library/jest-dom/vitest';

describe('ConfirmModal Component', () => {
  it('triggers onConfirm callback correctly', () => {
    const onConfirmMock = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        variant="danger"
        onConfirm={onConfirmMock}
        onCancel={vi.fn()}
      />
    );
    
    fireEvent.click(screen.getByText('Confirm'));
    expect(onConfirmMock).toHaveBeenCalledTimes(1);
    
    // Check variant color rendering
    expect(screen.getByText('Confirm').className).toContain('bg-[#EF4444]');
  });

  it('triggers onCancel callback correctly', () => {
    const onCancelMock = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={vi.fn()}
        onCancel={onCancelMock}
      />
    );
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard escape correctly', () => {
    const onCancelMock = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={vi.fn()}
        onCancel={onCancelMock}
      />
    );
    
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });
});
