import { doc, getDoc } from "firebase/firestore";
import { firestore } from "./services/firebase";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function Details() {
  const { email } = useLocalSearchParams<{ email: string }>();

  const [name, setName] = useState("");
  const [dna, setDna] = useState("");
  const [age, setAge] = useState(0);
  const [diseases, setDiseases] = useState<string[]>([]);
  const [status, setStatus] = useState("Carregando...");

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

          setStatus("Dados carregados!");
        } else {
          setStatus("Documento não encontrado");
        }
      } catch (error: any) {
        console.log("Erro:", error.message);
        setStatus(`Erro: ${error.message}`);
      }
    };

    getUser();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text>Status: {status}</Text>
      <Text>Email: {email}</Text>
      <Text>Name: {name}</Text>
      <Text>DNA: {dna}</Text>
      <Text>Age: {age}</Text>
      <Text>Diseases: {diseases.join(", ")}</Text>
    </View>
  );
}