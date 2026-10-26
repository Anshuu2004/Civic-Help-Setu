import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import LocationPermissionPanel from './LocationPermissionPanel';
import { LOCATION_STATUS } from '../../utils/locationPermission';

const render = (props) =>
  renderToStaticMarkup(<LocationPermissionPanel onRequestLocation={() => {}} {...props} />);

describe('LocationPermissionPanel', () => {
  it('explains the purpose before any prompt and offers an explicit button', () => {
    const html = render({ status: LOCATION_STATUS.IDLE });
    expect(html).toContain('sort offices by distance');
    expect(html).toContain('Share my location');
    expect(html).toContain('Search by locality instead');
    expect(html).not.toContain('role="alert"');
  });

  it.each([
    ['denied', 'Location access is blocked'],
    ['unsupported', 'This browser cannot share location'],
    ['unavailable', 'Could not work out your location'],
    ['timeout', 'Location request timed out'],
  ])('%s shows its own message and keeps manual search available', (status, title) => {
    const html = render({ status });
    expect(html).toContain(title);
    expect(html).toContain('role="alert"');
    expect(html).toContain('Search by locality instead');
  });

  it('hides the location button when the browser lacks support', () => {
    expect(render({ status: LOCATION_STATUS.UNSUPPORTED })).not.toContain('location-request-button');
  });

  it('disables the button when the browser reports denied', () => {
    const html = render({ status: LOCATION_STATUS.DENIED, permissionState: 'denied' });
    expect(html).toMatch(/id="location-request-button"[^>]*disabled/);
    expect(html).toContain('blocked in browser settings');
  });

  it('disables the button while requesting', () => {
    const html = render({ status: LOCATION_STATUS.REQUESTING });
    expect(html).toMatch(/id="location-request-button"[^>]*disabled/);
  });
});
