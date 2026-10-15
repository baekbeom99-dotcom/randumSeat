import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import confetti from 'canvas-confetti';
import { toPng } from 'html-to-image';
import { triggerConfetti, exportSeatingAsPng, printSeating } from './exportUtils';

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

vi.mock('html-to-image', () => ({
  toPng: vi.fn(),
}));

describe('exportUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('triggerConfetti', () => {
    it('triggers canvas-confetti with classroom celebration settings', () => {
      triggerConfetti();
      expect(confetti).toHaveBeenCalledTimes(1);
      const callArgs = vi.mocked(confetti).mock.calls[0][0];
      expect(callArgs?.particleCount).toBeGreaterThanOrEqual(100);
      expect(callArgs?.spread).toBeGreaterThanOrEqual(70);
    });

    it('gracefully handles confetti errors without throwing', () => {
      vi.mocked(confetti).mockImplementationOnce(() => {
        throw new Error('Canvas not supported');
      });
      expect(() => triggerConfetti()).not.toThrow();
    });
  });

  describe('exportSeatingAsPng', () => {
    let originalCreateElement: typeof document.createElement;

    beforeEach(() => {
      originalCreateElement = document.createElement.bind(document);
    });

    afterEach(() => {
      document.createElement = originalCreateElement;
    });

    it('returns false immediately if element is null', async () => {
      const result = await exportSeatingAsPng(null);
      expect(result).toBe(false);
      expect(toPng).not.toHaveBeenCalled();
    });

    it('exports element as PNG and triggers download with default filename', async () => {
      const mockElement = document.createElement('div');
      const fakeDataUrl = 'data:image/png;base64,fakeimagecontent';
      vi.mocked(toPng).mockResolvedValueOnce(fakeDataUrl);

      const mockClick = vi.fn();
      let href = '';
      let download = '';
      const mockAnchor = {
        set href(val: string) {
          href = val;
        },
        get href() {
          return href;
        },
        set download(val: string) {
          download = val;
        },
        get download() {
          return download;
        },
        click: mockClick,
      } as unknown as HTMLAnchorElement;

      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName.toLowerCase() === 'a') {
          return mockAnchor;
        }
        return originalCreateElement(tagName);
      });

      const result = await exportSeatingAsPng(mockElement);

      expect(result).toBe(true);
      expect(toPng).toHaveBeenCalledWith(mockElement, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });
      expect(mockAnchor.download).toBe('우리반_자리배치표.png');
      expect(mockAnchor.href).toBe(fakeDataUrl);
      expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it('uses custom filename when provided', async () => {
      const mockElement = document.createElement('div');
      vi.mocked(toPng).mockResolvedValueOnce('data:image/png;base64,custom');

      const mockClick = vi.fn();
      const mockAnchor = {
        click: mockClick,
        href: '',
        download: '',
      } as unknown as HTMLAnchorElement;

      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName.toLowerCase() === 'a') {
          return mockAnchor;
        }
        return originalCreateElement(tagName);
      });

      const result = await exportSeatingAsPng(mockElement, 'custom_chart.png');

      expect(result).toBe(true);
      expect(mockAnchor.download).toBe('custom_chart.png');
    });

    it('returns false and catches errors if toPng fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockElement = document.createElement('div');
      vi.mocked(toPng).mockRejectedValueOnce(new Error('Canvas render error'));

      const result = await exportSeatingAsPng(mockElement);
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('printSeating', () => {
    it('safely calls window.print', () => {
      const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
      printSeating();
      expect(printSpy).toHaveBeenCalledTimes(1);
      printSpy.mockRestore();
    });

    it('gracefully handles window.print throwing an error', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {
        throw new Error('Print not allowed');
      });
      expect(() => printSeating()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
      printSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });
});
