// FamilyFlow — "Editorial Family" palette. Keeps the magazine bones (warm
// paper canvas, near-black ink, hairline rules, a metallic gold accent) so the
// app still stands out and feels aspirational — but the accents are now joyful
// jewel tones (terracotta, teal, marigold, berry, grape) to bring the fun,
// warm, family energy the brief asks for. `muted` is darkened to pass contrast.
export const colors = {
  // editorial core
  ivory: '#F7F2E9', // warm paper, a touch fresher than before
  paper: '#FFFDF7', // near-white card
  ink: '#1B1714', // warm near-black
  charcoal: '#43392F', // warm body text
  gold: '#C28A33', // richer, more luminous metallic accent
  line: '#E7DDCC', // hairline
  muted: '#8A7E6F', // darkened for legibility on ivory

  // aliases used across the app (so the look propagates):
  bg: '#F7F2E9',
  card: '#FFFDF7',
  border: '#E7DDCC',
  dark: '#1B1714',
  white: '#FFFFFF',

  // joyful jewel accents (domains / members) — vibrant but still tasteful
  purple: '#7A5EA8', // grape
  sage: '#4FA58C', // fresh teal-green
  sand: '#D99A3C', // marigold / honey
  plum: '#A85674', // berry
};

// Typography. Playfair Display is a Didot-style fashion-magazine serif, bundled
// via expo-font (see App.js) so it renders identically on iOS and Android.
export const fonts = {
  serif: 'PlayfairDisplay',
  serifBold: 'PlayfairDisplay-Bold',
};

// Domain -> colour (joyful jewel accents)
export const domainColors = {
  household: '#C56A4A', // terracotta
  baby: colors.sage, // teal
  admin: colors.gold, // marigold gold
  social: colors.plum, // berry
};

export const domainLabels = {
  household: 'Household',
  baby: 'Baby',
  admin: 'Admin',
  social: 'Social',
};

export const DOMAINS = ['household', 'baby', 'admin', 'social'];
export const FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly', 'once'];

export const frequencyLabels = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
  once: 'One-off',
};

// Palette options offered when creating/editing a family member — a vibrant,
// harmonious spread so every household has a joyful, distinct cast.
export const MEMBER_COLORS = [
  '#C56A4A', // terracotta
  colors.sage, // teal
  colors.gold, // marigold
  colors.plum, // berry
  colors.purple, // grape
  '#5E7E9C', // slate blue
  '#E0875F', // coral
  colors.ink, // ink
];

export const MEMBER_EMOJIS = [
  '👩', '👨', '🧑', '👧', '👦', '👶', '🧓', '👵', '👴', '🐱', '🐶', '⭐️',
];

// Member roles. 'member' = adult family; 'child' and 'helper' (home help) can be
// assigned chores but are handled differently in charts / check-in / forfeit.
export const ROLES = ['member', 'child', 'helper'];
export const roleLabels = { member: 'Family', child: 'Child', helper: 'Home help' };

export function memberColor(member) {
  return member ? member.color : colors.muted;
}
export function memberLabel(member) {
  return member ? member.name : 'Unassigned';
}
