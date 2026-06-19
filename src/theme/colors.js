import { Platform } from 'react-native';

// FamilyFlow — "Vogue Family" editorial palette: ivory paper, charcoal ink,
// hairline rules, a single restrained metallic gold accent.
export const colors = {
  // editorial core
  ivory: '#F4F1EA',
  paper: '#FBFAF6',
  ink: '#161412',
  charcoal: '#3A352F',
  gold: '#9C7A3C', // muted metallic accent
  line: '#E0D9CC', // hairline
  muted: '#9C9488',

  // aliases used across the app (so the look propagates):
  bg: '#F4F1EA',
  card: '#FBFAF6',
  border: '#E0D9CC',
  dark: '#161412',
  white: '#FFFFFF',

  // original brand hues, kept as restrained accents (domains/members)
  purple: '#6E668F',
  sage: '#84AB7F',
  sand: '#C9A24B',
  plum: '#3F403A',
};

// Typography. Didot is the quintessential fashion-magazine serif on iOS.
export const fonts = {
  serif: Platform.select({ ios: 'Didot', android: 'serif', default: 'serif' }),
  serifBold: Platform.select({ ios: 'Didot-Bold', android: 'serif', default: 'serif' }),
};

// Domain -> colour (refined, lower-chroma accents)
export const domainColors = {
  household: colors.purple,
  baby: colors.sage,
  admin: colors.gold,
  social: colors.sand,
};

export const domainLabels = {
  household: 'Household',
  baby: 'Baby',
  admin: 'Admin',
  social: 'Social',
};

export const DOMAINS = ['household', 'baby', 'admin', 'social'];
export const FREQUENCIES = ['daily', 'weekly', 'yearly'];

export const frequencyLabels = {
  daily: 'Daily',
  weekly: 'Weekly',
  yearly: 'Plans',
};

// Palette options offered when creating/editing a family member.
export const MEMBER_COLORS = [
  colors.purple,
  colors.gold,
  colors.sage,
  colors.sand,
  '#9E5B6B', // rose
  '#5B7A94', // slate blue
  '#7A5A3C', // tobacco
  colors.ink,
];

export const MEMBER_EMOJIS = [
  '👩', '👨', '🧑', '👧', '👦', '👶', '🧓', '👵', '👴', '🐱', '🐶', '⭐️',
];

export function memberColor(member) {
  return member ? member.color : colors.muted;
}
export function memberLabel(member) {
  return member ? member.name : 'Unassigned';
}
