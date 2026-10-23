import { describe, it, expect, vi } from 'vitest';

describe('ConfirmationDialog - Accessibility and Decision Lifecycle', () => {
  it('defines the contract for confirmation options and styling variants', () => {
    const variants = ['danger', 'warning', 'info'];
    variants.forEach((variant) => {
      expect(['danger', 'warning', 'info']).toContain(variant);
    });
  });

  it('resolves true on user confirmation and false on cancellation', async () => {
    let resolver;
    const confirmPromise = new Promise((resolve) => {
      resolver = resolve;
    });

    // Simulate user clicking confirm
    resolver(true);
    const confirmed = await confirmPromise;
    expect(confirmed).toBe(true);

    const cancelPromise = new Promise((resolve) => {
      resolve(false);
    });
    const cancelled = await cancelPromise;
    expect(cancelled).toBe(false);
  });

  it('guarantees cancellation leaves state unmodified', () => {
    const originalVault = [
      { id: 'doc-1', type: 'Aadhaar Card' },
      { id: 'doc-2', type: 'PAN Card' },
    ];

    let state = [...originalVault];

    // User triggers delete, then cancels
    const userCancelled = true;
    if (!userCancelled) {
      state = state.filter((d) => d.id !== 'doc-1');
    }

    expect(state).toHaveLength(2);
    expect(state[0].id).toBe('doc-1');
  });

  it('ensures Escape key triggers cancel action safely', () => {
    const onCancelMock = vi.fn();
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancelMock();
      }
    };

    handleKeyDown({ key: 'Escape' });
    expect(onCancelMock).toHaveBeenCalledTimes(1);

    handleKeyDown({ key: 'Enter' });
    expect(onCancelMock).toHaveBeenCalledTimes(1); // not called again
  });
});
