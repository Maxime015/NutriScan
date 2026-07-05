import { Redirect } from 'expo-router';

// L'AuthGate (racine) redirige ensuite vers /login ou /onboarding si nécessaire.
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
