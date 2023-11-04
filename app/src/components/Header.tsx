import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Text from './Text';
import {colors} from '../styles/theme';
import {MaterialIcon} from '../icons/material-icons';
import Animated, {FadeInUp} from 'react-native-reanimated';

type HeaderProps = {
  title?: string;
  nodes?: Array<React.ReactElement>;
  backButtonCallback?: () => void;
  disabled?: boolean;
};

export const Header: React.FC<HeaderProps> = ({
  title,
  nodes = [<></>],
  backButtonCallback,
}) => {
  return (
    <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
      <View style={styles.titleContainer}>
        {!!backButtonCallback && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={backButtonCallback}>
            <MaterialIcon name="chevron-left" color={colors.white} size={24} />
          </TouchableOpacity>
        )}

        {title && <Text style={styles.title}>{title}</Text>}
      </View>
      <View style={styles.nodes}>
        {[...nodes].map((N, index) => {
          return React.cloneElement(N, {key: index});
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 10,
    width: '100%',
    height: 60,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.black[950],
    zIndex: 1,
    shadowColor: colors.black[950],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
  },
  nodes: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
});
