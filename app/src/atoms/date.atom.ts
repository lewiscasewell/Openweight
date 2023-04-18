import {DateTime} from 'luxon';
import {atomWithMMKV} from '.';

export const dateAtom = atomWithMMKV<{
  date: Date;
  dateString: string;
}>('date', {
  date: new Date(),
  dateString: DateTime.now().toFormat('dd-MM-yyyy'),
});
