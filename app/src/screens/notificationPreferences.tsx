import {Button, StyleSheet, Switch, TouchableOpacity, View} from 'react-native';
import Text from '../components/Text';
import {Header} from '../components/Header';
import {useNavigation} from '@react-navigation/native';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';
import {
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import dayjs from 'dayjs';
import notifee from '@notifee/react-native';
import {useAtom} from 'jotai';
import {
  disabledNotificationPreferences,
  enabledNotificationPreferences,
  ensureFutureDate,
  notificationPreferencesAtom,
} from '../atoms/notification-preferences.atom';
import {useEffect, useState} from 'react';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import {colors} from '../styles/theme';

const notificationId = 'log-weight-notification';

async function cancelNotification() {
  const notifications = await notifee.getTriggerNotifications();

  notifications.forEach(notification => {
    if (notification.notification.id === notificationId) {
      notifee.cancelNotification(notification.notification.id);
    }
  });
}

async function onCreateTriggerNotification({
  timestamp,
  repeatFrequency,
}: {
  timestamp: number;
  repeatFrequency: RepeatFrequency;
}) {
  await cancelNotification();

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp,
    repeatFrequency,
  };

  await notifee.createTriggerNotification(
    {
      id: 'log-weight-notification',
      title: 'How much do you weigh today?',
      body: 'Tap to log your daily bodyweight',
    },
    trigger,
  );
}

const NotificationPreferencesScreen = () => {
  const [notificationPreferences, setNotificationPreferences] = useAtom(
    notificationPreferencesAtom,
  );
  console.log(notificationPreferences);
  const navigation = useNavigation();

  useEffect(() => {
    if (notificationPreferences.enabled && notificationPreferences.timestamp) {
      onCreateTriggerNotification({
        timestamp: ensureFutureDate(notificationPreferences.timestamp),
        repeatFrequency: notificationPreferences.frequency,
      });
    } else {
      cancelNotification();
    }
  }, [notificationPreferences]);

  return (
    <View style={styles.container}>
      <Header
        title="Notification preferences"
        backButtonCallback={() => {
          navigation.goBack();
        }}
      />
      <View style={{padding: 20, gap: 20}}>
        <View style={{gap: 10}}>
          <Text>Would you like to receive reminders to log your weight?</Text>
          <Switch
            trackColor={{
              false: colors.grey['500'],
              true: colors['picton-blue'][700],
            }}
            value={notificationPreferences.enabled}
            onValueChange={value => {
              if (value) {
                setNotificationPreferences(enabledNotificationPreferences);
              } else {
                setNotificationPreferences(disabledNotificationPreferences);
              }
            }}
          />
        </View>
        {notificationPreferences.enabled && (
          <View style={{gap: 10}}>
            <Text>Frequency of reminders</Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <View style={{flexDirection: 'row', gap: 4}}>
                <TouchableOpacity
                  onPress={() =>
                    setNotificationPreferences({
                      ...notificationPreferences,
                      frequency: RepeatFrequency.DAILY,
                    })
                  }
                  style={[
                    styles.touchable,
                    notificationPreferences.frequency ===
                      RepeatFrequency.DAILY && styles.touchableActive,
                  ]}>
                  <Text>Every day</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    setNotificationPreferences({
                      ...notificationPreferences,
                      frequency: RepeatFrequency.WEEKLY,
                    })
                  }
                  style={[
                    styles.touchable,
                    notificationPreferences.frequency ===
                      RepeatFrequency.WEEKLY && styles.touchableActive,
                  ]}>
                  <Text>Every week</Text>
                </TouchableOpacity>
              </View>
              <RNDateTimePicker
                accentColor={colors['picton-blue'][700]}
                value={dayjs(notificationPreferences.timestamp).toDate()}
                onChange={(event, date) => {
                  if (date) {
                    setNotificationPreferences({
                      ...notificationPreferences,
                      timestamp: date.getTime(),
                    });
                  }
                }}
                mode="time"
                themeVariant="dark"
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, marginTop: StaticSafeAreaInsets.safeAreaInsetsTop},
  touchable: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.black[800],
  },
  touchableActive: {
    backgroundColor: colors['picton-blue'][700],
  },
});

export default NotificationPreferencesScreen;
