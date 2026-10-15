import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SeatTile from './SeatTile';
import GroupCard from './GroupCard';
import SeatingGrid from './SeatingGrid';
import { Group } from '../utils/seatAllocation';

describe('SeatTile', () => {
  it('renders seat index badge and placeholder when idle and displayValue is not provided', () => {
    render(
      <SeatTile
        seatId="seat-1"
        seatIndex={1}
        displayValue={0}
        isRevealed={false}
        isAnimating={false}
      />
    );

    expect(screen.getByText('자리 1')).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('renders displayed number and does not show student names', () => {
    render(
      <SeatTile
        seatId="seat-1"
        seatIndex={2}
        displayValue={7}
        isRevealed={true}
        isAnimating={false}
      />
    );

    expect(screen.getByText('자리 2')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    // Verify no names are shown
    expect(screen.queryByText(/철수|영희|민수/)).not.toBeInTheDocument();
  });

  it('applies rolling/slot styling when animating and not revealed', () => {
    const { container } = render(
      <SeatTile
        seatId="seat-1"
        seatIndex={1}
        displayValue={15}
        isRevealed={false}
        isAnimating={true}
      />
    );

    const tile = container.firstChild as HTMLElement;
    expect(tile).toHaveAttribute('data-animating', 'true');
    expect(tile).toHaveAttribute('data-revealed', 'false');
    // Check rolling classes or indicators
    expect(tile.className).toMatch(/animate|amber|violet|yellow/);
  });

  it('applies confirmed stamp appearance when revealed', () => {
    const { container } = render(
      <SeatTile
        seatId="seat-1"
        seatIndex={1}
        displayValue={12}
        isRevealed={true}
        isAnimating={false}
      />
    );

    const tile = container.firstChild as HTMLElement;
    expect(tile).toHaveAttribute('data-revealed', 'true');
    expect(tile.className).toMatch(/emerald|blue/);
  });

  it('handles empty/zero displayValue gracefully with placeholder', () => {
    render(
      <SeatTile
        seatId="seat-1"
        seatIndex={3}
        displayValue={0}
        isRevealed={false}
        isAnimating={true}
      />
    );

    expect(screen.getByText('?')).toBeInTheDocument();
  });
});

describe('GroupCard', () => {
  const sampleGroup: Group = {
    id: 1,
    name: '1모둠',
    seats: [
      { id: 'g1-s1', studentNumber: 10 },
      { id: 'g1-s2', studentNumber: 20 },
      { id: 'g1-s3', studentNumber: 15 },
    ],
  };

  it('renders group title and member count badge', () => {
    render(
      <GroupCard
        group={sampleGroup}
        displaySlotValues={{ 'g1-s1': 10, 'g1-s2': 20, 'g1-s3': 15 }}
        revealedSeats={new Set(['g1-s1'])}
        isAnimating={false}
      />
    );

    expect(screen.getByText('1모둠')).toBeInTheDocument();
    expect(screen.getByText('3명')).toBeInTheDocument();
  });

  it('renders all seats in the group with correct values', () => {
    render(
      <GroupCard
        group={sampleGroup}
        displaySlotValues={{ 'g1-s1': 5, 'g1-s2': 8, 'g1-s3': 12 }}
        revealedSeats={new Set(['g1-s1', 'g1-s2'])}
        isAnimating={false}
      />
    );

    expect(screen.getByText('자리 1')).toBeInTheDocument();
    expect(screen.getByText('자리 2')).toBeInTheDocument();
    expect(screen.getByText('자리 3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('cycles through color palettes based on group id', () => {
    const { container: c1 } = render(
      <GroupCard
        group={{ ...sampleGroup, id: 1 }}
        displaySlotValues={{}}
        revealedSeats={new Set()}
        isAnimating={false}
      />
    );

    const { container: c2 } = render(
      <GroupCard
        group={{ ...sampleGroup, id: 2 }}
        displaySlotValues={{}}
        revealedSeats={new Set()}
        isAnimating={false}
      />
    );

    // Group 1 and Group 2 should have different styling classes
    const card1 = c1.firstChild as HTMLElement;
    const card2 = c2.firstChild as HTMLElement;
    expect(card1.className).not.toEqual(card2.className);
  });
});

describe('SeatingGrid', () => {
  const sampleGroups: Group[] = [
    {
      id: 1,
      name: '1모둠',
      seats: [
        { id: 'g1-s1', studentNumber: 1 },
        { id: 'g1-s2', studentNumber: 2 },
      ],
    },
    {
      id: 2,
      name: '2모둠',
      seats: [
        { id: 'g2-s1', studentNumber: 3 },
        { id: 'g2-s2', studentNumber: 4 },
      ],
    },
  ];

  it('renders all groups with their seats and slot values', () => {
    const displaySlotValues = {
      'g1-s1': 11,
      'g1-s2': 12,
      'g2-s1': 13,
      'g2-s2': 14,
    };
    const revealedSeats = new Set(['g1-s1', 'g2-s1']);

    render(
      <SeatingGrid
        groups={sampleGroups}
        displaySlotValues={displaySlotValues}
        revealedSeats={revealedSeats}
        isAnimating={false}
      />
    );

    expect(screen.getByText('1모둠')).toBeInTheDocument();
    expect(screen.getByText('2모둠')).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('13')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
  });

  it('displays empty state when groups array is empty', () => {
    render(
      <SeatingGrid
        groups={[]}
        displaySlotValues={{}}
        revealedSeats={new Set()}
        isAnimating={false}
      />
    );

    expect(screen.getByText(/모둠이 없습니다|배치된 모둠이 없습니다/i)).toBeInTheDocument();
  });

  it('attaches gridRef correctly for screenshot capture', () => {
    const gridRef = createRef<HTMLDivElement>();

    render(
      <SeatingGrid
        groups={sampleGroups}
        displaySlotValues={{}}
        revealedSeats={new Set()}
        isAnimating={false}
        gridRef={gridRef}
      />
    );

    expect(gridRef.current).not.toBeNull();
    expect(gridRef.current).toBeInstanceOf(HTMLDivElement);
  });

  it('applies responsive column classes based on group count', () => {
    const { container: container2, rerender } = render(
      <SeatingGrid
        groups={sampleGroups} // 2 groups
        displaySlotValues={{}}
        revealedSeats={new Set()}
        isAnimating={false}
      />
    );

    const gridEl2 = container2.querySelector('[data-testid="seating-grid"]');
    expect(gridEl2?.className).toMatch(/grid-cols-1.*sm:grid-cols-2/);

    const fourGroups: Group[] = Array.from({ length: 4 }, (_, i) => ({
      id: i + 1,
      name: `${i + 1}모둠`,
      seats: [{ id: `g${i + 1}-s1`, studentNumber: i + 1 }],
    }));

    rerender(
      <SeatingGrid
        groups={fourGroups}
        displaySlotValues={{}}
        revealedSeats={new Set()}
        isAnimating={false}
      />
    );

    const gridEl4 = container2.querySelector('[data-testid="seating-grid"]');
    expect(gridEl4?.className).toMatch(/grid-cols/);

    const sixGroups: Group[] = Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      name: `${i + 1}모둠`,
      seats: [{ id: `g${i + 1}-s1`, studentNumber: i + 1 }],
    }));

    rerender(
      <SeatingGrid
        groups={sixGroups}
        displaySlotValues={{}}
        revealedSeats={new Set()}
        isAnimating={false}
      />
    );

    const gridEl6 = container2.querySelector('[data-testid="seating-grid"]');
    expect(gridEl6?.className).toMatch(/grid-cols/);
  });
});
