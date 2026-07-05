import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Text, View } from 'react-native';

import { PressableScale } from './PressableScale';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  className,
  fullWidth = true,
}: Props) {
  const isDisabled = disabled || loading;

  const content = (
    <View className="flex-row items-center justify-center gap-2">
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#ffffff' : '#22C55E'} />
      ) : (
        <>
          {icon}
          <Text
            className={
              variant === 'primary'
                ? 'text-white font-bold text-base'
                : variant === 'danger'
                  ? 'text-white font-bold text-base'
                  : 'text-ink font-semibold text-base'
            }>
            {label}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <PressableScale
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      className={`${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-60' : ''} ${className ?? ''}`}>
      {variant === 'primary' ? (
        <LinearGradient
          colors={['#22C55E', '#16A34A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 16 }}
          className="rounded-2xl px-5 py-4">
          {content}
        </LinearGradient>
      ) : (
        <View
          className={
            variant === 'secondary'
              ? 'rounded-2xl px-5 py-4 bg-surface-2 border border-border'
              : variant === 'danger'
                ? 'rounded-2xl px-5 py-4 bg-danger/90'
                : 'rounded-2xl px-5 py-4 border border-border'
          }>
          {content}
        </View>
      )}
    </PressableScale>
  );
}
