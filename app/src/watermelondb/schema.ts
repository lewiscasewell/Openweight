import {appSchema, tableSchema} from '@nozbe/watermelondb';

export default appSchema({
  version: 3,
  tables: [
    tableSchema({
      name: 'profiles',
      columns: [
        {name: 'name', type: 'string'},
        {name: 'email', type: 'string'},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
        {name: 'supabase_id', type: 'string'},
        {name: 'default_unit', type: 'string'},
        {name: 'gender', type: 'string', isOptional: true},
        {name: 'dob', type: 'number', isOptional: true},
        {name: 'height', type: 'number', isOptional: true},
        {name: 'height_unit', type: 'string', isOptional: true},
        {name: 'target_weight', type: 'number', isOptional: true},
        {name: 'target_weight_unit', type: 'string', isOptional: true},
        {name: 'activity_level', type: 'string', isOptional: true},
        {name: 'calorie_surplus', type: 'number', isOptional: true},
      ],
    }),
    tableSchema({
      name: 'weights',
      columns: [
        {name: 'weight', type: 'number'},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
        {name: 'profile_id', type: 'string', isIndexed: true},
        {name: 'supabase_id', type: 'string'},
        {name: 'date', type: 'number'},
        {name: 'date_string', type: 'string'},
        {name: 'unit', type: 'string'},
      ],
    }),
  ],
});
