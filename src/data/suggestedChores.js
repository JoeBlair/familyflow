// Suggested chores offered in the first-run setup picker (ChoreSetupScreen).
// Each: { title, frequency, domain }. `defaultOn` pre-ticks a sensible starter set
// so a family can tap straight through, then tailor.
export const SUGGESTED_CHORES = [
  // Household — daily
  { title: 'Make the bed', frequency: 'daily', domain: 'household', defaultOn: true },
  { title: 'Tidy living room', frequency: 'daily', domain: 'household', defaultOn: true },
  { title: 'Wash dishes', frequency: 'daily', domain: 'household', defaultOn: true },
  { title: 'Take out bins', frequency: 'daily', domain: 'household', defaultOn: true },
  { title: 'Cook dinner', frequency: 'daily', domain: 'household' },
  // Household — weekly
  { title: 'Vacuum and mop', frequency: 'weekly', domain: 'household', defaultOn: true },
  { title: 'Bathroom clean', frequency: 'weekly', domain: 'household', defaultOn: true },
  { title: 'Laundry', frequency: 'weekly', domain: 'household', defaultOn: true },
  { title: 'Grocery shop', frequency: 'weekly', domain: 'household', defaultOn: true },
  { title: 'Change bed sheets', frequency: 'weekly', domain: 'household' },
  // Household — yearly
  { title: 'Deep clean', frequency: 'yearly', domain: 'household' },
  { title: 'Service boiler', frequency: 'yearly', domain: 'household' },

  // Baby — daily
  { title: 'Morning feed', frequency: 'daily', domain: 'baby' },
  { title: 'Nappy changes', frequency: 'daily', domain: 'baby' },
  { title: 'Bedtime routine', frequency: 'daily', domain: 'baby' },
  { title: 'Nap check', frequency: 'daily', domain: 'baby' },
  // Baby — weekly / yearly
  { title: 'Prep baby food', frequency: 'weekly', domain: 'baby' },
  { title: 'Wash baby clothes', frequency: 'weekly', domain: 'baby' },
  { title: 'Paediatrician visit', frequency: 'yearly', domain: 'baby' },
  { title: 'Vaccinations', frequency: 'yearly', domain: 'baby' },

  // Admin — weekly / yearly
  { title: 'Check bank account', frequency: 'weekly', domain: 'admin', defaultOn: true },
  { title: 'Reply to messages', frequency: 'weekly', domain: 'admin' },
  { title: 'Pay bills', frequency: 'weekly', domain: 'admin' },
  { title: 'Tax return', frequency: 'yearly', domain: 'admin' },
  { title: 'Insurance renewal', frequency: 'yearly', domain: 'admin' },
  { title: 'Renew documents', frequency: 'yearly', domain: 'admin' },

  // Social — weekly / yearly
  { title: 'Couple check-in', frequency: 'daily', domain: 'social' },
  { title: 'Family video call', frequency: 'weekly', domain: 'social', defaultOn: true },
  { title: 'Date night plan', frequency: 'weekly', domain: 'social', defaultOn: true },
  { title: 'Holiday planning', frequency: 'yearly', domain: 'social' },
  { title: 'Birthday calendar', frequency: 'yearly', domain: 'social' },
];
