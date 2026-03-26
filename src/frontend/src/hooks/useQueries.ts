import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Crop,
  Date_,
  FertilizerSchedule,
  SharedFertilizerSchedule,
  SharedPlot,
  SharedPlotSchedules,
  SharedSpraySchedule,
  SpraySchedule,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currentUserProfile"] }),
  });
}

export function useListCrops() {
  const { actor, isFetching } = useActor();
  return useQuery<Crop[]>({
    queryKey: ["crops"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCrops();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCrop() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      cropType,
      plotName,
    }: { name: string; cropType: string; plotName: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addCrop(name, cropType, plotName);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crops"] }),
  });
}

export function useUpdateCrop() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      cropId,
      name,
      cropType,
      plotName,
    }: {
      cropId: bigint;
      name: string;
      cropType: string;
      plotName: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).updateCrop(
        cropId,
        name,
        cropType,
        plotName,
      ) as Promise<void>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crops"] }),
  });
}

export function useDeleteCrop() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cropId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteCrop(cropId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crops"] });
      qc.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
}

export function useGetSchedulesForMonth(month: number, year: number) {
  return useGetFertilizerSchedulesForMonth(month, year);
}

export function useGetFertilizerSchedulesForMonth(month: number, year: number) {
  const { actor, isFetching } = useActor();
  return useQuery<FertilizerSchedule[]>({
    queryKey: ["schedules", "fertilizer", "month", month, year],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFertilizerSchedulesForMonth(BigInt(month), BigInt(year));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSpraySchedulesForMonth(month: number, year: number) {
  const { actor, isFetching } = useActor();
  return useQuery<SpraySchedule[]>({
    queryKey: ["schedules", "spray", "month", month, year],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSpraySchedulesForMonth(BigInt(month), BigInt(year));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllFertilizerSchedules() {
  const { actor, isFetching } = useActor();
  return useQuery<FertilizerSchedule[]>({
    queryKey: ["schedules", "fertilizer", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllFertilizerSchedules() as Promise<
        FertilizerSchedule[]
      >;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllSpraySchedules() {
  const { actor, isFetching } = useActor();
  return useQuery<SpraySchedule[]>({
    queryKey: ["schedules", "spray", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllSpraySchedules() as Promise<SpraySchedule[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTodaysSchedules() {
  return useGetTodaysFertilizerSchedules();
}

export function useGetTodaysFertilizerSchedules() {
  const { actor, isFetching } = useActor();
  const today = new Date();
  const currentDate: Date_ = {
    day: BigInt(today.getDate()),
    month: BigInt(today.getMonth() + 1),
    year: BigInt(today.getFullYear()),
  };
  return useQuery<FertilizerSchedule[]>({
    queryKey: ["schedules", "fertilizer", "today"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTodaysFertilizerSchedules(currentDate);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTodaysSpraySchedules() {
  const { actor, isFetching } = useActor();
  const today = new Date();
  const currentDate: Date_ = {
    day: BigInt(today.getDate()),
    month: BigInt(today.getMonth() + 1),
    year: BigInt(today.getFullYear()),
  };
  return useQuery<SpraySchedule[]>({
    queryKey: ["schedules", "spray", "today"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTodaysSpraySchedules(currentDate);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddFertilizerSchedule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      cropId: bigint;
      fertilizerName: string;
      scheduledDate: Date_;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addFertilizerSchedule(
        params.cropId,
        params.fertilizerName,
        params.scheduledDate,
        params.notes,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
}

export function useUpdateFertilizerSchedule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      scheduleId: bigint;
      fertilizerName: string;
      scheduledDate: Date_;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).updateFertilizerSchedule(
        params.scheduleId,
        params.fertilizerName,
        params.scheduledDate,
        params.notes,
      ) as Promise<void>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
}

export function useDeleteFertilizerSchedule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (scheduleId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).deleteFertilizerSchedule(
        scheduleId,
      ) as Promise<void>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
}

export function useAddSpraySchedule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      cropId: bigint;
      sprayName: string;
      scheduledDate: Date_;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addSpraySchedule(
        params.cropId,
        params.sprayName,
        params.scheduledDate,
        params.notes,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
}

export function useUpdateSpraySchedule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      scheduleId: bigint;
      sprayName: string;
      scheduledDate: Date_;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).updateSpraySchedule(
        params.scheduleId,
        params.sprayName,
        params.scheduledDate,
        params.notes,
      ) as Promise<void>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
}

export function useDeleteSpraySchedule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (scheduleId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).deleteSpraySchedule(scheduleId) as Promise<void>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
}

export function useMarkScheduleAsDone() {
  return useMarkFertilizerScheduleAsDone();
}

export function useMarkFertilizerScheduleAsDone() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (scheduleId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.markFertilizerScheduleAsDone(scheduleId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
}

export function useMarkSprayScheduleAsDone() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (scheduleId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.markSprayScheduleAsDone(scheduleId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
}

// ---- Shared Plots ----

export function useGetMySharedPlots() {
  const { actor, isFetching } = useActor();
  return useQuery<SharedPlot[]>({
    queryKey: ["sharedPlots"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getMySharedPlots() as Promise<SharedPlot[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateSharedPlot() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      cropName,
      plotName,
    }: { cropName: string; plotName: string }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).createSharedPlot(
        cropName,
        plotName,
      ) as Promise<bigint>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sharedPlots"] }),
  });
}

export function useInviteCollaborator() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sharedPlotId,
      collaboratorId,
    }: { sharedPlotId: bigint; collaboratorId: string }) => {
      if (!actor) throw new Error("Actor not available");
      const { Principal } = await import("@icp-sdk/core/principal");
      const principal = Principal.fromText(collaboratorId);
      return (actor as any).inviteCollaborator(
        sharedPlotId,
        principal,
      ) as Promise<void>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sharedPlots"] }),
  });
}

export function useRemoveCollaborator() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sharedPlotId,
      collaboratorId,
    }: { sharedPlotId: bigint; collaboratorId: string }) => {
      if (!actor) throw new Error("Actor not available");
      const { Principal } = await import("@icp-sdk/core/principal");
      const principal = Principal.fromText(collaboratorId);
      return (actor as any).removeCollaborator(
        sharedPlotId,
        principal,
      ) as Promise<void>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sharedPlots"] }),
  });
}

export function useGetSharedPlotSchedules(sharedPlotId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<SharedPlotSchedules>({
    queryKey: ["sharedPlotSchedules", sharedPlotId.toString()],
    queryFn: async () => {
      if (!actor) return { fertilizerSchedules: [], spraySchedules: [] };
      return (actor as any).getSharedPlotSchedules(
        sharedPlotId,
      ) as Promise<SharedPlotSchedules>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTodaysSharedSchedules() {
  const { actor, isFetching } = useActor();
  const { data: sharedPlots, isLoading: plotsLoading } = useGetMySharedPlots();

  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth() + 1;
  const todayYear = today.getFullYear();

  const plotIds = (sharedPlots ?? []).map((p) => p.id.toString()).join(",");

  const query = useQuery<{
    sharedFertToday: Array<{
      schedule: SharedFertilizerSchedule;
      plot: SharedPlot;
    }>;
    sharedSprayToday: Array<{
      schedule: SharedSpraySchedule;
      plot: SharedPlot;
    }>;
  }>({
    queryKey: ["sharedSchedules", "today", plotIds],
    queryFn: async () => {
      if (!actor || !sharedPlots || sharedPlots.length === 0) {
        return { sharedFertToday: [], sharedSprayToday: [] };
      }
      const results = await Promise.all(
        sharedPlots.map(async (plot) => {
          const schedules = (await (actor as any).getSharedPlotSchedules(
            plot.id,
          )) as SharedPlotSchedules;
          return { plot, schedules };
        }),
      );

      const sharedFertToday: Array<{
        schedule: SharedFertilizerSchedule;
        plot: SharedPlot;
      }> = [];
      const sharedSprayToday: Array<{
        schedule: SharedSpraySchedule;
        plot: SharedPlot;
      }> = [];

      for (const { plot, schedules } of results) {
        for (const s of schedules.fertilizerSchedules) {
          if (
            Number(s.scheduledDate.day) === todayDay &&
            Number(s.scheduledDate.month) === todayMonth &&
            Number(s.scheduledDate.year) === todayYear
          ) {
            sharedFertToday.push({ schedule: s, plot });
          }
        }
        for (const s of schedules.spraySchedules) {
          if (
            Number(s.scheduledDate.day) === todayDay &&
            Number(s.scheduledDate.month) === todayMonth &&
            Number(s.scheduledDate.year) === todayYear
          ) {
            sharedSprayToday.push({ schedule: s, plot });
          }
        }
      }

      return { sharedFertToday, sharedSprayToday };
    },
    enabled: !!actor && !isFetching && !plotsLoading && !!sharedPlots,
  });

  return {
    sharedFertToday: query.data?.sharedFertToday ?? [],
    sharedSprayToday: query.data?.sharedSprayToday ?? [],
    isLoading: plotsLoading || query.isLoading,
    hasSharedPlots: (sharedPlots?.length ?? 0) > 0,
  };
}

export function useAddSharedFertilizerSchedule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      sharedPlotId: bigint;
      fertilizerName: string;
      quantity: string;
      scheduledDate: Date_;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).addSharedFertilizerSchedule(
        params.sharedPlotId,
        params.fertilizerName,
        params.quantity,
        params.scheduledDate,
        params.notes,
      ) as Promise<bigint>;
    },
    onSuccess: (_data, vars) => {
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
    mutationFn: async ({
      sharedPlotId,
      scheduleId,
    }: { sharedPlotId: bigint; scheduleId: bigint }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).deleteSharedFertilizerSchedule(
        sharedPlotId,
        scheduleId,
      ) as Promise<void>;
    },
    onSuccess: (_data, vars) => {
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
    mutationFn: async (params: {
      sharedPlotId: bigint;
      sprayName: string;
      quantity: string;
      scheduledDate: Date_;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).addSharedSpraySchedule(
        params.sharedPlotId,
        params.sprayName,
        params.quantity,
        params.scheduledDate,
        params.notes,
      ) as Promise<bigint>;
    },
    onSuccess: (_data, vars) => {
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
    mutationFn: async ({
      sharedPlotId,
      scheduleId,
    }: { sharedPlotId: bigint; scheduleId: bigint }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).deleteSharedSpraySchedule(
        sharedPlotId,
        scheduleId,
      ) as Promise<void>;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: ["sharedPlotSchedules", vars.sharedPlotId.toString()],
      });
    },
  });
}

export function useDeleteSharedPlot() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ sharedPlotId }: { sharedPlotId: bigint }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).deleteSharedPlot(sharedPlotId) as Promise<void>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sharedPlots"] }),
  });
}

export function useRenameSharedPlot() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sharedPlotId,
      newCropName,
      newPlotName,
    }: { sharedPlotId: bigint; newCropName: string; newPlotName: string }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).renameSharedPlot(
        sharedPlotId,
        newCropName,
        newPlotName,
      ) as Promise<void>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sharedPlots"] }),
  });
}
