import React, { type ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme";
// Each native modal measures its own safe area (including page sheets).
// Padding is added below that inset, so controls never touch the status bar.
export function ModalFrame({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <SafeAreaProvider>
      <SafeAreaView
        edges={["top", "bottom"]}
        style={[
          { flex: 1, backgroundColor: colors.cream, paddingTop: 12 },
          style,
        ]}
      >
        {children}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
