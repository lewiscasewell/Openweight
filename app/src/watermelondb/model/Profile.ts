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
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @field('default_weight_unit') defaultWeightUnit!: string;
  @field('supabase_user_id') supabaseUserId!: string;
  @field('gender') gender?: string;
  @date('dob_at') dobAt?: Date;
  @field('height') height?: number;
  @field('height_unit') heightUnit?: string;
  @field('target_weight') targetWeight?: number;
  @field('target_weight_unit') targetWeightUnit?: string;
  @field('activity_level') activityLevel?: string;
  @field('calorie_surplus') calorieSurplus?: number;

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
    return await this.collections
      .get<Weight>('weights')
      .create(weightRecord => {
        weightRecord.weight = weight;
        weightRecord.dateAt = dateOfWeight;
        weightRecord.unit = unit;
        weightRecord.supabaseUserId = this.supabaseUserId;
        // @ts-ignore
        weightRecord.profile.set(this);
      });
  }

  get hasCompletedProfile() {
    return Boolean(
      this.gender &&
        this.dobAt &&
        this.height &&
        this.heightUnit &&
        this.targetWeight &&
        this.targetWeightUnit &&
        this.activityLevel &&
        this.calorieSurplus,
    );
  }
}

export default Profile;
