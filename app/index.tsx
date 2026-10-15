import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { identify, track } from "../services/analytics";
import { auth, firestore } from "../services/firebase";

import { router } from "expo-router";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type AuthMode = "login" | "register";

export default function Index() {
  const [authenticationState, setAuthenticationState] =
    useState<AuthMode>("login");
  const isLogin = authenticationState === "login";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Screen view quando a tela de login abre
  useEffect(() => {
    track("screen_view", {
      firebase_screen: "login",
      firebase_screen_class: "Index",
    });
  }, []);

  const login = async () => {
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      identify(credential.user.uid);
      track("login", { method: "password" });

      router.push({
        pathname: "/details",
        params: {
          email: credential.user.email ?? "",
        },
      });
    } catch (error: any) {
      track("login_failed", { error_code: error?.code ?? "unknown" });
      Alert.alert("Erro", "Não foi possível realizar o login.");
      console.log(error);
    }
  };

  const signUp = async () => {
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await setDoc(doc(firestore, "users", credential.user.uid), {
        name: "",
        email: credential.user.email ?? "",
        age: 0,
        dna: "",
        diseases: [],
      });

      identify(credential.user.uid);
      track("sign_up", { method: "password" });

      alert(`Usuário Cadastrado: ${email}`);
      const token = await credential.user.getIdToken();
      console.log(token);
      router.push({
        pathname: "/details",
        params: {
          email: credential.user.email ?? "",
        },
      });
    } catch (error: any) {
      track("sign_up_failed", { error_code: error?.code ?? "unknown" });
      alert(`Usuário NÃO Cadastrado`);
      console.log(error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <MaterialCommunityIcons name="dna" size={34} color="#fff" />
          </View>
          <Text style={styles.title}>
            {isLogin ? "Bem-vindo!" : "Criar conta"}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin
              ? "Entre na sua conta para continuar"
              : "Preencha os dados para se cadastrar"}
          </Text>
        </View>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu email"
          placeholderTextColor="#94a3b8"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          autoComplete="password"
          value={password}
          onChangeText={setPassword}
        />

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={isLogin ? login : signUp}
        >
          <Text style={styles.buttonText}>
            {isLogin ? "Entrar" : "Cadastrar"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.switchButton}
          onPress={() => setAuthenticationState(isLogin ? "register" : "login")}
        >
          <Text style={styles.switchText}>
            {isLogin ? "Não tem conta? " : "Já tem conta? "}
            <Text style={styles.switchTextHighlight}>
              {isLogin ? "Cadastre-se" : "Entre"}
            </Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f4f7",
    padding: 20,
  },

  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },

  header: {
    alignItems: "center",
    marginBottom: 28,
  },

  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#0f172a",
    marginBottom: 20,
    backgroundColor: "#f8fafc",
  },

  button: {
    height: 52,
    backgroundColor: "#2563eb",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  switchButton: {
    marginTop: 20,
    alignItems: "center",
    paddingVertical: 8,
  },

  switchText: {
    fontSize: 14,
    color: "#64748b",
  },

  switchTextHighlight: {
    color: "#2563eb",
    fontWeight: "600",
  },
});