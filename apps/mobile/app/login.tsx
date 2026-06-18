import { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { Button, Text, TextInput } from 'react-native';
import { Screen } from '@/components/Screen';
import { api } from '@/lib/api-client';
export default function Login(){const [email,setEmail]=useState('admin@example.com'); const [password,setPassword]=useState('password'); const [error,setError]=useState(''); async function login(){try{const r=await api.post('v1/auth/login',{json:{email,password}}).json<{token:string}>(); await SecureStore.setItemAsync('token', r.token); router.push('/admin');}catch{setError('Login failed')}} return <Screen title="Admin Login"><TextInput value={email} onChangeText={setEmail} style={{borderWidth:1,padding:12}}/><TextInput secureTextEntry value={password} onChangeText={setPassword} style={{borderWidth:1,padding:12}}/><Button title="Login" onPress={login}/><Text>{error}</Text></Screen>}
