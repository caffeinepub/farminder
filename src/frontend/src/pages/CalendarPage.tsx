import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Leaf,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  useGetAllFertilizerSchedules,
  useGetAllSpraySchedules,
  useListCrops,
} from "../hooks/useQueries";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SKELETON_KEYS = Array.from({ length: 35 }, (_, i) => `sk-${i}`);

function extractQty(notes: string): string | null {
  return (
    notes
      .split("\n")
      .find((l) => l.startsWith("Qty:"))
      ?.replace("Qty:", "")
      .trim() ?? null
  );
}

export default function CalendarPage() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const { data: crops = [], isLoading: cropsLoading } = useListCrops();
  const { data: fertilizers = [], isLoading: fertLoading } =
    useGetAllFertilizerSchedules();
  const { data: sprays = [], isLoading: sprayLoading } =
    useGetAllSpraySchedules();

  const isLoading = cropsLoading || fertLoading || sprayLoading;

  const cropMap: Record<string, string> = {};
  for (const c of crops) {
    cropMap[String(c.id)] = c.name;
  }

  // Filter schedules for current viewMonth/viewYear
  const monthFerts = fertilizers.filter(
    (f) =>
      Number(f.scheduledDate.month) === viewMonth + 1 &&
      Number(f.scheduledDate.year) === viewYear,
  );
  const monthSprays = sprays.filter(
    (s) =>
      Number(s.scheduledDate.month) === viewMonth + 1 &&
      Number(s.scheduledDate.year) === viewYear,
  );

  // Build day -> tasks map
  const fertsByDay: Record<number, typeof fertilizers> = {};
  const spraysByDay: Record<number, typeof sprays> = {};
  for (const f of monthFerts) {
    const d = Number(f.scheduledDate.day);
    if (!fertsByDay[d]) fertsByDay[d] = [];
    fertsByDay[d].push(f);
  }
  for (const s of monthSprays) {
    const d = Number(s.scheduledDate.day);
    if (!spraysByDay[d]) spraysByDay[d] = [];
    spraysByDay[d].push(s);
  }

  // Calendar grid
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete grid rows
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    setSelectedDay(null);
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    setSelectedDay(null);
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const selectedFerts = selectedDay ? (fertsByDay[selectedDay] ?? []) : [];
  const selectedSprays = selectedDay ? (spraysByDay[selectedDay] ?? []) : [];
  const hasAnySchedule = fertilizers.length > 0 || sprays.length > 0;

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            Farm Calendar
          </h1>
          <p className="text-muted-foreground text-sm">
            View upcoming fertilizer & spray schedules
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <div className="grid grid-cols-7 gap-2">
            {SKELETON_KEYS.map((k) => (
              <Skeleton key={k} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
      ) : !hasAnySchedule ? (
        <div
          data-ocid="calendar.empty_state"
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
            <CalendarDays className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display font-bold text-xl mb-2">
            No Schedules Yet
          </h2>
          <p className="text-muted-foreground max-w-sm">
            Add fertilizer or spray schedules to your plots to see them here.
          </p>
        </div>
      ) : (
        <>
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={prevMonth}
              data-ocid="calendar.pagination_prev"
              className="rounded-xl"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="font-display font-bold text-xl text-foreground">
              {MONTHS[viewMonth]} {viewYear}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
              data-ocid="calendar.pagination_next"
              className="rounded-xl"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs text-muted-foreground">Fertilizer</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span className="text-xs text-muted-foreground">Spray</span>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div
                key={d}
                className="text-center text-xs font-semibold text-muted-foreground py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              const hasFert = day ? (fertsByDay[day]?.length ?? 0) > 0 : false;
              const hasSpray = day
                ? (spraysByDay[day]?.length ?? 0) > 0
                : false;
              const isToday =
                day === today.getDate() &&
                viewMonth === today.getMonth() &&
                viewYear === today.getFullYear();
              const isSelected = day !== null && day === selectedDay;

              return (
                <button
                  key={day !== null ? `day-${day}` : `empty-${idx}-static`}
                  type="button"
                  disabled={!day}
                  onClick={() => day && setSelectedDay(isSelected ? null : day)}
                  data-ocid={day ? `calendar.item.${idx + 1}` : undefined}
                  className={[
                    "relative flex flex-col items-center justify-start pt-1.5 pb-1 min-h-[56px] rounded-xl text-sm font-medium transition-all",
                    day
                      ? "cursor-pointer hover:bg-accent"
                      : "cursor-default opacity-0",
                    isSelected ? "bg-primary text-white hover:bg-primary" : "",
                    isToday && !isSelected
                      ? "border-2 border-primary text-primary"
                      : "",
                    !isSelected && !isToday && day ? "text-foreground" : "",
                  ].join(" ")}
                >
                  {day && <span>{day}</span>}
                  {day && (
                    <div className="flex gap-0.5 mt-1">
                      {hasFert && (
                        <span
                          className={`w-2 h-2 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500"}`}
                        />
                      )}
                      {hasSpray && (
                        <span
                          className={`w-2 h-2 rounded-full ${isSelected ? "bg-white/80" : "bg-blue-500"}`}
                        />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Day detail panel */}
          <AnimatePresence>
            {selectedDay !== null &&
              (selectedFerts.length > 0 || selectedSprays.length > 0) && (
                <motion.div
                  key={selectedDay}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm"
                  data-ocid="calendar.panel"
                >
                  <h3 className="font-display font-bold text-lg mb-4">
                    {MONTHS[viewMonth]} {selectedDay}, {viewYear}
                  </h3>

                  {selectedFerts.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Leaf className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold text-sm text-emerald-700">
                          Fertilizer Tasks
                        </span>
                      </div>
                      <div className="space-y-2">
                        {selectedFerts.map((f, i) => {
                          const qty = extractQty(f.notes);
                          return (
                            <div
                              key={String(f.id)}
                              data-ocid={`calendar.row.${i + 1}`}
                              className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 border border-emerald-100"
                            >
                              <div>
                                <p className="font-medium text-sm text-foreground">
                                  {f.fertilizerName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {cropMap[String(f.cropId)] ?? "Unknown Crop"}
                                </p>
                              </div>
                              {qty && (
                                <Badge className="bg-emerald-500 text-white text-xs">
                                  {qty}
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedSprays.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Droplets className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-sm text-blue-700">
                          Spray Tasks
                        </span>
                      </div>
                      <div className="space-y-2">
                        {selectedSprays.map((s, i) => {
                          const qty = extractQty(s.notes);
                          return (
                            <div
                              key={String(s.id)}
                              data-ocid={`calendar.row.${selectedFerts.length + i + 1}`}
                              className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3 border border-blue-100"
                            >
                              <div>
                                <p className="font-medium text-sm text-foreground">
                                  {s.sprayName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {cropMap[String(s.cropId)] ?? "Unknown Crop"}
                                </p>
                              </div>
                              {qty && (
                                <Badge className="bg-blue-500 text-white text-xs">
                                  {qty}
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            {selectedDay !== null &&
              selectedFerts.length === 0 &&
              selectedSprays.length === 0 && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 rounded-2xl border border-border bg-card p-5 text-center text-muted-foreground text-sm"
                  data-ocid="calendar.empty_state"
                >
                  No tasks scheduled for {MONTHS[viewMonth]} {selectedDay}.
                </motion.div>
              )}
          </AnimatePresence>
        </>
      )}
    </main>
  );
}
