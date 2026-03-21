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

  // Stable storage for persistence across upgrades
  stable var stableNextCropId : Nat = 0;
  stable var stableNextFertilizerScheduleId : Nat = 0;
  stable var stableNextSprayScheduleId : Nat = 0;
  stable var stableCrops : [(Principal, [Crop])] = [];
  stable var stableFertilizerSchedules : [(Principal, [FertilizerSchedule])] = [];
  stable var stableSpraySchedules : [(Principal, [SpraySchedule])] = [];
  stable var stableUserProfiles : [(Principal, UserProfile)] = [];

  var nextCropId = stableNextCropId;
  var nextFertilizerScheduleId = stableNextFertilizerScheduleId;
  var nextSprayScheduleId = stableNextSprayScheduleId;

  let crops = Map.empty<Principal, List.List<Crop>>();
  let fertilizerSchedules = Map.empty<Principal, List.List<FertilizerSchedule>>();
  let spraySchedules = Map.empty<Principal, List.List<SpraySchedule>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Restore data from stable storage on canister start
  for ((p, arr) in stableCrops.vals()) {
    crops.add(p, List.fromArray<Crop>(arr));
  };
  for ((p, arr) in stableFertilizerSchedules.vals()) {
    fertilizerSchedules.add(p, List.fromArray<FertilizerSchedule>(arr));
  };
  for ((p, arr) in stableSpraySchedules.vals()) {
    spraySchedules.add(p, List.fromArray<SpraySchedule>(arr));
  };
  for ((p, profile) in stableUserProfiles.vals()) {
    userProfiles.add(p, profile);
  };

  system func preupgrade() {
    stableNextCropId := nextCropId;
    stableNextFertilizerScheduleId := nextFertilizerScheduleId;
    stableNextSprayScheduleId := nextSprayScheduleId;

    let cropsBuf = List.empty<(Principal, [Crop])>();
    for ((p, list) in crops.entries()) {
      cropsBuf.add((p, list.toArray()));
    };
    stableCrops := cropsBuf.toArray();

    let fertBuf = List.empty<(Principal, [FertilizerSchedule])>();
    for ((p, list) in fertilizerSchedules.entries()) {
      fertBuf.add((p, list.toArray()));
    };
    stableFertilizerSchedules := fertBuf.toArray();

    let sprayBuf = List.empty<(Principal, [SpraySchedule])>();
    for ((p, list) in spraySchedules.entries()) {
      sprayBuf.add((p, list.toArray()));
    };
    stableSpraySchedules := sprayBuf.toArray();

    let profileBuf = List.empty<(Principal, UserProfile)>();
    for ((p, profile) in userProfiles.entries()) {
      profileBuf.add((p, profile));
    };
    stableUserProfiles := profileBuf.toArray();
  };

  system func postupgrade() {
    for ((p, arr) in stableCrops.vals()) {
      crops.add(p, List.fromArray<Crop>(arr));
    };
    for ((p, arr) in stableFertilizerSchedules.vals()) {
      fertilizerSchedules.add(p, List.fromArray<FertilizerSchedule>(arr));
    };
    for ((p, arr) in stableSpraySchedules.vals()) {
      spraySchedules.add(p, List.fromArray<SpraySchedule>(arr));
    };
    for ((p, profile) in stableUserProfiles.vals()) {
      userProfiles.add(p, profile);
    };
    nextCropId := stableNextCropId;
    nextFertilizerScheduleId := stableNextFertilizerScheduleId;
    nextSprayScheduleId := stableNextSprayScheduleId;
  };

  // Only blocks unauthenticated (anonymous) callers
  func checkAnonymous(caller : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    checkAnonymous(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    checkAnonymous(caller);
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    checkAnonymous(caller);
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addCrop(name : Text, cropType : Text, plotName : Text) : async Nat {
    checkAnonymous(caller);
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
    checkAnonymous(caller);
    switch (crops.get(caller)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  public shared ({ caller }) func updateCrop(cropId : Nat, name : Text, cropType : Text, plotName : Text) : async () {
    checkAnonymous(caller);
    let cropList = switch (crops.get(caller)) {
      case (null) { Runtime.trap("No crops found for user") };
      case (?list) { list };
    };
    crops.add(caller, cropList.map<Crop, Crop>(func(c) {
      if (c.id == cropId) { { id = c.id; name; cropType; plotName } } else { c };
    }));
  };

  public shared ({ caller }) func deleteCrop(cropId : Nat) : async () {
    checkAnonymous(caller);
    let cropList = switch (crops.get(caller)) {
      case (null) { Runtime.trap("No crops found for user") };
      case (?list) { list };
    };
    crops.add(caller, cropList.filter(func(c) { c.id != cropId }));
  };

  public shared ({ caller }) func addFertilizerSchedule(
    cropId : Nat, fertilizerName : Text, scheduledDate : Date, notes : Text,
  ) : async Nat {
    checkAnonymous(caller);
    let newSchedule : FertilizerSchedule = {
      id = nextFertilizerScheduleId;
      cropId;
      fertilizerName;
      scheduledDate;
      notes;
      isDone = false;
    };
    let existing = switch (fertilizerSchedules.get(caller)) {
      case (null) { List.empty<FertilizerSchedule>() };
      case (?list) { list };
    };
    existing.add(newSchedule);
    fertilizerSchedules.add(caller, existing);
    nextFertilizerScheduleId += 1;
    newSchedule.id;
  };

  public shared ({ caller }) func updateFertilizerSchedule(
    scheduleId : Nat, fertilizerName : Text, scheduledDate : Date, notes : Text,
  ) : async () {
    checkAnonymous(caller);
    let list = switch (fertilizerSchedules.get(caller)) {
      case (null) { Runtime.trap("No schedules found for user") };
      case (?l) { l };
    };
    fertilizerSchedules.add(caller, list.map<FertilizerSchedule, FertilizerSchedule>(func(s) {
      if (s.id == scheduleId) {
        { id = s.id; cropId = s.cropId; fertilizerName; scheduledDate; notes; isDone = s.isDone };
      } else { s };
    }));
  };

  public shared ({ caller }) func deleteFertilizerSchedule(scheduleId : Nat) : async () {
    checkAnonymous(caller);
    let list = switch (fertilizerSchedules.get(caller)) {
      case (null) { Runtime.trap("No schedules found for user") };
      case (?l) { l };
    };
    fertilizerSchedules.add(caller, list.filter(func(s) { s.id != scheduleId }));
  };

  public shared ({ caller }) func markFertilizerScheduleAsDone(scheduleId : Nat) : async () {
    checkAnonymous(caller);
    let list = switch (fertilizerSchedules.get(caller)) {
      case (null) { Runtime.trap("No schedules found for user") };
      case (?l) { l };
    };
    fertilizerSchedules.add(caller, list.map<FertilizerSchedule, FertilizerSchedule>(func(s) {
      if (s.id == scheduleId) {
        { id = s.id; cropId = s.cropId; fertilizerName = s.fertilizerName; scheduledDate = s.scheduledDate; notes = s.notes; isDone = true };
      } else { s };
    }));
  };

  public query ({ caller }) func getFertilizerSchedulesForMonth(month : Nat, year : Nat) : async [FertilizerSchedule] {
    checkAnonymous(caller);
    switch (fertilizerSchedules.get(caller)) {
      case (null) { [] };
      case (?list) {
        list.filter(func(s) { s.scheduledDate.month == month and s.scheduledDate.year == year }).toArray();
      };
    };
  };

  public query ({ caller }) func getTodaysFertilizerSchedules(currentDate : Date) : async [FertilizerSchedule] {
    checkAnonymous(caller);
    switch (fertilizerSchedules.get(caller)) {
      case (null) { [] };
      case (?list) {
        list.filter(func(s) {
          s.scheduledDate.day == currentDate.day and
          s.scheduledDate.month == currentDate.month and
          s.scheduledDate.year == currentDate.year
        }).toArray();
      };
    };
  };

  public query ({ caller }) func getAllFertilizerSchedules() : async [FertilizerSchedule] {
    checkAnonymous(caller);
    switch (fertilizerSchedules.get(caller)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  public shared ({ caller }) func addSpraySchedule(
    cropId : Nat, sprayName : Text, scheduledDate : Date, notes : Text,
  ) : async Nat {
    checkAnonymous(caller);
    let newSchedule : SpraySchedule = {
      id = nextSprayScheduleId;
      cropId;
      sprayName;
      scheduledDate;
      notes;
      isDone = false;
    };
    let existing = switch (spraySchedules.get(caller)) {
      case (null) { List.empty<SpraySchedule>() };
      case (?list) { list };
    };
    existing.add(newSchedule);
    spraySchedules.add(caller, existing);
    nextSprayScheduleId += 1;
    newSchedule.id;
  };

  public shared ({ caller }) func updateSpraySchedule(
    scheduleId : Nat, sprayName : Text, scheduledDate : Date, notes : Text,
  ) : async () {
    checkAnonymous(caller);
    let list = switch (spraySchedules.get(caller)) {
      case (null) { Runtime.trap("No spray schedules found for user") };
      case (?l) { l };
    };
    spraySchedules.add(caller, list.map<SpraySchedule, SpraySchedule>(func(s) {
      if (s.id == scheduleId) {
        { id = s.id; cropId = s.cropId; sprayName; scheduledDate; notes; isDone = s.isDone };
      } else { s };
    }));
  };

  public shared ({ caller }) func deleteSpraySchedule(scheduleId : Nat) : async () {
    checkAnonymous(caller);
    let list = switch (spraySchedules.get(caller)) {
      case (null) { Runtime.trap("No spray schedules found for user") };
      case (?l) { l };
    };
    spraySchedules.add(caller, list.filter(func(s) { s.id != scheduleId }));
  };

  public shared ({ caller }) func markSprayScheduleAsDone(scheduleId : Nat) : async () {
    checkAnonymous(caller);
    let list = switch (spraySchedules.get(caller)) {
      case (null) { Runtime.trap("No spray schedules found for user") };
      case (?l) { l };
    };
    spraySchedules.add(caller, list.map<SpraySchedule, SpraySchedule>(func(s) {
      if (s.id == scheduleId) {
        { id = s.id; cropId = s.cropId; sprayName = s.sprayName; scheduledDate = s.scheduledDate; notes = s.notes; isDone = true };
      } else { s };
    }));
  };

  public query ({ caller }) func getSpraySchedulesForMonth(month : Nat, year : Nat) : async [SpraySchedule] {
    checkAnonymous(caller);
    switch (spraySchedules.get(caller)) {
      case (null) { [] };
      case (?list) {
        list.filter(func(s) { s.scheduledDate.month == month and s.scheduledDate.year == year }).toArray();
      };
    };
  };

  public query ({ caller }) func getTodaysSpraySchedules(currentDate : Date) : async [SpraySchedule] {
    checkAnonymous(caller);
    switch (spraySchedules.get(caller)) {
      case (null) { [] };
      case (?list) {
        list.filter(func(s) {
          s.scheduledDate.day == currentDate.day and
          s.scheduledDate.month == currentDate.month and
          s.scheduledDate.year == currentDate.year
        }).toArray();
      };
    };
  };

  public query ({ caller }) func getAllSpraySchedules() : async [SpraySchedule] {
    checkAnonymous(caller);
    switch (spraySchedules.get(caller)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };
};
