import {addEventListener, NetInfoState} from '@react-native-community/netinfo';
import {AppState, AppStateStatus} from 'react-native';
import React from 'react';
import {Observable, Subscription} from 'rxjs';
import {
  catchError,
  debounceTime,
  map,
  filter,
  startWith,
  switchMap,
  combineLatestWith,
} from 'rxjs/operators';
import {sync, whenUpdatableDataSetChanges} from '.';

const TIME_DELAY_IN_MILLIS = 2000;

export function useSyncDatabase() {
  const [isSyncing, setIsSyncing] = React.useState(false);
  const syncSubscription = React.useRef<Subscription | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string>();

  React.useEffect(() => {
    if (!syncSubscription.current) {
      syncSubscription.current = whenUpdatableDataSetChanges()
        .pipe(
          map(hasChanges => {
            console.log('Changes', hasChanges);
            return hasChanges;
          }),
          combineLatestWith(whenNetworksChanges(), whenAppStateChanges()),
          map(([changes, isInternetReachable, appState]) => {
            console.log('WithlastestForm', {
              changes,
              isInternetReachable,
              appState,
            });
            return isInternetReachable && (changes || appState === 'active');
          }),
          switchMap(async isReadyToSync => isReadyToSync),
          debounceTime(TIME_DELAY_IN_MILLIS),
          filter(x => x === true),
          switchMap(async () => {
            setIsSyncing(true);
            console.log('Syncronization started');
            return await sync();
          }),
          map(() => setIsSyncing(false)),
          catchError(async (error, caught) => {
            console.log('Syncronization error', error, caught);
            setIsSyncing(false);
            setErrorMessage('Could not sync to database!');
          }),
        )
        .subscribe();
    }
    return () => syncSubscription.current?.unsubscribe();
  }, []);

  return {isSyncing, error: errorMessage};
}

function whenNetworksChanges() {
  return new Observable<NetInfoState>(emitter => {
    const unSubscribe = addEventListener(state => {
      console.log('NetInfo', state);
      emitter.next(state);
    });

    return unSubscribe;
  }).pipe(map(x => x.isInternetReachable));
}
function whenAppStateChanges() {
  return new Observable<AppStateStatus>(emitter => {
    const unSubsribe = AppState.addEventListener('change', state => {
      console.log('AppState', state);
      emitter.next(state);
    });

    return unSubsribe.remove;
  }).pipe(startWith('active'));
}
