import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function enableDailyReminder(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const settings = await Notifications.getPermissionsAsync();
    let granted = settings.granted;
    if (!granted) {
      const req = await Notifications.requestPermissionsAsync();
      granted = req.granted;
    }
    if (!granted) return false;

    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "RupeeNest",
        body: "Log today's spending to stay on top of your Smart Budget.",
        sound: false,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 20,
        minute: 0,
      } as Notifications.DailyTriggerInput,
    });
    return true;
  } catch {
    return false;
  }
}

export async function disableReminder(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore
  }
}
