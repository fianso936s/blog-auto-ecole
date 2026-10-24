import React, { useState } from "react";
import { Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { figureRatio, type LessonFigure } from "../../../../packages/product/src/courses";
import { styles as s } from "../theme";

/**
 * Schéma d’une fiche (même SVG que sur le site). Le SVG est statique et ne contient aucun script ;
 * la WebView n’exécute pas de JavaScript et ne suit aucun lien.
 */
export function LessonFigureView({ figure }: { figure: LessonFigure }) {
  const [width, setWidth] = useState(0);
  const height = width ? width / figureRatio(figure.svg) : 0;
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;background:transparent}svg{display:block;width:100%;height:auto}</style></head><body>${figure.svg}</body></html>`;
  return (
    <View style={{ gap: 6, marginVertical: 4 }} onLayout={(e) => setWidth(Math.min(e.nativeEvent.layout.width, 520))}>
      {width > 0 && (
        <View accessible accessibilityRole="image" accessibilityLabel={figure.alt} style={{ width, height, borderRadius: 14, overflow: "hidden" }}>
          <WebView
            source={{ html }}
            originWhitelist={["about:blank"]}
            javaScriptEnabled={false}
            scrollEnabled={false}
            bounces={false}
            onShouldStartLoadWithRequest={(req) => req.url === "about:blank"}
            style={{ width, height, backgroundColor: "transparent" }}
            pointerEvents="none"
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
          />
        </View>
      )}
      <Text selectable style={s.caption}>{figure.caption}</Text>
    </View>
  );
}
