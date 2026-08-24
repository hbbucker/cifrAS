import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TagInput } from '../components/ui/TagInput';
import '@testing-library/jest-dom/vitest';

describe('TagInput Component', () => {
  it('renders existing tags as chips', () => {
    const tags = ['Rock', 'Pop'];
    const onChange = vi.fn();

    render(<TagInput tags={tags} onChange={onChange} />);

    expect(screen.getByTestId('tag-chip-Rock')).toBeInTheDocument();
    expect(screen.getByTestId('tag-chip-Pop')).toBeInTheDocument();
    expect(screen.getByText('Rock')).toBeInTheDocument();
    expect(screen.getByText('Pop')).toBeInTheDocument();
  });

  it('adds a tag on Enter key and comma', () => {
    const onChange = vi.fn();
    const { rerender } = render(<TagInput tags={[]} onChange={onChange} />);

    const input = screen.getByTestId('tag-input-field');
    fireEvent.change(input, { target: { value: 'Missa' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['Missa']);

    // Comma key test
    rerender(<TagInput tags={['Missa']} onChange={onChange} />);
    fireEvent.change(input, { target: { value: 'Gospel' } });
    fireEvent.keyDown(input, { key: ',' });

    expect(onChange).toHaveBeenCalledWith(['Missa', 'Gospel']);
  });

  it('removes tag on clicking remove button', () => {
    const onChange = vi.fn();
    render(<TagInput tags={['Rock', 'Jazz']} onChange={onChange} />);

    const removeBtn = screen.getByTestId('remove-tag-Rock');
    fireEvent.click(removeBtn);

    expect(onChange).toHaveBeenCalledWith(['Jazz']);
  });

  it('removes last tag on Backspace when input is empty', () => {
    const onChange = vi.fn();
    render(<TagInput tags={['Rock', 'Jazz']} onChange={onChange} />);

    const input = screen.getByTestId('tag-input-field');
    fireEvent.keyDown(input, { key: 'Backspace' });

    expect(onChange).toHaveBeenCalledWith(['Rock']);
  });

  it('displays suggestions and adds on suggestion click', () => {
    const onChange = vi.fn();
    const suggestions = ['Rock', 'Reggae', 'Rap'];
    render(<TagInput tags={[]} onChange={onChange} availableSuggestions={suggestions} />);

    const input = screen.getByTestId('tag-input-field');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Re' } });

    expect(screen.getByTestId('tag-suggestions-list')).toBeInTheDocument();
    expect(screen.getByTestId('tag-suggestion-Reggae')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('tag-suggestion-Reggae'));
    expect(onChange).toHaveBeenCalledWith(['Reggae']);
  });

  it('navigates suggestions with ArrowDown / ArrowUp and selects with Enter', () => {
    const onChange = vi.fn();
    const suggestions = ['Pop', 'Punk'];
    render(<TagInput tags={[]} onChange={onChange} availableSuggestions={suggestions} />);

    const input = screen.getByTestId('tag-input-field');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'P' } });

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['Pop']);
  });

  it('does not add duplicate tags', () => {
    const onChange = vi.fn();
    render(<TagInput tags={['Rock']} onChange={onChange} />);

    const input = screen.getByTestId('tag-input-field');
    fireEvent.change(input, { target: { value: 'Rock' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders label and respects disabled and maxTags props', () => {
    const onChange = vi.fn();
    render(
      <TagInput
        tags={['Tag1', 'Tag2']}
        onChange={onChange}
        label="Custom Tags"
        maxTags={2}
        disabled
      />
    );

    expect(screen.getByText('Custom Tags')).toBeInTheDocument();
    expect(screen.queryByTestId('tag-input-field')).not.toBeInTheDocument();
  });

  it('closes suggestions on Escape key', () => {
    const onChange = vi.fn();
    render(<TagInput tags={[]} onChange={onChange} availableSuggestions={['Jazz']} />);

    const input = screen.getByTestId('tag-input-field');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'J' } });
    expect(screen.getByTestId('tag-suggestions-list')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByTestId('tag-suggestions-list')).not.toBeInTheDocument();
  });
});
