import {Database, Q} from '@nozbe/watermelondb';
import Weight from '../../watermelondb/model/Weight';
import {Session} from '@supabase/supabase-js';
import {TabStackNavigationProps} from '../../stacks/types';
import Profile from '../../watermelondb/model/Profile';
import dayjs from 'dayjs';

export async function addWeight({
  database,
  weights,
  session,
  date,
  weightInput,
  navigation,
  startAnimation,
}: {
  database: Database;
  weights: Weight[];
  session: Session | null;
  date: Date;
  weightInput: string;
  navigation: TabStackNavigationProps;
  startAnimation: () => void;
}): Promise<void> {
  await database.write(async () => {
    const profile = await database
      .get<Profile>('profiles')
      .query(Q.where('supabase_user_id', session?.user.id!))
      .fetch();

    const weightOnDate = weights.find(
      weight =>
        dayjs(weight.dateAt).format('YYYY-MM-DD') ===
        dayjs(date).format('YYYY-MM-DD'),
    );

    const isTargetWeightReached =
      parseFloat(weightInput) === profile?.[0]?.targetWeight;

    if (weightOnDate !== undefined && weightInput) {
      await weightOnDate.update(weightRecord => {
        weightRecord.weight = parseFloat(weightInput);
      });

      navigation.goBack();
      if (isTargetWeightReached) {
        startAnimation();
      }
      return;
    }
    if (weightInput) {
      await database.get<Weight>('weights').create(weight => {
        // @ts-ignore
        weight.profile.set(profile[0]);
        weight.weight = parseFloat(weightInput);
        weight.unit = 'kg';
        weight.dateAt = date;
        weight.supabaseUserId = session?.user.id!;
      });
    }

    if (isTargetWeightReached) {
      startAnimation();
    }

    navigation.goBack();
  });
}

export async function deleteWeight({
  database,
  weights,
  date,
  navigation,
}: {
  database: Database;
  weights: Weight[];
  date: Date;
  navigation: TabStackNavigationProps;
}): Promise<void> {
  await database.write(async () => {
    const weightOnDate = weights.find(
      weight =>
        dayjs(weight.dateAt).format('YYYY-MM-DD') ===
        dayjs(date).format('YYYY-MM-DD'),
    );

    if (weightOnDate !== undefined) {
      await weightOnDate
        .markAsDeleted()
        .then(() => {
          console.log('deleted');
        })
        .catch(error => {
          console.log(error);
        });

      navigation.goBack();

      return;
    }
  });
}
