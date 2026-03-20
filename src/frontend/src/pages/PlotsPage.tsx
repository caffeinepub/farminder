import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  FlaskConical,
  List,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Sprout,
  Trash2,
  Wind,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type {
  Crop,
  Date_,
  FertilizerSchedule,
  SpraySchedule,
} from "../backend.d";
import {
  useAddCrop,
  useAddFertilizerSchedule,
  useAddSpraySchedule,
  useDeleteCrop,
  useDeleteFertilizerSchedule,
  useDeleteSpraySchedule,
  useGetAllFertilizerSchedules,
  useGetAllSpraySchedules,
  useGetFertilizerSchedulesForMonth,
  useGetSpraySchedulesForMonth,
  useListCrops,
  useUpdateCrop,
  useUpdateFertilizerSchedule,
  useUpdateSpraySchedule,
} from "../hooks/useQueries";

const CROP_TYPES = [
  "Wheat",
  "Rice",
  "Corn",
  "Tomato",
  "Cotton",
  "Soybean",
  "Sugarcane",
  "Custom",
];

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

let _entryId = 0;
interface ScheduleEntry {
  id: number;
  name: string;
  day: string;
  month: string;
  year: string;
  notes: string;
  quantity: string;
  unit: string;
}

function emptyEntry(): ScheduleEntry {
  const now = new Date();
  return {
    id: ++_entryId,
    name: "",
    day: "",
    month: String(now.getMonth() + 1),
    year: String(now.getFullYear()),
    notes: "",
    quantity: "",
    unit: "kg",
  };
}

function buildNotes(entry: {
  quantity: string;
  unit: string;
  notes: string;
}): string {
  const parts: string[] = [];
  if (entry.quantity.trim()) {
    parts.push(`Qty: ${entry.quantity.trim()} ${entry.unit}`);
  }
  if (entry.notes.trim()) {
    parts.push(entry.notes.trim());
  }
  return parts.join("\n");
}

function parseNotes(raw: string): {
  quantity: string;
  unit: string;
  notes: string;
} {
  const match = raw.match(/^Qty:\s*([\d.]+)\s*(kg|gram|liter|ml)\n?/);
  if (match) {
    return {
      quantity: match[1],
      unit: match[2],
      notes: raw.replace(/^Qty:\s*[\d.]+\s*(?:kg|gram|liter|ml)\n?/, "").trim(),
    };
  }
  return { quantity: "", unit: "kg", notes: raw.trim() };
}

function formatDate(d: Date_): string {
  const month = MONTHS[Number(d.month) - 1] ?? "";
  return `${Number(d.day)} ${month} ${Number(d.year)}`;
}

