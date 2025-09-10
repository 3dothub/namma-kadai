import { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store';
import { Text } from 'react-native';

export function ReduxProvider({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <PersistGate loading={<Text>Loading...</Text>} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
