import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      {/* Configurar opções globais do cabeçalho aqui depois */}
      <Stack.Screen 
        name="LoginScreen" 
        options={{ headerShown: false }}
         
      />
    </Stack>
  );
}