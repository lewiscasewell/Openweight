import {View, Text, StyleSheet} from 'react-native';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';

export const EditProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Edit Profile</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StaticSafeAreaInsets.safeAreaInsetsTop,
  },
});
