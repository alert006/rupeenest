import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";

const PIN_KEY = "rupeenest_pin_hash";

// Tiny non-crypto hash. Good enough to gate UX on a personal device.
function hash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h) ^ input.charCodeAt(i);
  }
  return String(h >>> 0);
}

export async function setPin(pin: string): Promise<void> {
  if (Platform.OS === "web") return;
  await SecureStore.setItemAsync(PIN_KEY, hash(pin));
}

export async function hasPin(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const v = await SecureStore.getItemAsync(PIN_KEY);
  return !!v;
}

export async function verifyPin(pin: string): Promise<boolean> {
  if (Platform.OS === "web") return true;
  const v = await SecureStore.getItemAsync(PIN_KEY);
  return v === hash(pin);
}

export async function clearPin(): Promise<void> {
  if (Platform.OS === "web") return;
  await SecureStore.deleteItemAsync(PIN_KEY);
}

export async function biometricAvailable(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const has = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return has && enrolled;
  } catch {
    return false;
  }
}

export async function authenticateBiometric(reason = "Unlock RupeeNest"): Promise<boolean> {
  if (Platform.OS === "web") return true;
  try {
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      fallbackLabel: "Use PIN",
      disableDeviceFallback: false,
    });
    return res.success;
  } catch {
    return false;
  }
}
