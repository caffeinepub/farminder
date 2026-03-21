import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  MapPin,
  Package,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  useGetFertilizerSchedulesForMonth,
  useGetSpraySchedulesForMonth,
  useListCrops,
} from "../hooks/useQueries";

const MONTH_NAMES = [
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

const SKELETON_KEYS = ["sk-0", "sk-1", "sk-2", "sk-3", "sk-4", "sk-5"];

type MaterialItem = {
  id: string;
  type: "Fertilizer" | "Spray";
  name: string;
  day: number;
  month: number;
  year: number;
  plotName: string;
  notes: string;
  isDone: boolean;
};

export default function MaterialsPage() {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const { data: fertilizers, isLoading: fertLoading } =
    useGetFertilizerSchedulesForMonth(selectedMonth, selectedYear);
  const { data: sprays, isLoading: sprayLoading } =
    useGetSpraySchedulesForMonth(selectedMonth, selectedYear);
  const { data: crops } = useListCrops();

  const cropMap = new Map<string, string>();
  if (crops) {
    for (const c of crops) {
      cropMap.set(String(c.id), c.plotName);
    }
  }

  const items: MaterialItem[] = [];

  if (fertilizers) {
    for (const f of fertilizers) {
      items.push({
        id: `f-${f.id}`,
        type: "Fertilizer",
        name: f.fertilizerName,
        day: Number(f.scheduledDate.day),
        month: Number(f.scheduledDate.month),
        year: Number(f.scheduledDate.year),
        plotName: cropMap.get(String(f.cropId)) ?? "Unknown Plot",
        notes: f.notes,
        isDone: f.isDone,
      });
    }
  }

  if (sprays) {
    for (const s of sprays) {
      items.push({
        id: `s-${s.id}`,
        type: "Spray",
        name: s.sprayName,
        day: Number(s.scheduledDate.day),
        month: Number(s.scheduledDate.month),
        year: Number(s.scheduledDate.year),
        plotName: cropMap.get(String(s.cropId)) ?? "Unknown Plot",
        notes: s.notes,
        isDone: s.isDone,
      });
    }
  }

  items.sort((a, b) => a.day - b.day);

  const isLoading = fertLoading || sprayLoading;

  const goToPrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "oklch(0.62 0.18 140)" }}
          >
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">
              Materials
            </h1>
            <p className="text-muted-foreground text-sm">
              Monthly fertilizer &amp; spray checklist
            </p>
          </div>
        </div>

        {/* Month navigator */}
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-sm">
          <button
            type="button"
            data-ocid="materials.pagination_prev"
            onClick={goToPrevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-base text-foreground min-w-[140px] text-center">
            {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
          </span>
          <button
            type="button"
            data-ocid="materials.pagination_next"
            onClick={goToNextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary pill */}
      {!isLoading && items.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {items.filter((i) => i.type === "Fertilizer").length} Fertilizer
            {items.filter((i) => i.type === "Fertilizer").length !== 1
              ? "s"
              : ""}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {items.filter((i) => i.type === "Spray").length} Spray
            {items.filter((i) => i.type === "Spray").length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div
          data-ocid="materials.loading_state"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {SKELETON_KEYS.map((skKey) => (
            <div
              key={skKey}
              className="rounded-xl border border-border bg-card p-5 space-y-3"
            >
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <div
          data-ocid="materials.empty_state"
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "oklch(0.96 0.04 140)" }}
          >
            <Package
              className="w-8 h-8"
              style={{ color: "oklch(0.55 0.15 140)" }}
            />
          </div>
          <h3 className="font-semibold text-lg text-foreground mb-1">
            No materials scheduled
          </h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            No fertilizers or sprays are scheduled for{" "}
            {MONTH_NAMES[selectedMonth - 1]} {selectedYear}. Add schedules from
            the Plots section.
          </p>
        </div>
      )}

      {/* 3-column grid */}
      {!isLoading && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, idx) => {
            const isFert = item.type === "Fertilizer";
            const isPast = item.isDone;

            return (
              <motion.div
                key={item.id}
                data-ocid={`materials.item.${idx + 1}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className={`relative rounded-xl border bg-card shadow-sm p-5 flex flex-col gap-3 transition-opacity ${
                  isPast ? "opacity-70" : ""
                }`}
                style={{
                  borderColor: isFert
                    ? "oklch(0.85 0.10 140)"
                    : "oklch(0.82 0.08 250)",
                }}
              >
                {/* Done ribbon */}
                {isPast && (
                  <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase tracking-wide">
                    Done
                  </span>
                )}

                {/* Badge */}
                <div>
                  <Badge
                    className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${
                      isFert
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-blue-100 text-blue-700 border-blue-200"
                    }`}
                    variant="outline"
                  >
                    {item.type}
                  </Badge>
                </div>

                {/* Name */}
                <h3 className="font-bold text-lg text-foreground leading-tight">
                  {item.name}
                </h3>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "oklch(0.55 0.15 140)" }}
                  />
                  <span>
                    {item.day} {MONTH_NAMES[item.month - 1]} {item.year}
                  </span>
                </div>

                {/* Plot */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "oklch(0.55 0.12 250)" }}
                  />
                  <span>{item.plotName}</span>
                </div>

                {/* Qty / Notes */}
                {item.notes && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <FlaskConical
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{ color: "oklch(0.55 0.14 290)" }}
                    />
                    <span>
                      <span className="font-medium text-foreground">
                        Qty/Notes:{" "}
                      </span>
                      {item.notes}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </main>
  );
}
