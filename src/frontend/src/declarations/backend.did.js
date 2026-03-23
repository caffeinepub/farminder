/* eslint-disable */

// @ts-nocheck

import { IDL } from '@icp-sdk/core/candid';

export const Date = IDL.Record({
  'day' : IDL.Nat,
  'month' : IDL.Nat,
  'year' : IDL.Nat,
});
export const UserRole = IDL.Variant({
  'admin' : IDL.Null,
  'user' : IDL.Null,
  'guest' : IDL.Null,
});
export const FertilizerSchedule = IDL.Record({
  'id' : IDL.Nat,
  'fertilizerName' : IDL.Text,
  'scheduledDate' : Date,
  'isDone' : IDL.Bool,
  'cropId' : IDL.Nat,
  'notes' : IDL.Text,
});
export const SpraySchedule = IDL.Record({
  'id' : IDL.Nat,
  'scheduledDate' : Date,
  'isDone' : IDL.Bool,
  'cropId' : IDL.Nat,
  'notes' : IDL.Text,
  'sprayName' : IDL.Text,
});
export const UserProfile = IDL.Record({ 'name' : IDL.Text });
export const Crop = IDL.Record({
  'id' : IDL.Nat,
  'name' : IDL.Text,
  'cropType' : IDL.Text,
  'plotName' : IDL.Text,
});
export const PlotShareData = IDL.Record({
  'crops' : IDL.Vec(Crop),
  'fertilizerSchedules' : IDL.Vec(FertilizerSchedule),
  'spraySchedules' : IDL.Vec(SpraySchedule),
});
export const SharedPlot = IDL.Record({
  'id' : IDL.Nat,
  'cropName' : IDL.Text,
  'plotName' : IDL.Text,
  'owner' : IDL.Principal,
  'collaborators' : IDL.Vec(IDL.Principal),
});
export const SharedFertilizerSchedule = IDL.Record({
  'id' : IDL.Nat,
  'sharedPlotId' : IDL.Nat,
  'fertilizerName' : IDL.Text,
  'quantity' : IDL.Text,
  'scheduledDate' : Date,
  'notes' : IDL.Text,
  'addedBy' : IDL.Principal,
});
export const SharedSpraySchedule = IDL.Record({
  'id' : IDL.Nat,
  'sharedPlotId' : IDL.Nat,
  'sprayName' : IDL.Text,
  'quantity' : IDL.Text,
  'scheduledDate' : Date,
  'notes' : IDL.Text,
  'addedBy' : IDL.Principal,
});
export const SharedPlotSchedules = IDL.Record({
  'fertilizerSchedules' : IDL.Vec(SharedFertilizerSchedule),
  'spraySchedules' : IDL.Vec(SharedSpraySchedule),
});

