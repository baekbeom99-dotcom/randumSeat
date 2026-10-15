import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BlackboardBanner from './BlackboardBanner';

describe('BlackboardBanner', () => {
  it('renders classroom front banner with accessible label', () => {
    render(<BlackboardBanner />);
    const banner = screen.getByRole('region', {
      name: '교실 앞쪽 (칠판/교탁 위치)',
    });
    expect(banner).toBeInTheDocument();
  });

  it('displays podium and blackboard texts', () => {
    render(<BlackboardBanner />);
    expect(screen.getByText('교탁')).toBeInTheDocument();
    expect(screen.getByText('칠판 (교실 앞)')).toBeInTheDocument();
    expect(screen.getByText('선생님을 바라보는 방향입니다')).toBeInTheDocument();
  });

  it('applies custom className if provided', () => {
    const { container } = render(<BlackboardBanner className="custom-banner" />);
    expect(container.firstChild).toHaveClass('custom-banner');
  });
});
