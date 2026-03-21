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
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  FlaskConical,
  Loader2,
  Plus,
  Sprout,
  Trash2,
  UserPlus,
  Users,
  Wind,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Date_ } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddSharedFertilizerSchedule,
  useAddSharedSpraySchedule,
  useCreateSharedPlot,
  useDeleteSharedFertilizerSchedule,
  useDeleteSharedSpraySchedule,
  useGetMySharedPlots,
  useGetSharedPlotSchedules,
  useInviteCollaborator,
  useRemoveCollaborator,
} from "../hooks/useQueries";

interface SharedPlot {
  id: bigint;
  cropName: string;
  plotName: string;
  owner: any;
  collaborators: any[];
}

function dateToDate_(d: string): Date_ {
  const [year, month, day] = d.split("-").map(Number);
  return {
    year: BigInt(year),
    month: BigInt(month),
    day: BigInt(day),
  };
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateStr(d: Date_): string {
  return `${String(Number(d.day)).padStart(2, "0")}/${String(Number(d.month)).padStart(2, "0")}/${Number(d.year)}`;
}

function truncatePrincipal(p: string): string {
  if (p.length <= 12) return p;
  return `${p.slice(0, 6)}...${p.slice(-4)}`;
}

function SharedPlotSchedules({
  plot,
  myPrincipal,
}: {
  plot: SharedPlot;
  myPrincipal: string;
}) {
  const { data: schedules, isLoading } = useGetSharedPlotSchedules(plot.id);
  const { mutateAsync: addFert, isPending: addingFert } =
    useAddSharedFertilizerSchedule();
  const { mutateAsync: addSpray, isPending: addingSpray } =
    useAddSharedSpraySchedule();
  const { mutateAsync: deleteFert, isPending: deletingFert } =
    useDeleteSharedFertilizerSchedule();
  const { mutateAsync: deleteSpray, isPending: deletingSpray } =
    useDeleteSharedSpraySchedule();

  const [showFertForm, setShowFertForm] = useState(false);
  const [showSprayForm, setShowSprayForm] = useState(false);

  const [fertForm, setFertForm] = useState({
    name: "",
    quantity: "",
    unit: "kg",
    date: todayStr(),
    notes: "",
  });
  const [sprayForm, setSprayForm] = useState({
    name: "",
    quantity: "",
    unit: "liter",
    date: todayStr(),
    notes: "",
  });

  const handleAddFert = async () => {
    if (!fertForm.name.trim() || !fertForm.quantity.trim()) {
      toast.error("Name and quantity required");
      return;
    }
    try {
      await addFert({
        sharedPlotId: plot.id,
        fertilizerName: fertForm.name.trim(),
        quantity: `${fertForm.quantity} ${fertForm.unit}`,
        scheduledDate: dateToDate_(fertForm.date),
        notes: fertForm.notes,
      });
      setFertForm({
        name: "",
        quantity: "",
        unit: "kg",
        date: todayStr(),
        notes: "",
      });
      setShowFertForm(false);
      toast.success("Fertilizer schedule added");
    } catch {
      toast.error("Failed to add fertilizer");
    }
  };

  const handleAddSpray = async () => {
    if (!sprayForm.name.trim() || !sprayForm.quantity.trim()) {
      toast.error("Name and quantity required");
      return;
    }
    try {
      await addSpray({
        sharedPlotId: plot.id,
        sprayName: sprayForm.name.trim(),
        quantity: `${sprayForm.quantity} ${sprayForm.unit}`,
        scheduledDate: dateToDate_(sprayForm.date),
        notes: sprayForm.notes,
      });
      setSprayForm({
        name: "",
        quantity: "",
        unit: "liter",
        date: todayStr(),
        notes: "",
      });
      setShowSprayForm(false);
      toast.success("Spray schedule added");
    } catch {
      toast.error("Failed to add spray");
    }
  };

  const isOwner = plot.owner?.toText?.() === myPrincipal;

  if (isLoading) {
    return (
      <div className="py-4 space-y-2" data-ocid="shared_plots.loading_state">
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
      </div>
    );
  }

  const ferts = schedules?.fertilizerSchedules ?? [];
  const sprays = schedules?.spraySchedules ?? [];

  return (
    <div className="pt-3 space-y-4">
      {/* Add buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          className="gap-2 rounded-full border-green-600/40 text-green-700"
          onClick={() => {
            setShowFertForm((v) => !v);
            setShowSprayForm(false);
          }}
          data-ocid="shared_plots.open_modal_button"
        >
          <FlaskConical className="w-3.5 h-3.5" />
          Add Fertilizer
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-2 rounded-full border-blue-600/40 text-blue-700"
          onClick={() => {
            setShowSprayForm((v) => !v);
            setShowFertForm(false);
          }}
          data-ocid="shared_plots.secondary_button"
        >
          <Wind className="w-3.5 h-3.5" />
          Add Spray
        </Button>
      </div>

      {/* Add Fertilizer Inline Form */}
      <AnimatePresence>
        {showFertForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/20 p-4 space-y-3 overflow-hidden"
          >
            <p className="font-semibold text-sm text-green-800">
              New Fertilizer Schedule
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs">Fertilizer Name</Label>
                <Input
                  value={fertForm.name}
                  onChange={(e) =>
                    setFertForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Urea"
                  className="mt-1"
                  data-ocid="shared_plots.input"
                />
              </div>
              <div>
                <Label className="text-xs">Quantity</Label>
                <Input
                  value={fertForm.quantity}
                  onChange={(e) =>
                    setFertForm((f) => ({ ...f, quantity: e.target.value }))
                  }
                  placeholder="Amount"
                  type="number"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Unit</Label>
                <Select
                  value={fertForm.unit}
                  onValueChange={(v) => setFertForm((f) => ({ ...f, unit: v }))}
                >
                  <SelectTrigger className="mt-1">
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
              <div className="col-span-2">
                <Label className="text-xs">Date</Label>
                <Input
                  type="date"
                  value={fertForm.date}
                  onChange={(e) =>
                    setFertForm((f) => ({ ...f, date: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Notes (optional)</Label>
                <Textarea
                  value={fertForm.notes}
                  onChange={(e) =>
                    setFertForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Any notes..."
                  rows={2}
                  className="mt-1"
                  data-ocid="shared_plots.textarea"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddFert}
                disabled={addingFert}
                data-ocid="shared_plots.submit_button"
              >
                {addingFert ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : null}
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowFertForm(false)}
                data-ocid="shared_plots.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Spray Inline Form */}
      <AnimatePresence>
        {showSprayForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/20 p-4 space-y-3 overflow-hidden"
          >
            <p className="font-semibold text-sm text-blue-800">
              New Spray Schedule
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs">Spray Name</Label>
                <Input
                  value={sprayForm.name}
                  onChange={(e) =>
                    setSprayForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Pesticide X"
                  className="mt-1"
                  data-ocid="shared_plots.input"
                />
              </div>
              <div>
                <Label className="text-xs">Quantity</Label>
                <Input
                  value={sprayForm.quantity}
                  onChange={(e) =>
                    setSprayForm((f) => ({ ...f, quantity: e.target.value }))
                  }
                  placeholder="Amount"
                  type="number"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Unit</Label>
                <Select
                  value={sprayForm.unit}
                  onValueChange={(v) =>
                    setSprayForm((f) => ({ ...f, unit: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
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
              <div className="col-span-2">
                <Label className="text-xs">Date</Label>
                <Input
                  type="date"
                  value={sprayForm.date}
                  onChange={(e) =>
                    setSprayForm((f) => ({ ...f, date: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Notes (optional)</Label>
                <Textarea
                  value={sprayForm.notes}
                  onChange={(e) =>
                    setSprayForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Any notes..."
                  rows={2}
                  className="mt-1"
                  data-ocid="shared_plots.textarea"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddSpray}
                disabled={addingSpray}
                data-ocid="shared_plots.submit_button"
              >
                {addingSpray ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : null}
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSprayForm(false)}
                data-ocid="shared_plots.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fertilizer List */}
      {ferts.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-green-700 mb-2">
            Fertilizers
          </p>
          <div className="space-y-2">
            {ferts.map((f, i) => {
              const addedByText =
                f.addedBy?.toText?.() === myPrincipal
                  ? "You"
                  : truncatePrincipal(f.addedBy?.toText?.() ?? "");
              const canDelete =
                isOwner || f.addedBy?.toText?.() === myPrincipal;
              return (
                <div
                  key={f.id.toString()}
                  className="flex items-start justify-between bg-green-50 dark:bg-green-950/20 rounded-xl p-3 border border-green-100"
                  data-ocid={`shared_plots.item.${i + 1}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {f.fertilizerName}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <Badge className="text-xs rounded-full bg-green-100 text-green-800 border-green-200">
                        {f.quantity}
                      </Badge>
                      <Badge variant="outline" className="text-xs rounded-full">
                        {formatDateStr(f.scheduledDate)}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-xs rounded-full"
                      >
                        By: {addedByText}
                      </Badge>
                    </div>
                    {f.notes ? (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {f.notes}
                      </p>
                    ) : null}
                  </div>
                  {canDelete && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0 text-destructive hover:text-destructive"
                      onClick={() =>
                        deleteFert({ sharedPlotId: plot.id, scheduleId: f.id })
                      }
                      disabled={deletingFert}
                      data-ocid={`shared_plots.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Spray List */}
      {sprays.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
            Sprays
          </p>
          <div className="space-y-2">
            {sprays.map((s, i) => {
              const addedByText =
                s.addedBy?.toText?.() === myPrincipal
                  ? "You"
                  : truncatePrincipal(s.addedBy?.toText?.() ?? "");
              const canDelete =
                isOwner || s.addedBy?.toText?.() === myPrincipal;
              return (
                <div
                  key={s.id.toString()}
                  className="flex items-start justify-between bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3 border border-blue-100"
                  data-ocid={`shared_plots.item.${i + 1}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {s.sprayName}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <Badge className="text-xs rounded-full bg-blue-100 text-blue-800 border-blue-200">
                        {s.quantity}
                      </Badge>
                      <Badge variant="outline" className="text-xs rounded-full">
                        {formatDateStr(s.scheduledDate)}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-xs rounded-full"
                      >
                        By: {addedByText}
                      </Badge>
                    </div>
                    {s.notes ? (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {s.notes}
                      </p>
                    ) : null}
                  </div>
                  {canDelete && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0 text-destructive hover:text-destructive"
                      onClick={() =>
                        deleteSpray({ sharedPlotId: plot.id, scheduleId: s.id })
                      }
                      disabled={deletingSpray}
                      data-ocid={`shared_plots.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {ferts.length === 0 && sprays.length === 0 && (
        <p
          className="text-sm text-muted-foreground text-center py-4"
          data-ocid="shared_plots.empty_state"
        >
          No schedules yet. Add your first fertilizer or spray above.
        </p>
      )}
    </div>
  );
}

function SharedPlotCard({
  plot,
  myPrincipal,
}: { plot: SharedPlot; myPrincipal: string }) {
  const [expanded, setExpanded] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [invitePrincipal, setInvitePrincipal] = useState("");
  const { mutateAsync: invite, isPending: inviting } = useInviteCollaborator();
  const { mutateAsync: remove, isPending: removing } = useRemoveCollaborator();

  const isOwner = plot.owner?.toText?.() === myPrincipal;

  const handleInvite = async () => {
    if (!invitePrincipal.trim()) {
      toast.error("Enter a Principal ID");
      return;
    }
    try {
      // We pass the principal string; backend accepts Principal type
      await invite({
        sharedPlotId: plot.id,
        collaboratorId: invitePrincipal.trim(),
      });
      setInvitePrincipal("");
      setShowInvite(false);
      toast.success("Farmer invited!");
    } catch {
      toast.error("Failed to invite farmer");
    }
  };

  const handleRemove = async (collaborator: any) => {
    try {
      await remove({
        sharedPlotId: plot.id,
        collaboratorId: collaborator.toText(),
      });
      toast.success("Collaborator removed");
    } catch {
      toast.error("Failed to remove collaborator");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
    >
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sprout className="w-4 h-4 text-primary shrink-0" />
              <h3 className="font-bold text-base truncate">{plot.cropName}</h3>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {plot.plotName}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge
                className={`text-xs rounded-full ${
                  isOwner
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isOwner
                  ? "You are the owner"
                  : `Owner: ${truncatePrincipal(plot.owner?.toText?.() ?? "")}`}
              </Badge>
              <Badge variant="outline" className="text-xs rounded-full gap-1">
                <Users className="w-3 h-3" />
                {plot.collaborators.length} collaborator
                {plot.collaborators.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            className="rounded-full gap-1.5"
            onClick={() => setExpanded((v) => !v)}
            data-ocid="shared_plots.secondary_button"
          >
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            {expanded ? "Hide Schedules" : "View & Add Schedules"}
          </Button>
          {isOwner && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full gap-1.5 border-primary/40 text-primary"
              onClick={() => setShowInvite((v) => !v)}
              data-ocid="shared_plots.open_modal_button"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Invite Farmer
            </Button>
          )}
        </div>

        {/* Invite form */}
        <AnimatePresence>
          {showInvite && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-3">
                <p className="text-xs font-semibold text-primary">
                  Invite a Farmer
                </p>
                <p className="text-xs text-muted-foreground">
                  Enter the farmer's Principal ID (they can find it in the
                  Shared Plots page header).
                </p>
                <div className="flex gap-2">
                  <Input
                    value={invitePrincipal}
                    onChange={(e) => setInvitePrincipal(e.target.value)}
                    placeholder="abc123-..."
                    className="text-xs"
                    data-ocid="shared_plots.input"
                  />
                  <Button
                    size="sm"
                    onClick={handleInvite}
                    disabled={inviting}
                    data-ocid="shared_plots.submit_button"
                  >
                    {inviting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      "Invite"
                    )}
                  </Button>
                </div>

                {/* Current collaborators */}
                {plot.collaborators.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Current Collaborators
                    </p>
                    {plot.collaborators.map((c, idx) => (
                      <div
                        key={c.toText()}
                        className="flex items-center justify-between rounded-lg bg-background border border-border px-2 py-1.5"
                      >
                        <span className="text-xs font-mono truncate">
                          {truncatePrincipal(c.toText())}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-destructive hover:text-destructive text-xs"
                          onClick={() => handleRemove(c)}
                          disabled={removing}
                          data-ocid={`shared_plots.delete_button.${idx + 1}`}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expanded schedules */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border px-4 pb-4 overflow-hidden"
          >
            <SharedPlotSchedules plot={plot} myPrincipal={myPrincipal} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SharedPlotsTab() {
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal().toText() ?? "";

  const { data: sharedPlots, isLoading } = useGetMySharedPlots();
  const { mutateAsync: createPlot, isPending: creating } =
    useCreateSharedPlot();

  const [createOpen, setCreateOpen] = useState(false);
  const [cropName, setCropName] = useState("");
  const [plotName, setPlotName] = useState("");

  const handleCreate = async () => {
    if (!cropName.trim() || !plotName.trim()) {
      toast.error("Crop name and plot name required");
      return;
    }
    try {
      await createPlot({
        cropName: cropName.trim(),
        plotName: plotName.trim(),
      });
      setCropName("");
      setPlotName("");
      setCreateOpen(false);
      toast.success("Shared plot created!");
    } catch {
      toast.error("Failed to create shared plot");
    }
  };

  const copyPrincipal = () => {
    if (!myPrincipal) return;
    navigator.clipboard
      .writeText(myPrincipal)
      .then(() => {
        toast.success("Principal ID copied!");
      })
      .catch(() => {
        toast.error("Failed to copy");
      });
  };

  return (
    <div className="space-y-6">
      {/* My Principal ID */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
        <p className="text-xs font-semibold text-primary mb-1">
          Your Farmer ID (Principal)
        </p>
        <p className="text-xs text-muted-foreground mb-2">
          Share this ID with other farmers so they can invite you to their
          shared plots.
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs font-mono bg-background border border-border rounded-lg px-2 py-1.5 truncate">
            {myPrincipal || "Loading..."}
          </code>
          <Button
            size="icon"
            variant="outline"
            className="shrink-0 h-8 w-8"
            onClick={copyPrincipal}
            data-ocid="shared_plots.button"
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl">Shared Plots</h2>
          <p className="text-sm text-muted-foreground">
            Collaborate with other farmers on shared plots.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="rounded-full gap-2"
          data-ocid="shared_plots.primary_button"
        >
          <Plus className="w-4 h-4" />
          Create Shared Plot
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3" data-ocid="shared_plots.loading_state">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!sharedPlots || sharedPlots.length === 0) && (
        <div
          className="text-center py-16 rounded-2xl border border-dashed border-border"
          data-ocid="shared_plots.empty_state"
        >
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-muted-foreground">
            No shared plots yet
          </p>
          <p className="text-sm text-muted-foreground mt-1 mb-5">
            Create a shared plot or ask another farmer to invite you.
          </p>
          <Button
            onClick={() => setCreateOpen(true)}
            className="rounded-full"
            data-ocid="shared_plots.secondary_button"
          >
            <Plus className="w-4 h-4 mr-2" /> Create Shared Plot
          </Button>
        </div>
      )}

      {/* Plots list */}
      {!isLoading && sharedPlots && sharedPlots.length > 0 && (
        <div className="space-y-4">
          {sharedPlots.map((plot) => (
            <SharedPlotCard
              key={plot.id.toString()}
              plot={plot as SharedPlot}
              myPrincipal={myPrincipal}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(o) => !o && setCreateOpen(false)}
      >
        <DialogContent
          className="sm:max-w-md rounded-2xl"
          data-ocid="shared_plots.dialog"
        >
          <DialogHeader>
            <DialogTitle>Create Shared Plot</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Create a new plot to collaborate with other farmers.
            </p>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Crop Name</Label>
              <Input
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder="e.g. Rice"
                className="mt-1"
                data-ocid="shared_plots.input"
              />
            </div>
            <div>
              <Label>Plot Name</Label>
              <Input
                value={plotName}
                onChange={(e) => setPlotName(e.target.value)}
                placeholder="e.g. North Field"
                className="mt-1"
                data-ocid="shared_plots.input"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              data-ocid="shared_plots.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating}
              data-ocid="shared_plots.submit_button"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
