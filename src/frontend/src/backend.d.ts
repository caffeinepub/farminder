import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SpraySchedule {
    id: bigint;
    scheduledDate: Date_;
    isDone: boolean;
    cropId: bigint;
    notes: string;
    sprayName: string;
}
export interface Crop {
    id: bigint;
    name: string;
    cropType: string;
    plotName: string;
}
export interface Date_ {
    day: bigint;
    month: bigint;
    year: bigint;
}
export interface FertilizerSchedule {
    id: bigint;
    fertilizerName: string;
    scheduledDate: Date_;
    isDone: boolean;
    cropId: bigint;
    notes: string;
}
export interface UserProfile {
    name: string;
}
export interface PlotShareData {
    crops: Array<Crop>;
    fertilizerSchedules: Array<FertilizerSchedule>;
    spraySchedules: Array<SpraySchedule>;
}
export interface SharedPlot {
    id: bigint;
    cropName: string;
    plotName: string;
    owner: Principal;
    collaborators: Array<Principal>;
}
export interface SharedFertilizerSchedule {
    id: bigint;
    sharedPlotId: bigint;
    fertilizerName: string;
    quantity: string;
    scheduledDate: Date_;
    notes: string;
    addedBy: Principal;
}
export interface SharedSpraySchedule {
    id: bigint;
    sharedPlotId: bigint;
    sprayName: string;
    quantity: string;
    scheduledDate: Date_;
    notes: string;
    addedBy: Principal;
}
export interface SharedPlotSchedules {
    fertilizerSchedules: Array<SharedFertilizerSchedule>;
    spraySchedules: Array<SharedSpraySchedule>;
}
export interface backendInterface {
    addCrop(name: string, cropType: string, plotName: string): Promise<bigint>;
    listCrops(): Promise<Array<Crop>>;
    updateCrop(cropId: bigint, name: string, cropType: string, plotName: string): Promise<void>;
    deleteCrop(cropId: bigint): Promise<void>;
    addFertilizerSchedule(cropId: bigint, fertilizerName: string, scheduledDate: Date_, notes: string): Promise<bigint>;
    updateFertilizerSchedule(scheduleId: bigint, fertilizerName: string, scheduledDate: Date_, notes: string): Promise<void>;
    deleteFertilizerSchedule(scheduleId: bigint): Promise<void>;
    markFertilizerScheduleAsDone(scheduleId: bigint): Promise<void>;
    getFertilizerSchedulesForMonth(month: bigint, year: bigint): Promise<Array<FertilizerSchedule>>;
    getTodaysFertilizerSchedules(today: Date_): Promise<Array<FertilizerSchedule>>;
    getAllFertilizerSchedules(): Promise<Array<FertilizerSchedule>>;
    addSpraySchedule(cropId: bigint, sprayName: string, scheduledDate: Date_, notes: string): Promise<bigint>;
    updateSpraySchedule(scheduleId: bigint, sprayName: string, scheduledDate: Date_, notes: string): Promise<void>;
    deleteSpraySchedule(scheduleId: bigint): Promise<void>;
    markSprayScheduleAsDone(scheduleId: bigint): Promise<void>;
    getSpraySchedulesForMonth(month: bigint, year: bigint): Promise<Array<SpraySchedule>>;
    getTodaysSpraySchedules(today: Date_): Promise<Array<SpraySchedule>>;
    getAllSpraySchedules(): Promise<Array<SpraySchedule>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getPlotSchedulesPublic(userPrincipal: Principal, plotName: string): Promise<PlotShareData>;
    createSharedPlot(cropName: string, plotName: string): Promise<bigint>;
    inviteCollaborator(sharedPlotId: bigint, collaborator: Principal): Promise<void>;
    removeCollaborator(sharedPlotId: bigint, collaborator: Principal): Promise<void>;
    getMySharedPlots(): Promise<Array<SharedPlot>>;
    addSharedFertilizerSchedule(sharedPlotId: bigint, fertilizerName: string, quantity: string, scheduledDate: Date_, notes: string): Promise<bigint>;
    deleteSharedFertilizerSchedule(sharedPlotId: bigint, scheduleId: bigint): Promise<void>;
    addSharedSpraySchedule(sharedPlotId: bigint, sprayName: string, quantity: string, scheduledDate: Date_, notes: string): Promise<bigint>;
    deleteSharedSpraySchedule(sharedPlotId: bigint, scheduleId: bigint): Promise<void>;
    getSharedPlotSchedules(sharedPlotId: bigint): Promise<SharedPlotSchedules>;
    deleteSharedPlot(sharedPlotId: bigint): Promise<void>;
    renameSharedPlot(sharedPlotId: bigint, newCropName: string, newPlotName: string): Promise<void>;
}
