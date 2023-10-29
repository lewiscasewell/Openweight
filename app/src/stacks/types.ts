import {CompositeNavigationProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';

export type TabStackParamList = {
  Weights: {id: string};
  Calories: {id: string};
  Profile: undefined;
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

export type AuthStackParamList = {
  index: undefined;
  AddWeight: {dateToPass: string; id: string};
  EditProfile: {
    id: string;
  };
  UpdateEmailAddress: undefined;
};
