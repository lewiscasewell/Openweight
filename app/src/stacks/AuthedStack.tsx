import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Tabs from './TabStack';
import EditProfileScreen from '../screens/editProfile';
import {UpdateEmailAddressScreen} from '../screens/updateEmailAddress';
import AddWeightScreen from '../screens/addWeight/addWeight';
import {AuthStackParamList} from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const AuthedStack = () => {
  return (
    <AuthStack.Navigator
      screenOptions={() => {
        return {
          headerShown: false,
        };
      }}>
      <AuthStack.Screen name="index" component={Tabs} />
      <AuthStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerShown: true,
        }}
      />
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
    </AuthStack.Navigator>
  );
};

export default AuthedStack;
