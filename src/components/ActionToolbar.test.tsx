import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import ActionToolbar from './ActionToolbar';
import * as exportUtils from '../utils/exportUtils';

vi.mock('../utils/exportUtils', () => ({
  triggerConfetti: vi.fn(),
  exportSeatingAsPng: vi.fn().mockResolvedValue(true),
  printSeating: vi.fn(),
}));

describe('ActionToolbar', () => {
  const defaultTargetRef: React.RefObject<HTMLElement | null> = {
    current: document.createElement('div'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders root container with .no-print class', () => {
    const { container } = render(
      <ActionToolbar
        onReshuffle={vi.fn()}
        isAnimating={false}
        status="completed"
        targetRef={defaultTargetRef}
      />
    );
    expect(container.firstChild).toHaveClass('no-print');
  });

  describe('다시 뽑기 (Reshuffle)', () => {
    it('calls onReshuffle when clicked', () => {
      const onReshuffle = vi.fn();
      render(
        <ActionToolbar
          onReshuffle={onReshuffle}
          isAnimating={false}
          status="completed"
          targetRef={defaultTargetRef}
        />
      );

      const reshuffleButton = screen.getByRole('button', { name: /다시 뽑기/i });
      expect(reshuffleButton).toBeEnabled();
      fireEvent.click(reshuffleButton);

      expect(onReshuffle).toHaveBeenCalledTimes(1);
    });

    it('is disabled when isAnimating is true', () => {
      const onReshuffle = vi.fn();
      render(
        <ActionToolbar
          onReshuffle={onReshuffle}
          isAnimating={true}
          status="animating"
          targetRef={defaultTargetRef}
        />
      );

      const reshuffleButton = screen.getByRole('button', { name: /다시 뽑기/i });
      expect(reshuffleButton).toBeDisabled();
    });
  });

  describe('자리 배치표 인쇄 (Print)', () => {
    it('invokes printSeating when clicked', () => {
      render(
        <ActionToolbar
          onReshuffle={vi.fn()}
          isAnimating={false}
          status="completed"
          targetRef={defaultTargetRef}
        />
      );

      const printButton = screen.getByRole('button', { name: /인쇄/i });
      expect(printButton).toBeEnabled();
      fireEvent.click(printButton);

      expect(exportUtils.printSeating).toHaveBeenCalledTimes(1);
    });

    it('is disabled when isAnimating is true', () => {
      render(
        <ActionToolbar
          onReshuffle={vi.fn()}
          isAnimating={true}
          status="animating"
          targetRef={defaultTargetRef}
        />
      );

      const printButton = screen.getByRole('button', { name: /인쇄/i });
      expect(printButton).toBeDisabled();
    });
  });

  describe('이미지(PNG) 저장 (Export PNG)', () => {
    it('invokes exportSeatingAsPng with targetRef current element', async () => {
      render(
        <ActionToolbar
          onReshuffle={vi.fn()}
          isAnimating={false}
          status="completed"
          targetRef={defaultTargetRef}
        />
      );

      const exportButton = screen.getByRole('button', { name: /이미지.*저장/i });
      expect(exportButton).toBeEnabled();
      fireEvent.click(exportButton);

      expect(exportUtils.exportSeatingAsPng).toHaveBeenCalledWith(defaultTargetRef.current);
      await waitFor(() => {
        expect(exportButton).toBeEnabled();
      });
    });

    it('is disabled when status is idle', () => {
      render(
        <ActionToolbar
          onReshuffle={vi.fn()}
          isAnimating={false}
          status="idle"
          targetRef={defaultTargetRef}
        />
      );

      const exportButton = screen.getByRole('button', { name: /이미지.*저장/i });
      expect(exportButton).toBeDisabled();
    });

    it('is disabled when isAnimating is true', () => {
      render(
        <ActionToolbar
          onReshuffle={vi.fn()}
          isAnimating={true}
          status="animating"
          targetRef={defaultTargetRef}
        />
      );

      const exportButton = screen.getByRole('button', { name: /이미지.*저장/i });
      expect(exportButton).toBeDisabled();
    });

    it('shows loading state while generating PNG', async () => {
      let resolveExport: (val: boolean) => void;
      const exportPromise = new Promise<boolean>((resolve) => {
        resolveExport = resolve;
      });
      vi.mocked(exportUtils.exportSeatingAsPng).mockReturnValueOnce(exportPromise);

      render(
        <ActionToolbar
          onReshuffle={vi.fn()}
          isAnimating={false}
          status="completed"
          targetRef={defaultTargetRef}
        />
      );

      const exportButton = screen.getByRole('button', { name: /이미지.*저장/i });
      fireEvent.click(exportButton);

      // Should be disabled and in loading state while waiting
      expect(exportButton).toBeDisabled();
      expect(screen.getByText(/저장 중/i)).toBeInTheDocument();

      // Resolve export
      resolveExport!(true);
      await waitFor(() => {
        expect(screen.queryByText(/저장 중/i)).not.toBeInTheDocument();
        expect(exportButton).toBeEnabled();
      });
    });
  });

  describe('축하 폭죽 (Confetti)', () => {
    it('calls triggerConfetti when clicked in completed status', () => {
      render(
        <ActionToolbar
          onReshuffle={vi.fn()}
          isAnimating={false}
          status="completed"
          targetRef={defaultTargetRef}
        />
      );

      const confettiButton = screen.getByRole('button', { name: /폭죽/i });
      expect(confettiButton).toBeEnabled();
      fireEvent.click(confettiButton);

      expect(exportUtils.triggerConfetti).toHaveBeenCalledTimes(1);
    });

    it('is disabled when status is not completed', () => {
      render(
        <ActionToolbar
          onReshuffle={vi.fn()}
          isAnimating={false}
          status="idle"
          targetRef={defaultTargetRef}
        />
      );

      const confettiButton = screen.getByRole('button', { name: /폭죽/i });
      expect(confettiButton).toBeDisabled();
    });

    it('is disabled when isAnimating is true', () => {
      render(
        <ActionToolbar
          onReshuffle={vi.fn()}
          isAnimating={true}
          status="animating"
          targetRef={defaultTargetRef}
        />
      );

      const confettiButton = screen.getByRole('button', { name: /폭죽/i });
      expect(confettiButton).toBeDisabled();
    });
  });
});
