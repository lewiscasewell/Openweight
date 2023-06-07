import HapticFeedback from 'react-native-haptic-feedback';

type HapticFeedbackTypes =
  | 'selection'
  | 'impactLight'
  | 'impactMedium'
  | 'impactHeavy'
  | 'rigid'
  | 'soft'
  | 'notificationSuccess'
  | 'notificationWarning'
  | 'notificationError'
  | 'clockTick'
  | 'contextClick'
  | 'keyboardPress'
  | 'keyboardRelease'
  | 'keyboardTap'
  | 'longPress'
  | 'textHandleMove'
  | 'virtualKey'
  | 'virtualKeyRelease'
  | 'effectClick'
  | 'effectDoubleClick'
  | 'effectHeavyClick'
  | 'effectTick';

export function hapticFeedback(type: HapticFeedbackTypes, force = false): void {
  HapticFeedback.trigger(type, {
    enableVibrateFallback: force,
    ignoreAndroidSystemSettings: force,
  });
}
