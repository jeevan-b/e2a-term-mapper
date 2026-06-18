import { useState } from 'react';
import { router } from 'expo-router';
import { Button, TextInput, Text } from 'react-native';
import { Screen } from '@/components/Screen';
export default function Home() { const [q,setQ]=useState(''); return <Screen title="পৰিভাষা"><Text>English ↔ Assamese term mapping</Text><TextInput placeholder="Search terms" value={q} onChangeText={setQ} style={{ borderWidth: 1, padding: 12 }} /><Button title="Search" onPress={() => q.trim() && router.push(`/search?q=${encodeURIComponent(q)}`)} /><Button title="Browse" onPress={() => router.push('/browse')} /></Screen>; }
