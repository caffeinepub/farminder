import { useCallback, useEffect, useRef, useState } from "react";

const NOTIFIED_DATE_KEY = "farminder_notified_date";

type NotificationPermission = "default" | "granted" | "denied";

/** Returns milliseconds until 8:00 AM today (local time). If 8 AM has already passed, returns 0. */
function msUntil8AM(): number {
  const now = new Date();
  const target = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    8,
    0,
    0,
    0,
  );
  const diff = target.getTime() - now.getTime();
  return diff > 0 ? diff : 0;
}

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
  const scheduledTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Store latest task counts so the scheduled timer can use up-to-date values
  const pendingCountsRef = useRef<{ fert: number; spray: number }>({
    fert: 0,
    spray: 0,
  });

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

  const fireNotification = useCallback(
    async (fertCount: number, sprayCount: number) => {
      if (!isSupported || Notification.permission !== "granted") return;
      const today = new Date().toISOString().split("T")[0];
      const lastNotified = localStorage.getItem(NOTIFIED_DATE_KEY);
      if (lastNotified === today) return;
      if (fertCount === 0 && sprayCount === 0) return;

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
        const parts: string[] = [];
        if (fertCount > 0)
          parts.push(`${fertCount} fertilizer task${fertCount > 1 ? "s" : ""}`);
        if (sprayCount > 0)
          parts.push(`${sprayCount} spray task${sprayCount > 1 ? "s" : ""}`);
        reg.active.postMessage({
          type: "SHOW_NOTIFICATION",
          title: "Farminder Morning Reminder 🌱",
          body: `Good morning! You have ${parts.join(" and ")} today.`,
        });
        localStorage.setItem(NOTIFIED_DATE_KEY, today);
      }
    },
    [isSupported],
  );

  /**
   * Call this once per day when schedules are loaded.
   * - If it's already 8 AM or later and not yet notified today, fires immediately.
   * - If before 8 AM, schedules a timer so the notification fires at exactly 8 AM.
   */
  const scheduleDailyNotification = useCallback(
    (fertCount: number, sprayCount: number) => {
      if (!isSupported || Notification.permission !== "granted") return;
      if (fertCount === 0 && sprayCount === 0) return;

      // Always keep ref up-to-date for the scheduled timer
      pendingCountsRef.current = { fert: fertCount, spray: sprayCount };

      const delay = msUntil8AM();

      if (delay === 0) {
        // 8 AM has already passed today — fire now if not already notified
        fireNotification(fertCount, sprayCount);
      } else {
        // Before 8 AM — clear any existing timer and schedule a new one
        if (scheduledTimerRef.current !== null) {
          clearTimeout(scheduledTimerRef.current);
        }
        scheduledTimerRef.current = setTimeout(() => {
          const { fert, spray } = pendingCountsRef.current;
          fireNotification(fert, spray);
          scheduledTimerRef.current = null;
        }, delay);
      }
    },
    [isSupported, fireNotification],
  );

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (scheduledTimerRef.current !== null) {
        clearTimeout(scheduledTimerRef.current);
      }
    };
  }, []);

  /** @deprecated use scheduleDailyNotification instead */
  const sendDailyNotification = useCallback(
    (pendingTasks: unknown[], _cropMap?: unknown) => {
      scheduleDailyNotification((pendingTasks as unknown[]).length, 0);
    },
    [scheduleDailyNotification],
  );

  return {
    isSupported,
    permission,
    requestPermission,
    sendDailyNotification,
    scheduleDailyNotification,
  };
}
