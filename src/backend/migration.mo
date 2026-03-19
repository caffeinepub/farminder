import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  // Old types
  type OldDate = {
    day : Nat;
    month : Nat;
    year : Nat;
  };

  type OldFertilizerSchedule = {
    id : Nat;
    cropId : Nat;
    fertilizerName : Text;
    scheduledDate : OldDate;
    notes : Text;
    isDone : Bool;
  };

  // New types
  type Crop = {
    id : Nat;
    name : Text;
    cropType : Text;
  };

  type FertilizerSchedule = {
    id : Nat;
    cropId : Nat;
    fertilizerName : Text;
    scheduledDate : OldDate;
    notes : Text;
    isDone : Bool;
  };

  type SpraySchedule = {
    id : Nat;
    cropId : Nat;
    sprayName : Text;
    scheduledDate : OldDate;
    notes : Text;
    isDone : Bool;
  };

  type UserProfile = {
    name : Text;
  };

  type OldActor = {
    crops : Map.Map<Principal, List.List<Crop>>;
    nextCropId : Nat;
    nextScheduleId : Nat;
    schedules : Map.Map<Principal, List.List<OldFertilizerSchedule>>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  type NewActor = {
    crops : Map.Map<Principal, List.List<Crop>>;
    fertilizerSchedules : Map.Map<Principal, List.List<FertilizerSchedule>>;
    spraySchedules : Map.Map<Principal, List.List<SpraySchedule>>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextCropId : Nat;
    nextFertilizerScheduleId : Nat;
    nextSprayScheduleId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      crops = old.crops;
      fertilizerSchedules = old.schedules;
      spraySchedules = Map.empty<Principal, List.List<SpraySchedule>>();
      userProfiles = old.userProfiles;
      nextCropId = old.nextCropId;
      nextFertilizerScheduleId = old.nextScheduleId;
      nextSprayScheduleId = 0;
    };
  };
};
