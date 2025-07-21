import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import KYCInvestor from '../authForms/KYCInvestor';
import { kycReducer } from '../redux/KycSlice';
import { signupReducer } from '../redux/signup_auth';

const mockDispatch = vi.fn();

vi.mock('lucide-react', () => ({
  ArrowLeft: () => <div>ArrowLeftIcon</div>,
  ArrowRight: () => <div>ArrowRightIcon</div>,
  BarChart3: () => <div>BarChart3Icon</div>,
  File: () => <div>FileIcon</div>,
  FolderOpen: () => <div>FolderOpenIcon</div>,
  User: () => <div>UserIcon</div>,
  LogOut: () => <div>LogOutIcon</div>,
  PenLine: () => <div>PenLineIcon</div>,
  Bot: () => <div>BotIcon</div>,
}));

vi.mock('../Utils/Loader', () => ({
  default: () => <div>Loading...</div>,
}));

vi.mock('../assets/green_logo.png', () => ({
  default: 'mocked-logo.png',
}));

vi.mock('../assets/login_img.jpg', () => ({
  default: 'mocked-bg.jpg',
}));

vi.mock('./KYC', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useDispatch: () => mockDispatch,
  };
});

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({
      pathname: '/kyc-investor',
      search: '',
      hash: '',
      state: null,
    }),
  };
});

const mockStore = configureStore({
  reducer: {
    kycReducer: kycReducer,
    signupReducer: signupReducer,
  },
  preloadedState: {
    kycReducer: {
      loading: false,
      error: null,
      success: false,
      kycData: null,
      role: null,
    },
    signupReducer: {
      user: {
        full_name: '',
        email: '',
        phone_number: '',
      },
      loading: false,
      error: null,
      success: false,
    },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <Provider store={mockStore}>{component}</Provider>
    </BrowserRouter>
  );
};

describe('KYCInvestor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
  });

  it('renders initial step with form fields', async () => {
    renderWithProviders(<KYCInvestor />);
    expect(screen.getByText('Investor KYC Verification')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
  });

  it('shows validation errors on empty submission', async () => {
    renderWithProviders(<KYCInvestor />);
    fireEvent.click(screen.getByLabelText('Next step'));
    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  it('navigates between steps', async () => {
    renderWithProviders(<KYCInvestor />);

    fireEvent.change(screen.getByPlaceholderText('Full Name'), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email Address'), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), {
      target: { value: '123456789' },
    });
    fireEvent.change(screen.getByLabelText('Date of Birth (Must be 18+)'), {
      target: { value: '1990-01-01' },
    });
    fireEvent.change(screen.getByPlaceholderText('Nationality'), {
      target: { value: 'Ghanaian' },
    });

    fireEvent.click(screen.getByLabelText('Next step'));
    await waitFor(() => {
        expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument(); 
        expect(screen.getByLabelText(/ID Type/i)).toBeInTheDocument(); 
    });



    fireEvent.click(screen.getByLabelText('Previous step'));

    await waitFor(() => {
      expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument();
    });
  });

  it('prefills user data on mount', async () => {
    localStorage.setItem('ACCESS_TOKEN', 'test-token');
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => ({
        full_name: 'Prefilled User',
        email: 'prefilled@example.com',
        phone_number: '+233123456789',
      }),
    });

    renderWithProviders(<KYCInvestor />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Prefilled User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('prefilled@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('123456789')).toBeInTheDocument();
    });
  });

  it('submits form data successfully', async () => {
    renderWithProviders(<KYCInvestor />);

    // Step 1
    fireEvent.change(screen.getByPlaceholderText('Full Name'), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email Address'), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), {
      target: { value: '123456789' },
    });
    fireEvent.change(screen.getByLabelText('Date of Birth (Must be 18+)'), {
      target: { value: '1990-01-01' },
    });
    fireEvent.change(screen.getByPlaceholderText('Nationality'), {
      target: { value: 'Ghanaian' },
    });

    fireEvent.click(screen.getByLabelText('Next step'));

    // Step 2
    await waitFor(() => {
      expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('ID Type'), {
      target: { value: 'passport' },
    });
    fireEvent.change(screen.getByPlaceholderText('ID Number'), {
      target: { value: 'AB123456' },
    });

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText('Upload ID Document'), {
      target: { files: [file] },
    });
    fireEvent.change(screen.getByLabelText('Upload Profile Picture'), {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByLabelText('Next step'));

    // Step 3
    await waitFor(() => {
      expect(screen.getByText(/Step 3 of 3/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Residential Address'), {
      target: { value: '123 Main St' },
    });
    fireEvent.change(screen.getByPlaceholderText('Occupation'), {
      target: { value: 'Developer' },
    });
    fireEvent.change(screen.getByLabelText('Income Source'), {
      target: { value: 'salary' },
    });
    fireEvent.change(screen.getByPlaceholderText('Annual Income (USD)'), {
      target: { value: '50000' },
    });
    fireEvent.change(screen.getByPlaceholderText('Purpose of Account'), {
      target: { value: 'Investing' },
    });

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
    });
  });
});
