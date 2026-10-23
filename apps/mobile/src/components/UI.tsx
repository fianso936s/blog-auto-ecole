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
import { colors, tones, filterTone, type Tone, styles as s } from "../theme";
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
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        disabled={disabled || busy}
        onPress={onPress}
        style={({ pressed }) => ({
          minHeight: compact ? 44 : 54,
          paddingHorizontal: compact ? 16 : 20,
          paddingVertical: 12,
          borderRadius: 14,
          backgroundColor: secondary
            ? colors.paper
            : danger
              ? colors.red
              : colors.wine,
          borderWidth: secondary ? 1 : 0,
          borderColor: colors.line,
          opacity: disabled || busy ? 0.6 : pressed ? 0.8 : 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        })}
      >
        {busy ? (
          <ActivityIndicator color={secondary ? colors.wine : "white"} />
        ) : icon ? (
          <Icon
            name={icon}
            size={18}
            color={secondary ? colors.wine : "white"}
          />
        ) : null}
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: secondary ? colors.wine : "white",
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
        backgroundColor: colors.paper,
        borderWidth: 1,
        borderColor: colors.line,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.65 : 1,
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
          borderColor: active ? palette.ink : palette.soft,
          backgroundColor: active ? palette.ink : palette.soft,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <Icon
        name={active ? "checkmark" : "ellipse"}
        size={active ? 14 : 6}
        color={active ? "white" : palette.ink}
      />
      <Text style={[s.chipText, { color: active ? "white" : palette.ink }]}>
        {label}
      </Text>
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[
          s.field,
          props.multiline && { minHeight: 90, textAlignVertical: "top" },
        ]}
        {...props}
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
              { paddingHorizontal: 22, paddingTop: 15, paddingBottom: 12 },
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
    <View style={[s.card, { paddingVertical: 32, alignItems: "center" }]}>
      <View
        style={{
          width: 58,
          height: 58,
          borderRadius: 29,
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
