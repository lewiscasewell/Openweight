import {useAtom} from 'jotai';
import React from 'react';
import {View} from 'react-native';
import {sessionAtom} from '../atoms/session.atom';

import WeightList from '../components/WeightList';

export const HomeScreen = () => {
  const [session] = useAtom(sessionAtom);

  return <View>{session && <WeightList supabaseId={session.user.id} />}</View>;
};
