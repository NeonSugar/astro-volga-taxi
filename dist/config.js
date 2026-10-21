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
  // Up to three tariffs: {name, description, boarding, perKm, perMinute, features, featured, badge, note}.
  // features: up to three strings; featured: highlighted card; badge: optional short label.
  // A tariff is shown only when all three prices are finite nonnegative numbers.
  tariffs: [
    { name: 'Економ', description: 'Для повседневных поездок по городу.', boarding: 150, perKm: 18, perMinute: 4, features: ['На каждый день', 'По городу и по делам', 'Заказ в приложении'] },
    { name: 'Комфорт', description: 'Больше пространства и удобства в дороге.', boarding: 220, perKm: 25, perMinute: 6, features: ['Просторный салон', 'Для деловых встреч', 'Заказ в приложении'], featured: true, badge: 'Больше комфорта' },
    { name: 'Люкс', description: 'Для особых событий и важных поездок.', boarding: 400, perKm: 40, perMinute: 10, features: ['Автомобиль бизнес-класса', 'Для особых случаев', 'Заказ в приложении'] },
  ],
  // Two or three real screenshots: {src: 'assets/screen-1.webp', alt: '...'}.
  screenshots: [],
  metrikaId: 0,
  demoMode: true,
};
