import {Database} from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import schema from './schema';
// import migrations from './migrations';s
import Profile from './model/Profile';
import Weight from './model/Weight';
import {setGenerator} from '@nozbe/watermelondb/utils/common/randomId';
import {v4 as uuidv4} from 'uuid';

setGenerator(() => uuidv4());
const adapter = new SQLiteAdapter({
  schema,
  // migrations,
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
