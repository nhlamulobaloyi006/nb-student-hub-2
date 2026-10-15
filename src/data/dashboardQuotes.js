/**
 * Rotating quotes for the dashboard hero.
 * Selected deterministically by user email hash so it's stable per user.
 */

export const DASHBOARD_QUOTES = [
  { text: 'Big dreams need a plan. You\'re closer than you think.', author: '' },
  { text: 'The best time to start was yesterday. The next best time is now.', author: '' },
  { text: 'Every application you submit is a door you\'re opening.', author: '' },
  { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' },
  { text: 'Your marks today build the life you want tomorrow.', author: '' },
  { text: 'Small consistent steps beat big infrequent leaps.', author: '' },
  { text: 'You don\'t have to be great to start, but you have to start to be great.', author: 'Zig Ziglar' },
  { text: 'The future belongs to those who prepare for it today.', author: 'Malcolm X' },
  { text: 'Study while others are sleeping; work while others are loafing.', author: 'William A. Ward' },
  { text: 'Somewhere, something incredible is waiting to be known.', author: 'Carl Sagan' },
];

/**
 * Deterministic pick — same user always sees the same quote for the day.
 * Combines a simple string hash with the day-of-year so it rotates daily.
 */
export function pickQuote(seed) {
  const s = String(seed || 'guest');
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  const day = Math.floor(Date.now() / 86400000);
  const idx = Math.abs((h + day) % DASHBOARD_QUOTES.length);
  return DASHBOARD_QUOTES[idx];
}
