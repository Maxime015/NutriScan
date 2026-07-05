import { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';

interface Props {
  value: number;
  className?: string;
  /** Durée du comptage en ms. */
  duration?: number;
}

/**
 * Compteur animé : anime la valeur de 0 → `value` (easing cubic-out).
 * Utilise `className` pour hériter des couleurs du thème (text-ink, etc.).
 */
export function AnimatedNumber({ value, className, duration = 850 }: Props) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, duration]);

  return <Text className={className}>{display}</Text>;
}
