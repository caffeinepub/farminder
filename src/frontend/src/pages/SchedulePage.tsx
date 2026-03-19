import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  ChevronRight,
  Leaf,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Date_, FertilizerSchedule } from "../backend.d";
import {
  useAddFertilizerSchedule,
  useGetFertilizerSchedulesForMonth,
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

type CalendarCell = { key: string; day: number | null };
type CalendarRow = { key: string; cells: CalendarCell[] };

function buildCalendarRows(year: number, month: number): CalendarRow[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const allCells: CalendarCell[] = [];
  for (let p = 0; p < startOffset; p++)
    allCells.push({ key: `pad-s-${p}`, day: null });
  for (let d = 1; d <= daysInMonth; d++)
    allCells.push({ key: `day-${d}`, day: d });
  while (allCells.length % 7 !== 0)
    allCells.push({ key: `pad-e-${allCells.length}`, day: null });
  const rows: CalendarRow[] = [];
  for (let r = 0; r < allCells.length / 7; r++) {
    const slice = allCells.slice(r * 7, r * 7 + 7);
    const firstDayCell = slice.find((c) => c.day !== null);
    rows.push({
      key: firstDayCell ? `row-${firstDayCell.day}` : `row-pad-${r}`,
      cells: slice,
    });
  }
  return rows;
}

let rowCounter = 0;
type FertilizerRow = {
  id: string;
  cropId: string;
  fertilizerName: string;
  notes: string;
};

const emptyRow = (): FertilizerRow => ({
  id: `frow-${++rowCounter}`,
  cropId: "",
  fertilizerName: "",
  notes: "",
});

export default function SchedulePage() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [scheduleDay, setScheduleDay] = useState("");
  const [rows, setRows] = useState<FertilizerRow[]>([emptyRow()]);

  const { data: schedules, isLoading: schedulesLoading } =
    useGetFertilizerSchedulesForMonth(viewMonth, viewYear);
  const { data: crops, isLoading: cropsLoading } = useListCrops();
  const { mutateAsync: addSchedule, isPending: adding } =
    useAddFertilizerSchedule();

  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
    setSelectedDay(null);
  };

  const calendarRows = buildCalendarRows(viewYear, viewMonth);

  const scheduleMap = new Map<number, FertilizerSchedule[]>();
  for (const s of schedules ?? []) {
    const d = Number(s.scheduledDate.day);
    if (!scheduleMap.has(d)) scheduleMap.set(d, []);
    scheduleMap.get(d)!.push(s);
  }

  const cropMap = new Map((crops ?? []).map((c) => [c.id.toString(), c]));
  const daySchedules = selectedDay ? (scheduleMap.get(selectedDay) ?? []) : [];

  const updateRow = (
    id: string,
    field: keyof Omit<FertilizerRow, "id">,
    value: string,
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const removeRow = (id: string) => {
    setRows((prev) =>
      prev.length > 1 ? prev.filter((r) => r.id !== id) : prev,
    );
  };

  const isFormValid =
    scheduleDay && rows.every((r) => r.cropId && r.fertilizerName);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    const scheduledDate: Date_ = {
      day: BigInt(scheduleDay),
      month: BigInt(viewMonth),
      year: BigInt(viewYear),
    };
    try {
      await Promise.all(
        rows.map((row) =>
          addSchedule({
            cropId: BigInt(row.cropId),
            fertilizerName: row.fertilizerName,
            scheduledDate,
            notes: row.notes,
          }),
        ),
      );
      toast.success(
        rows.length > 1 ? `${rows.length} schedules added!` : "Schedule added!",
      );
      setAddOpen(false);
      setRows([emptyRow()]);
      setScheduleDay("");
    } catch {
      toast.error("Failed to add schedule");
    }
  };

  return (
    <main className="container mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl mb-1">
              Fertilizer Schedule
            </h1>
            <p className="text-muted-foreground">
              Plan your monthly fertilizer applications.
            </p>
          </div>
          <Button
            data-ocid="schedule.open_modal_button"
            onClick={() => setAddOpen(true)}
            className="rounded-full"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Schedule
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    data-ocid="schedule.pagination_prev"
                    onClick={prevMonth}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full h-7 px-3 text-xs"
                      onClick={() => {
                        setViewMonth(today.getMonth() + 1);
                        setViewYear(today.getFullYear());
                      }}
                    >
                      Today
                    </Button>
                    <span className="font-semibold">
                      {MONTH_NAMES[viewMonth - 1]} {viewYear}
                    </span>
                  </div>
                  <button
                    type="button"
                    data-ocid="schedule.pagination_next"
                    onClick={nextMonth}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (d) => (
                      <div
                        key={d}
                        className="text-center text-xs font-semibold text-muted-foreground py-2"
                      >
                        {d}
                      </div>
                    ),
                  )}
                </div>
                {schedulesLoading ? (
                  <Skeleton
                    className="h-64 w-full rounded-xl"
                    data-ocid="schedule.loading_state"
                  />
                ) : (
                  calendarRows.map((row) => (
                    <div key={row.key} className="grid grid-cols-7 gap-1 mb-1">
                      {row.cells.map((cell) => {
                        const events = cell.day
                          ? (scheduleMap.get(cell.day) ?? [])
                          : [];
                        const isToday =
                          cell.day === today.getDate() &&
                          viewMonth === today.getMonth() + 1 &&
                          viewYear === today.getFullYear();
                        const isSelected = cell.day === selectedDay;
                        return (
                          <button
                            key={cell.key}
                            type="button"
                            disabled={!cell.day}
                            onClick={() =>
                              cell.day &&
                              setSelectedDay(
                                cell.day === selectedDay ? null : cell.day,
                              )
                            }
                            className={`min-h-[64px] rounded-lg p-1.5 text-left transition-colors ${
                              !cell.day
                                ? "cursor-default"
                                : isSelected
                                  ? "bg-primary/10 border border-primary"
                                  : isToday
                                    ? "bg-accent border border-primary/30"
                                    : "hover:bg-muted"
                            }`}
                          >
                            {cell.day && (
                              <>
                                <span
                                  className={`text-xs font-semibold block text-center mb-0.5 ${
                                    isToday ? "text-primary" : "text-foreground"
                                  }`}
                                >
                                  {cell.day}
                                </span>
                                <div className="space-y-0.5">
                                  {events.slice(0, 2).map((ev) => (
                                    <div
                                      key={ev.id.toString()}
                                      className="bg-primary rounded text-white text-[9px] px-1 py-0.5 truncate"
                                    >
                                      {ev.fertilizerName}
                                    </div>
                                  ))}
                                  {events.length > 2 && (
                                    <div className="text-[9px] text-muted-foreground pl-1">
                                      +{events.length - 2}
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="shadow-card sticky top-24">
              <CardHeader>
                <CardTitle className="font-display text-lg">
                  {selectedDay
                    ? `${selectedDay} ${MONTH_NAMES[viewMonth - 1]}`
                    : "Select a day"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedDay ? (
                  <p className="text-sm text-muted-foreground">
                    Click on a day to see scheduled tasks.
                  </p>
                ) : daySchedules.length === 0 ? (
                  <div
                    data-ocid="schedule.empty_state"
                    className="text-center py-6"
                  >
                    <Leaf className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No tasks this day
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 rounded-full"
                      onClick={() => {
                        setScheduleDay(String(selectedDay));
                        setAddOpen(true);
                      }}
                    >
                      Add Task
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {daySchedules.map((s, i) => {
                      const crop = cropMap.get(s.cropId.toString());
                      return (
                        <div
                          key={s.id.toString()}
                          data-ocid={`schedule.item.${i + 1}`}
                          className={`p-3 rounded-xl border ${
                            s.isDone
                              ? "opacity-60 bg-muted/50"
                              : "bg-background"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">
                                {crop?.name ?? "Unknown"}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {s.fertilizerName}
                              </p>
                              {s.notes && (
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                  {s.notes}
                                </p>
                              )}
                            </div>
                            {s.isDone ? (
                              <Badge className="shrink-0 text-xs">Done</Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="shrink-0 text-xs text-primary border-primary"
                              >
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) {
            setRows([emptyRow()]);
            setScheduleDay("");
          }
        }}
      >
        <DialogContent
          data-ocid="schedule.dialog"
          className="max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Add Fertilizer Schedule
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="flex flex-col gap-4 mt-2">
            <div>
              <Label htmlFor="schedule-day">Day of Month</Label>
              <Input
                id="schedule-day"
                type="number"
                min={1}
                max={31}
                value={scheduleDay}
                onChange={(e) => setScheduleDay(e.target.value)}
                placeholder={`1 – ${new Date(viewYear, viewMonth, 0).getDate()}`}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Fertilizer Entries</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  data-ocid="schedule.secondary_button"
                  className="rounded-full h-7 px-3 text-xs"
                  onClick={addRow}
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Another
                </Button>
              </div>

              {rows.map((row, index) => (
                <div
                  key={row.id}
                  className="rounded-xl border border-border p-3 space-y-3 relative"
                  data-ocid={`schedule.item.${index + 1}`}
                >
                  {rows.length > 1 && (
                    <button
                      type="button"
                      data-ocid={`schedule.delete_button.${index + 1}`}
                      onClick={() => removeRow(row.id)}
                      className="absolute top-2 right-2 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      aria-label="Remove entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {cropsLoading ? (
                    <Skeleton className="h-9 w-full" />
                  ) : (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Crop
                      </Label>
                      <Select
                        value={row.cropId}
                        onValueChange={(v) => updateRow(row.id, "cropId", v)}
                      >
                        <SelectTrigger data-ocid="schedule.select">
                          <SelectValue placeholder="Select crop..." />
                        </SelectTrigger>
                        <SelectContent>
                          {(crops ?? []).map((c) => (
                            <SelectItem
                              key={c.id.toString()}
                              value={c.id.toString()}
                            >
                              {c.name} ({c.cropType})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      Fertilizer Name
                    </Label>
                    <Input
                      data-ocid="schedule.input"
                      value={row.fertilizerName}
                      onChange={(e) =>
                        updateRow(row.id, "fertilizerName", e.target.value)
                      }
                      placeholder="e.g. Urea, NPK 20-20-20"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      Notes (optional)
                    </Label>
                    <Textarea
                      data-ocid="schedule.textarea"
                      value={row.notes}
                      onChange={(e) =>
                        updateRow(row.id, "notes", e.target.value)
                      }
                      placeholder="Any extra details..."
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-1">
              <Button
                type="button"
                variant="outline"
                data-ocid="schedule.cancel_button"
                className="rounded-full flex-1"
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="schedule.submit_button"
                disabled={adding || !isFormValid}
                className="rounded-full flex-1"
              >
                {adding ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {rows.length > 1
                  ? `Add ${rows.length} Schedules`
                  : "Add Schedule"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
