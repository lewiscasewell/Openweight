import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useAtom, useAtomValue} from 'jotai';
import Animated, {FadeInUp} from 'react-native-reanimated';
import {colors} from '../../styles/theme';
import {loginFlowAtom} from '../../atoms/login-flow-state.atom';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';
import {Dimensions} from 'react-native';
import EmailScreen from './EmailScreen';
import VerifyOTP from './VerifyOtp';
import Text from '../../components/Text';
import {MeshGradient} from 'react-native-patterns';

const {width} = Dimensions.get('window');

const LandingScreen = () => {
  const [, setLoginFlowState] = useAtom(loginFlowAtom);

  const handleContinueWithEmail = () => {
    setLoginFlowState(prev => ({...prev, status: 'email-entry'}));
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Animated.Text
          entering={FadeInUp.duration(300).delay(100).springify()}
          style={styles.logo}>
          Openweight.
        </Animated.Text>
        <Animated.Text
          entering={FadeInUp.duration(300).delay(200).springify()}
          style={styles.slogan}>
          Track your weight, by Opencoach.
        </Animated.Text>
      </View>
      <View style={styles.touchablesContainer}>
        <Animated.View entering={FadeInUp.duration(300).delay(300).springify()}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.touchable}
            onPress={handleContinueWithEmail}>
            <Text style={styles.touchableText}>Continue with email</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

export const LoginScreen = () => {
  const loginFlowState = useAtomValue(loginFlowAtom);

  return (
    <MeshGradient
      uniqueKey="login-to-openweight"
      height={Dimensions.get('screen').height}
      width={Dimensions.get('screen').width}
      blurRadius={0.8}
      colors={[
        colors['picton-blue'][900],
        colors['picton-blue'][500],
        colors['picton-blue'][100],
      ]}
      overlayOpacity={0.9}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {loginFlowState.status === 'landing' && <LandingScreen />}
        {loginFlowState.status === 'email-entry' && <EmailScreen />}
        {loginFlowState.status === 'otp-verification' && <VerifyOTP />}
      </KeyboardAvoidingView>
    </MeshGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: StaticSafeAreaInsets.safeAreaInsetsTop,
    marginBottom: StaticSafeAreaInsets.safeAreaInsetsBottom,
  },
  logo: {
    fontSize: 44,
    color: colors.white,
    textAlign: 'center',
    fontFamily: 'CabinetGrotesk-Medium',
  },
  logoContainer: {
    flex: 1,
    paddingTop: 120,
  },
  slogan: {
    fontSize: 20,
    color: colors.grey[400],
    textAlign: 'center',
    fontFamily: 'CabinetGrotesk-Medium',
  },
  touchablesContainer: {
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    width,
  },
  touchable: {
    backgroundColor: colors['picton-blue'][600],
    padding: 14,
    borderRadius: 12,
  },
  touchableText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
