import confetti from 'canvas-confetti';
import { toPng } from 'html-to-image';

/**
 * Launches a colorful classroom celebratory confetti explosion using canvas-confetti.
 * Gracefully no-ops in non-browser or test environments.
 */
export function triggerConfetti(): void {
  try {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 120,
        spread: 85,
        origin: { y: 0.6 },
        colors: [
          '#22c55e', // Green
          '#3b82f6', // Blue
          '#f59e0b', // Amber
          '#ef4444', // Red
          '#8b5cf6', // Violet
          '#ec4899', // Pink
          '#14b8a6', // Teal
        ],
        disableForReducedMotion: true,
      });
    }
  } catch {
    // Gracefully catch or no-op if running in test or unsupported environment
  }
}

/**
 * Exports an HTMLElement as a high-resolution PNG image and triggers browser download.
 *
 * @param element The DOM element to capture (e.g. seating chart container)
 * @param filename Custom filename for download (defaults to '우리반_자리배치표.png')
 * @returns Promise<boolean> indicating success (true) or failure (false)
 */
export async function exportSeatingAsPng(
  element: HTMLElement | null,
  filename: string = '우리반_자리배치표.png'
): Promise<boolean> {
  if (!element) {
    return false;
  }

  try {
    const dataUrl = await toPng(element, {
      backgroundColor: '#ffffff',
      pixelRatio: 2,
    });

    const link = document.createElement('a');
    link.download = filename || '우리반_자리배치표.png';
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error('Failed to export seating chart as PNG:', error);
    return false;
  }
}

/**
 * Safely invokes window.print() to print the seating chart.
 * Unneeded UI elements should be hidden with `.no-print`.
 */
export function printSeating(): void {
  try {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  } catch (error) {
    console.error('Failed to trigger window.print():', error);
  }
}
