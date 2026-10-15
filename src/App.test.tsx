import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import confetti from 'canvas-confetti';
import { toPng } from 'html-to-image';
import App from './App';

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

vi.mock('html-to-image', () => ({
  toPng: vi.fn().mockResolvedValue('data:image/png;base64,mockedImageData'),
}));

const mockOscillator = {
  type: 'sine',
  frequency: {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
  },
  connect: vi.fn(),
  disconnect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  onended: null,
};

const mockGain = {
  gain: {
    value: 1,
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
  },
  connect: vi.fn(),
  disconnect: vi.fn(),
};

const mockAudioContext = {
  state: 'running',
  currentTime: 0,
  destination: {},
  createOscillator: vi.fn(() => mockOscillator),
  createGain: vi.fn(() => mockGain),
  resume: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
};

describe('App Integration', () => {
  let fullscreenElementMock: Element | null = null;
  let requestFullscreenMock: ReturnType<typeof vi.fn>;
  let exitFullscreenMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    // Mock AudioContext
    (window as unknown as { AudioContext?: unknown }).AudioContext = vi
      .fn()
      .mockImplementation(() => mockAudioContext);

    // Mock Fullscreen API
    fullscreenElementMock = null;
    requestFullscreenMock = vi.fn().mockImplementation(async () => {
      fullscreenElementMock = document.documentElement;
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    exitFullscreenMock = vi.fn().mockImplementation(async () => {
      fullscreenElementMock = null;
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    Object.defineProperty(document, 'fullscreenElement', {
      get: () => fullscreenElementMock,
      configurable: true,
    });
    document.documentElement.requestFullscreen = requestFullscreenMock;
    document.exitFullscreen = exitFullscreenMock;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Initial Layout & Component Rendering', () => {
    it('renders HeaderControlBar, BlackboardBanner, SeatingGrid, and ActionToolbar', () => {
      render(<App />);

      // HeaderControlBar
      expect(screen.getByLabelText('학생 수')).toHaveValue(24);
      expect(screen.getByLabelText('모둠 수')).toHaveValue(6);
      expect(screen.getByRole('button', { name: /긴장감 모드/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /빠른 모드/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '자리 뽑기 시작!' })).toBeInTheDocument();

      // BlackboardBanner
      expect(screen.getByRole('region', { name: /교실 앞쪽/ })).toBeInTheDocument();
      expect(screen.getByText('칠판 (교실 앞)')).toBeInTheDocument();
      expect(screen.getByText('교탁')).toBeInTheDocument();

      // SeatingGrid
      expect(screen.getByTestId('seating-grid')).toBeInTheDocument();
      expect(screen.getByText('1모둠')).toBeInTheDocument();
      expect(screen.getByText('6모둠')).toBeInTheDocument();

      // ActionToolbar
      expect(screen.getByRole('toolbar', { name: '배치표 도구 모음' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '자리 다시 뽑기' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '자리 배치표 인쇄' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '자리 배치표 이미지(PNG) 저장' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '축하 폭죽 터뜨리기' })).toBeInTheDocument();

      // Footer
      expect(screen.getByText(/공정하고 즐거운 교실 자리 배치/)).toBeInTheDocument();
    });
  });

  describe('Lottery Flow: Sequential Mode', () => {
    it('starts sequential lottery, animates slot values, and completes with confetti', () => {
      render(<App />);

      const startButton = screen.getByRole('button', { name: '자리 뽑기 시작!' });
      expect(startButton).not.toBeDisabled();

      // Start lottery
      fireEvent.click(startButton);

      // Now animating: start button is disabled
      expect(startButton).toBeDisabled();

      // Fast-forward through all 24 seats (24 * 150ms = 3600ms) plus buffer
      act(() => {
        vi.advanceTimersByTime(4000);
      });

      // Confetti is triggered upon completion
      expect(confetti).toHaveBeenCalledTimes(1);

      // Animation finishes and start button is re-enabled
      expect(startButton).not.toBeDisabled();
    });
  });

  describe('Lottery Flow: Instant Mode', () => {
    it('switches to instant mode and completes all seat reveals after duration', () => {
      render(<App />);

      const instantModeBtn = screen.getByRole('button', { name: /빠른 모드/ });
      fireEvent.click(instantModeBtn);
      expect(instantModeBtn).toHaveAttribute('aria-pressed', 'true');

      const startButton = screen.getByRole('button', { name: '자리 뽑기 시작!' });
      fireEvent.click(startButton);

      expect(startButton).toBeDisabled();

      // Advance by 2000ms instant duration
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(confetti).toHaveBeenCalledTimes(1);
      expect(startButton).not.toBeDisabled();
    });
  });

  describe('Student and Group Count Controls', () => {
    it('updates total students via increment, decrement, and direct input', () => {
      render(<App />);

      const studentInput = screen.getByLabelText('학생 수');
      const incBtn = screen.getByRole('button', { name: '학생 수 증가' });
      const decBtn = screen.getByRole('button', { name: '학생 수 감소' });

      // Increment: 24 -> 25
      fireEvent.click(incBtn);
      expect(studentInput).toHaveValue(25);

      // Decrement: 25 -> 24
      fireEvent.click(decBtn);
      expect(studentInput).toHaveValue(24);

      // Direct input change
      fireEvent.change(studentInput, { target: { value: '30' } });
      fireEvent.blur(studentInput);
      expect(studentInput).toHaveValue(30);
    });

    it('updates total groups and adjusts seating grid layout accordingly', () => {
      render(<App />);

      const groupInput = screen.getByLabelText('모둠 수');
      const incBtn = screen.getByRole('button', { name: '모둠 수 증가' });
      const decBtn = screen.getByRole('button', { name: '모둠 수 감소' });

      expect(screen.queryByText('7모둠')).not.toBeInTheDocument();

      // Increment: 6 -> 7
      fireEvent.click(incBtn);
      expect(groupInput).toHaveValue(7);
      expect(screen.getByText('7모둠')).toBeInTheDocument();

      // Decrement: 7 -> 6
      fireEvent.click(decBtn);
      expect(groupInput).toHaveValue(6);
      expect(screen.queryByText('7모둠')).not.toBeInTheDocument();
    });
  });

  describe('Sound Toggle', () => {
    it('toggles sound enabled state and button aria-label', () => {
      render(<App />);

      const soundBtn = screen.getByRole('button', { name: '소리 끄기' });
      expect(soundBtn).toBeInTheDocument();

      // Toggle off
      fireEvent.click(soundBtn);
      expect(screen.getByRole('button', { name: '소리 켜기' })).toBeInTheDocument();

      // Toggle back on
      fireEvent.click(screen.getByRole('button', { name: '소리 켜기' }));
      expect(screen.getByRole('button', { name: '소리 끄기' })).toBeInTheDocument();
    });
  });

  describe('Fullscreen Toggle', () => {
    it('requests fullscreen when not active and exits fullscreen when active', async () => {
      render(<App />);

      const fullscreenBtn = screen.getByRole('button', { name: '전체화면' });
      expect(fullscreenBtn).toBeInTheDocument();

      // Request fullscreen
      await act(async () => {
        fireEvent.click(fullscreenBtn);
      });

      expect(requestFullscreenMock).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('button', { name: '전체화면 종료' })).toBeInTheDocument();

      // Exit fullscreen
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: '전체화면 종료' }));
      });

      expect(exitFullscreenMock).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('button', { name: '전체화면' })).toBeInTheDocument();
    });
  });

  describe('ActionToolbar Actions', () => {
    it('triggers reshuffle (다시 뽑기) from ActionToolbar', () => {
      render(<App />);

      const reshuffleBtn = screen.getByRole('button', { name: '자리 다시 뽑기' });
      expect(reshuffleBtn).not.toBeDisabled();

      fireEvent.click(reshuffleBtn);

      expect(reshuffleBtn).toBeDisabled();

      act(() => {
        vi.advanceTimersByTime(4000);
      });

      expect(confetti).toHaveBeenCalledTimes(1);
      expect(reshuffleBtn).not.toBeDisabled();
    });

    it('triggers print when print button is clicked', () => {
      const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
      render(<App />);

      const printBtn = screen.getByRole('button', { name: '자리 배치표 인쇄' });
      fireEvent.click(printBtn);

      expect(printSpy).toHaveBeenCalledTimes(1);
      printSpy.mockRestore();
    });

    it('triggers PNG export when export button is clicked after lottery', async () => {
      render(<App />);

      // Switch to instant mode to finish quickly
      fireEvent.click(screen.getByRole('button', { name: /빠른 모드/ }));
      fireEvent.click(screen.getByRole('button', { name: '자리 뽑기 시작!' }));

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      const exportBtn = screen.getByRole('button', { name: '자리 배치표 이미지(PNG) 저장' });
      expect(exportBtn).not.toBeDisabled();

      await act(async () => {
        fireEvent.click(exportBtn);
      });

      expect(toPng).toHaveBeenCalled();
    });

    it('triggers confetti when party popper button is clicked after lottery completes', () => {
      render(<App />);

      const confettiBtn = screen.getByRole('button', { name: '축하 폭죽 터뜨리기' });
      // In idle state, confetti button is disabled
      expect(confettiBtn).toBeDisabled();

      // Complete lottery in instant mode
      fireEvent.click(screen.getByRole('button', { name: /빠른 모드/ }));
      fireEvent.click(screen.getByRole('button', { name: '자리 뽑기 시작!' }));

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // After completion, confetti button is enabled
      expect(confettiBtn).not.toBeDisabled();

      fireEvent.click(confettiBtn);
      // Confetti called once on completion, and once on button click
      expect(confetti).toHaveBeenCalledTimes(2);
    });
  });
});