export const idlService = IDL.Service({
  '_initializeAccessControlWithSecret' : IDL.Func([IDL.Text], [], []),
  'addCrop' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Nat], []),
  'addFertilizerSchedule' : IDL.Func(
      [IDL.Nat, IDL.Text, Date, IDL.Text],
      [IDL.Nat],
      [],
    ),
  'addSpraySchedule' : IDL.Func(
      [IDL.Nat, IDL.Text, Date, IDL.Text],
      [IDL.Nat],
      [],
    ),
  'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
  'deleteCrop' : IDL.Func([IDL.Nat], [], []),
  'deleteFertilizerSchedule' : IDL.Func([IDL.Nat], [], []),
  'deleteSpraySchedule' : IDL.Func([IDL.Nat], [], []),
  'getAllFertilizerSchedules' : IDL.Func(
      [],
      [IDL.Vec(FertilizerSchedule)],
      ['query'],
    ),
  'getAllSpraySchedules' : IDL.Func([], [IDL.Vec(SpraySchedule)], ['query']),
  'getCallerUserProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
  'getCallerUserRole' : IDL.Func([], [UserRole], ['query']),
  'getFertilizerSchedulesForMonth' : IDL.Func(
      [IDL.Nat, IDL.Nat],
      [IDL.Vec(FertilizerSchedule)],
      ['query'],
    ),
  'getSpraySchedulesForMonth' : IDL.Func(
      [IDL.Nat, IDL.Nat],
      [IDL.Vec(SpraySchedule)],
      ['query'],
    ),
  'getTodaysFertilizerSchedules' : IDL.Func(
      [Date],
      [IDL.Vec(FertilizerSchedule)],
      ['query'],
    ),
  'getTodaysSpraySchedules' : IDL.Func(
      [Date],
      [IDL.Vec(SpraySchedule)],
      ['query'],
    ),
  'getUserProfile' : IDL.Func(
      [IDL.Principal],
      [IDL.Opt(UserProfile)],
      ['query'],
    ),
  'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
  'listCrops' : IDL.Func([], [IDL.Vec(Crop)], ['query']),
  'markFertilizerScheduleAsDone' : IDL.Func([IDL.Nat], [], []),
  'markSprayScheduleAsDone' : IDL.Func([IDL.Nat], [], []),
  'saveCallerUserProfile' : IDL.Func([UserProfile], [], []),
  'updateCrop' : IDL.Func([IDL.Nat, IDL.Text, IDL.Text, IDL.Text], [], []),
  'updateFertilizerSchedule' : IDL.Func(
      [IDL.Nat, IDL.Text, Date, IDL.Text],
      [],
      [],
    ),
  'updateSpraySchedule' : IDL.Func([IDL.Nat, IDL.Text, Date, IDL.Text], [], []),
  'getPlotSchedulesPublic' : IDL.Func([IDL.Principal, IDL.Text], [PlotShareData], ['query']),
  'createSharedPlot' : IDL.Func([IDL.Text, IDL.Text], [IDL.Nat], []),
  'inviteCollaborator' : IDL.Func([IDL.Nat, IDL.Principal], [], []),
  'removeCollaborator' : IDL.Func([IDL.Nat, IDL.Principal], [], []),
  'getMySharedPlots' : IDL.Func([], [IDL.Vec(SharedPlot)], ['query']),
  'addSharedFertilizerSchedule' : IDL.Func(
      [IDL.Nat, IDL.Text, IDL.Text, Date, IDL.Text],
      [IDL.Nat],
      [],
    ),
  'deleteSharedFertilizerSchedule' : IDL.Func([IDL.Nat, IDL.Nat], [], []),
  'addSharedSpraySchedule' : IDL.Func(
      [IDL.Nat, IDL.Text, IDL.Text, Date, IDL.Text],
      [IDL.Nat],
      [],
    ),
  'deleteSharedSpraySchedule' : IDL.Func([IDL.Nat, IDL.Nat], [], []),
  'getSharedPlotSchedules' : IDL.Func([IDL.Nat], [SharedPlotSchedules], ['query']),
  'deleteSharedPlot' : IDL.Func([IDL.Nat], [], []),
  'renameSharedPlot' : IDL.Func([IDL.Nat, IDL.Text, IDL.Text], [], []),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const Date = IDL.Record({
    'day' : IDL.Nat,
    'month' : IDL.Nat,
    'year' : IDL.Nat,
  });
  const UserRole = IDL.Variant({
    'admin' : IDL.Null,
    'user' : IDL.Null,
    'guest' : IDL.Null,
  });
  const FertilizerSchedule = IDL.Record({
    'id' : IDL.Nat,
    'fertilizerName' : IDL.Text,
    'scheduledDate' : Date,
    'isDone' : IDL.Bool,
    'cropId' : IDL.Nat,
    'notes' : IDL.Text,
  });
  const SpraySchedule = IDL.Record({
    'id' : IDL.Nat,
    'scheduledDate' : Date,
    'isDone' : IDL.Bool,
    'cropId' : IDL.Nat,
    'notes' : IDL.Text,
    'sprayName' : IDL.Text,
  });
  const UserProfile = IDL.Record({ 'name' : IDL.Text });
  const Crop = IDL.Record({
    'id' : IDL.Nat,
    'name' : IDL.Text,
    'cropType' : IDL.Text,
    'plotName' : IDL.Text,
  });
  const PlotShareData = IDL.Record({
    'crops' : IDL.Vec(Crop),
    'fertilizerSchedules' : IDL.Vec(FertilizerSchedule),
    'spraySchedules' : IDL.Vec(SpraySchedule),
  });
  const SharedPlot = IDL.Record({
    'id' : IDL.Nat,
    'cropName' : IDL.Text,
    'plotName' : IDL.Text,
    'owner' : IDL.Principal,
    'collaborators' : IDL.Vec(IDL.Principal),
  });
  const SharedFertilizerSchedule = IDL.Record({
    'id' : IDL.Nat,
    'sharedPlotId' : IDL.Nat,
    'fertilizerName' : IDL.Text,
    'quantity' : IDL.Text,
    'scheduledDate' : Date,
    'notes' : IDL.Text,
    'addedBy' : IDL.Principal,
  });
  const SharedSpraySchedule = IDL.Record({
    'id' : IDL.Nat,
    'sharedPlotId' : IDL.Nat,
    'sprayName' : IDL.Text,
    'quantity' : IDL.Text,
    'scheduledDate' : Date,
    'notes' : IDL.Text,
    'addedBy' : IDL.Principal,
  });
  const SharedPlotSchedules = IDL.Record({
    'fertilizerSchedules' : IDL.Vec(SharedFertilizerSchedule),
    'spraySchedules' : IDL.Vec(SharedSpraySchedule),
  });

  return IDL.Service({
    '_initializeAccessControlWithSecret' : IDL.Func([IDL.Text], [], []),
    'addCrop' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Nat], []),
    'addFertilizerSchedule' : IDL.Func(
        [IDL.Nat, IDL.Text, Date, IDL.Text],
        [IDL.Nat],
        [],
      ),
    'addSpraySchedule' : IDL.Func(
        [IDL.Nat, IDL.Text, Date, IDL.Text],
        [IDL.Nat],
        [],
      ),
    'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
    'deleteCrop' : IDL.Func([IDL.Nat], [], []),
    'deleteFertilizerSchedule' : IDL.Func([IDL.Nat], [], []),
    'deleteSpraySchedule' : IDL.Func([IDL.Nat], [], []),
    'getAllFertilizerSchedules' : IDL.Func(
        [],
        [IDL.Vec(FertilizerSchedule)],
        ['query'],
      ),
    'getAllSpraySchedules' : IDL.Func([], [IDL.Vec(SpraySchedule)], ['query']),
    'getCallerUserProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'getCallerUserRole' : IDL.Func([], [UserRole], ['query']),
    'getFertilizerSchedulesForMonth' : IDL.Func(
        [IDL.Nat, IDL.Nat],
        [IDL.Vec(FertilizerSchedule)],
        ['query'],
      ),
    'getSpraySchedulesForMonth' : IDL.Func(
        [IDL.Nat, IDL.Nat],
        [IDL.Vec(SpraySchedule)],
        ['query'],
      ),
    'getTodaysFertilizerSchedules' : IDL.Func(
        [Date],
        [IDL.Vec(FertilizerSchedule)],
        ['query'],
      ),
    'getTodaysSpraySchedules' : IDL.Func(
        [Date],
        [IDL.Vec(SpraySchedule)],
        ['query'],
      ),
    'getUserProfile' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(UserProfile)],
        ['query'],
      ),
    'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    'listCrops' : IDL.Func([], [IDL.Vec(Crop)], ['query']),
    'markFertilizerScheduleAsDone' : IDL.Func([IDL.Nat], [], []),
    'markSprayScheduleAsDone' : IDL.Func([IDL.Nat], [], []),
    'saveCallerUserProfile' : IDL.Func([UserProfile], [], []),
    'updateCrop' : IDL.Func([IDL.Nat, IDL.Text, IDL.Text, IDL.Text], [], []),
    'updateFertilizerSchedule' : IDL.Func(
        [IDL.Nat, IDL.Text, Date, IDL.Text],
        [],
        [],
      ),
    'updateSpraySchedule' : IDL.Func(
        [IDL.Nat, IDL.Text, Date, IDL.Text],
        [],
        [],
      ),
    'getPlotSchedulesPublic' : IDL.Func([IDL.Principal, IDL.Text], [PlotShareData], ['query']),
    'createSharedPlot' : IDL.Func([IDL.Text, IDL.Text], [IDL.Nat], []),
    'inviteCollaborator' : IDL.Func([IDL.Nat, IDL.Principal], [], []),
    'removeCollaborator' : IDL.Func([IDL.Nat, IDL.Principal], [], []),
    'getMySharedPlots' : IDL.Func([], [IDL.Vec(SharedPlot)], ['query']),
    'addSharedFertilizerSchedule' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Text, Date, IDL.Text],
        [IDL.Nat],
        [],
      ),
    'deleteSharedFertilizerSchedule' : IDL.Func([IDL.Nat, IDL.Nat], [], []),
    'addSharedSpraySchedule' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Text, Date, IDL.Text],
        [IDL.Nat],
        [],
      ),
    'deleteSharedSpraySchedule' : IDL.Func([IDL.Nat, IDL.Nat], [], []),
    'getSharedPlotSchedules' : IDL.Func([IDL.Nat], [SharedPlotSchedules], ['query']),
    'deleteSharedPlot' : IDL.Func([IDL.Nat], [], []),
    'renameSharedPlot' : IDL.Func([IDL.Nat, IDL.Text, IDL.Text], [], []),
  });
};

export const init = ({ IDL }) => { return []; };
