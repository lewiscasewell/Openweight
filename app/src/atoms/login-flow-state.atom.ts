import {atomWithMMKV} from '.';

type Status =
  | 'landing'
  | 'email-entry'
  | 'email-otp'
  | 'otp-verification'
  | 'fetching-profile';

type LoginFlowState = {
  status: Status;
  otp: string | null;
  credential: string | null;
  credentialType: 'email' | 'mobile' | null;
  isLoading: boolean;
  isFetchingProfileData: boolean;
};

export const initialLoginFlowState: LoginFlowState = {
  status: 'landing',
  otp: null,
  credential: null,
  credentialType: null,
  isLoading: false,
  isFetchingProfileData: false,
};

export const loginFlowAtom = atomWithMMKV<LoginFlowState>(
  'login-flow-state',
  initialLoginFlowState,
);
