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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Loader2, Plus, Sprout, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddCrop, useDeleteCrop, useListCrops } from "../hooks/useQueries";

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

export default function CropsPage() {
  const { data: crops, isLoading } = useListCrops();
  const { mutateAsync: addCrop, isPending: adding } = useAddCrop();
  const { mutateAsync: deleteCrop, isPending: deleting } = useDeleteCrop();

  const [name, setName] = useState("");
  const [cropType, setCropType] = useState("");
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cropType) return;
    try {
      await addCrop({ name: name.trim(), cropType });
      setName("");
      setCropType("");
      toast.success(`${name.trim()} added!`);
    } catch {
      toast.error("Failed to add crop");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCrop(deleteId);
      toast.success("Crop deleted");
    } catch {
      toast.error("Failed to delete crop");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <main className="container mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display font-bold text-3xl mb-1">My Crops</h1>
        <p className="text-muted-foreground mb-8">
          Manage your registered crops.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Crop Form */}
          <div className="lg:col-span-1">
            <Card className="shadow-card sticky top-24">
              <CardHeader>
                <CardTitle className="font-display text-lg">
                  Add New Crop
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdd} className="flex flex-col gap-4">
                  <div>
                    <Label htmlFor="crop-name">Crop Name</Label>
                    <Input
                      id="crop-name"
                      data-ocid="crops.input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Field A - Wheat"
                    />
                  </div>
                  <div>
                    <Label htmlFor="crop-type">Crop Type</Label>
                    <Select value={cropType} onValueChange={setCropType}>
                      <SelectTrigger data-ocid="crops.select" id="crop-type">
                        <SelectValue placeholder="Select type..." />
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
                  <Button
                    type="submit"
                    disabled={adding || !name.trim() || !cropType}
                    data-ocid="crops.submit_button"
                    className="rounded-full w-full"
                  >
                    {adding ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Add Crop
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Crops List */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="space-y-3" data-ocid="crops.loading_state">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : !crops || crops.length === 0 ? (
              <div
                className="text-center py-16 rounded-2xl border border-dashed border-border"
                data-ocid="crops.empty_state"
              >
                <Sprout className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold text-muted-foreground">
                  No crops yet
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add your first crop using the form
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {crops.map((crop, i) => (
                    <motion.div
                      key={crop.id.toString()}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.04 }}
                      data-ocid={`crops.item.${i + 1}`}
                      className="flex items-center gap-4 bg-white rounded-xl border border-border shadow-xs p-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                        <Sprout className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{crop.name}</p>
                        <Badge variant="secondary" className="text-xs mt-0.5">
                          {crop.cropType}
                        </Badge>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        data-ocid={`crops.delete_button.${i + 1}`}
                        onClick={() => setDeleteId(crop.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="crops.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Crop?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the crop and all associated fertilizer schedules.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="crops.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="crops.confirm_button"
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
