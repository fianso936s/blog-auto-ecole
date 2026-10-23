import React, { type ReactNode } from "react";
import { View } from "react-native";
import { Chip, IconButton } from "./UI";
export type MapMode = "2d" | "3d";
export function MapModeBar({
  mode,
  onMode,
  fullscreen,
  onFullscreen,
  children,
}: {
  mode: MapMode;
  onMode: (mode: MapMode) => void;
  fullscreen: boolean;
  onFullscreen: () => void;
  children?: ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
      }}
    >
      <Chip label="2D" active={mode === "2d"} onPress={() => onMode("2d")} />
      <Chip label="3D" active={mode === "3d"} onPress={() => onMode("3d")} />
      <View style={{ flex: 1 }} />
      {children}
      <IconButton
        name={fullscreen ? "contract-outline" : "expand-outline"}
        label={
          fullscreen ? "Quitter le plein écran" : "Afficher en plein écran"
        }
        onPress={onFullscreen}
      />
    </View>
  );
}
