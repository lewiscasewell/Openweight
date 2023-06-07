import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
}

export const PrimaryButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading,
}) => {
  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.primaryButtonContainer}
        onPress={onPress}>
        <Text style={styles.primaryButtonText}>
          {loading ? 'Loading...' : title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export const SecondaryButton: React.FC<ButtonProps> = ({title, onPress}) => {
  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.secondaryButtonContainer}
        onPress={onPress}>
        <Text style={styles.secondaryButtonText}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  primaryButtonContainer: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
  },
  secondaryButtonContainer: {
    backgroundColor: '#fff',
    padding: 14,

    borderRadius: 10,
  },
  secondaryButtonText: {
    color: '#000',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 22,
  },
});
