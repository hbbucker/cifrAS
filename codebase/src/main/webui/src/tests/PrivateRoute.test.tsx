import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PrivateRoute } from '../components/auth/PrivateRoute';
import { useAuth } from '../context/AuthContext';
import '@testing-library/jest-dom/vitest';

vi.mock('../context/AuthContext', () => ({
 useAuth: vi.fn(),
}));

describe('PrivateRoute', () => {
 it('redirects to /login when unauthenticated', () => {
 (useAuth as unknown as { mockReturnValue: (val: unknown) => void }).mockReturnValue({ isAuthenticated: false, loading: false });

 render(
 <MemoryRouter initialEntries={['/protected']}>
 <Routes>
 <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
 <Route 
 path="/protected" 
 element={
 <PrivateRoute>
 <div data-testid="protected-content">Protected</div>
 </PrivateRoute>
 } 
 />
 </Routes>
 </MemoryRouter>
 );

 expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
 expect(screen.getByTestId('login-page')).toBeInTheDocument();
 });

 it('renders children when authenticated', () => {
 (useAuth as unknown as { mockReturnValue: (val: unknown) => void }).mockReturnValue({ isAuthenticated: true, loading: false });

 render(
 <MemoryRouter initialEntries={['/protected']}>
 <Routes>
 <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
 <Route 
 path="/protected" 
 element={
 <PrivateRoute>
 <div data-testid="protected-content">Protected</div>
 </PrivateRoute>
 } 
 />
 </Routes>
 </MemoryRouter>
 );

 expect(screen.getByTestId('protected-content')).toBeInTheDocument();
 expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
 });
});
