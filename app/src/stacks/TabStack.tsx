import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {TabStackParamList} from './types';
import {useSyncDatabase} from '../watermelondb/sync/use-sync';
import {sessionAtom} from '../atoms/session.atom';
import {useAtomValue} from 'jotai';
import {HomeScreen} from '../screens/home';
import {MaterialIcon} from '../icons/material-icons';
import CaloriesScreen from '../screens/calories';
import {ProfileScreen} from '../screens/profile';
import AddWeightButton from '../components/AddWeightButton';
import {StyleSheet} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {colors} from '../styles/theme';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';
import Confetti from '../components/Confetti';
const TabStack = createBottomTabNavigator<TabStackParamList>();

const renderWeightsIcon = ({
  color,
  size,
  name,
}: {
  color: string;
  size: number;
  name: 'scale-bathroom' | 'fire-circle' | 'account-circle';
}) => {
  return <MaterialIcon name={name} color={color} size={size} />;
};

const TabGradient = () => {
  return (
    <Animated.View
      style={tabGradientStyles.container}
      entering={FadeIn}
      exiting={FadeOut}>
      <LinearGradient
        colors={['transparent', colors.black[950]]}
        style={tabGradientStyles.height50}
      />
    </Animated.View>
  );
};

const tabGradientStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: StaticSafeAreaInsets.safeAreaInsetsBottom + 44,
    width: '100%',
  },
  height50: {
    height: 50,
  },
});

const Tabs = () => {
  const {isSyncing, error} = useSyncDatabase();
  const session = useAtomValue(sessionAtom);

  if (isSyncing || error) {
    console.log('isSyncing', isSyncing);
    console.log('error', error);
  }

  return (
    <>
      <TabStack.Navigator screenOptions={{headerShown: false}}>
        <TabStack.Screen
          name="Weights"
          initialParams={{id: session?.user.id}}
          component={HomeScreen}
          options={{
            tabBarIcon: ({color, size}) =>
              renderWeightsIcon({color, size, name: 'scale-bathroom'}),
            tabBarLabelStyle: styles.tabBarLabelStyle,
          }}
        />
        <TabStack.Screen
          name="Calories"
          initialParams={{id: session?.user.id}}
          component={CaloriesScreen}
          options={{
            tabBarIcon: ({color, size}) =>
              renderWeightsIcon({color, size, name: 'fire-circle'}),
            tabBarLabelStyle: styles.tabBarLabelStyle,
          }}
        />
        <TabStack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({color, size}) =>
              renderWeightsIcon({color, size, name: 'account-circle'}),
            tabBarLabelStyle: styles.tabBarLabelStyle,
          }}
        />
      </TabStack.Navigator>
      <TabGradient />
      <Confetti />
      <AddWeightButton />
    </>
  );
};

const styles = StyleSheet.create({
  tabBarLabelStyle: {
    fontFamily: 'CabinetGrotesk-Medium',
    fontSize: 12,
  },
});

export default Tabs;
