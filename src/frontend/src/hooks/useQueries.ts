import type { Principal } from "@dfinity/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

// ---- Crops ----

export function useListCrops() {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["crops"],
    queryFn: () => actor!.listCrops(),
    enabled: !!actor,
  });
}

export function useAddCrop() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      cropType,
      plotName,
    }: { name: string; cropType: string; plotName: string }) =>
      actor!.addCrop(name, cropType, plotName),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crops"] });
    },
  });
}

export function useUpdateCrop() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      cropId,
      name,
      cropType,
      plotName,
    }: { cropId: bigint; name: string; cropType: string; plotName: string }) =>
      actor!.updateCrop(cropId, name, cropType, plotName),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crops"] });
    },
  });
}

export function useDeleteCrop() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cropId: bigint) => actor!.deleteCrop(cropId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crops"] });
    },
  });
}

// ---- Fertilizer Schedules ----

export function useGetAllFertilizerSchedules() {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["fertilizerSchedules", "all"],
    queryFn: () => actor!.getAllFertilizerSchedules(),
    enabled: !!actor,
  });
}

export function useGetFertilizerSchedulesForMonth(month: number, year: number) {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["fertilizerSchedules", month, year],
    queryFn: () =>
      actor!.getFertilizerSchedulesForMonth(BigInt(month), BigInt(year)),
    enabled: !!actor,
  });
}

export function useGetTodaysFertilizerSchedules() {
  const { actor } = useActor();
  const today = new Date();
  return useQuery({
    queryKey: ["fertilizerSchedules", "today"],
    queryFn: () =>
      actor!.getTodaysFertilizerSchedules({
        day: BigInt(today.getDate()),
        month: BigInt(today.getMonth() + 1),
        year: BigInt(today.getFullYear()),
      }),
    enabled: !!actor,
  });
}

export function useAddFertilizerSchedule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      cropId,
      fertilizerName,
      scheduledDate,
      notes,
    }: {
      cropId: bigint;
      fertilizerName: string;
      scheduledDate: { day: bigint; month: bigint; year: bigint };
      notes: string;
    }) =>
      actor!.addFertilizerSchedule(
        cropId,
        fertilizerName,
        scheduledDate,
        notes,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fertilizerSchedules"] });
    },
  });
}

export function useUpdateFertilizerSchedule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      scheduleId,
      fertilizerName,
      scheduledDate,
      notes,
    }: {
      scheduleId: bigint;
      fertilizerName: string;
      scheduledDate: { day: bigint; month: bigint; year: bigint };
      notes: string;
    }) =>
      actor!.updateFertilizerSchedule(
        scheduleId,
        fertilizerName,
        scheduledDate,
        notes,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fertilizerSchedules"] });
    },
  });
}

export function useDeleteFertilizerSchedule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (scheduleId: bigint) =>
      actor!.deleteFertilizerSchedule(scheduleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fertilizerSchedules"] });
    },
  });
}

export function useMarkFertilizerScheduleAsDone() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (scheduleId: bigint) =>
      actor!.markFertilizerScheduleAsDone(scheduleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fertilizerSchedules"] });
    },
  });
}

// ---- Spray Schedules ----

export function useGetAllSpraySchedules() {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["spraySchedules", "all"],
    queryFn: () => actor!.getAllSpraySchedules(),
    enabled: !!actor,
  });
}

export function useGetSpraySchedulesForMonth(month: number, year: number) {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["spraySchedules", month, year],
    queryFn: () =>
      actor!.getSpraySchedulesForMonth(BigInt(month), BigInt(year)),
    enabled: !!actor,
  });
}

export function useGetTodaysSpraySchedules() {
  const { actor } = useActor();
  const today = new Date();
  return useQuery({
    queryKey: ["spraySchedules", "today"],
    queryFn: () =>
      actor!.getTodaysSpraySchedules({
        day: BigInt(today.getDate()),
        month: BigInt(today.getMonth() + 1),
        year: BigInt(today.getFullYear()),
      }),
    enabled: !!actor,
  });
}

export function useAddSpraySchedule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      cropId,
      sprayName,
      scheduledDate,
      notes,
    }: {
      cropId: bigint;
      sprayName: string;
      scheduledDate: { day: bigint; month: bigint; year: bigint };
      notes: string;
    }) => actor!.addSpraySchedule(cropId, sprayName, scheduledDate, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["spraySchedules"] });
    },
  });
}

export function useUpdateSpraySchedule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      scheduleId,
      sprayName,
      scheduledDate,
      notes,
    }: {
      scheduleId: bigint;
      sprayName: string;
      scheduledDate: { day: bigint; month: bigint; year: bigint };
      notes: string;
    }) =>
      actor!.updateSpraySchedule(scheduleId, sprayName, scheduledDate, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["spraySchedules"] });
    },
  });
}

export function useDeleteSpraySchedule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (scheduleId: bigint) => actor!.deleteSpraySchedule(scheduleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["spraySchedules"] });
    },
  });
}

export function useMarkSprayScheduleAsDone() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (scheduleId: bigint) =>
      actor!.markSprayScheduleAsDone(scheduleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["spraySchedules"] });
    },
  });
}

// ---- Shared Plots ----

export function useGetMySharedPlots() {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["sharedPlots"],
    queryFn: () => (actor as any).getMySharedPlots(),
    enabled: !!actor,
  });
}

