import React from 'react';
import Profile from '../watermelondb/model/Profile';

import {StyleSheet, Text, View, ScrollView, Pressable} from 'react-native';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import {Database, Q} from '@nozbe/watermelondb';
import {supabase} from '../supabase';
import {TabStackNavigationProps} from '../../App';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../styles/theme';
import {SecondaryButton} from './Button';
import {TouchableHighlight} from 'react-native-gesture-handler';

type Props = {
  database: Database;
  id: string;
  profiles: Profile[];
};

const ProfileComponent = ({profiles}: Props) => {
  const currentProfile = profiles?.[0];
  const navigation = useNavigation<TabStackNavigationProps>();
  console.log('currentProfile', currentProfile);
  if (!currentProfile) {
    return (
      <SecondaryButton
        title="Log out"
        onPress={() => {
          supabase.auth.signOut();
        }}
      />
    );
  }
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.headingContainer}>
          <Text style={styles.profileText}>Profile</Text>
          <Text style={styles.nameText}>{currentProfile.name}</Text>
        </View>
        <View style={styles.optionsContainer}>
          <TouchableHighlight
            style={styles.optionContainer}
            onPress={() => {
              navigation.navigate('EditProfile', {id: currentProfile.id});
            }}>
            <Text style={styles.optionText}>Profile information</Text>
          </TouchableHighlight>
          <TouchableHighlight style={styles.optionContainer}>
            <Text style={styles.optionText}>Change email address</Text>
          </TouchableHighlight>
        </View>
        <Pressable
          style={styles.logoutButton}
          onPress={() => {
            supabase.auth.signOut();
          }}>
          <Text style={styles.buttonText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const withModels = withObservables(['profiles'], ({database, id}: Props) => {
  return {
    profiles: database
      .get<Profile>('profiles')
      .query(Q.where('supabase_user_id', id))
      .observeWithColumns(['name']),
  };
});

export default withDatabase(withModels(ProfileComponent));

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    padding: 14,
  },
  profileText: {
    color: 'white',
    fontSize: 34,
    fontWeight: '500',
  },
  nameText: {
    color: colors.grey['400'],
    fontSize: 18,
    fontWeight: '700',
  },
  h3: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  headingContainer: {
    paddingVertical: 40,
  },
  optionsContainer: {
    paddingVertical: 40,
  },
  optionContainer: {
    paddingVertical: 20,
    borderBottomColor: colors.grey['500'],
    borderBottomWidth: 0.5,
  },
  optionText: {
    color: colors.grey['200'],
    fontSize: 22,
  },
  profileItemContainer: {
    padding: 20,
    borderTopColor: colors.grey['400'],
    borderWidth: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionItemContainer: {
    padding: 20,
    borderColor: colors.grey['500'],
    borderWidth: 0.5,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.grey['400'],
  },
  buttonContainer: {
    padding: 14,
  },
  buttonText: {
    color: colors.grey['200'],
    fontSize: 18,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  logoutButton: {
    paddingVertical: 60,
  },
});
