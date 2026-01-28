import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsPage from '../../app/dashboard/settings/page';
import '@testing-library/jest-dom';

// Mock Supabase client
const mockGetUser = jest.fn();
const mockUpdateUser = jest.fn();
const mockUpload = jest.fn();
const mockGetPublicUrl = jest.fn();

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: () => ({
    auth: {
      getUser: mockGetUser,
      updateUser: mockUpdateUser,
    },
    storage: {
      from: () => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      }),
    },
  }),
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: '123',
          email: 'test@example.com',
          user_metadata: {
            first_name: 'John',
            last_name: 'Doe',
            username: 'jdoe',
            avatar_url: 'https://example.com/avatar.jpg',
          },
        },
      },
    });

    mockUpdateUser.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/new-avatar.jpg' } });
    mockUpload.mockResolvedValue({ error: null });
  });

  it('renders profile form with user data', async () => {
    render(<SettingsPage />);

    // Wait for data loading
    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('jdoe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
  });

  it('updates user profile on save', async () => {
    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    // Change values
    fireEvent.change(screen.getByDisplayValue('John'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByDisplayValue('Doe'), { target: { value: 'Smith' } });
    fireEvent.change(screen.getByDisplayValue('jdoe'), { target: { value: 'jsmith' } });

    // Submit form
    const saveButton = screen.getByText(/save changes/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        data: {
          first_name: 'Jane',
          last_name: 'Smith',
          username: 'jsmith',
          full_name: 'Jane Smith',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      });
    });
  });
});
