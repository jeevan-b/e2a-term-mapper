import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Redirect, Stack } from 'expo-router';
import { Text } from 'react-native';

export default function AdminLayout() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  useEffect(() => { SecureStore.getItemAsync('token').then(setToken); }, []);
  if (token === undefined) return <Text>Loading...</Text>;
  if (!token) return <Redirect href="/login" />;
  return <Stack />;
}
