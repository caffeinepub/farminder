import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type Date = {
    day : Nat;
    month : Nat;
    year : Nat;
  };

  type Crop = {
    id : Nat;
    name : Text;
    cropType : Text;
    plotName : Text;
  };

  type FertilizerSchedule = {
    id : Nat;
    cropId : Nat;
    fertilizerName : Text;
    scheduledDate : Date;
    notes : Text;
    isDone : Bool;
  };

  type SpraySchedule = {
    id : Nat;
    cropId : Nat;
    sprayName : Text;
    scheduledDate : Date;
    notes : Text;
    isDone : Bool;
  };

  type UserProfile = {
    name : Text;
  };

  type OldActor = {
    crops : Map.Map<Principal, List.List<Crop>>;
    fertilizerSchedules : Map.Map<Principal, List.List<FertilizerSchedule>>;
    nextCropId : Nat;
    nextFertilizerScheduleId : Nat;
    nextSprayScheduleId : Nat;
    spraySchedules : Map.Map<Principal, List.List<SpraySchedule>>;
    stableCrops : [(Principal, [Crop])];
    stableFertilizerSchedules : [(Principal, [FertilizerSchedule])];
    stableNextCropId : Nat;
    stableNextFertilizerScheduleId : Nat;
    stableNextSprayScheduleId : Nat;
    stableSpraySchedules : [(Principal, [SpraySchedule])];
    stableUserProfiles : [(Principal, UserProfile)];
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    userCrops : Map.Map<Principal, List.List<Crop>>;
    userFertilizerSchedules : Map.Map<Principal, List.List<FertilizerSchedule>>;
    userSpraySchedules : Map.Map<Principal, List.List<SpraySchedule>>;
    nextId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      userProfiles = old.userProfiles;
      userCrops = old.crops;
      userFertilizerSchedules = old.fertilizerSchedules;
      userSpraySchedules = old.spraySchedules;
      nextId = if (
        old.nextCropId > old.nextFertilizerScheduleId and
        old.nextCropId > old.nextSprayScheduleId
      ) {
        old.nextCropId + 1;
      } else if (old.nextFertilizerScheduleId > old.nextSprayScheduleId) {
        old.nextFertilizerScheduleId + 1;
      } else {
        old.nextSprayScheduleId + 1;
      };
    };
  };
};
