import { StyleSheet } from "react-native";
import product from "../../../packages/product/product.json";
export const colors = product.colors;
/** Repère v2 — same fonts as the site; system font is the fallback until they load. */
export const fonts = {
  body: "DMSans_400Regular",
  bodyMedium: "DMSans_500Medium",
  bodySemi: "DMSans_600SemiBold",
  bodyBold: "DMSans_700Bold",
  display: "Manrope_800ExtraBold",
  displayBold: "Manrope_700Bold",
} as const;
export const radius = { sm: 12, md: 16, lg: 22, xl: 28, pill: 999 } as const;
export const shadow = {
  sm: { shadowColor: "#1C1719", shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  md: { shadowColor: "#1C1719", shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
  lg: { shadowColor: "#1C1719", shadowOpacity: 0.14, shadowRadius: 28, shadowOffset: { width: 0, height: 12 } },
  wine: { shadowColor: colors.wine, shadowOpacity: 0.26, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
} as const;
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.wine,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    letterSpacing: -1.2,
    lineHeight: 36,
    color: colors.ink,
  },
  subtitle: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.muted },
  heading: {
    fontFamily: fonts.display,
    fontSize: 21,
    letterSpacing: -0.5,
    color: colors.ink,
  },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.ink },
  muted: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.muted },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  card: {
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.line,
    gap: 12,
    ...shadow.sm,
  },
  line: { height: StyleSheet.hairlineWidth * 2, backgroundColor: colors.line },
  label: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink },
  field: {
    backgroundColor: colors.paper,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
    minHeight: 52,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: 15,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: "center",
    backgroundColor: colors.paper,
  },
  chipActive: { backgroundColor: colors.wine, borderColor: colors.wine },
  chipText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.wine },
  error: { fontFamily: fonts.body, color: colors.red, fontSize: 14, lineHeight: 21 },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.muted },
});

export type Tone = "neutral" | "red" | "blue" | "green" | "amber" | "purple";
export const tones = {
  neutral: { ink: colors.wine, soft: colors.soft },
  red: { ink: colors.red, soft: colors.redSoft },
  blue: { ink: colors.blue, soft: colors.blueSoft },
  green: { ink: colors.green, soft: colors.greenSoft },
  amber: { ink: colors.amber, soft: colors.amberSoft },
  purple: { ink: colors.purple, soft: colors.purpleSoft },
};
export function filterTone(label: string): Tone {
  if (
    /Priorité|Intersection|Vitesse|Avancé|Danger|À revoir|Vigilance/i.test(
      label,
    )
  )
    return "red";
  if (/Giratoire|Intermédiaire/i.test(label)) return "amber";
  if (/Manœuvre|Stationn|Volant/i.test(label)) return "purple";
  if (/Observation|Placement|Centre/i.test(label)) return "blue";
  if (/Facile|Publié|Visible|Lu/i.test(label)) return "green";
  return "neutral";
}
