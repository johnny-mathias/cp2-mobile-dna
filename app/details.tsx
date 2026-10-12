
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "./services/firebase";
import { useEffect, useState } from "react";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function Details() {
  const { email } = useLocalSearchParams<{ email: string }>();

  const [name, setName] = useState("");
  const [dna, setDna] = useState("");
  const [age, setAge] = useState(0);
  const [diseases, setDiseases] = useState<string[]>([]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const docRef = doc(
          firestore,
          "users",
          "tHjipiKUIN2D9UyKZYNI"
        );

        const document = await getDoc(docRef);

        if (document.exists()) {
          const data = document.data();

          setName(data.name ?? "");
          setDna(data.dna ?? "");
          setAge(data.age ?? 0);
          setDiseases(data.diseases ?? []);
        }
      } catch (error: any) {
        console.log("Erro:", error.message);
      }
    };

    getUser();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Meu Perfil</Text>
        <Text style={styles.subtitle}>
          Informações pessoais e de saúde
        </Text>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {name ? name.charAt(0).toUpperCase() : "U"}
          </Text>
        </View>

        <Text style={styles.userName}>{name || "Usuário"}</Text>
        <Text style={styles.userEmail}>{email}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>
          Dados pessoais
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Nome</Text>
          <Text style={styles.value}>{name}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{email}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Idade</Text>
          <Text style={styles.value}>{age} anos</Text>
        </View>

        <Text style={styles.sectionTitle}>
          Informações de saúde
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.label}>DNA</Text>
          <Text style={styles.value}>{dna}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Doenças</Text>
          <Text style={styles.value}>
            {diseases.length > 0
              ? diseases.join(", ")
              : "Nenhuma doença registrada"}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f4f7",
    padding: 20,
  },

  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginBottom: 25,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 12,
  },

  avatarText: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "bold",
  },

  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
  },

  userEmail: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 5,
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 25,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 15,
    marginTop: 5,
  },

  infoBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#777",
    marginBottom: 5,
  },

  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#222",
  },
});
