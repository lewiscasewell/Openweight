import {atomWithMMKV} from '.';

export const dateRanges = ['ALL', '1Y', '3M', '1M', '1W'] as const;
export type DateRange = (typeof dateRanges)[number];

export const dateRangeAtom = atomWithMMKV<DateRange>('dateRange', '1Y');
