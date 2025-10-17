import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DisplayNameNotification } from '../DisplayNameNotification';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { UserService } from '@/features/user/services/userService';

// Mock UserService
jest.mock('@/features/user/services/userService', () => ({
  UserService: {
    updateProfile: jest.fn(),
  },
}));

// Mock AuthProvider
const mockProfile = { displayName: null, full_name: null };
const mockRefreshProfile = jest.fn();

jest.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => ({
    profile: mockProfile,
    refreshProfile: mockRefreshProfile,
  }),
}));

describe('DisplayNameNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders notification when user has no display name', () => {
    render(<DisplayNameNotification />);
    
    expect(screen.getByText('Numele de afișare nu este setat')).toBeInTheDocument();
    expect(screen.getByText('Pentru a afișa un nume personalizat cu comentariile dvs., vă rugăm să setați un nume de afișare.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Introduceți numele de afișare')).toBeInTheDocument();
    expect(screen.getByText('Setează numele')).toBeInTheDocument();
    expect(screen.getByText('Continuă fără nume')).toBeInTheDocument();
  });

  it('calls onDisplayNameSet when name is set successfully', async () => {
    const mockOnDisplayNameSet = jest.fn();
    (UserService.updateProfile as jest.Mock).mockResolvedValue(true);

    render(
      <DisplayNameNotification onDisplayNameSet={mockOnDisplayNameSet} />
    );

    const input = screen.getByPlaceholderText('Introduceți numele de afișare');
    const submitButton = screen.getByText('Setează numele');

    fireEvent.change(input, { target: { value: 'John Doe' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(UserService.updateProfile).toHaveBeenCalledWith({ displayName: 'John Doe' });
      expect(mockRefreshProfile).toHaveBeenCalled();
      expect(mockOnDisplayNameSet).toHaveBeenCalledWith('John Doe');
    });
  });

  it('calls onContinueWithoutName when continue without name is clicked', () => {
    const mockOnContinueWithoutName = jest.fn();

    render(
      <DisplayNameNotification onContinueWithoutName={mockOnContinueWithoutName} />
    );

    const continueButton = screen.getByText('Continuă fără nume');
    fireEvent.click(continueButton);

    expect(mockOnContinueWithoutName).toHaveBeenCalled();
  });

  it('disables submit button when input is empty', () => {
    render(<DisplayNameNotification />);
    
    const submitButton = screen.getByText('Setează numele');
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when input has value', () => {
    render(<DisplayNameNotification />);
    
    const input = screen.getByPlaceholderText('Introduceți numele de afișare');
    const submitButton = screen.getByText('Setează numele');

    fireEvent.change(input, { target: { value: 'John Doe' } });
    
    expect(submitButton).not.toBeDisabled();
  });
});
