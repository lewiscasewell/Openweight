import {Database} from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import schema from './model/schema';
import migrations from './model/migrations';
import Profile from './model/Profile';
import Weight from './model/Weight';

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  // For debugging:
  // onSetUpError: error => console.error(error),
  // onSetUpSuccess: () => console.log("Database set up successfully"),
  // onVersionChanged: ({ from, to }) => console.log(`Database version changed from ${from} to ${to}`),
  // For production:
  dbName: 'watermelondb',
  // For Android:
  // schemaVersion: 1,
  // For iOS:
  // useWebSQL: false,
  // For React Native:
  // synchronous: true,
  // For Expo:
  // disablePromise: true,
});

export const database = new Database({
  adapter,
  modelClasses: [Profile, Weight],
});
