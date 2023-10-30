import React from 'react';
import {Text as RNText, StyleSheet} from 'react-native';
import {colors} from '../styles/theme';

interface TextProps extends React.ComponentProps<typeof RNText> {}

const Text: React.FC<TextProps> = props => {
  return (
    <RNText {...props} style={[styles.defaultStyle, props.style]}>
      {props.children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  defaultStyle: {
    color: colors.white,
    fontFamily: 'CabinetGrotesk-Medium',
  },
});

export default Text;
