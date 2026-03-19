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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCrop(name: string, cropType: string): Promise<bigint>;
    addFertilizerSchedule(cropId: bigint, fertilizerName: string, scheduledDate: Date_, notes: string): Promise<bigint>;
    addSpraySchedule(cropId: bigint, sprayName: string, scheduledDate: Date_, notes: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteCrop(cropId: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFertilizerSchedulesForMonth(month: bigint, year: bigint): Promise<Array<FertilizerSchedule>>;
    getSpraySchedulesForMonth(month: bigint, year: bigint): Promise<Array<SpraySchedule>>;
    getTodaysFertilizerSchedules(currentDate: Date_): Promise<Array<FertilizerSchedule>>;
    getTodaysSpraySchedules(currentDate: Date_): Promise<Array<SpraySchedule>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listCrops(): Promise<Array<Crop>>;
    markFertilizerScheduleAsDone(scheduleId: bigint): Promise<void>;
    markSprayScheduleAsDone(scheduleId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
