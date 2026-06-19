// Simple emoji iconography for tasks. Exact title match first, then keyword, then
// a per-category fallback — so custom chores still get a sensible icon.

const EXACT = {
  'make the bed': '🛏️',
  'tidy living room': '🛋️',
  'wash dishes': '🍽️',
  'take out bins': '🗑️',
  'morning feed': '🍼',
  'nappy changes': '🧷',
  'bedtime routine': '🌙',
  'nap check': '😴',
  'couple check-in': '💬',
  'vacuum and mop': '🧹',
  'bathroom clean': '🛁',
  'laundry': '🧺',
  'grocery shop': '🛒',
  'prep baby food': '🥣',
  'wash baby clothes': '👕',
  'check bank account': '💳',
  'reply to messages': '📩',
  'family video call': '📹',
  'date night plan': '🍷',
  'deep clean': '🧽',
  'service boiler': '🔧',
  'paediatrician visit': '🩺',
  'vaccinations': '💉',
  'tax return': '🧾',
  'insurance renewal': '📄',
  'renew documents': '🪪',
  'holiday planning': '✈️',
  'birthday calendar': '🎂',
};

const KEYWORDS = [
  ['dish', '🍽️'], ['laundry', '🧺'], ['bath', '🛁'], ['shower', '🚿'],
  ['vacuum', '🧹'], ['mop', '🧹'], ['clean', '🧽'], ['tidy', '🧺'],
  ['bin', '🗑️'], ['trash', '🗑️'], ['rubbish', '🗑️'],
  ['shop', '🛒'], ['groc', '🛒'], ['cook', '🍳'], ['meal', '🍽️'], ['dinner', '🍽️'],
  ['feed', '🍼'], ['nappy', '🧷'], ['diaper', '🧷'], ['baby', '👶'],
  ['bed', '🛏️'], ['nap', '😴'], ['sleep', '🌙'],
  ['bank', '💳'], ['bill', '💸'], ['pay', '💸'], ['tax', '🧾'],
  ['message', '📩'], ['email', '📧'], ['call', '📞'], ['video', '📹'],
  ['date', '🍷'], ['birthday', '🎂'], ['holiday', '✈️'], ['travel', '✈️'],
  ['insur', '📄'], ['document', '🪪'], ['boiler', '🔧'], ['fix', '🔧'], ['repair', '🔧'],
  ['vaccin', '💉'], ['doctor', '🩺'], ['paediatric', '🩺'], ['dentist', '🦷'],
  ['plant', '🪴'], ['water', '🪴'], ['garden', '🌿'],
  ['car', '🚗'], ['dog', '🐕'], ['cat', '🐈'], ['pet', '🐾'],
];

const DOMAIN = { household: '🏠', baby: '👶', admin: '🗂️', social: '💛' };

export function taskIcon(title = '', domain = 'household') {
  const t = title.toLowerCase().trim();
  if (EXACT[t]) return EXACT[t];
  for (const [k, e] of KEYWORDS) if (t.includes(k)) return e;
  return DOMAIN[domain] || '•';
}
