import {associations, Model} from '@nozbe/watermelondb';
import {date, field, immutableRelation} from '@nozbe/watermelondb/decorators';
import Profile from './Profile';

export default class Weight extends Model {
  static table = 'weights';

  static associations = associations([
    'profiles',
    {type: 'belongs_to', key: 'profile_id'},
  ]);

  @field('weight') weight!: number;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @field('supabase_id') supabaseId!: string;
  @date('date') date!: Date;
  @field('unit') unit!: string;
  @field('date_string') dateString!: string;

  @immutableRelation('profiles', 'profile_id') profile!: Profile;
}
