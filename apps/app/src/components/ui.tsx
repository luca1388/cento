import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewProps,
} from 'react-native';
import { avatarColor, initials, radius, space, useTheme } from '@/theme';

export function Screen({ style, ...rest }: ViewProps) {
  const theme = useTheme();
  return <View {...rest} style={[{ flex: 1, backgroundColor: theme.bg }, style]} />;
}

export function Card({ style, ...rest }: ViewProps) {
  const theme = useTheme();
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: theme.card,
          borderColor: theme.line,
          borderWidth: StyleSheet.hairlineWidth,
          borderRadius: radius.md,
          padding: space.lg,
        },
        style,
      ]}
    />
  );
}

export function Title({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return <Text style={{ fontSize: 28, fontWeight: '800', letterSpacing: -0.5, color: theme.text }}>{children}</Text>;
}

export function Subtitle({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return <Text style={{ fontSize: 14, color: theme.muted, marginTop: 2 }}>{children}</Text>;
}

export function SectionLabel({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  const theme = useTheme();
  return (
    <Text
      style={[
        { fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', color: theme.muted, marginBottom: space.sm },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Body({ children, muted, style }: { children: React.ReactNode; muted?: boolean; style?: StyleProp<TextStyle> }) {
  const theme = useTheme();
  return <Text style={[{ fontSize: 15, lineHeight: 21, color: muted ? theme.muted : theme.text }, style]}>{children}</Text>;
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: avatarColor(name),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: size * 0.36 }}>{initials(name)}</Text>
    </View>
  );
}

interface ButtonProps extends PressableProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export function Button({ label, variant = 'primary', style, ...rest }: ButtonProps) {
  const theme = useTheme();
  const bg =
    variant === 'primary'
      ? theme.primary
      : variant === 'danger'
        ? theme.danger
        : variant === 'secondary'
          ? theme.accentSoft
          : 'transparent';
  const fg = variant === 'primary' ? theme.onPrimary : variant === 'danger' ? '#fff' : variant === 'secondary' ? theme.text : theme.accent;
  return (
    <Pressable
      {...rest}
      style={(state) => [
        {
          backgroundColor: bg,
          borderRadius: radius.md,
          paddingVertical: 12,
          paddingHorizontal: space.lg,
          alignItems: 'center',
          opacity: state.pressed ? 0.7 : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      <Text style={{ color: fg, fontWeight: '700', fontSize: 15 }}>{label}</Text>
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  tone = 'accent',
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  tone?: 'accent' | 'today';
}) {
  const theme = useTheme();
  const on = tone === 'today' ? theme.today : theme.accent;
  const soft = tone === 'today' ? theme.todaySoft : theme.accentSoft;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: radius.pill,
        backgroundColor: selected ? on : soft,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ fontSize: 13, fontWeight: '700', color: selected ? (tone === 'today' ? '#fff' : theme.onPrimary) : theme.text }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Field({ label, hint, error, style, ...rest }: TextInputProps & { label: string; hint?: string; error?: string }) {
  const theme = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13, fontWeight: '700', color: theme.muted }}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.muted}
        {...rest}
        style={[
          {
            backgroundColor: theme.card,
            color: theme.text,
            borderColor: error ? theme.danger : theme.line,
            borderWidth: 1,
            borderRadius: radius.sm,
            paddingVertical: 10,
            paddingHorizontal: space.md,
            fontSize: 16,
          },
          style,
        ]}
      />
      {error ? (
        <Text style={{ fontSize: 12, color: theme.danger }}>{error}</Text>
      ) : hint ? (
        <Text style={{ fontSize: 12, color: theme.muted }}>{hint}</Text>
      ) : null}
    </View>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: ViewProps['style'] }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: space.sm }, style]}>{children}</View>;
}

export function Switch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      style={{
        width: 46,
        height: 28,
        borderRadius: 14,
        padding: 3,
        backgroundColor: value ? theme.accent : theme.line,
        justifyContent: 'center',
      }}
    >
      <View
        style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: theme.card, alignSelf: value ? 'flex-end' : 'flex-start' }}
      />
    </Pressable>
  );
}

export function SettingRow({
  title,
  hint,
  right,
  onPress,
}: {
  title: string;
  hint?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        paddingVertical: 10,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, color: theme.text, fontWeight: '600' }}>{title}</Text>
        {hint ? <Text style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>{hint}</Text> : null}
      </View>
      {right}
    </Pressable>
  );
}

