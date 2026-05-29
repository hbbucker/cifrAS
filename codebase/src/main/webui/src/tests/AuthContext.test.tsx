import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';
import authClient from '../services/authService';

vi.mock('../services/authService', () => ({
 default: {
 get: vi.fn(),
 }
}));

const TestComponent = () => {
 const { user, isAuthenticated, login, logout, loading } = useAuth();
 
 if (loading) return <div>Loading...</div>;
 
 return (
 <div>
 <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Unauthenticated'}</div>
 <div data-testid="user-name">{user?.name}</div>
 <button onClick={() => login('mockToken', 'mockRefresh', { id: '1', email: 'test@test.com', name: 'Test User' })}>Login</button>
 <button onClick={logout}>Logout</button>
 </div>
 );
};

describe('AuthContext', () => {
 beforeEach(() => {
 localStorage.clear();
 vi.clearAllMocks();
 });

 it('provides default unauthenticated state', async () => {
 (authClient.get as unknown as { mockRejectedValue: (val: unknown) => void }).mockRejectedValue(new Error('Unauthorized'));
 
 await act(async () => {
 render(
 <AuthProvider>
 <TestComponent />
 </AuthProvider>
 );
 });

 expect(screen.getByTestId('auth-status')).toHaveTextContent('Unauthenticated');
 });

 it('handles login and logout correctly', async () => {
 (authClient.get as unknown as { mockRejectedValue: (val: unknown) => void }).mockRejectedValue(new Error('Unauthorized'));
 
 await act(async () => {
 render(
 <AuthProvider>
 <TestComponent />
 </AuthProvider>
 );
 });

 await act(async () => {
 screen.getByText('Login').click();
 });

 expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
 expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
 expect(localStorage.getItem('token')).toBe('mockToken');

 await act(async () => {
 screen.getByText('Logout').click();
 });

 expect(screen.getByTestId('auth-status')).toHaveTextContent('Unauthenticated');
 expect(localStorage.getItem('token')).toBeNull();
 });
});
