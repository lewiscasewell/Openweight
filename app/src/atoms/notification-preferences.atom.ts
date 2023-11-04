import {RepeatFrequency} from '@notifee/react-native';
import {atomWithMMKV} from '.';
import dayjs from 'dayjs';

type NotificationPreferences = {
  enabled: boolean;
  timestamp: number | null;
  frequency: RepeatFrequency;
};

export function ensureFutureDate(date: number) {
  const now = dayjs().valueOf();
  if (date > now) {
    return date;
  }
  return dayjs(date).add(1, 'day').valueOf();
}

export const disabledNotificationPreferences: NotificationPreferences = {
  enabled: false,
  timestamp: null,
  frequency: RepeatFrequency.NONE,
};

export const enabledNotificationPreferences: NotificationPreferences = {
  enabled: true,
  timestamp: ensureFutureDate(
    dayjs().hour(9).minute(0).second(0).millisecond(0).valueOf(),
  ),
  frequency: RepeatFrequency.DAILY,
};

export const notificationPreferencesAtom =
  atomWithMMKV<NotificationPreferences>(
    'notification-preferences',
    disabledNotificationPreferences,
  );
