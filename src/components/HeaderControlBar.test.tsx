import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HeaderControlBar, { HeaderControlBarProps } from './HeaderControlBar';
import BlackboardBanner from './BlackboardBanner';

describe('HeaderControlBar', () => {
  const defaultProps: HeaderControlBarProps = {
    totalStudents: 24,
    totalGroups: 6,
    onTotalStudentsChange: vi.fn(),
    onTotalGroupsChange: vi.fn(),
    mode: 'sequential',
    onModeChange: vi.fn(),
    soundEnabled: true,
    onSoundToggle: vi.fn(),
    isFullscreen: false,
    onFullscreenToggle: vi.fn(),
    onStartLottery: vi.fn(),
    isAnimating: false,
  };

  it('renders student count and handles increment / decrement', () => {
    const onTotalStudentsChange = vi.fn();
    render(
      <HeaderControlBar
        {...defaultProps}
        totalStudents={24}
        onTotalStudentsChange={onTotalStudentsChange}
      />
    );

    // Plus button increments
    const plusBtn = screen.getByRole('button', { name: /학생 수 증가/i });
    fireEvent.click(plusBtn);
    expect(onTotalStudentsChange).toHaveBeenCalledWith(25);

    // Minus button decrements
    const minusBtn = screen.getByRole('button', { name: /학생 수 감소/i });
    fireEvent.click(minusBtn);
    expect(onTotalStudentsChange).toHaveBeenCalledWith(23);
  });

  it('respects student count limits (min: 2, max: 60)', () => {
    const onTotalStudentsChange = vi.fn();
    const { rerender } = render(
      <HeaderControlBar
        {...defaultProps}
        totalStudents={2}
        onTotalStudentsChange={onTotalStudentsChange}
      />
    );

    const minusBtn = screen.getByRole('button', { name: /학생 수 감소/i });
    expect(minusBtn).toBeDisabled();

    rerender(
      <HeaderControlBar
        {...defaultProps}
        totalStudents={60}
        onTotalStudentsChange={onTotalStudentsChange}
      />
    );
    const plusBtn = screen.getByRole('button', { name: /학생 수 증가/i });
    expect(plusBtn).toBeDisabled();
  });

  it('handles direct student input changes', () => {
    const onTotalStudentsChange = vi.fn();
    render(
      <HeaderControlBar
        {...defaultProps}
        onTotalStudentsChange={onTotalStudentsChange}
      />
    );

    const input = screen.getByRole('spinbutton', { name: /학생 수/i });
    fireEvent.change(input, { target: { value: '30' } });
    expect(onTotalStudentsChange).toHaveBeenCalledWith(30);
  });

  it('renders group count and handles increment / decrement', () => {
    const onTotalGroupsChange = vi.fn();
    render(
      <HeaderControlBar
        {...defaultProps}
        totalGroups={6}
        onTotalGroupsChange={onTotalGroupsChange}
      />
    );

    // Plus button increments
    const plusBtn = screen.getByRole('button', { name: /모둠 수 증가/i });
    fireEvent.click(plusBtn);
    expect(onTotalGroupsChange).toHaveBeenCalledWith(7);

    // Minus button decrements
    const minusBtn = screen.getByRole('button', { name: /모둠 수 감소/i });
    fireEvent.click(minusBtn);
    expect(onTotalGroupsChange).toHaveBeenCalledWith(5);
  });

  it('respects group count limits (min: 1, max: 15)', () => {
    const onTotalGroupsChange = vi.fn();
    const { rerender } = render(
      <HeaderControlBar
        {...defaultProps}
        totalGroups={1}
        onTotalGroupsChange={onTotalGroupsChange}
      />
    );

    const minusBtn = screen.getByRole('button', { name: /모둠 수 감소/i });
    expect(minusBtn).toBeDisabled();

    rerender(
      <HeaderControlBar
        {...defaultProps}
        totalGroups={15}
        onTotalGroupsChange={onTotalGroupsChange}
      />
    );
    const plusBtn = screen.getByRole('button', { name: /모둠 수 증가/i });
    expect(plusBtn).toBeDisabled();
  });

  it('handles direct group input changes', () => {
    const onTotalGroupsChange = vi.fn();
    render(
      <HeaderControlBar
        {...defaultProps}
        onTotalGroupsChange={onTotalGroupsChange}
      />
    );

    const input = screen.getByRole('spinbutton', { name: /모둠 수/i });
    fireEvent.change(input, { target: { value: '8' } });
    expect(onTotalGroupsChange).toHaveBeenCalledWith(8);
  });

  it('toggles mode between sequential and instant', () => {
    const onModeChange = vi.fn();
    const { rerender } = render(
      <HeaderControlBar
        {...defaultProps}
        mode="sequential"
        onModeChange={onModeChange}
      />
    );

    const instantBtn = screen.getByRole('button', { name: /빠른 모드/i });
    fireEvent.click(instantBtn);
    expect(onModeChange).toHaveBeenCalledWith('instant');

    rerender(
      <HeaderControlBar
        {...defaultProps}
        mode="instant"
        onModeChange={onModeChange}
      />
    );
    const sequentialBtn = screen.getByRole('button', { name: /긴장감 모드/i });
    fireEvent.click(sequentialBtn);
    expect(onModeChange).toHaveBeenCalledWith('sequential');
  });

  it('toggles sound on and off', () => {
    const onSoundToggle = vi.fn();
    const { rerender } = render(
      <HeaderControlBar
        {...defaultProps}
        soundEnabled={true}
        onSoundToggle={onSoundToggle}
      />
    );

    const soundBtn = screen.getByRole('button', { name: /소리/i });
    fireEvent.click(soundBtn);
    expect(onSoundToggle).toHaveBeenCalledTimes(1);

    rerender(
      <HeaderControlBar
        {...defaultProps}
        soundEnabled={false}
        onSoundToggle={onSoundToggle}
      />
    );
    expect(screen.getByRole('button', { name: /소리/i })).toBeInTheDocument();
  });

  it('toggles fullscreen', () => {
    const onFullscreenToggle = vi.fn();
    const { rerender } = render(
      <HeaderControlBar
        {...defaultProps}
        isFullscreen={false}
        onFullscreenToggle={onFullscreenToggle}
      />
    );

    const fsBtn = screen.getByRole('button', { name: /전체화면/i });
    fireEvent.click(fsBtn);
    expect(onFullscreenToggle).toHaveBeenCalledTimes(1);

    rerender(
      <HeaderControlBar
        {...defaultProps}
        isFullscreen={true}
        onFullscreenToggle={onFullscreenToggle}
      />
    );
    expect(screen.getByRole('button', { name: /전체화면/i })).toBeInTheDocument();
  });

  it('triggers onStartLottery when start button is clicked and enabled', () => {
    const onStartLottery = vi.fn();
    render(
      <HeaderControlBar
        {...defaultProps}
        totalStudents={24}
        totalGroups={6}
        isAnimating={false}
        onStartLottery={onStartLottery}
      />
    );

    const startBtn = screen.getByRole('button', { name: /자리 뽑기 시작/i });
    expect(startBtn).not.toBeDisabled();
    fireEvent.click(startBtn);
    expect(onStartLottery).toHaveBeenCalledTimes(1);
  });

  it('disables start button when isAnimating is true', () => {
    const onStartLottery = vi.fn();
    render(
      <HeaderControlBar
        {...defaultProps}
        isAnimating={true}
        onStartLottery={onStartLottery}
      />
    );

    const startBtn = screen.getByRole('button', { name: /자리 뽑기 시작/i });
    expect(startBtn).toBeDisabled();
    fireEvent.click(startBtn);
    expect(onStartLottery).not.toHaveBeenCalled();
  });

  it('disables start button and shows validation warning when totalStudents < totalGroups', () => {
    const onStartLottery = vi.fn();
    render(
      <HeaderControlBar
        {...defaultProps}
        totalStudents={3}
        totalGroups={5}
        isAnimating={false}
        onStartLottery={onStartLottery}
      />
    );

    const startBtn = screen.getByRole('button', { name: /자리 뽑기 시작/i });
    expect(startBtn).toBeDisabled();

    // Friendly validation message
    expect(
      screen.getByText('학생 수가 모둠 수 이상이어야 자리를 나눌 수 있어요!')
    ).toBeInTheDocument();
  });

  it('does not display validation message when totalStudents >= totalGroups', () => {
    render(
      <HeaderControlBar
        {...defaultProps}
        totalStudents={24}
        totalGroups={6}
      />
    );

    expect(
      screen.queryByText('학생 수가 모둠 수 이상이어야 자리를 나눌 수 있어요!')
    ).not.toBeInTheDocument();
  });

  it('includes the no-print class on the root container', () => {
    const { container } = render(<HeaderControlBar {...defaultProps} />);
    expect(container.firstChild).toHaveClass('no-print');
  });
});

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

