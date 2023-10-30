import React, {useEffect} from 'react';
import {Dimensions, View, ActivityIndicator, StyleSheet} from 'react-native';
import Text from '../components/Text';
import {colors} from '../styles/theme';
import {useAtom} from 'jotai';
import {loginFlowAtom} from '../atoms/login-flow-state.atom';

const LoadingScreen = () => {
  const [, setLoginFlowState] = useAtom(loginFlowAtom);

  useEffect(() => {
    setTimeout(() => {
      setLoginFlowState(prev => ({...prev, isFetchingProfileData: false}));
    }, 30000);
  }, [setLoginFlowState]);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Loading your profile</Text>
      <ActivityIndicator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: Dimensions.get('screen').height,
    backgroundColor: colors.black[950],
  },
  text: {
    paddingTop: 100,
    paddingBottom: 20,
    color: colors.grey['100'],
    textAlign: 'center',
    fontSize: 22,
  },
});

export default LoadingScreen;
