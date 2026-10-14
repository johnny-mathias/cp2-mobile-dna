import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { collection, getDocs } from "firebase/firestore";
import { auth, firestore } from "./services/firebase";
import { useEffect, useState } from "react";
import { track } from "./services/analytics";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";

useEffect(() => {
  if (Platform.OS === "web") return;

  const sub = Notifications.addNotificationReceivedListener(() => {
    track("notification_received");
  });

  return () => sub.remove();
}, []);

// Configura o comportamento das notificações com o aplicativo aberto
if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// Solicita permissão para notificações
async function requestPermissions(): Promise<boolean> {
  track("notification_opened");
  try {
    if (Platform.OS === "web") {
      console.log(
        "Notificações locais não são suportadas neste ambiente Web."
      );
      return false;
    }

    // Cria o canal de notificações no Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Notificações",
        importance: Notifications.AndroidImportance.MAX,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    // Verifica as permissões atuais
    const existingPermission =
      await Notifications.getPermissionsAsync();

    // Usa uma checagem estrutural para evitar erros de tipagem
    let permissionGranted =
      "granted" in existingPermission &&
      existingPermission.granted === true;

    // Solicita permissão caso ainda não tenha sido concedida
    if (!permissionGranted) {
      const requestedPermission =
        await Notifications.requestPermissionsAsync();

      permissionGranted =
        "granted" in requestedPermission &&
        requestedPermission.granted === true;
    }

    if (!permissionGranted) {
      Alert.alert(
        "Permissão necessária",
        "Habilite as notificações nas configurações do dispositivo."
      );

      return false;
    }

    return true;
  } catch (error) {
    console.log("Erro ao solicitar permissões:", error);
    return false;
  }
}

export default function Details() {
  const { email } = useLocalSearchParams<{ email: string }>();

  const [name, setName] = useState("");
  const [dna, setDna] = useState("");
  const [age, setAge] = useState(0);
  const [diseases, setDiseases] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scheduling, setScheduling] = useState(false);

  // Busca os dados do usuário no Firestore
  useEffect(() => {
    let active = true;

    const getUser = async () => {
      try {
        const userEmail = auth.currentUser?.email;

        if (!userEmail) {
          if (active) {
            setError("Usuário não autenticado.");
          }
          return;
        }

        const usersRef = collection(firestore, "users");

        const snapshot = await getDocs(usersRef);

        // Encontra o usuário pelo email, sem query ou where
        const userDoc = snapshot.docs.find(
          (document) =>
            document.data().email?.toLowerCase() ===
            userEmail.toLowerCase()
        );

        if (!active) return;

        if (userDoc) {
          const data = userDoc.data();

          setName(data.name ?? "");
          setDna(data.dna ?? "");
          setAge(data.age ?? 0);

          setDiseases(
            Array.isArray(data.diseases) ? data.diseases : []
          );

          console.log("Usuário encontrado:", userDoc.id);
        } else {
          setError("Usuário não encontrado no Firestore.");
        }
      } catch (err) {
        console.log("Erro ao buscar usuário:", err);

        if (active) {
          setError("Erro ao carregar os dados do usuário.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    getUser();

    return () => {
      active = false;
    };
  }, []);

  // Detecta o clique na notificação
  useEffect(() => {
    if (Platform.OS === "web") return;

    const subscription =
      Notifications.addNotificationResponseReceivedListener(
        async (response) => {
          try {
            const url =
              response.notification.request.content.data?.url;

            if (typeof url !== "string") return;

            if (
              url.startsWith("https://") ||
              url.startsWith("http://")
            ) {
              const supported = await Linking.canOpenURL(url);

              if (supported) {
                await Linking.openURL(url);
              } else {
                console.log("Não foi possível abrir:", url);
              }
            }
          } catch (err) {
            console.log("Erro ao abrir notificação:", err);
          }
        }
      );

    return () => {
      subscription.remove();
    };
  }, []);

  // Agenda uma notificação local
  const scheduleNotification = async () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Ambiente não suportado",
        "Teste as notificações em um dispositivo Android ou iOS."
      );
      return;
    }

    try {
      setScheduling(true);

      const permission = await requestPermissions();

      if (!permission) {
        track("notification_permission_denied");
        return;
      }


      const notificationId =
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Olá! 👋",
            body: `Olá, ${name || "usuário"}! Seu exame de DNA está pronto. Entre no app para mais informações.`,
            sound: "default",
          },
          trigger: {
            type:
              Notifications.SchedulableTriggerInputTypes
                .TIME_INTERVAL,
            seconds: 5,
            repeats: false,
            channelId: "default",
          },
        });

      track("notification_scheduled", { delay_seconds: 5 });

      console.log(
        "Notificação agendada com ID:",
        notificationId
      );

      Alert.alert(
        "Notificação agendada",
        "Você receberá uma notificação em aproximadamente 5 segundos."
      );
    } catch (err) {
      console.log("Erro ao agendar notificação:", err);

      Alert.alert(
        "Erro",
        "Não foi possível agendar a notificação."
      );
    } finally {
      setScheduling(false);
    }
  };

  // Tela de carregamento
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>
          Carregando informações...
        </Text>
      </View>
    );
  }

  // Tela de erro
  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

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

        <Text style={styles.userName}>
          {name || "Usuário"}
        </Text>

        <Text style={styles.userEmail}>
          {auth.currentUser?.email ?? email}
        </Text>

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
          <Text style={styles.value}>
            {auth.currentUser?.email ?? email}
          </Text>
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

        <TouchableOpacity
          style={[
            styles.notificationButton,
            scheduling && styles.disabledButton,
          ]}
          onPress={scheduleNotification}
          disabled={scheduling}
          activeOpacity={0.8}
        >
          {scheduling ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.notificationButtonText}>
              Enviar notificação 🔔
            </Text>
          )}
        </TouchableOpacity>
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

  notificationButton: {
    height: 52,
    backgroundColor: "#2563eb",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  disabledButton: {
    opacity: 0.6,
  },

  notificationButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f4f7",
    padding: 20,
  },

  loadingText: {
    fontSize: 15,
    color: "#777",
    marginTop: 15,
  },

  errorText: {
    fontSize: 16,
    color: "#dc2626",
    textAlign: "center",
  },
});