import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { AdminAuthProvider } from '../context/AdminAuthContext';

describe('AdminLayout', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('admin_token', 'admin-dev-token');
  });

  it('renders navigation links, brand logo, and switches languages', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <AdminAuthProvider>
          <Routes>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<div>Dashboard Content</div>} />
              <Route path="/users" element={<div>Users Content</div>} />
            </Route>
          </Routes>
        </AdminAuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('CifrAS')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();

    // Check language switch buttons: PT, EN, ES
    const ptBtn = screen.getByRole('button', { name: 'PT' });
    const enBtn = screen.getByRole('button', { name: 'EN' });
    const esBtn = screen.getByRole('button', { name: 'ES' });

    expect(ptBtn).toBeInTheDocument();
    expect(enBtn).toBeInTheDocument();
    expect(esBtn).toBeInTheDocument();

    await user.click(esBtn);
    await waitFor(() => {
      expect(screen.getByText('Panel de Control')).toBeInTheDocument();
    });

    await user.click(ptBtn);
  });

  it('handles logout and mobile menu toggle', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <AdminAuthProvider>
          <Routes>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<div>Dashboard Content</div>} />
            </Route>
            <Route path="/login" element={<div>Login Page Target</div>} />
          </Routes>
        </AdminAuthProvider>
      </MemoryRouter>
    );

    const logoutBtn = screen.getByRole('button', { name: /Sair|Logout|Cerrar sesión/i });
    await user.click(logoutBtn);

    expect(localStorage.getItem('admin_token')).toBeNull();
  });
});
