import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NoAuthStackParamList} from './types';
import {LoginScreen} from '../screens/login/login';

const NoAuthStack = createNativeStackNavigator<NoAuthStackParamList>();

const NoAuthedStack = () => {
  return (
    <NoAuthStack.Navigator>
      <NoAuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{headerShown: false}}
      />
    </NoAuthStack.Navigator>
  );
};

export default NoAuthedStack;
