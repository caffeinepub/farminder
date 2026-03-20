import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Crop,
  Date_,
  FertilizerSchedule,
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
