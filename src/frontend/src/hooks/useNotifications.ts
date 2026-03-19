import { useCallback, useEffect, useRef, useState } from "react";

const NOTIFIED_DATE_KEY = "farminder_notified_date";

type NotificationPermission = "default" | "granted" | "denied";

export function useNotifications() {
  const isSupported =
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator;

  const [permission, setPermission] = useState<NotificationPermission>(
    isSupported
      ? (Notification.permission as NotificationPermission)
      : "denied",
  );

  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!isSupported) return;
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        swRegistrationRef.current = reg;
      })
      .catch(console.error);
  }, [isSupported]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return;
    const result = await Notification.requestPermission();
    setPermission(result as NotificationPermission);
    return result;
  }, [isSupported]);

  const sendDailyNotification = useCallback(
    (pendingTasks: unknown[], _cropMap?: unknown) => {
      if (!isSupported || permission !== "granted" || pendingTasks.length === 0)
        return;

      const today = new Date().toISOString().split("T")[0];
      const lastNotified = localStorage.getItem(NOTIFIED_DATE_KEY);
      if (lastNotified === today) return;

      const send = async () => {
        let reg = swRegistrationRef.current;
        if (!reg) {
          try {
            reg = await navigator.serviceWorker.ready;
            swRegistrationRef.current = reg;
          } catch {
            return;
          }
        }
        if (reg.active) {
          reg.active.postMessage({
            type: "SHOW_NOTIFICATION",
            title: "Farminder Reminder 🌱",
            body: `You have ${pendingTasks.length} fertilizer task${pendingTasks.length > 1 ? "s" : ""} today!`,
          });
          localStorage.setItem(NOTIFIED_DATE_KEY, today);
        }
      };

      send();
    },
    [isSupported, permission],
  );

  return { isSupported, permission, requestPermission, sendDailyNotification };
}