// ── Add Plot Dialog ──────────────────────────────────────────────────────────
function AddPlotDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { mutateAsync: addCrop, isPending } = useAddCrop();
  const [cropName, setCropName] = useState("");
  const [cropType, setCropType] = useState("");
  const [plotName, setPlotName] = useState("");

  const reset = () => {
    setCropName("");
    setCropType("");
    setPlotName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName.trim() || !cropType) return;
    try {
      await addCrop({
        name: cropName.trim(),
        cropType,
        plotName: plotName.trim(),
      });
      toast.success("Plot added!");
      reset();
      onClose();
    } catch {
      toast.error("Failed to add plot");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent data-ocid="plots.dialog" className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Add New Plot
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div>
            <Label htmlFor="add-plot-crop-name">Crop Name</Label>
            <Input
              id="add-plot-crop-name"
              data-ocid="plots.input"
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              placeholder="e.g. Summer Wheat"
            />
          </div>
          <div>
            <Label htmlFor="add-plot-crop-type">Crop Type</Label>
            <Select value={cropType} onValueChange={setCropType}>
              <SelectTrigger data-ocid="plots.select" id="add-plot-crop-type">
                <SelectValue placeholder="Select crop type..." />
              </SelectTrigger>
              <SelectContent>
                {CROP_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="add-plot-name">Plot Name</Label>
            <Input
              id="add-plot-name"
              data-ocid="plots.plot_name.input"
              value={plotName}
              onChange={(e) => setPlotName(e.target.value)}
              placeholder="e.g. Plot A, North Field"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="plots.cancel_button"
              onClick={() => {
                reset();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !cropName.trim() || !cropType}
              data-ocid="plots.submit_button"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add Plot
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Add Fertilizer Dialog ────────────────────────────────────────────────────
function AddFertilizerDialog({
  crop,
  open,
  onClose,
}: {
  crop: Crop | null;
  open: boolean;
  onClose: () => void;
}) {
  const { mutateAsync: addSchedule, isPending } = useAddFertilizerSchedule();
  const [entries, setEntries] = useState<ScheduleEntry[]>([emptyEntry()]);

  const reset = () => setEntries([emptyEntry()]);

  const updateEntry = (
    idx: number,
    field: keyof ScheduleEntry,
    val: string,
  ) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, [field]: val } : e)),
    );
  };

  const addEntry = () =>
    setEntries((prev) => {
      const last = prev[prev.length - 1];
      return [
        ...prev,
        { ...emptyEntry(), day: last.day, month: last.month, year: last.year },
      ];
    });

  const removeEntry = (idx: number) =>
    setEntries((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crop) return;
    const valid = entries.filter((en) => en.name.trim() && en.day);
    if (valid.length === 0) return;
    try {
      await Promise.all(
        valid.map((en) => {
          const scheduledDate: Date_ = {
            day: BigInt(Number(en.day)),
            month: BigInt(Number(en.month)),
            year: BigInt(Number(en.year)),
          };
          return addSchedule({
            cropId: crop.id,
            fertilizerName: en.name.trim(),
            scheduledDate,
            notes: buildNotes(en),
          });
        }),
      );
      toast.success(
        `${valid.length} fertilizer schedule${valid.length > 1 ? "s" : ""} added!`,
      );
      reset();
      onClose();
    } catch {
      toast.error("Failed to add fertilizer schedule");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent
        data-ocid="fertilizer.dialog"
        className="max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-green-700">
            Add Fertilizer Schedule
          </DialogTitle>
          {crop && (
            <p className="text-sm text-muted-foreground mt-1">
              For:{" "}
              <span className="font-semibold text-foreground">{crop.name}</span>
              {crop.plotName && (
                <span className="ml-1 text-muted-foreground">
                  · {crop.plotName}
                </span>
              )}
            </p>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {entries.map((en, idx) => (
            <div
              key={en.id}
              className="border border-border rounded-xl p-4 relative"
              data-ocid={`fertilizer.item.${idx + 1}`}
            >
              {entries.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEntry(idx)}
                  data-ocid={`fertilizer.delete_button.${idx + 1}`}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remove entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <div className="flex flex-col gap-3">
                <div>
                  <Label>Fertilizer Name</Label>
                  <Input
                    value={en.name}
                    onChange={(e) => updateEntry(idx, "name", e.target.value)}
                    placeholder="e.g. Urea, DAP"
                    data-ocid="fertilizer.input"
                  />
                </div>
                <div>
                  <Label>Quantity (optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      value={en.quantity}
                      onChange={(e) =>
                        updateEntry(idx, "quantity", e.target.value)
                      }
                      placeholder="e.g. 500"
                      className="flex-1"
                    />
                    <Select
                      value={en.unit}
                      onValueChange={(v) => updateEntry(idx, "unit", v)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="gram">gram</SelectItem>
                        <SelectItem value="liter">liter</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label>Day</Label>
                    <Input
                      type="number"
                      min={1}
                      max={31}
                      value={en.day}
                      onChange={(e) => updateEntry(idx, "day", e.target.value)}
                      placeholder="1–31"
                    />
                  </div>
                  <div>
                    <Label>Month</Label>
                    <Select
                      value={en.month}
                      onValueChange={(v) => updateEntry(idx, "month", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m, mi) => (
                          <SelectItem key={m} value={String(mi + 1)}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input
                      type="number"
                      min={2024}
                      max={2099}
                      value={en.year}
                      onChange={(e) => updateEntry(idx, "year", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Notes (optional)</Label>
                  <Textarea
                    value={en.notes}
                    onChange={(e) => updateEntry(idx, "notes", e.target.value)}
                    placeholder="Any notes..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEntry}
            data-ocid="fertilizer.secondary_button"
            className="self-start"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Another
          </Button>
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="fertilizer.cancel_button"
              onClick={() => {
                reset();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="fertilizer.submit_button"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <FlaskConical className="w-4 h-4 mr-2" />
              )}
              Save Schedule
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Add Spray Dialog ─────────────────────────────────────────────────────────
function AddSprayDialog({
  crop,
  open,
  onClose,
}: {
  crop: Crop | null;
  open: boolean;
  onClose: () => void;
}) {
  const { mutateAsync: addSchedule, isPending } = useAddSpraySchedule();
  const [entries, setEntries] = useState<ScheduleEntry[]>([emptyEntry()]);

  const reset = () => setEntries([emptyEntry()]);

  const updateEntry = (
    idx: number,
    field: keyof ScheduleEntry,
    val: string,
  ) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, [field]: val } : e)),
    );
  };

  const addEntry = () =>
    setEntries((prev) => {
      const last = prev[prev.length - 1];
      return [
        ...prev,
        { ...emptyEntry(), day: last.day, month: last.month, year: last.year },
      ];
    });

  const removeEntry = (idx: number) =>
    setEntries((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crop) return;
    const valid = entries.filter((en) => en.name.trim() && en.day);
    if (valid.length === 0) return;
    try {
      await Promise.all(
        valid.map((en) => {
          const scheduledDate: Date_ = {
            day: BigInt(Number(en.day)),
            month: BigInt(Number(en.month)),
            year: BigInt(Number(en.year)),
          };
          return addSchedule({
            cropId: crop.id,
            sprayName: en.name.trim(),
            scheduledDate,
            notes: buildNotes(en),
          });
        }),
      );
      toast.success(
        `${valid.length} spray schedule${valid.length > 1 ? "s" : ""} added!`,
      );
      reset();
      onClose();
    } catch {
      toast.error("Failed to add spray schedule");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent
        data-ocid="spray.dialog"
        className="max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-blue-700">
            Add Spray Schedule
          </DialogTitle>
          {crop && (
            <p className="text-sm text-muted-foreground mt-1">
              For:{" "}
              <span className="font-semibold text-foreground">{crop.name}</span>
              {crop.plotName && (
                <span className="ml-1 text-muted-foreground">
                  · {crop.plotName}
                </span>
              )}
            </p>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {entries.map((en, idx) => (
            <div
              key={en.id}
              className="border border-border rounded-xl p-4 relative"
              data-ocid={`spray.item.${idx + 1}`}
            >
              {entries.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEntry(idx)}
                  data-ocid={`spray.delete_button.${idx + 1}`}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remove entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <div className="flex flex-col gap-3">
                <div>
                  <Label>Spray / Chemical Name</Label>
                  <Input
                    value={en.name}
                    onChange={(e) => updateEntry(idx, "name", e.target.value)}
                    placeholder="e.g. Chlorpyrifos, Neem Oil"
                    data-ocid="spray.input"
                  />
                </div>
                <div>
                  <Label>Quantity (optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      value={en.quantity}
                      onChange={(e) =>
                        updateEntry(idx, "quantity", e.target.value)
                      }
                      placeholder="e.g. 500"
                      className="flex-1"
                    />
                    <Select
                      value={en.unit}
                      onValueChange={(v) => updateEntry(idx, "unit", v)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="gram">gram</SelectItem>
                        <SelectItem value="liter">liter</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label>Day</Label>
                    <Input
                      type="number"
                      min={1}
                      max={31}
                      value={en.day}
                      onChange={(e) => updateEntry(idx, "day", e.target.value)}
                      placeholder="1–31"
                    />
                  </div>
                  <div>
                    <Label>Month</Label>
                    <Select
                      value={en.month}
                      onValueChange={(v) => updateEntry(idx, "month", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m, mi) => (
                          <SelectItem key={m} value={String(mi + 1)}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input
                      type="number"
                      min={2024}
                      max={2099}
                      value={en.year}
                      onChange={(e) => updateEntry(idx, "year", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Notes (optional)</Label>
                  <Textarea
                    value={en.notes}
                    onChange={(e) => updateEntry(idx, "notes", e.target.value)}
                    placeholder="Any notes..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEntry}
            data-ocid="spray.secondary_button"
            className="self-start"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Another
          </Button>
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="spray.cancel_button"
              onClick={() => {
                reset();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="spray.submit_button"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Wind className="w-4 h-4 mr-2" />
              )}
              Save Schedule
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Fertilizer Dialog ────────────────────────────────────────────────────
function EditFertilizerDialog({
  schedule,
  open,
  onClose,
}: {
  schedule: FertilizerSchedule | null;
  open: boolean;
  onClose: () => void;
}) {
  const { mutateAsync: updateSchedule, isPending } =
    useUpdateFertilizerSchedule();
  const parsed = schedule
    ? parseNotes(schedule.notes)
    : { quantity: "", unit: "kg", notes: "" };
  const [name, setName] = useState(schedule?.fertilizerName ?? "");
  const [quantity, setQuantity] = useState(parsed.quantity);
  const [unit, setUnit] = useState(parsed.unit);
  const [day, setDay] = useState(
    schedule ? String(Number(schedule.scheduledDate.day)) : "",
  );
  const [month, setMonth] = useState(
    schedule ? String(Number(schedule.scheduledDate.month)) : "",
  );
  const [year, setYear] = useState(
    schedule ? String(Number(schedule.scheduledDate.year)) : "",
  );
  const [notes, setNotes] = useState(parsed.notes);

  // Reset fields when schedule changes
  const resetToSchedule = (s: FertilizerSchedule) => {
    const p = parseNotes(s.notes);
    setName(s.fertilizerName);
    setQuantity(p.quantity);
    setUnit(p.unit);
    setDay(String(Number(s.scheduledDate.day)));
    setMonth(String(Number(s.scheduledDate.month)));
    setYear(String(Number(s.scheduledDate.year)));
    setNotes(p.notes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedule || !name.trim() || !day) return;
    try {
      await updateSchedule({
        scheduleId: schedule.id,
        fertilizerName: name.trim(),
        scheduledDate: {
          day: BigInt(Number(day)),
          month: BigInt(Number(month)),
          year: BigInt(Number(year)),
        },
        notes: buildNotes({ quantity, unit, notes }),
      });
      toast.success("Fertilizer schedule updated!");
      onClose();
    } catch {
      toast.error("Failed to update schedule");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
        else if (schedule) resetToSchedule(schedule);
      }}
    >
      <DialogContent
        data-ocid="fertilizer_edit.dialog"
        className="max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-green-700">
            Edit Fertilizer Schedule
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div>
            <Label>Fertilizer Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Urea, DAP"
              data-ocid="fertilizer_edit.input"
            />
          </div>
          <div>
            <Label>Quantity (optional)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={0}
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 500"
                className="flex-1"
              />
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="gram">gram</SelectItem>
                  <SelectItem value="liter">liter</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label>Day</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={day}
                onChange={(e) => setDay(e.target.value)}
                placeholder="1–31"
              />
            </div>
            <div>
              <Label>Month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, mi) => (
                    <SelectItem key={m} value={String(mi + 1)}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Year</Label>
              <Input
                type="number"
                min={2024}
                max={2099}
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes..."
              rows={2}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="fertilizer_edit.cancel_button"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !name.trim() || !day}
              data-ocid="fertilizer_edit.save_button"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <FlaskConical className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Spray Dialog ─────────────────────────────────────────────────────────
function EditSprayDialog({
  schedule,
  open,
  onClose,
}: {
  schedule: SpraySchedule | null;
  open: boolean;
  onClose: () => void;
}) {
  const { mutateAsync: updateSchedule, isPending } = useUpdateSpraySchedule();
  const parsed = schedule
    ? parseNotes(schedule.notes)
    : { quantity: "", unit: "kg", notes: "" };
  const [name, setName] = useState(schedule?.sprayName ?? "");
  const [quantity, setQuantity] = useState(parsed.quantity);
  const [unit, setUnit] = useState(parsed.unit);
  const [day, setDay] = useState(
    schedule ? String(Number(schedule.scheduledDate.day)) : "",
  );
  const [month, setMonth] = useState(
    schedule ? String(Number(schedule.scheduledDate.month)) : "",
  );
  const [year, setYear] = useState(
    schedule ? String(Number(schedule.scheduledDate.year)) : "",
  );
  const [notes, setNotes] = useState(parsed.notes);

  const resetToSchedule = (s: SpraySchedule) => {
    const p = parseNotes(s.notes);
    setName(s.sprayName);
    setQuantity(p.quantity);
    setUnit(p.unit);
    setDay(String(Number(s.scheduledDate.day)));
    setMonth(String(Number(s.scheduledDate.month)));
    setYear(String(Number(s.scheduledDate.year)));
    setNotes(p.notes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedule || !name.trim() || !day) return;
    try {
      await updateSchedule({
        scheduleId: schedule.id,
        sprayName: name.trim(),
        scheduledDate: {
          day: BigInt(Number(day)),
          month: BigInt(Number(month)),
          year: BigInt(Number(year)),
        },
        notes: buildNotes({ quantity, unit, notes }),
      });
      toast.success("Spray schedule updated!");
      onClose();
    } catch {
      toast.error("Failed to update schedule");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
        else if (schedule) resetToSchedule(schedule);
      }}
    >
      <DialogContent
        data-ocid="spray_edit.dialog"
        className="max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-blue-700">
            Edit Spray Schedule
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div>
            <Label>Spray / Chemical Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chlorpyrifos, Neem Oil"
              data-ocid="spray_edit.input"
            />
          </div>
          <div>
            <Label>Quantity (optional)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={0}
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 500"
                className="flex-1"
              />
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="gram">gram</SelectItem>
                  <SelectItem value="liter">liter</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label>Day</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={day}
                onChange={(e) => setDay(e.target.value)}
                placeholder="1–31"
              />
            </div>
            <div>
              <Label>Month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, mi) => (
                    <SelectItem key={m} value={String(mi + 1)}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Year</Label>
              <Input
                type="number"
                min={2024}
                max={2099}
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes..."
              rows={2}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="spray_edit.cancel_button"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !name.trim() || !day}
              data-ocid="spray_edit.save_button"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Wind className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── View Schedules Dialog ────────────────────────────────────────────────────
function ViewSchedulesDialog({
  crop,
  open,
  onClose,
}: {
  crop: Crop | null;
  open: boolean;
  onClose: () => void;
}) {
  const { data: allFert } = useGetAllFertilizerSchedules();
  const { data: allSpray } = useGetAllSpraySchedules();
  const { mutateAsync: deleteFert } = useDeleteFertilizerSchedule();
  const { mutateAsync: deleteSpray } = useDeleteSpraySchedule();

  const [editFertSchedule, setEditFertSchedule] =
    useState<FertilizerSchedule | null>(null);
  const [editSpraySchedule, setEditSpraySchedule] =
    useState<SpraySchedule | null>(null);
  const [deleteFertId, setDeleteFertId] = useState<bigint | null>(null);
  const [deleteSprayId, setDeleteSprayId] = useState<bigint | null>(null);

  const fertSchedules = (allFert ?? []).filter(
    (s) => crop && s.cropId === crop.id,
  );
  const spraySchedules = (allSpray ?? []).filter(
    (s) => crop && s.cropId === crop.id,
  );

  const handleDeleteFert = async () => {
    if (deleteFertId == null) return;
    try {
      await deleteFert(deleteFertId);
      toast.success("Fertilizer schedule deleted!");
    } catch {
      toast.error("Failed to delete schedule");
    } finally {
      setDeleteFertId(null);
    }
  };

  const handleDeleteSpray = async () => {
    if (deleteSprayId == null) return;
    try {
      await deleteSpray(deleteSprayId);
      toast.success("Spray schedule deleted!");
    } catch {
      toast.error("Failed to delete schedule");
    } finally {
      setDeleteSprayId(null);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) onClose();
        }}
      >
        <DialogContent
          data-ocid="view_schedules.dialog"
          className="max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Schedules
            </DialogTitle>
            {crop && (
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-semibold text-foreground">
                  {crop.name}
                </span>
                {crop.plotName && (
                  <span className="ml-1 text-muted-foreground">
                    · {crop.plotName}
                  </span>
                )}
              </p>
            )}
          </DialogHeader>

          <Tabs defaultValue="fertilizer" className="mt-2">
            <TabsList className="w-full">
              <TabsTrigger
                value="fertilizer"
                className="flex-1"
                data-ocid="view_schedules.tab"
              >
                <FlaskConical className="w-4 h-4 mr-1.5 text-green-600" />
                Fertilizer ({fertSchedules.length})
              </TabsTrigger>
              <TabsTrigger
                value="spray"
                className="flex-1"
                data-ocid="view_schedules.tab"
              >
                <Wind className="w-4 h-4 mr-1.5 text-blue-600" />
                Spray ({spraySchedules.length})
              </TabsTrigger>
            </TabsList>

            {/* Fertilizer Tab */}
            <TabsContent value="fertilizer" className="mt-3">
              {fertSchedules.length === 0 ? (
                <div
                  className="text-center py-10 text-muted-foreground"
                  data-ocid="view_schedules.empty_state"
                >
                  <FlaskConical className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No fertilizer schedules added yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {fertSchedules.map((s, i) => {
                    const { quantity, unit, notes } = parseNotes(s.notes);
                    return (
                      <div
                        key={s.id.toString()}
                        className="flex items-start gap-3 p-3 border border-border rounded-xl bg-green-50/50"
                        data-ocid={`view_schedules.item.${i + 1}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">
                            {s.fertilizerName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(s.scheduledDate)}
                          </p>
                          {quantity && (
                            <Badge className="mt-1 text-xs bg-green-100 text-green-700 border-green-200">
                              {quantity} {unit}
                            </Badge>
                          )}
                          {notes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setEditFertSchedule(s)}
                            data-ocid={`view_schedules.edit_button.${i + 1}`}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-green-700 hover:bg-green-100 transition-colors"
                            aria-label="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteFertId(s.id)}
                            data-ocid={`view_schedules.delete_button.${i + 1}`}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Spray Tab */}
            <TabsContent value="spray" className="mt-3">
              {spraySchedules.length === 0 ? (
                <div
                  className="text-center py-10 text-muted-foreground"
                  data-ocid="view_schedules.empty_state"
                >
                  <Wind className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No spray schedules added yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {spraySchedules.map((s, i) => {
                    const { quantity, unit, notes } = parseNotes(s.notes);
                    return (
                      <div
                        key={s.id.toString()}
                        className="flex items-start gap-3 p-3 border border-border rounded-xl bg-blue-50/50"
                        data-ocid={`view_schedules.item.${i + 1}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{s.sprayName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(s.scheduledDate)}
                          </p>
                          {quantity && (
                            <Badge className="mt-1 text-xs bg-blue-100 text-blue-700 border-blue-200">
                              {quantity} {unit}
                            </Badge>
                          )}
                          {notes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setEditSpraySchedule(s)}
                            data-ocid={`view_schedules.edit_button.${i + 1}`}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-700 hover:bg-blue-100 transition-colors"
                            aria-label="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteSprayId(s.id)}
                            data-ocid={`view_schedules.delete_button.${i + 1}`}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Edit Dialogs */}
      <EditFertilizerDialog
        schedule={editFertSchedule}
        open={!!editFertSchedule}
        onClose={() => setEditFertSchedule(null)}
      />
      <EditSprayDialog
        schedule={editSpraySchedule}
        open={!!editSpraySchedule}
        onClose={() => setEditSpraySchedule(null)}
      />

      {/* Delete Confirm Dialogs */}
      <AlertDialog
        open={deleteFertId != null}
        onOpenChange={(o) => {
          if (!o) setDeleteFertId(null);
        }}
      >
        <AlertDialogContent data-ocid="view_schedules.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fertilizer Schedule?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the fertilizer schedule. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="view_schedules.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFert}
              data-ocid="view_schedules.confirm_button"
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteSprayId != null}
        onOpenChange={(o) => {
          if (!o) setDeleteSprayId(null);
        }}
      >
        <AlertDialogContent data-ocid="view_schedules.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Spray Schedule?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the spray schedule. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="view_schedules.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSpray}
              data-ocid="view_schedules.confirm_button"
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── Plot Card ────────────────────────────────────────────────────────────────
function PlotCard({
  crop,
  index,
  fertilizerCount,
  sprayCount,
  onAddFertilizer,
  onAddSpray,
  onViewSchedules,
  onDelete,
  onEdit,
}: {
  crop: Crop;
  index: number;
  fertilizerCount: number;
  sprayCount: number;
  onAddFertilizer: (crop: Crop) => void;
  onAddSpray: (crop: Crop) => void;
  onViewSchedules: (crop: Crop) => void;
  onDelete: (crop: Crop) => void;
  onEdit: (crop: Crop) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      data-ocid={`plots.item.${index + 1}`}
      className="bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base truncate">{crop.name}</p>
          <div className="flex items-center gap-2 flex-wrap mt-1.5">
            <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
              {crop.cropType}
            </Badge>
            {crop.plotName && (
              <Badge
                variant="outline"
                className="text-xs flex items-center gap-1"
              >
                <MapPin className="w-3 h-3" />
                {crop.plotName}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <Sprout className="w-5 h-5 text-primary" />
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={() => onEdit(crop)}
            data-ocid="plots.edit_button"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(crop)}
            data-ocid="plots.delete_button"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Schedule counts */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 bg-green-50 rounded-lg px-3 py-2 text-center">
          <p className="text-xl font-bold text-green-700">{fertilizerCount}</p>
          <p className="text-xs text-green-600">Fertilizer this month</p>
        </div>
        <div className="flex-1 bg-blue-50 rounded-lg px-3 py-2 text-center">
          <p className="text-xl font-bold text-blue-700">{sprayCount}</p>
          <p className="text-xs text-blue-600">Spray this month</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          data-ocid={`plots.fertilizer_button.${index + 1}`}
          onClick={() => onAddFertilizer(crop)}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
        >
          <FlaskConical className="w-3.5 h-3.5 mr-1" />
          Add Fertilizer
        </Button>
        <Button
          size="sm"
          data-ocid={`plots.spray_button.${index + 1}`}
          onClick={() => onAddSpray(crop)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
        >
          <Wind className="w-3.5 h-3.5 mr-1" />
          Add Spray
        </Button>
        <Button
          size="sm"
          variant="outline"
          data-ocid={`plots.view_button.${index + 1}`}
          onClick={() => onViewSchedules(crop)}
          className="w-full text-xs mt-0.5"
        >
          <List className="w-3.5 h-3.5 mr-1" />
          View Schedules
        </Button>
      </div>
    </motion.div>
  );
}

// ── Main PlotsPage ───────────────────────────────────────────────────────────
export default function PlotsPage() {
  const now = new Date();
  const { data: crops, isLoading } = useListCrops();
  const { data: fertSchedules } = useGetFertilizerSchedulesForMonth(
    now.getMonth() + 1,
    now.getFullYear(),
  );
  const { data: spraySchedules } = useGetSpraySchedulesForMonth(
    now.getMonth() + 1,
    now.getFullYear(),
  );

  const [addPlotOpen, setAddPlotOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Crop | null>(null);
  const [editTarget, setEditTarget] = useState<Crop | null>(null);
  const [editPlotName, setEditPlotName] = useState("");
  const { mutateAsync: deleteCrop } = useDeleteCrop();
  const { mutateAsync: updateCrop } = useUpdateCrop();

  const handleEditPlot = async () => {
    if (!editTarget) return;
    try {
      await updateCrop({
        cropId: editTarget.id,
        name: editTarget.name,
        cropType: editTarget.cropType,
        plotName: editPlotName.trim() || editTarget.plotName,
      });
      toast.success("Plot updated");
    } catch {
      toast.error("Failed to update plot");
    } finally {
      setEditTarget(null);
    }
  };
  const [fertTarget, setFertTarget] = useState<Crop | null>(null);
  const [sprayTarget, setSprayTarget] = useState<Crop | null>(null);
  const [viewTarget, setViewTarget] = useState<Crop | null>(null);

  // Group crops by cropType
  const grouped = (crops ?? []).reduce<Record<string, Crop[]>>((acc, crop) => {
    const key = crop.cropType || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(crop);
    return acc;
  }, {});

  const { data: allFertSchedules } = useGetAllFertilizerSchedules();
  const { data: allSpraySchedules } = useGetAllSpraySchedules();
  const { mutateAsync: deleteFert } = useDeleteFertilizerSchedule();
  const { mutateAsync: deleteSpray } = useDeleteSpraySchedule();

  const handleDeletePlot = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCrop(deleteTarget.id);
      const fertsToDelete = (allFertSchedules ?? []).filter(
        (s) => s.cropId === deleteTarget.id,
      );
      const spraysToDelete = (allSpraySchedules ?? []).filter(
        (s) => s.cropId === deleteTarget.id,
      );
      await Promise.all([
        ...fertsToDelete.map((s) => deleteFert(s.id)),
        ...spraysToDelete.map((s) => deleteSpray(s.id)),
      ]);
      toast.success("Plot deleted");
    } catch {
      toast.error("Failed to delete plot");
    } finally {
      setDeleteTarget(null);
    }
  };

  const getFertCount = (cropId: bigint) =>
    (fertSchedules ?? []).filter((s) => s.cropId === cropId).length;

  const getSprayCount = (cropId: bigint) =>
    (spraySchedules ?? []).filter((s) => s.cropId === cropId).length;

  let globalIndex = 0;

  return (
    <main className="container mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl mb-1">My Plots</h1>
            <p className="text-muted-foreground">
              View and manage fertilizer &amp; spray schedules per plot.
            </p>
          </div>
          <Button
            onClick={() => setAddPlotOpen(true)}
            data-ocid="plots.open_modal_button"
            className="rounded-full gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Plot
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-6" data-ocid="plots.loading_state">
            {[1, 2].map((g) => (
              <div key={g}>
                <Skeleton className="h-6 w-32 mb-3 rounded-full" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-52 rounded-2xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && (!crops || crops.length === 0) && (
          <div
            className="text-center py-20 rounded-2xl border border-dashed border-border"
            data-ocid="plots.empty_state"
          >
            <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold text-muted-foreground">No plots yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-5">
              Click "Add Plot" to register your first crop plot.
            </p>
            <Button
              onClick={() => setAddPlotOpen(true)}
              data-ocid="plots.primary_button"
              className="rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Plot
            </Button>
          </div>
        )}

        {/* Grouped by crop type */}
        {!isLoading && crops && crops.length > 0 && (
          <div className="space-y-10">
            <AnimatePresence>
              {Object.entries(grouped).map(([type, typeCrops]) => (
                <motion.section
                  key={type}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  data-ocid="plots.section"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="font-display font-bold text-xl">{type}</h2>
                    <Badge className="rounded-full bg-primary/10 text-primary border-primary/20">
                      {typeCrops.length}{" "}
                      {typeCrops.length === 1 ? "plot" : "plots"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {typeCrops.map((crop) => {
                      const idx = globalIndex++;
                      return (
                        <PlotCard
                          key={crop.id.toString()}
                          crop={crop}
                          index={idx}
                          fertilizerCount={getFertCount(crop.id)}
                          sprayCount={getSprayCount(crop.id)}
                          onAddFertilizer={setFertTarget}
                          onAddSpray={setSprayTarget}
                          onViewSchedules={setViewTarget}
                          onDelete={setDeleteTarget}
                          onEdit={(c) => {
                            setEditTarget(c);
                            setEditPlotName(c.plotName);
                          }}
                        />
                      );
                    })}
                  </div>
                </motion.section>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Dialogs */}
      <AddPlotDialog open={addPlotOpen} onClose={() => setAddPlotOpen(false)} />
      {/* Edit Plot Dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
      >
        <DialogContent
          className="sm:max-w-md rounded-2xl"
          data-ocid="plots.dialog"
        >
          <DialogHeader>
            <DialogTitle>Edit Plot</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Update the plot name for this crop.
            </p>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div>
              <Label>Crop Name</Label>
              <Input
                value={editTarget?.name ?? ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label>Plot Name</Label>
              <Input
                value={editPlotName}
                onChange={(e) => setEditPlotName(e.target.value)}
                placeholder="e.g. North Field"
                data-ocid="plots.input"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setEditTarget(null)}
              data-ocid="plots.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={handleEditPlot} data-ocid="plots.save_button">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <AddFertilizerDialog
        crop={fertTarget}
        open={!!fertTarget}
        onClose={() => setFertTarget(null)}
      />
      <AddSprayDialog
        crop={sprayTarget}
        open={!!sprayTarget}
        onClose={() => setSprayTarget(null)}
      />
      <ViewSchedulesDialog
        crop={viewTarget}
        open={!!viewTarget}
        onClose={() => setViewTarget(null)}
      />
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plot?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteTarget?.name}" and all its
              fertilizer and spray schedules. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="plots.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlot}
              data-ocid="plots.confirm_button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
