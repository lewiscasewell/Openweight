import React from 'react';
import {
  Dimensions,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {colors} from '../styles/theme';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Loading your profile</Text>
      <ActivityIndicator size="large" color={colors.grey['100']} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: Dimensions.get('screen').height,
    backgroundColor: colors.black,
  },
  text: {
    padding: 100,
    color: colors.grey['100'],
    textAlign: 'center',
    fontSize: 22,
  },
});

export default LoadingScreen;
