import React, {useEffect} from 'react';
import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import Tabs from './TabStack';
import EditProfileScreen from '../screens/editProfile';
import {UpdateEmailAddressScreen} from '../screens/updateEmailAddress';
import AddWeightScreen from '../screens/addWeight/addWeight';
import {AuthStackParamList} from './types';
import PreferencesScreen from '../screens/preferences';
import NotificationPreferencesScreen from '../screens/notificationPreferences';
import notifee, {EventType} from '@notifee/react-native';
import {useNavigation} from '@react-navigation/native';
import {useAtomValue} from 'jotai';
import {sessionAtom} from '../atoms/session.atom';
import dayjs from 'dayjs';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
type NavigationType = NativeStackNavigationProp<AuthStackParamList>;

const AuthedStack = () => {
  const userSession = useAtomValue(sessionAtom);
  const navigation = useNavigation<NavigationType>();

  useEffect(() => {
    notifee.onForegroundEvent(async ({type, detail}) => {
      if (type === EventType.PRESS) {
        navigation.navigate('AddWeight', {
          dateToPass: dayjs().format('YYYY-MM-DD'),
          id: userSession?.user.id!,
        });
      }
    });
  }, []);

  return (
    <AuthStack.Navigator
      screenOptions={() => {
        return {
          headerShown: false,
        };
      }}>
      <AuthStack.Screen name="index" component={Tabs} />
      <AuthStack.Screen name="EditProfile" component={EditProfileScreen} />
      <AuthStack.Screen
        name="UpdateEmailAddress"
        component={UpdateEmailAddressScreen}
        options={{
          headerShown: true,
        }}
      />
      <AuthStack.Screen
        name="AddWeight"
        component={AddWeightScreen}
        options={{
          presentation: 'modal',
        }}
      />
      <AuthStack.Screen name="Preferences" component={PreferencesScreen} />
      <AuthStack.Screen
        name="NotificationPreferences"
        component={NotificationPreferencesScreen}
      />
    </AuthStack.Navigator>
  );
};

export default AuthedStack;
