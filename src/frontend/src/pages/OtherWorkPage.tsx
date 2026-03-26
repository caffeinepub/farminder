import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  Loader2,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

export interface OtherWork {
  id: bigint;
  plotName: string;
  workDescription: string;
  scheduledDate: { day: bigint; month: bigint; year: bigint };
  notes: string;
  isDone: boolean;
}

function padTwo(n: number) {
  return String(n).padStart(2, "0");
}

function dateObjToStr(d: { day: bigint; month: bigint; year: bigint }): string {
  return `${d.year}-${padTwo(Number(d.month))}-${padTwo(Number(d.day))}`;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function todayStr() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

export default function OtherWorkPage() {
  const { actor } = useActor();
  const qc = useQueryClient();

  const [plotName, setPlotName] = useState("");
  const [workDescription, setWorkDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState(todayStr());
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingDone, setPendingDone] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const { data: allWork = [], isLoading } = useQuery<OtherWork[]>({
    queryKey: ["otherWork"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllOtherWork() as Promise<OtherWork[]>;
    },
    enabled: !!actor,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    if (!plotName.trim() || !workDescription.trim() || !scheduledDate) {
      toast.error("Please fill in plot name, work description, and date.");
      return;
    }
    setSubmitting(true);
    try {
      const [y, m, d] = scheduledDate.split("-").map(Number);
      await (actor as any).addOtherWork(
        plotName.trim(),
        workDescription.trim(),
        { day: BigInt(d), month: BigInt(m), year: BigInt(y) },
        notes.trim(),
      );
      qc.invalidateQueries({ queryKey: ["otherWork"] });
      setPlotName("");
      setWorkDescription("");
      setScheduledDate(todayStr());
      setNotes("");
      toast.success("Work entry added!");
    } catch {
      toast.error("Failed to add work entry.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkDone = async (id: bigint) => {
    if (!actor) return;
    const key = id.toString();
    setPendingDone(key);
    try {
      await (actor as any).markOtherWorkAsDone(id);
      qc.invalidateQueries({ queryKey: ["otherWork"] });
      toast.success("Marked as done!");
    } catch {
      toast.error("Failed to mark as done.");
    } finally {
      setPendingDone(null);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!actor) return;
    const key = id.toString();
    setPendingDelete(key);
    try {
      await (actor as any).deleteOtherWork(id);
      qc.invalidateQueries({ queryKey: ["otherWork"] });
      toast.success("Entry deleted.");
    } catch {
      toast.error("Failed to delete entry.");
    } finally {
      setPendingDelete(null);
    }
  };

  // Sort by date descending
  const sorted = [...allWork].sort((a, b) =>
    dateObjToStr(b.scheduledDate).localeCompare(dateObjToStr(a.scheduledDate)),
  );

  // Group by date string
  const grouped = new Map<string, OtherWork[]>();
  for (const entry of sorted) {
    const ds = dateObjToStr(entry.scheduledDate);
    const list = grouped.get(ds) ?? [];
    list.push(entry);
    grouped.set(ds, list);
  }
  const groupDates = [...grouped.keys()].sort((a, b) => b.localeCompare(a));

  return (
    <main className="container mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <Briefcase className="w-7 h-7 text-primary" />
          <h1 className="font-display font-bold text-3xl">Other Work</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Log other tasks for your plots and track them by date.
        </p>

        {/* Add Form */}
        <Card className="shadow-card mb-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="w-4 h-4" />
              Add Work Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="ow-plot">Plot Name</Label>
                  <Input
                    id="ow-plot"
                    data-ocid="other_work.input"
                    placeholder="e.g. North Field"
                    value={plotName}
                    onChange={(e) => setPlotName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ow-date">Date</Label>
                  <Input
                    id="ow-date"
                    type="date"
                    data-ocid="other_work.input"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ow-desc">Work Description</Label>
                <Textarea
                  id="ow-desc"
                  data-ocid="other_work.textarea"
                  placeholder="Describe the work to be done..."
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ow-notes">
                  Notes{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="ow-notes"
                  data-ocid="other_work.input"
                  placeholder="Any additional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                data-ocid="other_work.submit_button"
                disabled={submitting || !actor}
                className="rounded-full"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Add Work
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Entries */}
        <h2 className="font-display font-bold text-xl mb-5 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          All Work Entries
        </h2>

        {isLoading ? (
          <div className="space-y-3" data-ocid="other_work.loading_state">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : allWork.length === 0 ? (
          <div
            className="text-center py-16 rounded-2xl border border-dashed border-border"
            data-ocid="other_work.empty_state"
          >
            <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold text-muted-foreground">
              No work entries yet
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Use the form above to log your first work entry.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <AnimatePresence>
              {groupDates.map((date) => {
                const dayEntries = grouped.get(date) ?? [];
                const today = todayStr();
                const isPast = date < today;
                const isToday = date === today;
                return (
                  <motion.div
                    key={date}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <CalendarDays className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold text-sm text-muted-foreground">
                        {formatDate(date)}
                      </span>
                      {isToday && (
                        <Badge className="bg-primary text-white text-xs">
                          Today
                        </Badge>
                      )}
                      {isPast && !isToday && (
                        <Badge
                          variant="outline"
                          className="text-xs text-muted-foreground"
                        >
                          Past
                        </Badge>
                      )}
                      {!isPast && !isToday && (
                        <Badge className="bg-amber-500 text-white text-xs">
                          Upcoming
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-3 pl-7">
                      {dayEntries.map((entry, i) => {
                        const idKey = entry.id.toString();
                        const isDonePending = pendingDone === idKey;
                        const isDeletePending = pendingDelete === idKey;
                        return (
                          <motion.div
                            key={idKey}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            data-ocid={`other_work.item.${i + 1}`}
                            className={`rounded-xl border p-4 ${
                              entry.isDone
                                ? "bg-muted/40 border-border opacity-70"
                                : "bg-white border-amber-100 shadow-xs"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                                  entry.isDone ? "bg-green-100" : "bg-amber-50"
                                }`}
                              >
                                {entry.isDone ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Briefcase className="w-4 h-4 text-amber-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`font-semibold ${
                                    entry.isDone
                                      ? "line-through text-muted-foreground"
                                      : ""
                                  }`}
                                >
                                  {entry.workDescription}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  <MapPin className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    {entry.plotName}
                                  </span>
                                  {entry.isDone && (
                                    <Badge className="bg-green-600 text-white text-xs ml-1">
                                      Done
                                    </Badge>
                                  )}
                                </div>
                                {entry.notes && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {entry.notes}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {!entry.isDone && (
                                  <Button
                                    size="sm"
                                    data-ocid={`other_work.item.${i + 1}.primary_button`}
                                    onClick={() => handleMarkDone(entry.id)}
                                    disabled={isDonePending}
                                    className="rounded-full text-xs"
                                  >
                                    {isDonePending ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                    )}
                                    Done
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  data-ocid={`other_work.item.${i + 1}.delete_button`}
                                  onClick={() => handleDelete(entry.id)}
                                  disabled={isDeletePending}
                                  className="rounded-full text-xs text-destructive border-destructive/30 hover:bg-destructive/5"
                                >
                                  {isDeletePending ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </main>
  );
}
