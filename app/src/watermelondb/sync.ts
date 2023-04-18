import {hasUnsyncedChanges, synchronize} from '@nozbe/watermelondb/sync';
import {map} from 'rxjs';
import {database} from '.';
import {supabase} from '../supabase';

export async function sync() {
  await synchronize({
    database,
    pullChanges: async ({lastPulledAt, migration, schemaVersion}) => {
      //   console.log('lastPulledAt - PULL CHANGES', lastPulledAt);
      //   console.log('migration', migration);
      //   console.log('schemaVersion', schemaVersion);
      const {data} = await supabase.auth.getSession();
      console.log('pullChanges...');
      //   const {data: yo} = await supabase.auth.getUser(
      //     data.session?.access_token,
      //   );
      //   console.log(data.session?.access_token);
      const urlParams = `last_pulled_at=${lastPulledAt}`;

      const response = await fetch(
        `http://localhost:3000/api/sync?${urlParams}`,
        {
          headers: {
            Authorization: `Bearer ${data.session?.access_token}`,
          },
        },
      );

      if (!response.ok) {
        console.log('hwew');
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      //   const data = await response.json();
      const {changes, timestamp} = await response.json();

      console.log('changes', changes.weights.updated);

      //   console.log('changes', changes);
      //   console.log('timestamp', timestamp);
      //   console.log('data', data);

      return {changes, timestamp};
    },
    pushChanges: async ({changes, lastPulledAt}) => {
      //   console.log('changes in push changes', changes);
      //   console.log('lastPulledAt - PUSH CHANGES', lastPulledAt);
      console.log('pushChanges...');
      const urlParams = `last_pulled_at=${lastPulledAt}`;

      const response = await fetch(
        `http://localhost:3000/api/sync?${urlParams}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify(changes),
        },
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} - ${response.statusText}`,
        );
      }
    },
  });
}

export async function isAnyUnsyncedChanges(): Promise<boolean> {
  return await hasUnsyncedChanges({
    database,
  });
}

export function whenUpdatableDataSetChanges() {
  return database.withChangesForTables(['profiles', 'weights']).pipe(
    map(allTables => {
      console.log('allTables', allTables);
      return allTables?.filter(table => table.record._raw._status !== 'synced');
    }),
    map(x => {
      console.log(
        'whenUpdatableDataSetChanges -> ',
        x?.map(y => y.record._raw),
      );
      if (x === null || x === undefined) {
        return false;
      }

      return x.length > 0;
    }),
  );
}
