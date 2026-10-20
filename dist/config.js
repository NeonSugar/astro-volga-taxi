/* Fill in approved content before launch. Empty links keep calls/downloads in demo mode. */
window.ASTRO_CONFIG = {
  // Empty value uses the current address, including the LAN address during local preview.
  siteUrl: '',
  phoneDisplay: '+7 (000) 000-00-00',
  phone: '',
  address: 'ул. Примерная, д. 00',
  emailDisplay: 'hello@example.com',
  email: '',
  driverContact: { phoneDisplay: '+7 (000) 000-00-01', phone: '', emailDisplay: 'drivers@example.com', email: '' },
  passenger: { apk: '', rustore: '', android: '', ios: '', universal: '' },
  driver: { apk: '', android: '', ios: '', universal: '' },
  messengers: { telegram: '', max: '' },
  privacyUrl: '',
  agreementUrl: '',
  officeMapUrl: '',
  companyDetails: '',
  // Up to three approved tariffs: {name, description, boarding, perKm, perMinute, note}.
  // Only finite nonnegative numbers are published as prices. Empty array preserves the draft.
  tariffs: [],
  // Two or three real screenshots: {src: 'assets/screen-1.webp', alt: '...'}.
  screenshots: [],
  metrikaId: 0,
  popupEnabled: true,
  popupDelayMs: 30000,
};
