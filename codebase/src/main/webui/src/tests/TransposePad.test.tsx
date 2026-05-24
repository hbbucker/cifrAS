import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TransposePad } from '../components/music/TransposePad';
import '@testing-library/jest-dom/vitest';

describe('TransposePad Component', () => {
  it('displays the current transposed key', () => {
    render(<TransposePad currentKey="G" onTransposeDown={vi.fn()} onTransposeUp={vi.fn()} />);
    expect(screen.getByTestId('current-key')).toHaveTextContent('G');
  });

  it('triggers transposition callbacks on click', () => {
    const onDown = vi.fn();
    const onUp = vi.fn();
    render(<TransposePad currentKey="C" onTransposeDown={onDown} onTransposeUp={onUp} />);
    
    fireEvent.click(screen.getByTestId('transpose-down'));
    expect(onDown).toHaveBeenCalledTimes(1);
    
    fireEvent.click(screen.getByTestId('transpose-up'));
    expect(onUp).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when disabled prop is true', () => {
    render(<TransposePad currentKey="C" disabled={true} onTransposeDown={vi.fn()} onTransposeUp={vi.fn()} />);
    
    expect(screen.getByTestId('transpose-down')).toBeDisabled();
    expect(screen.getByTestId('transpose-up')).toBeDisabled();
  });
});
