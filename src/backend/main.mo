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

  public type SharedPlot = {
    id : Nat;
    cropName : Text;
    plotName : Text;
    owner : Principal;
    collaborators : [Principal];
  };

  public type SharedFertilizerSchedule = {
    id : Nat;
    sharedPlotId : Nat;
    fertilizerName : Text;
    quantity : Text;
    scheduledDate : Date;
    notes : Text;
    addedBy : Principal;
  };

  public type SharedSpraySchedule = {
    id : Nat;
    sharedPlotId : Nat;
    sprayName : Text;
    quantity : Text;
    scheduledDate : Date;
    notes : Text;
    addedBy : Principal;
  };

  public type SharedPlotSchedules = {
    fertilizerSchedules : [SharedFertilizerSchedule];
    spraySchedules : [SharedSpraySchedule];
  };

  // Stable storage for persistence across upgrades
  stable var stableNextCropId : Nat = 0;
  stable var stableNextFertilizerScheduleId : Nat = 0;
  stable var stableNextSprayScheduleId : Nat = 0;
  stable var stableCrops : [(Principal, [Crop])] = [];
  stable var stableFertilizerSchedules : [(Principal, [FertilizerSchedule])] = [];
  stable var stableSpraySchedules : [(Principal, [SpraySchedule])] = [];
  stable var stableUserProfiles : [(Principal, UserProfile)] = [];

  // Shared plot stable storage
  stable var stableNextSharedPlotId : Nat = 0;
  stable var stableNextSharedFertScheduleId : Nat = 0;
  stable var stableNextSharedSprayScheduleId : Nat = 0;
  stable var stableSharedPlots : [(Nat, SharedPlot)] = [];
  stable var stableSharedFertilizerSchedules : [(Nat, [SharedFertilizerSchedule])] = [];
  stable var stableSharedSpraySchedules : [(Nat, [SharedSpraySchedule])] = [];

  var nextCropId = stableNextCropId;
  var nextFertilizerScheduleId = stableNextFertilizerScheduleId;
  var nextSprayScheduleId = stableNextSprayScheduleId;
  var nextSharedPlotId = stableNextSharedPlotId;
  var nextSharedFertScheduleId = stableNextSharedFertScheduleId;
  var nextSharedSprayScheduleId = stableNextSharedSprayScheduleId;

  let crops = Map.empty<Principal, List.List<Crop>>();
  let fertilizerSchedules = Map.empty<Principal, List.List<FertilizerSchedule>>();
  let spraySchedules = Map.empty<Principal, List.List<SpraySchedule>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let sharedPlots = Map.empty<Nat, SharedPlot>();
  let sharedFertilizerSchedules = Map.empty<Nat, List.List<SharedFertilizerSchedule>>();
  let sharedSpraySchedules = Map.empty<Nat, List.List<SharedSpraySchedule>>();

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
  for ((id, plot) in stableSharedPlots.vals()) {
    sharedPlots.add(id, plot);
  };
  for ((id, arr) in stableSharedFertilizerSchedules.vals()) {
    sharedFertilizerSchedules.add(id, List.fromArray<SharedFertilizerSchedule>(arr));
  };
  for ((id, arr) in stableSharedSpraySchedules.vals()) {
    sharedSpraySchedules.add(id, List.fromArray<SharedSpraySchedule>(arr));
  };

  system func preupgrade() {
    stableNextCropId := nextCropId;
    stableNextFertilizerScheduleId := nextFertilizerScheduleId;
    stableNextSprayScheduleId := nextSprayScheduleId;
    stableNextSharedPlotId := nextSharedPlotId;
    stableNextSharedFertScheduleId := nextSharedFertScheduleId;
    stableNextSharedSprayScheduleId := nextSharedSprayScheduleId;

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

    let sharedPlotsBuf = List.empty<(Nat, SharedPlot)>();
    for ((id, plot) in sharedPlots.entries()) {
      sharedPlotsBuf.add((id, plot));
    };
    stableSharedPlots := sharedPlotsBuf.toArray();

    let sharedFertBuf = List.empty<(Nat, [SharedFertilizerSchedule])>();
    for ((id, list) in sharedFertilizerSchedules.entries()) {
      sharedFertBuf.add((id, list.toArray()));
    };
    stableSharedFertilizerSchedules := sharedFertBuf.toArray();

    let sharedSprayBuf = List.empty<(Nat, [SharedSpraySchedule])>();
    for ((id, list) in sharedSpraySchedules.entries()) {
      sharedSprayBuf.add((id, list.toArray()));
    };
    stableSharedSpraySchedules := sharedSprayBuf.toArray();
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
    for ((id, plot) in stableSharedPlots.vals()) {
      sharedPlots.add(id, plot);
    };
    for ((id, arr) in stableSharedFertilizerSchedules.vals()) {
      sharedFertilizerSchedules.add(id, List.fromArray<SharedFertilizerSchedule>(arr));
    };
    for ((id, arr) in stableSharedSpraySchedules.vals()) {
      sharedSpraySchedules.add(id, List.fromArray<SharedSpraySchedule>(arr));
    };
    nextCropId := stableNextCropId;
    nextFertilizerScheduleId := stableNextFertilizerScheduleId;
    nextSprayScheduleId := stableNextSprayScheduleId;
    nextSharedPlotId := stableNextSharedPlotId;
    nextSharedFertScheduleId := stableNextSharedFertScheduleId;
    nextSharedSprayScheduleId := stableNextSharedSprayScheduleId;
  };

  // Only blocks unauthenticated (anonymous) callers
  func checkAnonymous(caller : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
  };

  func isCollaborator(plot : SharedPlot, caller : Principal) : Bool {
    if (plot.owner == caller) return true;
    for (c in plot.collaborators.vals()) {
      if (c == caller) return true;
    };
    false;
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

  public type PlotShareData = {
    crops : [Crop];
    fertilizerSchedules : [FertilizerSchedule];
    spraySchedules : [SpraySchedule];
  };

  public query func getPlotSchedulesPublic(userPrincipal : Principal, plotName : Text) : async PlotShareData {
    let userCrops = switch (crops.get(userPrincipal)) {
      case (null) { [] };
      case (?list) { list.filter(func(c) { c.plotName == plotName }).toArray() };
    };
    let cropIds = userCrops.map(func(c : Crop) : Nat { c.id });
    let hasCropId = func(id : Nat) : Bool {
      for (cid in cropIds.vals()) { if (cid == id) { return true }; };
      false;
    };
    let fertiArr = switch (fertilizerSchedules.get(userPrincipal)) {
      case (null) { [] };
      case (?list) { list.filter(func(s) { hasCropId(s.cropId) }).toArray() };
    };
    let sprayArr = switch (spraySchedules.get(userPrincipal)) {
      case (null) { [] };
      case (?list) { list.filter(func(s) { hasCropId(s.cropId) }).toArray() };
    };
    { crops = userCrops; fertilizerSchedules = fertiArr; spraySchedules = sprayArr };
  };

  // ---- Shared Plot Collaboration ----

  public shared ({ caller }) func createSharedPlot(cropName : Text, plotName : Text) : async Nat {
    checkAnonymous(caller);
    let newPlot : SharedPlot = {
      id = nextSharedPlotId;
      cropName;
      plotName;
      owner = caller;
      collaborators = [];
    };
    sharedPlots.add(nextSharedPlotId, newPlot);
    nextSharedPlotId += 1;
    newPlot.id;
  };

  public shared ({ caller }) func inviteCollaborator(sharedPlotId : Nat, collaborator : Principal) : async () {
    checkAnonymous(caller);
    let plot = switch (sharedPlots.get(sharedPlotId)) {
      case (null) { Runtime.trap("Shared plot not found") };
      case (?p) { p };
    };
    if (plot.owner != caller) Runtime.trap("Only the owner can invite collaborators");
    // Check not already added
    for (c in plot.collaborators.vals()) {
      if (c == collaborator) Runtime.trap("Already a collaborator");
    };
    let newCollaborators = List.empty<Principal>();
    for (c in plot.collaborators.vals()) { newCollaborators.add(c); };
    newCollaborators.add(collaborator);
    sharedPlots.add(sharedPlotId, {
      id = plot.id;
      cropName = plot.cropName;
      plotName = plot.plotName;
      owner = plot.owner;
      collaborators = newCollaborators.toArray();
    });
  };

  public shared ({ caller }) func removeCollaborator(sharedPlotId : Nat, collaborator : Principal) : async () {
    checkAnonymous(caller);
    let plot = switch (sharedPlots.get(sharedPlotId)) {
      case (null) { Runtime.trap("Shared plot not found") };
      case (?p) { p };
    };
    if (plot.owner != caller) Runtime.trap("Only the owner can remove collaborators");
    let remaining = List.empty<Principal>();
    for (c in plot.collaborators.vals()) {
      if (c != collaborator) remaining.add(c);
    };
    sharedPlots.add(sharedPlotId, {
      id = plot.id;
      cropName = plot.cropName;
      plotName = plot.plotName;
      owner = plot.owner;
      collaborators = remaining.toArray();
    });
  };

  public query ({ caller }) func getMySharedPlots() : async [SharedPlot] {
    checkAnonymous(caller);
    let result = List.empty<SharedPlot>();
    for ((_, plot) in sharedPlots.entries()) {
      if (isCollaborator(plot, caller)) result.add(plot);
    };
    result.toArray();
  };

  public shared ({ caller }) func addSharedFertilizerSchedule(
    sharedPlotId : Nat, fertilizerName : Text, quantity : Text, scheduledDate : Date, notes : Text,
  ) : async Nat {
    checkAnonymous(caller);
    let plot = switch (sharedPlots.get(sharedPlotId)) {
      case (null) { Runtime.trap("Shared plot not found") };
      case (?p) { p };
    };
    if (not isCollaborator(plot, caller)) Runtime.trap("Not authorized for this plot");
    let newSchedule : SharedFertilizerSchedule = {
      id = nextSharedFertScheduleId;
      sharedPlotId;
      fertilizerName;
      quantity;
      scheduledDate;
      notes;
      addedBy = caller;
    };
    let existing = switch (sharedFertilizerSchedules.get(sharedPlotId)) {
      case (null) { List.empty<SharedFertilizerSchedule>() };
      case (?l) { l };
    };
    existing.add(newSchedule);
    sharedFertilizerSchedules.add(sharedPlotId, existing);
    nextSharedFertScheduleId += 1;
    newSchedule.id;
  };

  public shared ({ caller }) func deleteSharedFertilizerSchedule(sharedPlotId : Nat, scheduleId : Nat) : async () {
    checkAnonymous(caller);
    let plot = switch (sharedPlots.get(sharedPlotId)) {
      case (null) { Runtime.trap("Shared plot not found") };
      case (?p) { p };
    };
    let list = switch (sharedFertilizerSchedules.get(sharedPlotId)) {
      case (null) { Runtime.trap("No schedules found") };
      case (?l) { l };
    };
    // Only owner or the person who added it can delete
    let target = list.filter(func(s) { s.id == scheduleId });
    if (target.size() == 0) Runtime.trap("Schedule not found");
    let s = target.toArray()[0];
    if (plot.owner != caller and s.addedBy != caller) Runtime.trap("Not authorized to delete this schedule");
    sharedFertilizerSchedules.add(sharedPlotId, list.filter(func(s2) { s2.id != scheduleId }));
  };

  public shared ({ caller }) func addSharedSpraySchedule(
    sharedPlotId : Nat, sprayName : Text, quantity : Text, scheduledDate : Date, notes : Text,
  ) : async Nat {
    checkAnonymous(caller);
    let plot = switch (sharedPlots.get(sharedPlotId)) {
      case (null) { Runtime.trap("Shared plot not found") };
      case (?p) { p };
    };
    if (not isCollaborator(plot, caller)) Runtime.trap("Not authorized for this plot");
    let newSchedule : SharedSpraySchedule = {
      id = nextSharedSprayScheduleId;
      sharedPlotId;
      sprayName;
      quantity;
      scheduledDate;
      notes;
      addedBy = caller;
    };
    let existing = switch (sharedSpraySchedules.get(sharedPlotId)) {
      case (null) { List.empty<SharedSpraySchedule>() };
      case (?l) { l };
    };
    existing.add(newSchedule);
    sharedSpraySchedules.add(sharedPlotId, existing);
    nextSharedSprayScheduleId += 1;
    newSchedule.id;
  };

  public shared ({ caller }) func deleteSharedSpraySchedule(sharedPlotId : Nat, scheduleId : Nat) : async () {
    checkAnonymous(caller);
    let plot = switch (sharedPlots.get(sharedPlotId)) {
      case (null) { Runtime.trap("Shared plot not found") };
      case (?p) { p };
    };
    let list = switch (sharedSpraySchedules.get(sharedPlotId)) {
      case (null) { Runtime.trap("No schedules found") };
      case (?l) { l };
    };
    let target = list.filter(func(s) { s.id == scheduleId });
    if (target.size() == 0) Runtime.trap("Schedule not found");
    let s = target.toArray()[0];
    if (plot.owner != caller and s.addedBy != caller) Runtime.trap("Not authorized to delete this schedule");
    sharedSpraySchedules.add(sharedPlotId, list.filter(func(s2) { s2.id != scheduleId }));
  };

  public query ({ caller }) func getSharedPlotSchedules(sharedPlotId : Nat) : async SharedPlotSchedules {
    checkAnonymous(caller);
    let plot = switch (sharedPlots.get(sharedPlotId)) {
      case (null) { Runtime.trap("Shared plot not found") };
      case (?p) { p };
    };
    if (not isCollaborator(plot, caller)) Runtime.trap("Not authorized for this plot");
    let fertArr = switch (sharedFertilizerSchedules.get(sharedPlotId)) {
      case (null) { [] };
      case (?l) { l.toArray() };
    };
    let sprayArr = switch (sharedSpraySchedules.get(sharedPlotId)) {
      case (null) { [] };
      case (?l) { l.toArray() };
    };
    { fertilizerSchedules = fertArr; spraySchedules = sprayArr };
  };

};
