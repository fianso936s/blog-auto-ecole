import { StyleSheet } from "react-native";
import product from "../../../packages/product/product.json";
export const colors = product.colors;
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 20, paddingBottom: 32, gap: 16 },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.5,
    color: colors.wine,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -1.1,
    lineHeight: 36,
    color: colors.ink,
  },
  subtitle: { fontSize: 15, lineHeight: 23, color: colors.muted },
  heading: {
    fontSize: 21,
    fontWeight: "600",
    letterSpacing: -0.5,
    color: colors.ink,
  },
  body: { fontSize: 15, lineHeight: 22, color: colors.ink },
  muted: { fontSize: 13, lineHeight: 20, color: colors.muted },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  card: {
    backgroundColor: colors.paper,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 12,
  },
  line: { height: 1, backgroundColor: colors.line },
  label: { fontSize: 13, color: colors.muted, fontWeight: "500" },
  field: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.ink,
    minHeight: 50,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 24,
    paddingHorizontal: 15,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: "center",
    backgroundColor: colors.paper,
  },
  chipActive: { backgroundColor: colors.wine, borderColor: colors.wine },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.wine },
  error: { color: colors.red, fontSize: 13, lineHeight: 20 },
  caption: { fontSize: 12, lineHeight: 18, color: colors.muted },
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
