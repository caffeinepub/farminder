import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type Date = {
    day : Nat;
    month : Nat;
    year : Nat;
  };

  public type Crop = {
    id : Nat;
    name : Text;
    cropType : Text;
    plotName : Text;
  };

  public type FertilizerSchedule = {
    id : Nat;
    cropId : Nat;
    fertilizerName : Text;
    scheduledDate : Date;
    notes : Text;
    isDone : Bool;
  };

  public type SpraySchedule = {
    id : Nat;
    cropId : Nat;
    sprayName : Text;
    scheduledDate : Date;
    notes : Text;
    isDone : Bool;
  };

  public type UserProfile = {
    name : Text;
  };

  var nextCropId = 0;
  var nextFertilizerScheduleId = 0;
  var nextSprayScheduleId = 0;

  // Data stores per user (principal)
  let crops = Map.empty<Principal, List.List<Crop>>();
  let fertilizerSchedules = Map.empty<Principal, List.List<FertilizerSchedule>>();
  let spraySchedules = Map.empty<Principal, List.List<SpraySchedule>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    checkUserPermission(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    checkUserPermission(caller);
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addCrop(name : Text, cropType : Text, plotName : Text) : async Nat {
    checkUserPermission(caller);

    let newCrop : Crop = {
      id = nextCropId;
      name;
      cropType;
      plotName;
    };

    let existingCrops = switch (crops.get(caller)) {
      case (null) { List.empty<Crop>() };
      case (?list) { list };
    };

    existingCrops.add(newCrop);
    crops.add(caller, existingCrops);

    nextCropId += 1;
    newCrop.id;
  };

  public query ({ caller }) func listCrops() : async [Crop] {
    checkUserPermission(caller);

    let cropList = switch (crops.get(caller)) {
      case (null) { List.empty<Crop>() };
      case (?list) { list };
    };
    cropList.toArray();
  };

  public shared ({ caller }) func deleteCrop(cropId : Nat) : async () {
    checkUserPermission(caller);

    let cropList = switch (crops.get(caller)) {
      case (null) { Runtime.trap("No crops found for user") };
      case (?list) { list };
    };

    let newList = cropList.filter(func(crop) { crop.id != cropId });
    crops.add(caller, newList);
  };

  public shared ({ caller }) func addFertilizerSchedule(
    cropId : Nat,
    fertilizerName : Text,
    scheduledDate : Date,
    notes : Text,
  ) : async Nat {
    checkUserPermission(caller);

    let newSchedule : FertilizerSchedule = {
      id = nextFertilizerScheduleId;
      cropId;
      fertilizerName;
      scheduledDate;
      notes;
      isDone = false;
    };

    let existingSchedules = switch (fertilizerSchedules.get(caller)) {
      case (null) { List.empty<FertilizerSchedule>() };
      case (?list) { list };
    };

    existingSchedules.add(newSchedule);
    fertilizerSchedules.add(caller, existingSchedules);

    nextFertilizerScheduleId += 1;
    newSchedule.id;
  };

  public shared ({ caller }) func updateFertilizerSchedule(
    scheduleId : Nat,
    fertilizerName : Text,
    scheduledDate : Date,
    notes : Text,
  ) : async () {
    checkUserPermission(caller);

    let scheduleList = switch (fertilizerSchedules.get(caller)) {
      case (null) { Runtime.trap("No schedules found for user") };
      case (?list) { list };
    };

    let newList = scheduleList.map<FertilizerSchedule, FertilizerSchedule>(
      func(schedule) {
        if (schedule.id == scheduleId) {
          {
            id = schedule.id;
            cropId = schedule.cropId;
            fertilizerName;
            scheduledDate;
            notes;
            isDone = schedule.isDone;
          };
        } else {
          schedule;
        };
      }
    );

    fertilizerSchedules.add(caller, newList);
  };

  public shared ({ caller }) func deleteFertilizerSchedule(scheduleId : Nat) : async () {
    checkUserPermission(caller);

    let scheduleList = switch (fertilizerSchedules.get(caller)) {
      case (null) { Runtime.trap("No schedules found for user") };
      case (?list) { list };
    };

    let newList = scheduleList.filter(func(s) { s.id != scheduleId });
    fertilizerSchedules.add(caller, newList);
  };

  public shared ({ caller }) func addSpraySchedule(
    cropId : Nat,
    sprayName : Text,
    scheduledDate : Date,
    notes : Text,
  ) : async Nat {
    checkUserPermission(caller);

    let newSchedule : SpraySchedule = {
      id = nextSprayScheduleId;
      cropId;
      sprayName;
      scheduledDate;
      notes;
      isDone = false;
    };

    let existingSchedules = switch (spraySchedules.get(caller)) {
      case (null) { List.empty<SpraySchedule>() };
      case (?list) { list };
    };

    existingSchedules.add(newSchedule);
    spraySchedules.add(caller, existingSchedules);

    nextSprayScheduleId += 1;
    newSchedule.id;
  };

  public shared ({ caller }) func updateSpraySchedule(
    scheduleId : Nat,
    sprayName : Text,
    scheduledDate : Date,
    notes : Text,
  ) : async () {
    checkUserPermission(caller);

    let scheduleList = switch (spraySchedules.get(caller)) {
      case (null) { Runtime.trap("No spray schedules found for user") };
      case (?list) { list };
    };

    let newList = scheduleList.map<SpraySchedule, SpraySchedule>(
      func(schedule) {
        if (schedule.id == scheduleId) {
          {
            id = schedule.id;
            cropId = schedule.cropId;
            sprayName;
            scheduledDate;
            notes;
            isDone = schedule.isDone;
          };
        } else {
          schedule;
        };
      }
    );

    spraySchedules.add(caller, newList);
  };

  public shared ({ caller }) func deleteSpraySchedule(scheduleId : Nat) : async () {
    checkUserPermission(caller);

    let scheduleList = switch (spraySchedules.get(caller)) {
      case (null) { Runtime.trap("No spray schedules found for user") };
      case (?list) { list };
    };

    let newList = scheduleList.filter(func(s) { s.id != scheduleId });
    spraySchedules.add(caller, newList);
  };

  public query ({ caller }) func getFertilizerSchedulesForMonth(month : Nat, year : Nat) : async [FertilizerSchedule] {
    checkUserPermission(caller);

    let scheduleList = switch (fertilizerSchedules.get(caller)) {
      case (null) { List.empty<FertilizerSchedule>() };
      case (?list) { list };
    };

    let filtered = scheduleList.filter(
      func(schedule) {
        schedule.scheduledDate.month == month and schedule.scheduledDate.year == year
      }
    );

    filtered.toArray();
  };

  public query ({ caller }) func getAllFertilizerSchedules() : async [FertilizerSchedule] {
    checkUserPermission(caller);

    let scheduleList = switch (fertilizerSchedules.get(caller)) {
      case (null) { List.empty<FertilizerSchedule>() };
      case (?list) { list };
    };

    scheduleList.toArray();
  };

  public query ({ caller }) func getAllSpraySchedules() : async [SpraySchedule] {
    checkUserPermission(caller);

    let scheduleList = switch (spraySchedules.get(caller)) {
      case (null) { List.empty<SpraySchedule>() };
      case (?list) { list };
    };

    scheduleList.toArray();
  };

  public query ({ caller }) func getTodaysFertilizerSchedules(currentDate : Date) : async [FertilizerSchedule] {
    checkUserPermission(caller);

    let scheduleList = switch (fertilizerSchedules.get(caller)) {
      case (null) { List.empty<FertilizerSchedule>() };
      case (?list) { list };
    };

    let filtered = scheduleList.filter(
      func(schedule) {
        schedule.scheduledDate.day == currentDate.day and
        schedule.scheduledDate.month == currentDate.month and
        schedule.scheduledDate.year == currentDate.year
      }
    );

    filtered.toArray();
  };

  public shared ({ caller }) func markFertilizerScheduleAsDone(scheduleId : Nat) : async () {
    checkUserPermission(caller);

    let scheduleList = switch (fertilizerSchedules.get(caller)) {
      case (null) { Runtime.trap("No schedules found for user") };
      case (?list) { list };
    };

    let newList = scheduleList.map<FertilizerSchedule, FertilizerSchedule>(
      func(schedule) {
        if (schedule.id == scheduleId) {
          {
            id = schedule.id;
            cropId = schedule.cropId;
            fertilizerName = schedule.fertilizerName;
            scheduledDate = schedule.scheduledDate;
            notes = schedule.notes;
            isDone = true;
          };
        } else {
          schedule;
        };
      }
    );

    fertilizerSchedules.add(caller, newList);
  };

  public query ({ caller }) func getSpraySchedulesForMonth(month : Nat, year : Nat) : async [SpraySchedule] {
    checkUserPermission(caller);

    let scheduleList = switch (spraySchedules.get(caller)) {
      case (null) { List.empty<SpraySchedule>() };
      case (?list) { list };
    };

    let filtered = scheduleList.filter(
      func(schedule) {
        schedule.scheduledDate.month == month and schedule.scheduledDate.year == year
      }
    );

    filtered.toArray();
  };

  public query ({ caller }) func getTodaysSpraySchedules(currentDate : Date) : async [SpraySchedule] {
    checkUserPermission(caller);

    let scheduleList = switch (spraySchedules.get(caller)) {
      case (null) { List.empty<SpraySchedule>() };
      case (?list) { list };
    };

    let filtered = scheduleList.filter(
      func(schedule) {
        schedule.scheduledDate.day == currentDate.day and
        schedule.scheduledDate.month == currentDate.month and
        schedule.scheduledDate.year == currentDate.year
      }
    );

    filtered.toArray();
  };

  public shared ({ caller }) func markSprayScheduleAsDone(scheduleId : Nat) : async () {
    checkUserPermission(caller);

    let scheduleList = switch (spraySchedules.get(caller)) {
      case (null) { Runtime.trap("No spray schedules found for user") };
      case (?list) { list };
    };

    let newList = scheduleList.map<SpraySchedule, SpraySchedule>(
      func(schedule) {
        if (schedule.id == scheduleId) {
          {
            id = schedule.id;
            cropId = schedule.cropId;
            sprayName = schedule.sprayName;
            scheduledDate = schedule.scheduledDate;
            notes = schedule.notes;
            isDone = true;
          };
        } else {
          schedule;
        };
      }
    );

    spraySchedules.add(caller, newList);
  };

  func checkUserPermission(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
  };
};
