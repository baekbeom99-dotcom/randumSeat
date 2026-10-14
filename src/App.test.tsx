import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders title', () => {
    render(<App />);
    expect(screen.getByText('우리 반 자리 뽑기')).toBeInTheDocument();
  });
});
