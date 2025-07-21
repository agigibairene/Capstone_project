/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FAQSection from '../components/FAQSection';

vi.mock('lucide-react', () => ({
  Minus: () => <div data-testid="minus-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial, whileInView }: any) => (
      <div data-testid="motion-div" data-initial={initial} data-whileinview={whileInView}>
        {children}
      </div>
    ),
  },
}));

describe('FAQSection', () => {
  it('renders the Faq component', () => {
    render(<FAQSection />);
    
    expect(screen.getByText('What you need to Know')).toBeInTheDocument();
    expect(
      screen.getByText(/These are a couple of frequently asked questions/)
    ).toBeInTheDocument();
  });

  it('displays the FAQ image', () => {
    render(<FAQSection />);
    
    const image = screen.getByAltText('know more');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining('planb.png'));
  });

  it('renders all FAQ items', () => {
    render(<FAQSection />);
    
    const faqItems = screen.getAllByTestId('motion-div');
    expect(faqItems.length).toBe(6); 
  });

  it('shows plus icons for all FAQ items initially', () => {
    render(<FAQSection />);
    
    const plusIcons = screen.getAllByTestId('plus-icon');
    expect(plusIcons.length).toBe(6);
    expect(screen.queryByTestId('minus-icon')).toBeNull();
  });

  it('toggles FAQ content when clicked', () => {
    render(<FAQSection />);
    
    const firstFaqButton = screen.getAllByRole('button')[0];
    fireEvent.click(firstFaqButton);
    
    // After click, should show minus icon and content
    expect(screen.getAllByTestId('minus-icon').length).toBe(1);
    expect(screen.getAllByTestId('plus-icon').length).toBe(5);
    expect(screen.getByText(/Farmers or agricultural entrepreneurs/)).toBeInTheDocument();
    
    // Click again to close
    fireEvent.click(firstFaqButton);
    expect(screen.getAllByTestId('plus-icon').length).toBe(6);
    expect(screen.queryByText(/Farmers or agricultural entrepreneurs/)).not.toBeInTheDocument();
  });

  it('only opens one FAQ item at a time', () => {
    render(<FAQSection />);
    
    const faqButtons = screen.getAllByRole('button');
    fireEvent.click(faqButtons[0]);
    fireEvent.click(faqButtons[1]);
    
    // Only the second item should be open now
    expect(screen.getAllByTestId('minus-icon').length).toBe(1);
    expect(screen.getAllByTestId('plus-icon').length).toBe(5);
    expect(screen.queryByText(/Investors interested in supporting/)).toBeInTheDocument();
    expect(screen.queryByText(/Farmers or agricultural entrepreneurs/)).not.toBeInTheDocument();
  });

  it('applies Framer Motion animations', () => {
    render(<FAQSection />);
    
    const motionDivs = screen.getAllByTestId('motion-div');
    expect(motionDivs[0]).toHaveAttribute('data-initial', 'hidden');
    expect(motionDivs[0]).toHaveAttribute('data-whileinview', 'visible');
  });
});