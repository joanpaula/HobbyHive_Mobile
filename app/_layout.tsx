import { Slot, Stack } from "expo-router";
import { MenuProvider } from "react-native-popup-menu";
import { AuthProvider } from "@/utils/authContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PostProvider } from "@/utils/postContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <PostProvider>
          <AuthProvider>
            <MenuProvider>
              <Slot />
            </MenuProvider>
          </AuthProvider>
        </PostProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
