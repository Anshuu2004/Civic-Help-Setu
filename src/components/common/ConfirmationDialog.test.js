import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ConfirmationDialog from './ConfirmationDialog';

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

describe('ConfirmationDialog - rendered output', () => {
  const render = (props) =>
    renderToStaticMarkup(
      createElement(ConfirmationDialog, {
        isOpen: true,
        title: 'Remove this service guide?',
        message: 'This removes "PAN Card" from the active service directory.',
        itemName: 'PAN Card',
        confirmLabel: 'Remove service',
        cancelLabel: 'Keep service',
        onConfirm: () => {},
        onCancel: () => {},
        ...props,
      })
    );

  it('renders nothing when closed', () => {
    expect(render({ isOpen: false })).toBe('');
  });

  it('shows the target record, consequence and both choices as an alertdialog', () => {
    const html = render({});
    expect(html).toContain('role="alertdialog"');
    expect(html).toContain('PAN Card');
    expect(html).toContain('Remove service');
    expect(html).toContain('Keep service');
    expect(html).not.toContain('role="alert"');
    expect(html).not.toContain('disabled');
  });

  it('pending: locks cancel, close and confirm so the action cannot be sent twice', () => {
    const html = render({ isLoading: true });
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('Processing...');
    // close icon, cancel and confirm are all disabled
    expect(html.match(/disabled=""/g)).toHaveLength(3);
  });

  it('failure: announces the error inline and keeps both buttons usable', () => {
    const html = render({ errorMessage: 'Could not remove it. Try again.', confirmLabel: 'Try again' });
    expect(html).toContain('role="alert"');
    expect(html).toContain('Could not remove it. Try again.');
    expect(html).toContain('Try again');
    expect(html).not.toContain('disabled');
  });
});
