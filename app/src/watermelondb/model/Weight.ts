import {associations, Model} from '@nozbe/watermelondb';
import {date, field, relation} from '@nozbe/watermelondb/decorators';
import Profile from './Profile';

export default class Weight extends Model {
  static table = 'weights';

  static associations = associations([
    'profiles',
    {type: 'belongs_to', key: 'profile_id'},
  ]);

  @field('weight') weight!: number;
  @date('created_at') created_at!: Date;
  @date('updated_at') updated_at!: Date;
  @field('supabase_id') supabase_id!: string;
  @date('date') date!: Date;
  @field('unit') unit!: string;

  @relation('profiles', 'profile_id') profile!: Profile;
}
