import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { BrandLogo, BrandIcon } from '../components/ui/BrandLogo';
import '@testing-library/jest-dom/vitest';

describe('BrandLogo & BrandIcon Components', () => {
  describe('BrandIcon', () => {
    it('renders the SVG icon with default size and gradient', () => {
      render(<BrandIcon />);
      const icon = screen.getByTestId('brand-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.tagName.toLowerCase()).toBe('svg');
      expect(icon.getAttribute('viewBox')).toBe('0 0 32 32');
      expect(icon).toHaveClass('w-8', 'h-8');
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });

    it('supports custom size variants (sm, md, lg) and number sizes', () => {
      const { rerender } = render(<BrandIcon size="sm" className="custom-icon" />);
      let icon = screen.getByTestId('brand-icon');
      expect(icon).toHaveClass('w-6', 'h-6', 'custom-icon');

      rerender(<BrandIcon size="lg" />);
      icon = screen.getByTestId('brand-icon');
      expect(icon).toHaveClass('w-12', 'h-12');

      rerender(<BrandIcon size={40} />);
      icon = screen.getByTestId('brand-icon');
      expect(icon.style.width).toBe('40px');
      expect(icon.style.height).toBe('40px');

      rerender(<BrandIcon size={'unknown' as 'md'} />);
      icon = screen.getByTestId('brand-icon');
      expect(icon).toHaveClass('w-8', 'h-8');
    });

    it('contains chord pick silhouette, frets, chord lines and C chord arc', () => {
      const { container } = render(<BrandIcon />);
      const paths = container.querySelectorAll('path');
      expect(paths.length).toBe(4); // Pick base, strings, frets, C arc
      const circles = container.querySelectorAll('circle');
      expect(circles.length).toBe(2); // 2 chord note dots
    });
  });

  describe('BrandLogo', () => {
    it('renders logo with icon and text by default', () => {
      render(<BrandLogo />);
      const logo = screen.getByTestId('brand-logo');
      expect(logo).toBeInTheDocument();
      expect(screen.getByTestId('brand-icon')).toBeInTheDocument();
      const text = screen.getByTestId('brand-logo-text');
      expect(text).toHaveTextContent('CifrAS');
      expect(text).toHaveClass('text-xl');
    });

    it('renders only the icon when iconOnly is true', () => {
      render(<BrandLogo iconOnly />);
      expect(screen.getByTestId('brand-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('brand-logo-text')).not.toBeInTheDocument();
      expect(screen.queryByText('CifrAS')).not.toBeInTheDocument();
    });

    it('renders as a router Link when asLink is true with default and custom to', () => {
      const { rerender } = render(
        <MemoryRouter>
          <BrandLogo asLink />
        </MemoryRouter>
      );
      let link = screen.getByRole('link', { name: 'CifrAS' });
      expect(link).toHaveAttribute('href', '/dashboard');

      rerender(
        <MemoryRouter>
          <BrandLogo asLink to="/custom-path" aria-label="Go home" />
        </MemoryRouter>
      );
      link = screen.getByRole('link', { name: 'Go home' });
      expect(link).toHaveAttribute('href', '/custom-path');
    });

    it('applies custom size styling and custom classNames', () => {
      const { rerender } = render(
        <BrandLogo
          size="sm"
          className="my-container"
          iconClassName="my-icon"
          textClassName="my-text"
        />
      );
      let logo = screen.getByTestId('brand-logo');
      expect(logo).toHaveClass('my-container', 'gap-2');
      expect(screen.getByTestId('brand-icon')).toHaveClass('my-icon');
      expect(screen.getByTestId('brand-logo-text')).toHaveClass('my-text', 'text-lg');

      rerender(<BrandLogo size="lg" textClassName="custom-lg" />);
      logo = screen.getByTestId('brand-logo');
      expect(logo).toHaveClass('gap-3.5');
      expect(screen.getByTestId('brand-logo-text')).toHaveClass('text-3xl', 'custom-lg');
    });

    it('triggers onClick handler when clicked', () => {
      const handleClick = vi.fn();
      render(<BrandLogo onClick={handleClick} />);
      const logo = screen.getByTestId('brand-logo');
      expect(logo.getAttribute('role')).toBe('button');
      fireEvent.click(logo);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('triggers onClick handler in link mode', () => {
      const handleClick = vi.fn();
      render(
        <MemoryRouter>
          <BrandLogo asLink to="/test" onClick={handleClick} />
        </MemoryRouter>
      );
      const link = screen.getByRole('link');
      fireEvent.click(link);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
