/* Fill in approved content before launch. Empty links keep calls/downloads in demo mode. */
window.ASTRO_CONFIG = {
  // Empty value uses the current address, including the LAN address during local preview.
  siteUrl: '',
  phoneDisplay: '+7 (000) 000-00-00',
  phone: '',
  address: '',
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
  // Demo prices for the local prototype. Replace with approved tariffs before launch.
  // Up to three tariffs: {name, description, boarding, perKm, perMinute, note}.
  // A tariff is shown only when all three prices are finite nonnegative numbers.
  tariffs: [
    { name: 'Економ', description: 'Для повседневных поездок по делам и по городу.', boarding: 150, perKm: 18, perMinute: 4 },
    { name: 'Комфорт', description: 'Больше пространства для спокойной поездки.', boarding: 220, perKm: 25, perMinute: 6 },
    { name: 'Люкс', description: 'Автомобиль бизнес-класса для особых планов.', boarding: 400, perKm: 40, perMinute: 10 },
  ],
  // Two or three real screenshots: {src: 'assets/screen-1.webp', alt: '...'}.
  screenshots: [],
  metrikaId: 0,
  demoMode: true,
};
