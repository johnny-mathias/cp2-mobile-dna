import { Stack } from 'expo-router';


export default function RootLayout() {
  return (
    <Stack>
      {/* Configurar opções globais do cabeçalho aqui depois */}
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Bosta" 
        options={{ headerShown: false }}
      />
    </Stack>
  );
}