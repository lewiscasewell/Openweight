import {View, Text, StyleSheet, Button} from 'react-native';
import {sync} from '../watermelondb/sync';

export const CaloriesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calories</Text>
      <Button
        title="SYNC"
        onPress={() => {
          sync();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
});
