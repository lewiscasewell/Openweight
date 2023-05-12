import {hasUnsyncedChanges, synchronize} from '@nozbe/watermelondb/sync';
import {map} from 'rxjs';
import {database} from '../index';
import {supabase} from '../../supabase';

// const baseUrl = 'https://weight-tracker-3.hop.sh/api/sync';
const baseUrl = 'http://localhost:3000/api/sync';

export async function sync() {
  const {data} = await supabase.auth.getSession();

  await synchronize({
    database,
    pullChanges: async ({lastPulledAt}) => {
      console.log('pullChanges...');

      const urlParams = `last_pulled_at=${lastPulledAt}`;
      console.log('data.session?.access_token', data.session?.access_token);

      const response = await fetch(`${baseUrl}/?${urlParams}`, {
        headers: {
          Authorization: `Bearer ${data.session?.access_token}`,
        },
      });

      if (!response.ok) {
        console.log('hwew');
        throw new Error(`HTTPs error! status: ${response.status}`);
      }

      const {changes, timestamp} = await response.json();

      console.log('client changes', changes.profiles.updated);

      return {changes, timestamp};
    },
    pushChanges: async ({changes, lastPulledAt}) => {
      console.log('pushChanges...');

      const urlParams = `last_pulled_at=${lastPulledAt}`;
      const response = await fetch(`${baseUrl}/?${urlParams}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.session?.access_token}`,
        },
        method: 'POST',
        body: JSON.stringify(changes),
      });

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
      return allTables?.filter(table => table.record._raw._status !== 'synced');
    }),
    map(x => {
      if (x === null || x === undefined) {
        return false;
      }

      return x.length > 0;
    }),
  );
}
