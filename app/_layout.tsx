import "@/global.css";
import { store as reduxStore } from "@/lib/redux/store";
import { Stack } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

const persistor = persistStore(reduxStore);

export default function RootLayout() {
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
    <Provider store={reduxStore}>
      <PersistGate loading={null} persistor={persistor}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </PersistGate>
    </Provider>
  );
}
