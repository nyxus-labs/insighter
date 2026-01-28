import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../../components/dashboard/Header';
import '@testing-library/jest-dom';

// Mock useRouter
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Header', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('navigates to search page on enter', () => {
    render(<Header />);
    const input = screen.getByPlaceholderText('SEARCH COMMAND...');
    
    fireEvent.change(input, { target: { value: 'test query' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(mockPush).toHaveBeenCalledWith('/dashboard/search?q=test%20query');
  });

  it('does not navigate on empty query', () => {
    render(<Header />);
    const input = screen.getByPlaceholderText('SEARCH COMMAND...');
    
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(mockPush).not.toHaveBeenCalled();
  });
});
