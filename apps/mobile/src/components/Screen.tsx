import { PropsWithChildren } from 'react';
import { ScrollView, Text, View } from 'react-native';
export function Screen({ title, children }: PropsWithChildren<{ title: string }>) { return <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}><Text style={{ fontSize: 32, fontWeight: '700' }}>{title}</Text><View style={{ gap: 12 }}>{children}</View></ScrollView>; }
