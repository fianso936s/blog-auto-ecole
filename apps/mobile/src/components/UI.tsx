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
