import {ScrollView, StyleSheet, View} from 'react-native';
import Text from '../components/Text';
import {Header} from '../components/Header';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';
import {useNavigation} from '@react-navigation/native';
import {TouchableHighlight} from 'react-native';
import {colors} from '../styles/theme';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../stacks/types';

type PreferencesScreenNavigation =
  NativeStackNavigationProp<AuthStackParamList>;

const PreferencesScreen = () => {
  const navigation = useNavigation<PreferencesScreenNavigation>();
  return (
    <View style={styles.container}>
      <Header
        title="Preferences"
        backButtonCallback={() => {
          navigation.goBack();
        }}
      />

      <ScrollView style={styles.optionsContainer}>
        <TouchableHighlight
          style={styles.optionContainer}
          onPress={() => {
            navigation.navigate('NotificationPreferences');
          }}>
          <Text style={styles.optionText}>Notifications</Text>
        </TouchableHighlight>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, marginTop: StaticSafeAreaInsets.safeAreaInsetsTop},
  optionsContainer: {
    padding: 20,
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
});

export default PreferencesScreen;
