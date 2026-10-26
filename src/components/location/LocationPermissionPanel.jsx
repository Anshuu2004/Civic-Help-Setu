import { Navigation, ShieldCheck, Info, Search } from 'lucide-react';
import {
  LOCATION_STATUS,
  canRequestLocation,
  getLocationFailureCopy,
  isFallbackStatus,
} from '../../utils/locationPermission';

export const LOCATION_REQUEST_BUTTON_ID = 'location-request-button';
export const LOCALITY_SEARCH_INPUT_ID = 'office-locality-search';

const LocationPermissionPanel = ({ status, permissionState = 'unknown', onRequestLocation }) => {
  const failure = getLocationFailureCopy(status);
  const fallback = isFallbackStatus(status);
  const requesting = status === LOCATION_STATUS.REQUESTING;
  const canRequest = canRequestLocation({ status, permissionState });
  // Denied but the browser cannot confirm the setting: only offer a deliberate retry.
  const isRetry = fallback && status !== LOCATION_STATUS.UNSUPPORTED;
  const buttonLabel = requesting
    ? 'Detecting location...'
    : !canRequest
      ? 'Location is blocked in browser settings'
      : status === LOCATION_STATUS.DENIED
      ? 'I have allowed it in browser settings, try again'
      : isRetry
        ? 'Try location again'
        : 'Share my location';

  const focusSearch = () => {
    const input = document.getElementById(LOCALITY_SEARCH_INPUT_ID);
    if (input) {
      input.scrollIntoView?.({ block: 'center' });
      input.focus();
    }
  };

  return (
    <section className="location-permission" aria-labelledby="location-permission-title">
      <h2 id="location-permission-title" className="location-permission__title">
        <ShieldCheck size={18} aria-hidden="true" /> Find offices near you
      </h2>
      <p className="location-permission__text">
        If you choose to share your location, we use it only in this browser to sort offices by distance. It is
        not sent anywhere and is forgotten when you close the tab. Sharing is optional: you can always search by
        city, area or PIN code instead.
      </p>

      {failure && (
        <div className="location-permission__status" role="alert">
          <Info size={18} aria-hidden="true" />
          <div>
            <strong>{failure.title}</strong>
            <div>{failure.message}</div>
          </div>
        </div>
      )}

      <div className="location-permission__actions">
        {status !== LOCATION_STATUS.UNSUPPORTED && (
          <button
            type="button"
            id={LOCATION_REQUEST_BUTTON_ID}
            className="btn btn-secondary location-permission__button"
            onClick={onRequestLocation}
            disabled={!canRequest}
            aria-disabled={!canRequest}
          >
            <Navigation size={16} aria-hidden="true" />
            {buttonLabel}
          </button>
        )}
        {(fallback || status === LOCATION_STATUS.IDLE) && (
          <button
            type="button"
            className="btn btn-secondary location-permission__button"
            onClick={focusSearch}
          >
            <Search size={16} aria-hidden="true" />
            Search by locality instead
          </button>
        )}
      </div>
      <p className="location-permission__sr" role="status">
        {requesting ? 'Waiting for your browser to share your location.' : ''}
      </p>
    </section>
  );
};

export default LocationPermissionPanel;
