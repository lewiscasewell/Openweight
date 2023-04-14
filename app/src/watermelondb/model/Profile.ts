import {associations, Model, Query} from '@nozbe/watermelondb';
import {children, date, field, writer} from '@nozbe/watermelondb/decorators';
import Weight from './Weight';

class Profile extends Model {
  static table = 'profiles';

  static associations = associations([
    'weights',
    {type: 'has_many', foreignKey: 'profile_id'},
  ]);

  @field('name') name!: string;
  @field('email') email!: string;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @field('supabase_id') supabase_id!: string;
  @field('gender') gender?: string;
  @date('dob') dob?: Date;
  @field('height') height?: number;
  @field('height_unit') height_unit?: string;
  @field('target_weight') target_weight?: number;
  @field('target_weight_unit') target_weight_unit?: string;
  @field('activity_level') activity_level?: string;
  @field('calorie_surplus') calorie_surplus?: number;

  @children('weights') weights!: Query<Weight>;

  @writer
  async addWeight({
    weight,
    dateOfWeight,
    unit,
  }: {
    weight: number;
    dateOfWeight: Date;
    unit: string;
  }) {
    return this.collections.get<Weight>('weights').create(weightRecord => {
      weightRecord.weight = weight;
      weightRecord.date = dateOfWeight;
      weightRecord.unit = unit;
      weightRecord.supabase_id = this.supabase_id;
      weightRecord.profile.set(this);
    });
  }

  get hasCompletedProfile() {
    return (
      this.gender &&
      this.dob &&
      this.height &&
      this.height_unit &&
      this.target_weight &&
      this.target_weight_unit &&
      this.activity_level &&
      this.calorie_surplus
    );
  }
}

export default Profile;
