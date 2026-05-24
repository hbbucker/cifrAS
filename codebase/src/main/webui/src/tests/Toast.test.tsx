import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ToastProvider, useToast } from '../context/ToastContext';
import '@testing-library/jest-dom/vitest';

const TestComponent = () => {
  const { toast } = useToast();
  return (
    <div>
      <button onClick={() => toast('Success message', 'success')}>Success</button>
      <button onClick={() => toast('Warning message', 'warning')}>Warning</button>
      <button onClick={() => toast('Error message', 'error')}>Error</button>
    </div>
  );
};

describe('ToastContext & ToastNotification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('triggers and renders success toast', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Success'));
    
    const toast = screen.getByRole('alert');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveTextContent('Success message');
    expect(toast.className).toContain('bg-[#10B981]');
  });

  it('triggers and renders warning and error toasts', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Warning'));
    const warningToast = screen.getByText('Warning message');
    expect(warningToast).toBeInTheDocument();
    expect(warningToast.parentElement?.className).toContain('bg-[#F59E0B]');

    fireEvent.click(screen.getByText('Error'));
    const errorToast = screen.getByText('Error message');
    expect(errorToast).toBeInTheDocument();
    expect(errorToast.parentElement?.className).toContain('bg-[#EF4444]');
  });

  it('auto-dismisses toast after 3000ms', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Success'));
    expect(screen.getByText('Success message')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
  });
});
