import {StyleSheet, View, Text, TextInput} from 'react-native';
import React from 'react';
import {colors} from '../styles/theme';

interface PrimaryTextInputProps extends React.ComponentProps<typeof TextInput> {
  label: string;
}

export const PrimaryTextInput: React.FC<PrimaryTextInputProps> = ({
  label,
  ...rest
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...rest}
        style={styles.input}
        placeholderTextColor={colors.grey[500]}
        autoCorrect={false}
        autoCapitalize={'none'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    color: colors.grey[300],
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    backgroundColor: colors.grey[900],
    borderRadius: 10,
    padding: 16,
    fontSize: 20,
    color: colors.white,
    fontWeight: 'bold',
  },
});
