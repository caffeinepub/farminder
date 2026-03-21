import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Droplets,
  Leaf,
  MapPin,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  useGetAllFertilizerSchedules,
  useGetAllSpraySchedules,
  useListCrops,
} from "../hooks/useQueries";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_SHORT = ["S", "M", "T", "W", "T", "F", "S"];
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

function isPastDate(day: number, month: number, year: number): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(year, month, day);
  return target < today;
}

function isTodayDate(day: number, month: number, year: number): boolean {
  const today = new Date();
  return (
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear()
  );
}

type ViewMode = "year" | "month";

function MiniMonthCard({
  year,
  month,
  fertilizers,
  sprays,
  isCurrentMonth,
  onClick,
}: {
  year: number;
  month: number;
  fertilizers: Array<{
    scheduledDate: { day: bigint; month: bigint; year: bigint };
  }>;
  sprays: Array<{
    scheduledDate: { day: bigint; month: bigint; year: bigint };
  }>;
  isCurrentMonth: boolean;
  onClick: () => void;
}) {
  const today = new Date();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const fertDays = new Set<number>();
  const sprayDays = new Set<number>();
  for (const f of fertilizers) {
    if (
      Number(f.scheduledDate.month) === month + 1 &&
      Number(f.scheduledDate.year) === year
    ) {
      fertDays.add(Number(f.scheduledDate.day));
    }
  }
  for (const s of sprays) {
    if (
      Number(s.scheduledDate.month) === month + 1 &&
      Number(s.scheduledDate.year) === year
    ) {
      sprayDays.add(Number(s.scheduledDate.day));
    }
  }

  const isThisMonthToday =
    today.getMonth() === month && today.getFullYear() === year;
  const todayDate = today.getDate();

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left p-3 rounded-2xl border transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer bg-card",
        isCurrentMonth
          ? "border-primary shadow-md ring-1 ring-primary/30"
          : "border-border",
      ].join(" ")}
    >
      <div
        className={[
          "font-semibold text-sm mb-2",
          isCurrentMonth ? "text-primary" : "text-foreground",
        ].join(" ")}
      >
        {MONTHS[month]}
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS_SHORT.map((d, i) => (
          <div
            key={`day-header-${MONTHS[month]}-${i}`}
            className="text-center text-[8px] font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px">
        {cells.map((day, idx) => {
          const hasFert = day ? fertDays.has(day) : false;
          const hasSpray = day ? sprayDays.has(day) : false;
          const isTodayCell = isThisMonthToday && day === todayDate;
          const isPast = day ? isPastDate(day, month, year) : false;
          return (
            <div
              key={day !== null ? `day-${day}` : `empty-${idx}`}
              className={[
                "flex flex-col items-center justify-start pt-0.5 pb-px rounded text-[9px] font-medium h-7",
                day ? "text-foreground" : "opacity-0",
                isTodayCell
                  ? "bg-primary/10 text-primary font-bold ring-1 ring-primary rounded"
                  : "",
                isPast && day ? "opacity-60" : "",
              ].join(" ")}
            >
              {day && <span>{day}</span>}
              {day && (hasFert || hasSpray) && (
                <div className="flex gap-px mt-px">
                  {hasFert && (
                    <span
                      className={`w-1 h-1 rounded-full ${isPast ? "bg-emerald-400" : "bg-emerald-500"}`}
                    />
                  )}
                  {hasSpray && (
                    <span
                      className={`w-1 h-1 rounded-full ${isPast ? "bg-blue-400" : "bg-blue-500"}`}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </button>
  );
}

function PlotTaskGroup({
  plotName,
  tasks,
  type,
  cropMap,
  baseIndex,
  isCompleted,
}: {
  plotName: string;
  tasks: Array<{
    id: bigint;
    fertilizerName?: string;
    sprayName?: string;
    cropId: bigint;
    notes: string;
  }>;
  type: "fertilizer" | "spray";
  cropMap: Record<string, string>;
  baseIndex: number;
  isCompleted: boolean;
}) {
  const bgClass = isCompleted
    ? type === "fertilizer"
      ? "bg-emerald-50/60 border-emerald-100/60"
      : "bg-blue-50/60 border-blue-100/60"
    : type === "fertilizer"
      ? "bg-emerald-50 border-emerald-100"
      : "bg-blue-50 border-blue-100";
  const badgeClass =
    type === "fertilizer"
      ? "bg-emerald-500 text-white"
      : "bg-blue-500 text-white";

  return (
    <div className="mb-3">
      <div className="flex items-center gap-1.5 mb-2 px-1">
        <MapPin className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs font-bold text-foreground">{plotName}</span>
      </div>
      <div className="space-y-1.5 pl-4">
        {tasks.map((task, i) => {
          const qty = extractQty(task.notes);
          const name =
            type === "fertilizer" ? task.fertilizerName! : task.sprayName!;
          return (
            <div
              key={String(task.id)}
              data-ocid={`calendar.row.${baseIndex + i + 1}`}
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 border ${bgClass} ${isCompleted ? "opacity-80" : ""}`}
            >
              <div className="flex items-center gap-2">
                {isCompleted && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                )}
                <div>
                  <p
                    className={`font-medium text-sm ${isCompleted ? "text-muted-foreground" : "text-foreground"}`}
                  >
                    {name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {cropMap[String(task.cropId)] ?? "Unknown Crop"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {qty && (
                  <Badge className={`text-xs ${badgeClass}`}>{qty}</Badge>
                )}
                {isCompleted && (
                  <Badge
                    variant="outline"
                    className="text-xs text-emerald-600 border-emerald-300"
                  >
                    Done
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const today = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(
    today.getDate(),
  );

  const { data: crops = [], isLoading: cropsLoading } = useListCrops();
  const { data: fertilizers = [], isLoading: fertLoading } =
    useGetAllFertilizerSchedules();
  const { data: sprays = [], isLoading: sprayLoading } =
    useGetAllSpraySchedules();

  const isLoading = cropsLoading || fertLoading || sprayLoading;

  const cropMap: Record<string, string> = {};
  const plotNameMap: Record<string, string> = {};
  for (const c of crops) {
    cropMap[String(c.id)] = c.name;
    plotNameMap[String(c.id)] = c.plotName || c.name;
  }

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

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
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
  const isSelectedDayToday = selectedDay
    ? isTodayDate(selectedDay, viewMonth, viewYear)
    : false;
  const isSelectedDayCompleted = selectedDay
    ? isPastDate(selectedDay, viewMonth, viewYear)
    : false;

  const openMonthDetail = (month: number) => {
    setViewMonth(month);
    setSelectedDay(null);
    setViewMode("month");
  };

  function groupByPlot<T extends { cropId: bigint }>(
    items: T[],
  ): Record<string, T[]> {
    const groups: Record<string, T[]> = {};
    for (const item of items) {
      const plotName = plotNameMap[String(item.cropId)] || "Unknown Plot";
      if (!groups[plotName]) groups[plotName] = [];
      groups[plotName].push(item);
    }
    return groups;
  }

  const fertsByPlot = groupByPlot(selectedFerts);
  const spraysByPlot = groupByPlot(selectedSprays);

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            Farm Calendar
          </h1>
          <p className="text-muted-foreground text-sm">
            View fertilizer &amp; spray schedules by plot
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <div className="grid grid-cols-3 gap-4">
            {SKELETON_KEYS.slice(0, 12).map((k) => (
              <Skeleton key={k} className="h-48 rounded-2xl" />
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
      ) : viewMode === "year" ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewYear((y) => y - 1)}
              data-ocid="calendar.pagination_prev"
              className="rounded-xl"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="font-display font-bold text-xl text-foreground">
              {viewYear}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewYear((y) => y + 1)}
              data-ocid="calendar.pagination_next"
              className="rounded-xl"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-4 mb-5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs text-muted-foreground">Fertilizer</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span className="text-xs text-muted-foreground">Spray</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span className="text-xs text-muted-foreground">
                Completed (past dates)
              </span>
            </div>
            <span className="text-xs text-muted-foreground ml-auto italic">
              Tap a month to view details
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {MONTHS.map((_, monthIdx) => (
              <MiniMonthCard
                key={MONTHS[monthIdx]}
                year={viewYear}
                month={monthIdx}
                fertilizers={fertilizers}
                sprays={sprays}
                isCurrentMonth={
                  today.getMonth() === monthIdx &&
                  today.getFullYear() === viewYear
                }
                onClick={() => openMonthDetail(monthIdx)}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setViewMode("year");
                setSelectedDay(null);
              }}
              data-ocid="calendar.secondary_button"
              className="rounded-xl gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              {viewYear}
            </Button>
            <div className="flex items-center gap-2 flex-1 justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={prevMonth}
                data-ocid="calendar.pagination_prev"
                className="rounded-xl"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="font-display font-bold text-xl text-foreground w-48 text-center">
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
          </div>

          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs text-muted-foreground">Fertilizer</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span className="text-xs text-muted-foreground">Spray</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Completed</span>
            </div>
          </div>

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
              const isPast = day ? isPastDate(day, viewMonth, viewYear) : false;

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
                    isPast && !isSelected && day ? "opacity-70" : "",
                  ].join(" ")}
                >
                  {day && <span>{day}</span>}
                  {day && (hasFert || hasSpray) && (
                    <div className="flex gap-0.5 mt-1">
                      {hasFert && (
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSelected
                              ? "bg-white"
                              : isPast
                                ? "bg-emerald-400"
                                : "bg-emerald-500"
                          }`}
                        />
                      )}
                      {hasSpray && (
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSelected
                              ? "bg-white/80"
                              : isPast
                                ? "bg-blue-400"
                                : "bg-blue-500"
                          }`}
                        />
                      )}
                    </div>
                  )}
                  {/* Small checkmark for completed past dates */}
                  {day && isPast && (hasFert || hasSpray) && !isSelected && (
                    <CheckCircle2 className="absolute top-0.5 right-0.5 w-2.5 h-2.5 text-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {selectedDay !== null && (
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm"
                data-ocid="calendar.panel"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display font-bold text-lg">
                    {MONTHS[viewMonth]} {selectedDay}, {viewYear}
                  </h3>
                  {isSelectedDayToday ? (
                    <Badge className="gap-1 bg-primary text-primary-foreground text-xs">
                      <CalendarDays className="w-3 h-3" />
                      Today
                    </Badge>
                  ) : isSelectedDayCompleted ? (
                    <Badge className="gap-1 bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="gap-1 text-xs text-blue-600 border-blue-300"
                    >
                      <Clock className="w-3 h-3" />
                      Upcoming
                    </Badge>
                  )}
                </div>

                {selectedFerts.length === 0 && selectedSprays.length === 0 ? (
                  <p
                    className="text-muted-foreground text-sm py-4 text-center"
                    data-ocid="calendar.empty_state"
                  >
                    No tasks scheduled for this day.
                  </p>
                ) : (
                  <>
                    {selectedFerts.length > 0 && (
                      <div className="mb-5">
                        <div className="flex items-center gap-2 mb-3 mt-3">
                          <Leaf className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-sm text-emerald-700">
                            Fertilizer Tasks
                          </span>
                          <Badge variant="outline" className="text-xs ml-auto">
                            {selectedFerts.length} task
                            {selectedFerts.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        {Object.entries(fertsByPlot).map(
                          ([plotName, tasks], gi) => {
                            const baseIndex = Object.values(fertsByPlot)
                              .slice(0, gi)
                              .reduce((acc, g) => acc + g.length, 0);
                            return (
                              <PlotTaskGroup
                                key={plotName}
                                plotName={plotName}
                                tasks={tasks as any}
                                type="fertilizer"
                                cropMap={cropMap}
                                baseIndex={baseIndex}
                                isCompleted={isSelectedDayCompleted}
                              />
                            );
                          },
                        )}
                      </div>
                    )}

                    {selectedSprays.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Droplets className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-sm text-blue-700">
                            Spray Tasks
                          </span>
                          <Badge variant="outline" className="text-xs ml-auto">
                            {selectedSprays.length} task
                            {selectedSprays.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        {Object.entries(spraysByPlot).map(
                          ([plotName, tasks], gi) => {
                            const baseIndex =
                              selectedFerts.length +
                              Object.values(spraysByPlot)
                                .slice(0, gi)
                                .reduce((acc, g) => acc + g.length, 0);
                            return (
                              <PlotTaskGroup
                                key={plotName}
                                plotName={plotName}
                                tasks={tasks as any}
                                type="spray"
                                cropMap={cropMap}
                                baseIndex={baseIndex}
                                isCompleted={isSelectedDayCompleted}
                              />
                            );
                          },
                        )}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </main>
  );
}
