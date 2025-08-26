import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShareButtons } from '../ShareButtons';

// Mock navigator.clipboard
const mockClipboard = {
  writeText: jest.fn(),
};
Object.assign(navigator, {
  clipboard: mockClipboard,
});

// Mock navigator.share
const mockShare = jest.fn();
Object.assign(navigator, {
  share: mockShare,
});

describe('ShareButtons', () => {
  const defaultProps = {
    url: 'https://example.com/test-article',
    title: 'Test Article Title',
    description: 'Test article description',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders copy link button', () => {
    render(<ShareButtons {...defaultProps} />);
    expect(screen.getByLabelText('Copiază link-ul')).toBeInTheDocument();
  });

  it('renders social media share buttons', () => {
    render(<ShareButtons {...defaultProps} />);
    expect(screen.getByLabelText('Partajează pe Facebook')).toBeInTheDocument();
    expect(screen.getByLabelText('Partajează pe Twitter')).toBeInTheDocument();
    expect(screen.getByLabelText('Partajează pe LinkedIn')).toBeInTheDocument();
    expect(screen.getByLabelText('Trimite prin email')).toBeInTheDocument();
  });

  it('copies link to clipboard when copy button is clicked', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined);
    
    render(<ShareButtons {...defaultProps} />);
    const copyButton = screen.getByLabelText('Copiază link-ul');
    
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith(defaultProps.url);
    });
  });

  it('shows success state when link is copied', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined);
    
    render(<ShareButtons {...defaultProps} />);
    const copyButton = screen.getByLabelText('Copiază link-ul');
    
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(screen.getByText('Copiat!')).toBeInTheDocument();
    });
  });

  it('renders with labels when showLabels is true', () => {
    render(<ShareButtons {...defaultProps} showLabels={true} />);
    expect(screen.getByText('Copiază link')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders without labels when showLabels is false', () => {
    render(<ShareButtons {...defaultProps} showLabels={false} />);
    expect(screen.queryByText('Copiază link')).not.toBeInTheDocument();
    expect(screen.queryByText('Facebook')).not.toBeInTheDocument();
    expect(screen.queryByText('Twitter')).not.toBeInTheDocument();
    expect(screen.queryByText('LinkedIn')).not.toBeInTheDocument();
    expect(screen.queryByText('Email')).not.toBeInTheDocument();
  });

  it('renders native share button when navigator.share is available', () => {
    render(<ShareButtons {...defaultProps} />);
    expect(screen.getByLabelText('Partajează')).toBeInTheDocument();
  });

  it('calls navigator.share when native share button is clicked', async () => {
    mockShare.mockResolvedValue(undefined);
    
    render(<ShareButtons {...defaultProps} />);
    const shareButton = screen.getByLabelText('Partajează');
    
    fireEvent.click(shareButton);
    
    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith({
        title: defaultProps.title,
        text: defaultProps.description,
        url: defaultProps.url,
      });
    });
  });

  it('generates correct social media URLs', () => {
    render(<ShareButtons {...defaultProps} />);
    
    const facebookButton = screen.getByLabelText('Partajează pe Facebook');
    const twitterButton = screen.getByLabelText('Partajează pe Twitter');
    const linkedinButton = screen.getByLabelText('Partajează pe LinkedIn');
    const emailButton = screen.getByLabelText('Trimite prin email');
    
    expect(facebookButton.closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('facebook.com/sharer/sharer.php')
    );
    
    expect(twitterButton.closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('twitter.com/intent/tweet')
    );
    
    expect(linkedinButton.closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('linkedin.com/sharing/share-offsite')
    );
    
    expect(emailButton.closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:')
    );
  });
});
