import * as Notifications from 'expo-notifications';

// Show reminders even when the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const REMINDER_ID = 'ff-daily-reminder';

export async function ensureNotifPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

// Schedule (or reschedule) a repeating daily local reminder.
export async function scheduleDailyReminder(hour, minute = 0) {
  await cancelDailyReminder();
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: 'FamilyFlow',
      body: 'A quick tidy? See what’s on today.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes?.DAILY ?? 'daily',
      hour,
      minute,
    },
  });
}

export async function cancelDailyReminder() {
  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
  } catch {
    // nothing scheduled — fine
  }
}
