/**
 * Copy text to the clipboard. Uses the async Clipboard API and falls back to
 * a hidden textarea with execCommand when the API is missing or blocked.
 * Returns true if the copy worked, false otherwise (never throws).
 */
export const copyServiceLink = async (text) => {
  if (!text) return false;

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // permission denied or insecure context, try the fallback below
    }
  }

  if (typeof document === 'undefined') return false;
  const area = document.createElement('textarea');
  try {
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    return Boolean(document.execCommand('copy'));
  } catch {
    return false;
  } finally {
    area.remove();
  }
};

export const getServiceUrl = (serviceId) =>
  `${window.location.origin}/services/${serviceId}`;
