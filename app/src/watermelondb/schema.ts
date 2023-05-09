import {appSchema, tableSchema} from '@nozbe/watermelondb';

export default appSchema({
  version: 5,
  tables: [
    tableSchema({
      name: 'profiles',
      columns: [
        {name: 'name', type: 'string'},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
        {name: 'supabase_user_id', type: 'string', isIndexed: true},
        {name: 'default_unit', type: 'string'},
        {name: 'gender', type: 'string', isOptional: true},
        {name: 'dob_at', type: 'number', isOptional: true},
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
        {name: 'supabase_user_id', type: 'string', isIndexed: true},
        {name: 'date_at', type: 'number'},
        {name: 'unit', type: 'string'},
      ],
    }),
  ],
});
