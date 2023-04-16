import {
  addColumns,
  schemaMigrations,
} from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: 'profiles',
          columns: [{name: 'default_unit', type: 'string'}],
        }),
      ],
    },
  ],
});
