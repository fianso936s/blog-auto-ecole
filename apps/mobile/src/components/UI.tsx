import { ModalFrame } from "./ModalFrame";
import React, { type ReactNode } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  type TextInputProps,
} from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { colors, fonts, radius, shadow, tones, filterTone, type Tone, styles as s } from "../theme";
export const Icon = ({
  name,
  size = 20,
  color = colors.wine,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  size?: number;
  color?: string;
}) => <Ionicons name={name} size={size} color={color} />;
export function Button({
  label,
  onPress,
  secondary = false,
  danger = false,
  busy = false,
  disabled = false,
  icon,
  compact = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  danger?: boolean;
  busy?: boolean;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  compact?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const [pressed, setPressed] = React.useState(false);
  return (
    <Animated.View
      style={{
        transform: [
          { scale: pressed && !reducedMotion && !disabled && !busy ? 0.97 : 1 },
        ],
        transitionProperty: "transform",
        transitionDuration: reducedMotion ? 0 : 120,
        transitionTimingFunction: "ease-out",
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: disabled || busy, busy }}
        onPressIn={() => { setPressed(true); if (!secondary) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        onPressOut={() => setPressed(false)}
        disabled={disabled || busy}
        onPress={onPress}
        style={({ pressed }) => ({
          minHeight: compact ? 44 : 54,
          paddingHorizontal: compact ? 16 : 22,
          paddingVertical: 12,
          borderRadius: compact ? 12 : 16,
          backgroundColor: secondary
            ? "transparent"
            : danger
              ? colors.red
              : pressed
                ? colors.night
                : colors.wine,
          borderWidth: secondary ? 1.5 : 0,
          borderColor: colors.ink,
          opacity: disabled || busy ? 0.55 : 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          ...(secondary || danger ? {} : shadow.wine),
        })}
      >
        {busy ? (
          <ActivityIndicator color={secondary ? colors.ink : colors.paper} />
        ) : icon ? (
          <Icon
            name={icon}
            size={18}
            color={secondary ? colors.ink : colors.paper}
          />
        ) : null}
        <Text
          style={{
            fontSize: compact ? 14 : 16,
            fontFamily: fonts.displayBold,
            letterSpacing: -0.1,
            color: secondary ? colors.ink : colors.paper,
          }}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
export function IconButton({
  name,
  onPress,
  label,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
  label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={10}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: pressed ? colors.soft : colors.paper,
        borderWidth: 1,
        borderColor: colors.line,
        alignItems: "center",
        justifyContent: "center",
        transform: [{ scale: pressed ? 0.92 : 1 }],
      })}
    >
      <Icon name={name} />
    </Pressable>
  );
}
export function Chip({
  label,
  active,
  onPress,
  tone,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  tone?: Tone;
}) {
  const palette = tones[tone || filterTone(label)];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      style={({ pressed }) => [
        s.chip,
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 7,
          borderColor: active ? palette.ink : "transparent",
          backgroundColor: active ? palette.ink : palette.soft,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}
    >
      <Icon
        name={active ? "checkmark" : "ellipse"}
        size={active ? 14 : 6}
        color={active ? colors.paper : palette.ink}
      />
      <Text style={[s.chipText, { color: active ? colors.paper : palette.ink }]}>
        {label}
      </Text>
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <View style={{ gap: 8 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        selectionColor={colors.wine}
        style={[
          s.field,
          focused && { borderColor: colors.wine },
          props.multiline && { minHeight: 96, textAlignVertical: "top" },
        ]}
        {...props}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
      />
    </View>
  );
}
export function Sheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <Modal
      visible={visible}
      animationType={reducedMotion ? "fade" : "slide"}
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ModalFrame>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            style={[
              s.between,
              { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14, borderBottomWidth: 1, borderColor: colors.line },
            ]}
          >
            <Text style={[s.heading, { flex: 1 }]}>{title}</Text>
            <IconButton name="close" label="Fermer" onPress={onClose} />
          </View>
          <ScrollView
            contentContainerStyle={s.content}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </ModalFrame>
    </Modal>
  );
}
export function Empty({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <View style={[s.card, { paddingVertical: 36, alignItems: "center", borderStyle: "dashed", borderWidth: 1.5, shadowOpacity: 0 }]}>
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: radius.md,
          backgroundColor: colors.soft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="location-outline" size={26} />
      </View>
      <Text style={[s.heading, { textAlign: "center" }]}>{title}</Text>
      <Text style={[s.subtitle, { textAlign: "center" }]}>{description}</Text>
      {action}
    </View>
  );
}
/** A compact dropdown: one row shows the current choice, the list opens beneath it. */
export function Dropdown<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { id: T; label: string; section?: string }[];
  onChange: (id: T) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const current = options.find((o) => o.id === value)?.label ?? value;
  return (
    <View style={{ gap: 8 }}>
      <Text style={s.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label} : ${current}`}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(!open)}
        style={({ pressed }) => [
          s.field,
          { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderColor: open ? colors.wine : colors.line, transform: [{ scale: pressed ? 0.99 : 1 }] },
        ]}
      >
        <Text style={{ fontFamily: fonts.bodySemi, fontSize: 16, color: colors.ink, flex: 1 }} numberOfLines={1}>{current}</Text>
        <Icon name={open ? "chevron-up" : "chevron-down"} size={18} />
      </Pressable>
      {open && (
        <View style={[s.card, { padding: 6, gap: 2 }]}>
          {options.map((o, i) => {
            const active = o.id === value;
            const header = o.section && o.section !== options[i - 1]?.section ? o.section : null;
            return (
              <React.Fragment key={o.id}>
              {header && <Text style={[s.eyebrow, { paddingHorizontal: 12, paddingTop: i ? 12 : 6, paddingBottom: 4, color: colors.muted }]}>{header.toUpperCase()}</Text>}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => { void Haptics.selectionAsync(); onChange(o.id); setOpen(false); }}
                style={({ pressed }) => ({ minHeight: 46, paddingHorizontal: 12, borderRadius: radius.sm, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: active ? colors.soft : pressed ? colors.cream : "transparent" })}
              >
                <Text style={{ flex: 1, fontFamily: active ? fonts.bodyBold : fonts.body, fontSize: 15, lineHeight: 20, paddingVertical: 10, color: active ? colors.wine : colors.ink }}>{o.label}</Text>
                {active && <Icon name="checkmark" size={18} />}
              </Pressable>
              </React.Fragment>
            );
          })}
        </View>
      )}
    </View>
  );
}
/** Same as the website's <details> blocks: a titled row that opens its content beneath. */
export function Disclosure({
  title,
  children,
  tone,
  card = true,
}: {
  title: string;
  children: ReactNode;
  tone?: string;
  card?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <View style={card ? [s.card, { padding: 0, gap: 0, overflow: "hidden" }] : { borderBottomWidth: 1, borderColor: colors.line }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(!open)}
        style={({ pressed }) => ({ minHeight: 54, paddingHorizontal: card ? 18 : 2, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: pressed ? colors.cream : "transparent" })}
      >
        <Text style={{ flex: 1, fontFamily: fonts.bodySemi, fontSize: 15, color: tone || colors.ink }}>{title}</Text>
        <Icon name={open ? "chevron-up" : "chevron-down"} size={18} />
      </Pressable>
      {open && <View style={{ paddingHorizontal: card ? 18 : 2, paddingBottom: 16, gap: 10 }}>{children}</View>}
    </View>
  );
}
/** Same as the website's segmented tabs (.course-tabs). */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <View accessibilityRole="tablist" accessibilityLabel={label} style={{ flexDirection: "row", gap: 2, padding: 4, borderRadius: radius.md, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line }}>
      {options.map((o) => {
        const active = o.id === value;
        return (
          <Pressable
            key={o.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => { if (!active) void Haptics.selectionAsync(); onChange(o.id); }}
            style={({ pressed }) => ({ flex: 1, minHeight: 44, borderRadius: radius.sm, alignItems: "center", justifyContent: "center", paddingHorizontal: 8, backgroundColor: active ? colors.wine : pressed ? colors.cream : "transparent" })}
          >
            <Text style={{ fontFamily: fonts.bodySemi, fontSize: 15, color: active ? colors.paper : colors.muted, textAlign: "center" }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
/** Page heading shared by every tab, as on the website: eyebrow, title with a wine dot, subtitle. */
export function PageHeading({ eyebrow, title, subtitle, dot = false, icon }: { eyebrow: string; title: string; subtitle?: string; dot?: boolean; icon?: React.ComponentProps<typeof Ionicons>["name"] }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
      <View style={{ flex: 1, gap: 8 }}>
        <Text style={s.eyebrow}>{eyebrow}</Text>
        <Text style={s.title} accessibilityRole="header">
          {title}
          {dot && <Text style={{ color: colors.wine }}>.</Text>}
        </Text>
        {!!subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
      </View>
      {icon && (
        <View style={{ width: 48, height: 48, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} size={22} />
        </View>
      )}
    </View>
  );
}
