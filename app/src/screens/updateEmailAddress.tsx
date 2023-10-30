import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Alert, TouchableOpacity} from 'react-native';
import Text from '../components/Text';
import {PrimaryTextInput} from '../components/TextInput';
import {supabase} from '../supabase';
import {PrimaryButton} from '../components/Button';
import {MaterialIcon} from '../icons/material-icons';

const GoBack = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={() => {
        navigation.goBack();
      }}>
      <MaterialIcon name="chevron-left" color="white" size={30} />
    </TouchableOpacity>
  );
};
export const UpdateEmailAddressScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      // eslint-disable-next-line react/no-unstable-nested-components
      headerLeft: () => <GoBack />,
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update Email Address</Text>

      <View style={styles.formContainer}>
        <PrimaryTextInput
          label="New email Address"
          placeholder="email@address.com"
          onChangeText={(text: string) => {
            setEmail(text);
          }}
          value={email}
        />

        <PrimaryButton
          loading={loading}
          title="Update Email Address"
          onPress={async () => {
            setLoading(true);
            const {data, error} = await supabase.auth.updateUser({
              email: email,
            });

            if (error) {
              Alert.alert(error.message);
              setLoading(false);
              return;
            }

            if (data) {
              Alert.alert(
                `Check both ${data.user.email} and ${data.user.new_email} for a confirmation link to update the email address.`,
              );
              setLoading(false);
            }
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 14},
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  formContainer: {
    marginTop: 40,
  },
});
