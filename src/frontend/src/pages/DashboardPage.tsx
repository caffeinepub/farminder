import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  BellOff,
  CheckCircle,
  Droplets,
  Leaf,
  Loader2,
  Sprout,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useNotifications } from "../hooks/useNotifications";
import {
  useGetTodaysFertilizerSchedules,
  useGetTodaysSpraySchedules,
  useListCrops,
  useMarkFertilizerScheduleAsDone,
  useMarkSprayScheduleAsDone,
} from "../hooks/useQueries";

function extractQty(notes: string): string | null {
  const line = notes.split("\n").find((l) => l.startsWith("Qty:"));
  return line ? line.replace("Qty:", "").trim() : null;
}

function extractUserNotes(notes: string): string {
  return notes
    .split("\n")
    .filter((l) => !l.startsWith("Qty:"))
    .join("\n")
    .trim();
}

export default function DashboardPage() {
  const { data: crops, isLoading: cropsLoading } = useListCrops();
  const { data: todayFertilizer, isLoading: fertilizerLoading } =
    useGetTodaysFertilizerSchedules();
  const { data: todaySpray, isLoading: sprayLoading } =
    useGetTodaysSpraySchedules();
  const { mutateAsync: markFertDone, isPending: fertPending } =
    useMarkFertilizerScheduleAsDone();
  const { mutateAsync: markSprayDone, isPending: sprayPending } =
    useMarkSprayScheduleAsDone();
  const {
    isSupported,
    permission,
    requestPermission,
    scheduleDailyNotification,
  } = useNotifications();

  const cropMap = new Map((crops ?? []).map((c) => [c.id.toString(), c]));

  const fertPending_ = (todayFertilizer ?? []).filter((s) => !s.isDone);
  const fertDone = (todayFertilizer ?? []).filter((s) => s.isDone);
  const sprayPending_ = (todaySpray ?? []).filter((s) => !s.isDone);
  const sprayDone = (todaySpray ?? []).filter((s) => s.isDone);

  const totalTasks = (todayFertilizer?.length ?? 0) + (todaySpray?.length ?? 0);
  const totalDone = fertDone.length + sprayDone.length;

  const schedulesLoading = fertilizerLoading || sprayLoading;

  const notificationScheduledRef = useRef(false);

  useEffect(() => {
    if (
      !fertilizerLoading &&
      !sprayLoading &&
      permission === "granted" &&
      !notificationScheduledRef.current &&
      (fertPending_.length > 0 || sprayPending_.length > 0)
    ) {
      notificationScheduledRef.current = true;
      scheduleDailyNotification(fertPending_.length, sprayPending_.length);
    }
  }, [
    fertilizerLoading,
    sprayLoading,
    fertPending_.length,
    sprayPending_.length,
    permission,
    scheduleDailyNotification,
  ]);

  const handleMarkFertDone = async (id: bigint) => {
    try {
      await markFertDone(id);
      toast.success("Task marked as done!");
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleMarkSprayDone = async (id: bigint) => {
    try {
      await markSprayDone(id);
      toast.success("Spray task marked as done!");
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleEnableNotifications = async () => {
    const result = await requestPermission();
    if (result === "granted") {
      toast.success(
        "Notifications enabled! You'll get a reminder at 8 AM on task days.",
      );
    } else if (result === "denied") {
      toast.error(
        "Notifications blocked. Please enable them in your browser settings.",
      );
    }
  };

  return (
    <main className="container mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display font-bold text-3xl mb-1">Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          Here&apos;s what needs attention today.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Total Crops",
              value: crops?.length ?? 0,
              icon: <Sprout className="w-5 h-5 text-primary" />,
              loading: cropsLoading,
            },
            {
              label: "Today's Tasks",
              value: totalTasks,
              icon: <Leaf className="w-5 h-5 text-primary" />,
              loading: schedulesLoading,
            },
            {
              label: "Completed",
              value: totalDone,
              icon: <CheckCircle className="w-5 h-5 text-primary" />,
              loading: schedulesLoading,
            },
          ].map((stat) => (
            <Card key={stat.label} className="shadow-card">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                {stat.loading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <span className="font-display font-bold text-3xl">
                    {stat.value}
                  </span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Notification Permission Banner */}
        <AnimatePresence>
          {isSupported && permission !== "granted" && (
            <motion.div
              key="notif-banner"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              {permission === "denied" ? (
                <div
                  data-ocid="notifications.error_state"
                  className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3"
                >
                  <BellOff className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-destructive">
                      Notifications are blocked
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Please enable notifications in your browser or phone
                      settings to receive daily reminders at 8 AM.
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  data-ocid="notifications.panel"
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <Bell className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">
                        Get reminded at 8 AM every task day 🌾
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Enable notifications to receive a morning alert at
                        8&nbsp;AM whenever you have fertilizer or spray tasks
                        scheduled.
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleEnableNotifications}
                    data-ocid="notifications.primary_button"
                    className="rounded-full shrink-0 whitespace-nowrap"
                  >
                    <Bell className="w-3.5 h-3.5 mr-1.5" />
                    Enable Notifications
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Today's Fertilizer Tasks */}
        <h2 className="font-display font-bold text-xl mb-4">
          Today&apos;s Fertilizer Tasks
        </h2>
        {fertilizerLoading ? (
          <div className="space-y-3" data-ocid="dashboard.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : fertPending_.length === 0 && fertDone.length === 0 ? (
          <div
            className="text-center py-12 rounded-2xl border border-dashed border-border mb-8"
            data-ocid="dashboard.empty_state"
          >
            <Leaf className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold text-muted-foreground">
              No fertilizer tasks scheduled for today
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Go to Plots to add fertilizer tasks
            </p>
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {fertPending_.map((s, i) => {
              const crop = cropMap.get(s.cropId.toString());
              const qty = extractQty(s.notes);
              const userNotes = extractUserNotes(s.notes);
              return (
                <motion.div
                  key={s.id.toString()}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  data-ocid={`dashboard.item.${i + 1}`}
                  className="flex items-center gap-4 bg-white rounded-xl border border-border shadow-xs p-4"
                >
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <Leaf className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {crop?.name ?? "Unknown Crop"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate flex items-center flex-wrap gap-1">
                      {s.fertilizerName}
                      {qty && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                          {qty}
                        </span>
                      )}
                    </p>
                    {userNotes && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {userNotes}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {`${s.scheduledDate.day}/${s.scheduledDate.month}`}
                  </Badge>
                  <Button
                    size="sm"
                    data-ocid={`dashboard.item.${i + 1}.primary_button`}
                    onClick={() => handleMarkFertDone(s.id)}
                    disabled={fertPending}
                    className="rounded-full shrink-0"
                  >
                    {fertPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    )}
                    Done
                  </Button>
                </motion.div>
              );
            })}
            {fertDone.map((s, i) => {
              const crop = cropMap.get(s.cropId.toString());
              const qty = extractQty(s.notes);
              return (
                <div
                  key={s.id.toString()}
                  data-ocid={`dashboard.done.item.${i + 1}`}
                  className="flex items-center gap-4 bg-muted/50 rounded-xl border border-border p-4 opacity-60"
                >
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate line-through">
                      {crop?.name ?? "Unknown Crop"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate flex items-center flex-wrap gap-1">
                      {s.fertilizerName}
                      {qty && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                          {qty}
                        </span>
                      )}
                    </p>
                  </div>
                  <Badge className="shrink-0 text-xs">Done</Badge>
                </div>
              );
            })}
          </div>
        )}

        {/* Today's Spray Tasks */}
        <h2 className="font-display font-bold text-xl mb-4">
          Today&apos;s Spray Tasks
        </h2>
        {sprayLoading ? (
          <div className="space-y-3" data-ocid="dashboard.spray.loading_state">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : sprayPending_.length === 0 && sprayDone.length === 0 ? (
          <div
            className="text-center py-12 rounded-2xl border border-dashed border-border"
            data-ocid="dashboard.spray.empty_state"
          >
            <Droplets className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold text-muted-foreground">
              No spray tasks scheduled for today
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Go to Plots to add spray tasks
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sprayPending_.map((s, i) => {
              const crop = cropMap.get(s.cropId.toString());
              const qty = extractQty(s.notes);
              const userNotes = extractUserNotes(s.notes);
              return (
                <motion.div
                  key={s.id.toString()}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  data-ocid={`dashboard.spray.item.${i + 1}`}
                  className="flex items-center gap-4 bg-white rounded-xl border border-blue-100 shadow-xs p-4"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Droplets className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {crop?.name ?? "Unknown Crop"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate flex items-center flex-wrap gap-1">
                      {s.sprayName}
                      {qty && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          {qty}
                        </span>
                      )}
                    </p>
                    {userNotes && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {userNotes}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className="shrink-0 text-xs border-blue-300 text-blue-600"
                  >
                    {`${s.scheduledDate.day}/${s.scheduledDate.month}`}
                  </Badge>
                  <Button
                    size="sm"
                    data-ocid={`dashboard.spray.item.${i + 1}.primary_button`}
                    onClick={() => handleMarkSprayDone(s.id)}
                    disabled={sprayPending}
                    className="rounded-full shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {sprayPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    )}
                    Done
                  </Button>
                </motion.div>
              );
            })}
            {sprayDone.map((s, i) => {
              const crop = cropMap.get(s.cropId.toString());
              const qty = extractQty(s.notes);
              return (
                <div
                  key={s.id.toString()}
                  data-ocid={`dashboard.spray.done.item.${i + 1}`}
                  className="flex items-center gap-4 bg-muted/50 rounded-xl border border-border p-4 opacity-60"
                >
                  <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate line-through">
                      {crop?.name ?? "Unknown Crop"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate flex items-center flex-wrap gap-1">
                      {s.sprayName}
                      {qty && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          {qty}
                        </span>
                      )}
                    </p>
                  </div>
                  <Badge className="shrink-0 text-xs">Done</Badge>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </main>
  );
}
