/**
 * Notification preferences.
 *
 * Local-only, on purpose: there is no push/email delivery backend yet, so
 * these switches genuinely just gate what the app shows itself (in-app
 * reminders, badges) rather than promising a text or email that nothing
 * sends. Defaults mirror what a student would want on by default versus
 * something they'd opt into — leaderboard movement is the one most people
 * would find noisy, so it defaults off.
 */

export type NotifKey = 'streak' | 'work' | 'cards' | 'leaderboard' | 'weekly'

export type NotifPrefs = Record<NotifKey, boolean>

const KEY = 'ewin-notif-prefs-v1'

const DEFAULTS: NotifPrefs = {
  streak: true,
  work: true,
  cards: true,
  leaderboard: false,
  weekly: true,
}

export function loadNotifPrefs(): NotifPrefs {
  if (typeof window === 'undefined') return DEFAULTS
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}') as Partial<NotifPrefs>
    return { ...DEFAULTS, ...raw }
  } catch {
    return DEFAULTS
  }
}

export function setNotifPref(key: NotifKey, on: boolean): NotifPrefs {
  const next = { ...loadNotifPrefs(), [key]: on }
  localStorage.setItem(KEY, JSON.stringify(next))
  return next
}