export function useCreateSharedPlot() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      cropName,
      plotName,
    }: { cropName: string; plotName: string }) =>
      (actor as any).createSharedPlot(cropName, plotName),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sharedPlots"] });
    },
  });
}

export function useInviteCollaborator() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sharedPlotId,
      collaborator,
    }: { sharedPlotId: bigint; collaborator: Principal }) =>
      (actor as any).inviteCollaborator(sharedPlotId, collaborator),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sharedPlots"] });
    },
  });
}

export function useRemoveCollaborator() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sharedPlotId,
      collaborator,
    }: { sharedPlotId: bigint; collaborator: any }) =>
      (actor as any).removeCollaborator(sharedPlotId, collaborator),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sharedPlots"] });
    },
  });
}

export function useDeleteSharedPlot() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sharedPlotId: bigint) =>
      (actor as any).deleteSharedPlot(sharedPlotId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sharedPlots"] });
    },
  });
}

export function useRenameSharedPlot() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sharedPlotId,
      newCropName,
      newPlotName,
    }: { sharedPlotId: bigint; newCropName: string; newPlotName: string }) =>
      (actor as any).renameSharedPlot(sharedPlotId, newCropName, newPlotName),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sharedPlots"] });
    },
  });
}

export function useGetSharedPlotSchedules(sharedPlotId: bigint) {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["sharedPlotSchedules", sharedPlotId.toString()],
    queryFn: () => (actor as any).getSharedPlotSchedules(sharedPlotId),
    enabled: !!actor,
  });
}

export function useAddSharedFertilizerSchedule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sharedPlotId,
      fertilizerName,
      quantity,
      scheduledDate,
      notes,
    }: {
      sharedPlotId: bigint;
      fertilizerName: string;
      quantity: string;
      scheduledDate: { day: bigint; month: bigint; year: bigint };
      notes: string;
    }) =>
      (actor as any).addSharedFertilizerSchedule(
        sharedPlotId,
        fertilizerName,
        quantity,
        scheduledDate,
        notes,
      ),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ["sharedPlotSchedules", vars.sharedPlotId.toString()],
      });
    },
  });
}

export function useDeleteSharedFertilizerSchedule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sharedPlotId,
      scheduleId,
    }: { sharedPlotId: bigint; scheduleId: bigint }) =>
      (actor as any).deleteSharedFertilizerSchedule(sharedPlotId, scheduleId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ["sharedPlotSchedules", vars.sharedPlotId.toString()],
      });
    },
  });
}

export function useAddSharedSpraySchedule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sharedPlotId,
      sprayName,
      quantity,
      scheduledDate,
      notes,
    }: {
      sharedPlotId: bigint;
      sprayName: string;
      quantity: string;
      scheduledDate: { day: bigint; month: bigint; year: bigint };
      notes: string;
    }) =>
      (actor as any).addSharedSpraySchedule(
        sharedPlotId,
        sprayName,
        quantity,
        scheduledDate,
        notes,
      ),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ["sharedPlotSchedules", vars.sharedPlotId.toString()],
      });
    },
  });
}

export function useDeleteSharedSpraySchedule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sharedPlotId,
      scheduleId,
    }: { sharedPlotId: bigint; scheduleId: bigint }) =>
      (actor as any).deleteSharedSpraySchedule(sharedPlotId, scheduleId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ["sharedPlotSchedules", vars.sharedPlotId.toString()],
      });
    },
  });
}

// ---- Today's shared schedules ----

export function useGetTodaysSharedSchedules() {
  const { actor } = useActor();
  const today = new Date();
  const query = useQuery({
    queryKey: ["sharedSchedules", "today"],
    queryFn: async () => {
      const sharedPlots = await (actor as any).getMySharedPlots();
      const sharedFert: Array<{ schedule: any; plot: any }> = [];
      const sharedSpray: Array<{ schedule: any; plot: any }> = [];
      for (const plot of sharedPlots) {
        const schedules = await (actor as any).getSharedPlotSchedules(plot.id);
        for (const s of schedules.fertilizerSchedules) {
          if (
            Number(s.scheduledDate.day) === today.getDate() &&
            Number(s.scheduledDate.month) === today.getMonth() + 1 &&
            Number(s.scheduledDate.year) === today.getFullYear()
          ) {
            sharedFert.push({ schedule: s, plot });
          }
        }
        for (const s of schedules.spraySchedules) {
          if (
            Number(s.scheduledDate.day) === today.getDate() &&
            Number(s.scheduledDate.month) === today.getMonth() + 1 &&
            Number(s.scheduledDate.year) === today.getFullYear()
          ) {
            sharedSpray.push({ schedule: s, plot });
          }
        }
      }
      return {
        sharedFertToday: sharedFert,
        sharedSprayToday: sharedSpray,
        hasSharedPlots: sharedPlots.length > 0,
      };
    },
    enabled: !!actor,
  });
  return {
    sharedFertToday: query.data?.sharedFertToday ?? [],
    sharedSprayToday: query.data?.sharedSprayToday ?? [],
    hasSharedPlots: query.data?.hasSharedPlots ?? false,
    isLoading: query.isLoading,
  };
}

// ---- User Profile ----

export function useGetCallerUserProfile() {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["callerUserProfile"],
    queryFn: () => actor!.getCallerUserProfile(),
    enabled: !!actor,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (profile: { name: string }) =>
      actor!.saveCallerUserProfile(profile),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["callerUserProfile"] });
    },
  });
}
