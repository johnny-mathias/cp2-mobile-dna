import { Platform } from "react-native";
import { logEvent, setUserId } from "firebase/analytics";
import { analyticsPromise } from "./firebase";

const MEASUREMENT_ID = "G-3TH41QWTT9";
const API_SECRET = "PASTE_YOUR_API_SECRET"; // Firebase Console > Data Streams > Measurement Protocol API secrets

// Identifiers for native events (new on each app launch)
const clientId = `${Date.now()}.${Math.floor(Math.random() * 1e9)}`;
const sessionId = String(Math.floor(Date.now() / 1000));
let currentUserId: string | null = null;

export async function identify(uid: string | null) {
    currentUserId = uid;
    if (Platform.OS === "web") {
        const analytics = await analyticsPromise;
        if (analytics) setUserId(analytics, uid);
    }
}

export async function track(event: string, params: Record<string, any> = {}) {
    try {
        if (Platform.OS === "web") {
            const analytics = await analyticsPromise;
            if (analytics) logEvent(analytics, event, params);
            return;
        }

        await fetch(
            `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
            {
                method: "POST",
                body: JSON.stringify({
                    client_id: clientId,
                    ...(currentUserId ? { user_id: currentUserId } : {}),
                    events: [
                        {
                            name: event,
                            params: {
                                ...params,
                                session_id: sessionId,
                                engagement_time_msec: 100,
                                platform: Platform.OS,
                            },
                        },
                    ],
                }),
            }
        );
    } catch (err) {
        console.log("Analytics error:", err);
    }
}