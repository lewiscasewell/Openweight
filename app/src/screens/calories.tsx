import React from 'react';
import {Text, StyleSheet, Button, ScrollView} from 'react-native';
import {LineGraph} from 'react-native-graph';
import {sync} from '../watermelondb/sync';

export const CaloriesScreen = () => {
  const months = ['2023-01', '2023-02', '2022-12', '2022-11', '2023-10'];
  const sortedMonths = months.sort((a, b) => {
    return b.localeCompare(a);
  });
  console.log(sortedMonths);
  return (
    <ScrollView style={styles.container}>
      <Button title="sync" onPress={() => sync()} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  graph: {
    flex: 1,
    height: 200,
    width: 300,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
});
