import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { CheckCircle2, ImageIcon, RefreshCw, X, Zap, ZapOff } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/ui/Button';
import { PressableScale } from '../../components/ui/PressableScale';
import { colors } from '../../lib/theme';

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [torch, setTorch] = useState(false);
  const [capturing, setCapturing] = useState(false);

  async function capture() {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (photo?.uri) {
        router.replace({ pathname: '/analysis/processing', params: { uri: photo.uri } });
      }
    } finally {
      setCapturing(false);
    }
  }

  async function pickFromGallery() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!res.canceled && res.assets[0]) {
      router.replace({ pathname: '/analysis/processing', params: { uri: res.assets[0].uri } });
    }
  }

  // Permission non encore résolue.
  if (!permission) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  // Permission refusée.
  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-8">
        <View className="w-16 h-16 rounded-2xl bg-primary/15 items-center justify-center mb-5">
          <ImageIcon size={30} color={colors.primary} />
        </View>
        <Text className="text-ink text-xl font-bold text-center mb-2">Accès à la caméra</Text>
        <Text className="text-muted text-center mb-6">
          Autorisez la caméra pour scanner les étiquettes de vos aliments.
        </Text>
        <Button label="Autoriser la caméra" onPress={requestPermission} />
        <Button label="Retour" variant="ghost" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing} enableTorch={torch} />

      {/* Overlay */}
      <SafeAreaView className="absolute inset-0" pointerEvents="box-none">
        {/* Barre supérieure */}
        <View className="flex-row items-center justify-between px-5 pt-2">
          <RoundIcon onPress={() => router.back()}>
            <X size={22} color="#fff" />
          </RoundIcon>
          <RoundIcon onPress={() => setTorch((t) => !t)}>
            {torch ? <Zap size={22} color="#F59E0B" /> : <ZapOff size={22} color="#fff" />}
          </RoundIcon>
        </View>

        {/* Cadre de scan */}
        <View className="flex-1 items-center justify-center px-10">
          <View style={{ width: '100%', aspectRatio: 0.8 }} className="relative">
            <Corner className="top-0 left-0 border-l-4 border-t-4 rounded-tl-2xl" />
            <Corner className="top-0 right-0 border-r-4 border-t-4 rounded-tr-2xl" />
            <Corner className="bottom-0 left-0 border-l-4 border-b-4 rounded-bl-2xl" />
            <Corner className="bottom-0 right-0 border-r-4 border-b-4 rounded-br-2xl" />
          </View>
          <View className="flex-row items-center gap-2 bg-black/70 rounded-2xl px-4 py-3 mt-6">
            <CheckCircle2 size={20} color={colors.primary} />
            <View>
              <Text className="text-white font-semibold">Positionnez l'étiquette</Text>
              <Text className="text-white/60 text-xs">Cadrez la liste d'ingrédients</Text>
            </View>
          </View>
        </View>

        {/* Contrôles bas */}
        <View className="flex-row items-center justify-around px-8 pb-6">
          <RoundIcon onPress={pickFromGallery}>
            <ImageIcon size={24} color="#fff" />
          </RoundIcon>

          <PressableScale onPress={capture} scaleTo={0.9}>
            <View className="w-20 h-20 rounded-full border-4 border-white items-center justify-center">
              {capturing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View className="w-16 h-16 rounded-full bg-white" />
              )}
            </View>
          </PressableScale>

          <RoundIcon onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}>
            <RefreshCw size={24} color="#fff" />
          </RoundIcon>
        </View>
      </SafeAreaView>
    </View>
  );
}

function RoundIcon({ children, onPress }: { children: React.ReactNode; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      className="w-12 h-12 rounded-full bg-black/50 items-center justify-center">
      {children}
    </Pressable>
  );
}

function Corner({ className }: { className: string }) {
  return (
    <View
      className={`absolute w-8 h-8 ${className}`}
      style={{ borderColor: colors.primary }}
    />
  );
}
