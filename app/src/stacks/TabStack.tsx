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
          }}
        />
        <TabStack.Screen
          name="Calories"
          initialParams={{id: session?.user.id}}
          component={CaloriesScreen}
          options={{
            tabBarIcon: ({color, size}) =>
              renderWeightsIcon({color, size, name: 'fire-circle'}),
          }}
        />
        <TabStack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({color, size}) =>
              renderWeightsIcon({color, size, name: 'account-circle'}),
          }}
        />
      </TabStack.Navigator>
      <AddWeightButton />
    </>
  );
};

export default Tabs;
