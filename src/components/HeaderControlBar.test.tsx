import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HeaderControlBar, { HeaderControlBarProps } from './HeaderControlBar';

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

  it('clamps student count on blur to [2, 60]', () => {
    const onTotalStudentsChange = vi.fn();
    const { rerender } = render(
      <HeaderControlBar
        {...defaultProps}
        totalStudents={1}
        onTotalStudentsChange={onTotalStudentsChange}
      />
    );

    const input = screen.getByRole('spinbutton', { name: /학생 수/i });
    fireEvent.blur(input);
    expect(onTotalStudentsChange).toHaveBeenCalledWith(2);

    rerender(
      <HeaderControlBar
        {...defaultProps}
        totalStudents={100}
        onTotalStudentsChange={onTotalStudentsChange}
      />
    );
    fireEvent.blur(input);
    expect(onTotalStudentsChange).toHaveBeenCalledWith(60);
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

  it('clamps group count on blur to [1, 15]', () => {
    const onTotalGroupsChange = vi.fn();
    const { rerender } = render(
      <HeaderControlBar
        {...defaultProps}
        totalGroups={0}
        onTotalGroupsChange={onTotalGroupsChange}
      />
    );

    const input = screen.getByRole('spinbutton', { name: /모둠 수/i });
    fireEvent.blur(input);
    expect(onTotalGroupsChange).toHaveBeenCalledWith(1);

    rerender(
      <HeaderControlBar
        {...defaultProps}
        totalGroups={20}
        onTotalGroupsChange={onTotalGroupsChange}
      />
    );
    fireEvent.blur(input);
    expect(onTotalGroupsChange).toHaveBeenCalledWith(15);
  });

  it('toggles mode between sequential and instant and sets aria-pressed', () => {
    const onModeChange = vi.fn();
    const { rerender } = render(
      <HeaderControlBar
        {...defaultProps}
        mode="sequential"
        onModeChange={onModeChange}
      />
    );

    const sequentialBtn = screen.getByRole('button', { name: /긴장감 모드/i });
    const instantBtn = screen.getByRole('button', { name: /빠른 모드/i });

    expect(sequentialBtn).toHaveAttribute('aria-pressed', 'true');
    expect(instantBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(instantBtn);
    expect(onModeChange).toHaveBeenCalledWith('instant');

    rerender(
      <HeaderControlBar
        {...defaultProps}
        mode="instant"
        onModeChange={onModeChange}
      />
    );

    expect(sequentialBtn).toHaveAttribute('aria-pressed', 'false');
    expect(instantBtn).toHaveAttribute('aria-pressed', 'true');

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

  it('disables start button and shows out-of-bounds warning when values exceed limits', () => {
    render(
      <HeaderControlBar
        {...defaultProps}
        totalStudents={1}
        totalGroups={1}
      />
    );

    const startBtn = screen.getByRole('button', { name: /자리 뽑기 시작/i });
    expect(startBtn).toBeDisabled();

    expect(
      screen.getByText(
        '학생 수는 2~60명, 모둠 수는 1~15개 범위 내에서 설정해 주세요!'
      )
    ).toBeInTheDocument();
  });

  it('does not display validation message when values are valid and totalStudents >= totalGroups', () => {
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
    expect(
      screen.queryByText(
        '학생 수는 2~60명, 모둠 수는 1~15개 범위 내에서 설정해 주세요!'
      )
    ).not.toBeInTheDocument();
  });

  it('includes the no-print class on the root container', () => {
    const { container } = render(<HeaderControlBar {...defaultProps} />);
    expect(container.firstChild).toHaveClass('no-print');
  });
});
