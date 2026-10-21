// Opens the official carrier page; never fetches or infers carrier status.
export function uspsTrackingUrl(carrier, tracking) {
  if (!/^usps$/i.test(String(carrier || '').trim())) return null;
  const number = String(tracking || '').replace(/\s/g, '').toUpperCase();
  if (!/^(?:\d{20,22}|\d{26}|[A-Z]{2}\d{9}US)$/.test(number)) return null;
  return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(number)}`;
}
