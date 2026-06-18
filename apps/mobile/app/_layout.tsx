import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';
import '../global.css';
const client = new QueryClient();
export default function Layout() { return <QueryClientProvider client={client}><View style={{ flex: 1 }}><View style={{ flexDirection: 'row', gap: 16, padding: 12 }}><Link href="/"><Text>Home</Text></Link><Link href="/browse"><Text>Browse</Text></Link><Link href="/login"><Text>Admin</Text></Link></View><Stack /></View></QueryClientProvider>; }
