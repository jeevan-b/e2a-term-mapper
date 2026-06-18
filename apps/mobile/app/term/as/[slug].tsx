import { useQuery } from '@tanstack/react-query';
import { Link, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { api } from '@/lib/api-client';
export default function AssameseTerm() { const { slug } = useLocalSearchParams<{slug:string}>(); const r=useQuery({queryKey:['as',slug],queryFn:()=>api.get(`v1/terms/as/${slug}`).json<any>()}); return <Screen title={r.data?.term?.term ?? 'Assamese term'}>{r.data?.equivalents?.map((t:any)=><Link key={t.id} href={`/term/en/${t.slug}`}><Text>{t.term}</Text></Link>)}</Screen>; }
