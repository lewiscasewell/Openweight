import 'react-native-get-random-values';
import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {LogBox, StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {supabase} from './src/supabase';
import DatabaseProvider from '@nozbe/watermelondb/DatabaseProvider';
import {database} from './src/watermelondb';
import {useAtom} from 'jotai';
import {sessionAtom} from './src/atoms/session.atom';
import {theme} from './src/styles/theme';
import {appStateAtom} from './src/atoms/appLoading.atom';
import LoadingScreen from './src/screens/loadingScreen';
import AuthedStack from './src/stacks/AuthedStack';
import NoAuthedStack from './src/stacks/NoAuthedStack';

LogBox.ignoreLogs([
  'useSharedValueEffect()',
  'Overriding previous layout animation',
]);

function App(): JSX.Element {
  const [userSession, setSession] = useAtom(sessionAtom);
  const [isAppLoading] = useAtom(appStateAtom);

  useEffect(() => {
    supabase.auth.getSession().then(({data: {session}}) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        database.write(async () => {
          await database.unsafeResetDatabase();
        });
      }

      setSession(session);
    });
  }, [setSession]);

  return (
    <NavigationContainer theme={theme}>
      <DatabaseProvider database={database}>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" />
          {isAppLoading.isAppLoading && <LoadingScreen />}
          {userSession && <AuthedStack />}
          {!userSession && <NoAuthedStack />}
        </SafeAreaProvider>
      </DatabaseProvider>
    </NavigationContainer>
  );
}

export default App;
