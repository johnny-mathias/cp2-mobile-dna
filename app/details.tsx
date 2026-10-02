import { doc, getDoc } from "firebase/firestore";
import { firestore } from "./services/firebase";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function Details() {
  const [name, setName] = useState("");
  const [dna, setDna] = useState("");
  const [age, setAge] = useState(0);
  const [disease, setDisease] = useState([]);

  // Substituir por modelo DRY depois
  const docName = doc(firestore, "users", "ceFRGozOpEvQH4VKs8H0");
  const docDna = doc(firestore, "users", "ceFRGozOpEvQH4VKs8H0");
  const docAge = doc(firestore, "users", "ceFRGozOpEvQH4VKs8H0");
  const docDisease = doc(firestore, "users", "ceFRGozOpEvQH4VKs8H0");

  useEffect(() => {
    Promise.all([getDoc(docName), getDoc(docDna), getDoc(docAge), getDoc(docDisease)]).then(
      ([document1, document2, document3, document4]) => {
        if (document1.exists()) setName(document1.data().value);
        if (document2.exists()) setDna(document2.data().value);
        if (document3.exists()) setAge(document3.data().value);
        if (document4.exists()) setDisease(document4.data().value);
      },
    );
  }, []);
  return (
    <View>
      <Text>name: {name}</Text>
      <Text>dna: {dna}</Text>
      <Text>age: {age}</Text>
      <Text>disease: {disease.join(", ")}</Text>
    </View>
  );
}
