import "@/global.css";
import { store as reduxStore } from "@/lib/redux/store";
import * as KeepAwake from "expo-keep-awake";
import { Stack } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect } from "react";
import { AppState } from "react-native";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { Provider as ReduxProvider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

const persistor = persistStore(reduxStore);

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

export default function RootLayout() {

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        // App has come to the foreground
        KeepAwake.activateKeepAwakeAsync();
      } else {
        // App has gone to the background or inactive
        KeepAwake.deactivateKeepAwake();
      }
    });

    // Initial activation when component mounts and app is active
    if (AppState.currentState === 'active') {
      KeepAwake.activateKeepAwakeAsync();
    }

    return () => {
      // Cleanup subscription and ensure keep awake is deactivated
      subscription.remove();
      KeepAwake.deactivateKeepAwake();
    };
  }, []);

  useEffect(() => {
    async function setOrientation() {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.ALL
      );
    }
    setOrientation();

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  return (
    <ReduxProvider store={reduxStore}>
      <PersistGate loading={null} persistor={persistor}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
        <Toast />
      </PersistGate>
    </ReduxProvider>
  );
}
