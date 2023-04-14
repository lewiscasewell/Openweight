import {KeyboardAvoidingView, StyleSheet, View} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {PrimaryTextInput} from '../../../components/TextInput';
import {SecondaryButton} from '../../../components/Button';
import {SafeAreaView} from 'react-native-safe-area-context';

export const RegisterNameAndEmailScreen = () => {
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [password, setPassword] = React.useState('');

  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={60}
        style={{flex: 1}}>
        <View style={{padding: 10, flex: 1}}>
          <PrimaryTextInput
            onChangeText={text => setName(text)}
            value={name}
            placeholder="Name"
            autoCompleteType="name"
            label="Name"
          />

          <PrimaryTextInput
            onChangeText={text => setEmail(text)}
            value={email}
            placeholder="email@address.com"
            label="Email"
          />
          <PrimaryTextInput
            onChangeText={text => setPassword(text)}
            value={password}
            placeholder="Password"
            label="Password"
            secureTextEntry={true}
          />
        </View>
        <View
          style={{
            padding: 10,
          }}>
          <SecondaryButton
            title="Next"
            onPress={() => {
              navigation.navigate('RegisterGenderAndDob');
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: -40,
    padding: 10,
    flex: 1,
  },
});
