/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {
  CompositeNavigationProp,
  NavigationContainer,
  useNavigation,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';
import {LogBox, StatusBar, StyleSheet, TouchableOpacity} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {LoginScreen} from './src/screens/auth/login';
import {supabase} from './src/supabase';
import DatabaseProvider from '@nozbe/watermelondb/DatabaseProvider';
import {database} from './src/watermelondb';

import {
  BottomTabNavigationProp,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {HomeScreen} from './src/screens/home';
import {ProfileScreen} from './src/screens/profile';
import {RegisterScreen} from './src/screens/auth/register';
import {CaloriesScreen} from './src/screens/calories';
import AddWeightScreen from './src/screens/addWeight';

import {useAtom} from 'jotai';
import {sessionAtom} from './src/atoms/session.atom';
import {useSyncDatabase} from './src/watermelondb/sync/use-sync';

import {DateTime} from 'luxon';
import {colors, theme} from './src/styles/theme';
import {MaterialIcon} from './src/icons/material-icons';

LogBox.ignoreLogs(['useSharedValueEffect()']);

// database.write(async () => {
//   await database.unsafeResetDatabase();
// });

export type TabStackParamList = {
  Weights: undefined;
  Calories: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  index: undefined;
  AddWeight: {dateToPass: string; id: string | undefined};
};

export type NoAuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type NoAuthStackNavigationProps =
  NativeStackNavigationProp<NoAuthStackParamList>;

export type TabStackNavigationProps = CompositeNavigationProp<
  BottomTabNavigationProp<TabStackParamList>,
  NativeStackNavigationProp<AuthStackParamList>
>;

const NoAuthStack = createNativeStackNavigator<NoAuthStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const TabStack = createBottomTabNavigator<TabStackParamList>();

const Tabs = () => {
  const navigation = useNavigation<TabStackNavigationProps>();
  const {isSyncing, error} = useSyncDatabase();
  const [session] = useAtom(sessionAtom);

  if (isSyncing || error) {
    console.log('isSyncing', isSyncing);
    console.log('error', error);
  }

  return (
    <>
      <TabStack.Navigator screenOptions={{headerShown: false}}>
        <TabStack.Screen
          name="Weights"
          component={HomeScreen}
          options={{
            tabBarIcon: ({color, size}) => (
              <MaterialIcon name="scale-bathroom" color={color} size={size} />
            ),
          }}
        />
        <TabStack.Screen
          name="Calories"
          component={CaloriesScreen}
          options={{
            tabBarIcon: ({color, size}) => (
              <MaterialIcon name="fire-circle" color={color} size={size} />
            ),
          }}
        />
        <TabStack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({color, size}) => (
              <MaterialIcon name="account-circle" color={color} size={size} />
            ),
          }}
        />
      </TabStack.Navigator>
      {
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('AddWeight', {
              dateToPass: DateTime.now().toFormat('dd-MM-yyyy'),
              id: session?.user.id,
            });
          }}
          style={styles.addButton}>
          <MaterialIcon name="plus" color={colors.grey[900]} size={40} />
        </TouchableOpacity>
      }
    </>
  );
};

function App(): JSX.Element {
  const [userSession, setSession] = useAtom(sessionAtom);

  useEffect(() => {
    supabase.auth.getSession().then(({data: {session}}) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, [setSession]);

  return (
    <NavigationContainer theme={theme}>
      <DatabaseProvider database={database}>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" />
          {userSession && (
            <AuthStack.Navigator
              screenOptions={() => {
                return {
                  headerShown: false,
                };
              }}>
              <AuthStack.Screen name="index" component={Tabs} />
              <AuthStack.Screen
                name="AddWeight"
                component={AddWeightScreen}
                options={{
                  presentation: 'modal',
                }}
              />
            </AuthStack.Navigator>
          )}

          {!userSession && (
            <NoAuthStack.Navigator>
              <NoAuthStack.Screen name="Login" component={LoginScreen} />
              <NoAuthStack.Screen name="Register" component={RegisterScreen} />
            </NoAuthStack.Navigator>
          )}
        </SafeAreaProvider>
      </DatabaseProvider>
    </NavigationContainer>
  );
}

export default App;

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: colors.primary,
    height: 60,
    width: 60,
    position: 'absolute',
    right: 20,
    bottom: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
