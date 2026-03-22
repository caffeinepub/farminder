/* eslint-disable */

// @ts-nocheck

import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

export interface Crop {
  'id' : bigint,
  'name' : string,
  'cropType' : string,
  'plotName' : string,
}
export interface Date { 'day' : bigint, 'month' : bigint, 'year' : bigint }
export interface FertilizerSchedule {
  'id' : bigint,
  'fertilizerName' : string,
  'scheduledDate' : Date,
  'isDone' : boolean,
  'cropId' : bigint,
  'notes' : string,
}
export interface SpraySchedule {
  'id' : bigint,
  'scheduledDate' : Date,
  'isDone' : boolean,
  'cropId' : bigint,
  'notes' : string,
  'sprayName' : string,
}
export interface UserProfile { 'name' : string }
export type UserRole = { 'admin' : null } |
  { 'user' : null } |
  { 'guest' : null };
export interface PlotShareData {
  'crops' : Array<Crop>,
  'fertilizerSchedules' : Array<FertilizerSchedule>,
  'spraySchedules' : Array<SpraySchedule>,
}
export interface SharedPlot {
  'id' : bigint,
  'cropName' : string,
  'plotName' : string,
  'owner' : Principal,
  'collaborators' : Array<Principal>,
}
export interface SharedFertilizerSchedule {
  'id' : bigint,
  'sharedPlotId' : bigint,
  'fertilizerName' : string,
  'quantity' : string,
  'scheduledDate' : Date,
  'notes' : string,
  'addedBy' : Principal,
}
export interface SharedSpraySchedule {
  'id' : bigint,
  'sharedPlotId' : bigint,
  'sprayName' : string,
  'quantity' : string,
  'scheduledDate' : Date,
  'notes' : string,
  'addedBy' : Principal,
}
export interface SharedPlotSchedules {
  'fertilizerSchedules' : Array<SharedFertilizerSchedule>,
  'spraySchedules' : Array<SharedSpraySchedule>,
}
export interface _SERVICE {
  '_initializeAccessControlWithSecret' : ActorMethod<[string], undefined>,
  'addCrop' : ActorMethod<[string, string, string], bigint>,
  'addFertilizerSchedule' : ActorMethod<[bigint, string, Date, string], bigint>,
  'addSpraySchedule' : ActorMethod<[bigint, string, Date, string], bigint>,
  'assignCallerUserRole' : ActorMethod<[Principal, UserRole], undefined>,
  'deleteCrop' : ActorMethod<[bigint], undefined>,
  'deleteFertilizerSchedule' : ActorMethod<[bigint], undefined>,
  'deleteSpraySchedule' : ActorMethod<[bigint], undefined>,
  'getAllFertilizerSchedules' : ActorMethod<[], Array<FertilizerSchedule>>,
  'getAllSpraySchedules' : ActorMethod<[], Array<SpraySchedule>>,
  'getCallerUserProfile' : ActorMethod<[], [] | [UserProfile]>,
  'getCallerUserRole' : ActorMethod<[], UserRole>,
  'getFertilizerSchedulesForMonth' : ActorMethod<
    [bigint, bigint],
    Array<FertilizerSchedule>
  >,
  'getSpraySchedulesForMonth' : ActorMethod<
    [bigint, bigint],
    Array<SpraySchedule>
  >,
  'getTodaysFertilizerSchedules' : ActorMethod<
    [Date],
    Array<FertilizerSchedule>
  >,
  'getTodaysSpraySchedules' : ActorMethod<[Date], Array<SpraySchedule>>,
  'getUserProfile' : ActorMethod<[Principal], [] | [UserProfile]>,
  'isCallerAdmin' : ActorMethod<[], boolean>,
  'listCrops' : ActorMethod<[], Array<Crop>>,
  'markFertilizerScheduleAsDone' : ActorMethod<[bigint], undefined>,
  'markSprayScheduleAsDone' : ActorMethod<[bigint], undefined>,
  'saveCallerUserProfile' : ActorMethod<[UserProfile], undefined>,
  'updateCrop' : ActorMethod<[bigint, string, string, string], undefined>,
  'updateFertilizerSchedule' : ActorMethod<
    [bigint, string, Date, string],
    undefined
  >,
  'updateSpraySchedule' : ActorMethod<
    [bigint, string, Date, string],
    undefined
  >,
  'getPlotSchedulesPublic' : ActorMethod<[Principal, string], PlotShareData>,
  'createSharedPlot' : ActorMethod<[string, string], bigint>,
  'inviteCollaborator' : ActorMethod<[bigint, Principal], undefined>,
  'removeCollaborator' : ActorMethod<[bigint, Principal], undefined>,
  'getMySharedPlots' : ActorMethod<[], Array<SharedPlot>>,
  'addSharedFertilizerSchedule' : ActorMethod<[bigint, string, string, Date, string], bigint>,
  'deleteSharedFertilizerSchedule' : ActorMethod<[bigint, bigint], undefined>,
  'addSharedSpraySchedule' : ActorMethod<[bigint, string, string, Date, string], bigint>,
  'deleteSharedSpraySchedule' : ActorMethod<[bigint, bigint], undefined>,
  'getSharedPlotSchedules' : ActorMethod<[bigint], SharedPlotSchedules>,
}
export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
