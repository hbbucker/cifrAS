import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { BottomNav } from '../components/layout/BottomNav';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import '@testing-library/jest-dom/vitest';

describe('Layout Components', () => {
 describe('Sidebar', () => {
 it('renders and contains ARIA navigation roles', () => {
  render(
  <AuthProvider>
  <ThemeProvider>
  <ToastProvider>
  <MemoryRouter>
  <Sidebar />
  </MemoryRouter>
  </ToastProvider>
  </ThemeProvider>
  </AuthProvider>
  );
 
 expect(screen.getByRole('navigation', { name: 'Main sidebar navigation' })).toBeInTheDocument();
 expect(screen.getByTestId('sidebar').className).toContain('hidden sm:flex');
 });

 it('toggles collapse state on button click', () => {
  render(
  <AuthProvider>
  <ThemeProvider>
  <ToastProvider>
  <MemoryRouter>
  <Sidebar />
  </MemoryRouter>
  </ToastProvider>
  </ThemeProvider>
  </AuthProvider>
  );
 
 const sidebar = screen.getByTestId('sidebar');
 expect(sidebar.className).toContain('w-64');
 
 const toggleBtn = screen.getByRole('button', { name: 'Collapse sidebar' });
 fireEvent.click(toggleBtn);
 
 expect(sidebar.className).toContain('w-20');
 expect(screen.queryByText('CifrAS')).not.toBeInTheDocument();
 
 const expandBtn = screen.getByRole('button', { name: 'Expand sidebar' });
 fireEvent.click(expandBtn);
 
 expect(sidebar.className).toContain('w-64');
 });
 });

 describe('BottomNav', () => {
 it('renders and contains ARIA roles', () => {
  render(
  <AuthProvider>
  <ThemeProvider>
  <ToastProvider>
  <MemoryRouter>
  <BottomNav />
  </MemoryRouter>
  </ToastProvider>
  </ThemeProvider>
  </AuthProvider>
  );
 
 const nav = screen.getByTestId('bottom-nav');
 expect(nav).toBeInTheDocument();
 expect(nav.className).toContain('sm:hidden');
 expect(screen.getByRole('navigation', { name: 'Mobile bottom navigation' })).toBeInTheDocument();
 
 expect(screen.getAllByRole('link')).toHaveLength(4);
 });
 });
});
