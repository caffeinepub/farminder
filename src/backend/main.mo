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

  // Stable storage
  stable var stableNextCropId : Nat = 0;
  stable var stableNextFertilizerScheduleId : Nat = 0;
  stable var stableNextSprayScheduleId : Nat = 0;
  stable var stableCrops : [(Principal, [Crop])] = [];
  stable var stableFertilizerSchedules : [(Principal, [FertilizerSchedule])] = [];
  stable var stableSpraySchedules : [(Principal, [SpraySchedule])] = [];
  stable var stableUserProfiles : [(Principal, UserProfile)] = [];

  stable var stableNextSharedPlotId : Nat = 0;
  stable var stableNextSharedFertScheduleId : Nat = 0;
  stable var stableNextSharedSprayScheduleId : Nat = 0;
  stable var stableSharedPlots : [(Nat, SharedPlot)] = [];
  stable var stableSharedFertilizerSchedules : [(Nat, [SharedFertilizerSchedule])] = [];
  stable var stableSharedSpraySchedules : [(Nat, [SharedSpraySchedule])] = [];

  // Runtime counters
  var nextCropId = stableNextCropId;
  var nextFertilizerScheduleId = stableNextFertilizerScheduleId;
  var nextSprayScheduleId = stableNextSprayScheduleId;
  var nextSharedPlotId = stableNextSharedPlotId;
  var nextSharedFertScheduleId = stableNextSharedFertScheduleId;
  var nextSharedSprayScheduleId = stableNextSharedSprayScheduleId;

  // In-memory maps (restored from stable storage below)
  let crops = Map.empty<Principal, List.List<Crop>>();
  let fertilizerSchedules = Map.empty<Principal, List.List<FertilizerSchedule>>();
  let spraySchedules = Map.empty<Principal, List.List<SpraySchedule>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let sharedPlots = Map.empty<Nat, SharedPlot>();
  let sharedFertilizerSchedules = Map.empty<Nat, List.List<SharedFertilizerSchedule>>();
  let sharedSpraySchedules = Map.empty<Nat, List.List<SharedSpraySchedule>>();

  // Restore data on actor init (first install: stable arrays are empty; upgrade: they have data)
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

  // postupgrade only restores counters (map data already restored in actor body above)
  system func postupgrade() {
    nextCropId := stableNextCropId;
    nextFertilizerScheduleId := stableNextFertilizerScheduleId;
    nextSprayScheduleId := stableNextSprayScheduleId;
    nextSharedPlotId := stableNextSharedPlotId;
    nextSharedFertScheduleId := stableNextSharedFertScheduleId;
    nextSharedSprayScheduleId := stableNextSharedSprayScheduleId;
  };

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

  // Helper: get or create a mutable list stored under a Principal key
  func getOrCreateCropList(caller : Principal) : List.List<Crop> {
    switch (crops.get(caller)) {
      case (?list) { list };
      case (null) {
        let newList = List.empty<Crop>();
        crops.add(caller, newList);
        newList;
      };
    };
  };

  func getOrCreateFertList(caller : Principal) : List.List<FertilizerSchedule> {
    switch (fertilizerSchedules.get(caller)) {
      case (?list) { list };
      case (null) {
        let newList = List.empty<FertilizerSchedule>();
        fertilizerSchedules.add(caller, newList);
        newList;
      };
    };
  };

  func getOrCreateSprayList(caller : Principal) : List.List<SpraySchedule> {
    switch (spraySchedules.get(caller)) {
      case (?list) { list };
      case (null) {
        let newList = List.empty<SpraySchedule>();
        spraySchedules.add(caller, newList);
        newList;
      };
    };
  };

  func getOrCreateSharedFertList(sharedPlotId : Nat) : List.List<SharedFertilizerSchedule> {
    switch (sharedFertilizerSchedules.get(sharedPlotId)) {
      case (?list) { list };
      case (null) {
        let newList = List.empty<SharedFertilizerSchedule>();
        sharedFertilizerSchedules.add(sharedPlotId, newList);
        newList;
      };
    };
  };

  func getOrCreateSharedSprayList(sharedPlotId : Nat) : List.List<SharedSpraySchedule> {
    switch (sharedSpraySchedules.get(sharedPlotId)) {
      case (?list) { list };
      case (null) {
        let newList = List.empty<SharedSpraySchedule>();
        sharedSpraySchedules.add(sharedPlotId, newList);
        newList;
      };
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
    switch (userProfiles.get(caller)) {
      case (?_) { /* already exists, mutable update not needed for records */ };
      case (null) { userProfiles.add(caller, profile) };
    };
  };

  public shared ({ caller }) func addCrop(name : Text, cropType : Text, plotName : Text) : async Nat {
    checkAnonymous(caller);
    let newCrop : Crop = {
      id = nextCropId;
      name;
      cropType;
      plotName;
    };
    let list = getOrCreateCropList(caller);
    list.add(newCrop);
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
    let list = switch (crops.get(caller)) {
      case (null) { Runtime.trap("No crops found for user") };
      case (?l) { l };
    };
    // Rebuild: filter out old, add updated
    let updated = list.filter(func(c) { c.id != cropId });
    updated.add({ id = cropId; name; cropType; plotName });
    // Replace list contents in-place by clearing and re-adding
    switch (crops.get(caller)) {
      case (null) { crops.add(caller, updated) };
      case (?existing) {
        // Clear existing and copy updated items
        let arr = updated.toArray();
        // We need to mutate in place; create fresh list and swap entries
        // Since mo:core List is a mutable object stored by reference in the map,
        // we must clear and refill the same list object to avoid Map.add on existing key.
        let size = existing.size();
        var i = 0;
        while (i < size) {
          ignore existing.removeLast();
          i += 1;
        };
        for (item in arr.vals()) {
          existing.add(item);
        };
      };
    };
  };

  public shared ({ caller }) func deleteCrop(cropId : Nat) : async () {
    checkAnonymous(caller);
    switch (crops.get(caller)) {
      case (null) {};
      case (?list) {
        let arr = list.filter(func(c) { c.id != cropId }).toArray();
        let size = list.size();
        var i = 0;
        while (i < size) { ignore list.removeLast(); i += 1 };
        for (item in arr.vals()) { list.add(item) };
      };
    };
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
    let list = getOrCreateFertList(caller);
    list.add(newSchedule);
    nextFertilizerScheduleId += 1;
    newSchedule.id;
  };

  public shared ({ caller }) func updateFertilizerSchedule(
    scheduleId : Nat, fertilizerName : Text, scheduledDate : Date, notes : Text,
  ) : async () {
    checkAnonymous(caller);
    switch (fertilizerSchedules.get(caller)) {
      case (null) { Runtime.trap("No schedules found for user") };
      case (?list) {
        let arr = list.map<FertilizerSchedule, FertilizerSchedule>(func(s) {
          if (s.id == scheduleId) {
            { id = s.id; cropId = s.cropId; fertilizerName; scheduledDate; notes; isDone = s.isDone };
          } else { s };
        }).toArray();
        let size = list.size();
        var i = 0;
        while (i < size) { ignore list.removeLast(); i += 1 };
        for (item in arr.vals()) { list.add(item) };
      };
    };
  };

  public shared ({ caller }) func deleteFertilizerSchedule(scheduleId : Nat) : async () {
    checkAnonymous(caller);
    switch (fertilizerSchedules.get(caller)) {
      case (null) {};
      case (?list) {
        let arr = list.filter(func(s) { s.id != scheduleId }).toArray();
        let size = list.size();
        var i = 0;
        while (i < size) { ignore list.removeLast(); i += 1 };
        for (item in arr.vals()) { list.add(item) };
      };
    };
  };

  public shared ({ caller }) func markFertilizerScheduleAsDone(scheduleId : Nat) : async () {
    checkAnonymous(caller);
    switch (fertilizerSchedules.get(caller)) {
      case (null) { Runtime.trap("No schedules found") };
      case (?list) {
        let arr = list.map<FertilizerSchedule, FertilizerSchedule>(func(s) {
          if (s.id == scheduleId) {
            { id = s.id; cropId = s.cropId; fertilizerName = s.fertilizerName; scheduledDate = s.scheduledDate; notes = s.notes; isDone = true };
          } else { s };
        }).toArray();
        let size = list.size();
        var i = 0;
        while (i < size) { ignore list.removeLast(); i += 1 };
        for (item in arr.vals()) { list.add(item) };
      };
    };
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
    let list = getOrCreateSprayList(caller);
    list.add(newSchedule);
    nextSprayScheduleId += 1;
    newSchedule.id;
  };

  public shared ({ caller }) func updateSpraySchedule(
    scheduleId : Nat, sprayName : Text, scheduledDate : Date, notes : Text,
  ) : async () {
    checkAnonymous(caller);
    switch (spraySchedules.get(caller)) {
      case (null) { Runtime.trap("No spray schedules found for user") };
      case (?list) {
        let arr = list.map<SpraySchedule, SpraySchedule>(func(s) {
          if (s.id == scheduleId) {
            { id = s.id; cropId = s.cropId; sprayName; scheduledDate; notes; isDone = s.isDone };
          } else { s };
        }).toArray();
        let size = list.size();
        var i = 0;
        while (i < size) { ignore list.removeLast(); i += 1 };
        for (item in arr.vals()) { list.add(item) };
      };
    };
  };

  public shared ({ caller }) func deleteSpraySchedule(scheduleId : Nat) : async () {
    checkAnonymous(caller);
    switch (spraySchedules.get(caller)) {
      case (null) {};
      case (?list) {
        let arr = list.filter(func(s) { s.id != scheduleId }).toArray();
        let size = list.size();
        var i = 0;
        while (i < size) { ignore list.removeLast(); i += 1 };
        for (item in arr.vals()) { list.add(item) };
      };
    };
  };

  public shared ({ caller }) func markSprayScheduleAsDone(scheduleId : Nat) : async () {
    checkAnonymous(caller);
    switch (spraySchedules.get(caller)) {
      case (null) { Runtime.trap("No spray schedules found") };
      case (?list) {
        let arr = list.map<SpraySchedule, SpraySchedule>(func(s) {
          if (s.id == scheduleId) {
            { id = s.id; cropId = s.cropId; sprayName = s.sprayName; scheduledDate = s.scheduledDate; notes = s.notes; isDone = true };
          } else { s };
        }).toArray();
        let size = list.size();
        var i = 0;
        while (i < size) { ignore list.removeLast(); i += 1 };
        for (item in arr.vals()) { list.add(item) };
      };
    };
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
    let id = nextSharedPlotId;
    let newPlot : SharedPlot = {
      id;
      cropName;
      plotName;
      owner = caller;
      collaborators = [];
    };
    sharedPlots.add(id, newPlot);
    nextSharedPlotId += 1;
    id;
  };

  public shared ({ caller }) func inviteCollaborator(sharedPlotId : Nat, collaborator : Principal) : async () {
    checkAnonymous(caller);
    let plot = switch (sharedPlots.get(sharedPlotId)) {
      case (null) { Runtime.trap("Shared plot not found") };
      case (?p) { p };
    };
    if (plot.owner != caller) Runtime.trap("Only the owner can invite collaborators");
    for (c in plot.collaborators.vals()) {
      if (c == collaborator) Runtime.trap("Already a collaborator");
    };
    let newCollaborators = List.empty<Principal>();
    for (c in plot.collaborators.vals()) { newCollaborators.add(c); };
    newCollaborators.add(collaborator);
    // Update shared plot by removing old entry and adding updated one
    ignore sharedPlots.remove(sharedPlotId);
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
    ignore sharedPlots.remove(sharedPlotId);
    sharedPlots.add(sharedPlotId, {
      id = plot.id;
      cropName = plot.cropName;
      plotName = plot.plotName;
      owner = plot.owner;
      collaborators = remaining.toArray();
    });
  };


  public shared ({ caller }) func deleteSharedPlot(sharedPlotId : Nat) : async () {
    checkAnonymous(caller);
    let plot = switch (sharedPlots.get(sharedPlotId)) {
      case (null) { Runtime.trap("Shared plot not found") };
      case (?p) { p };
    };
    if (plot.owner != caller) Runtime.trap("Only the owner can delete this shared plot");
    ignore sharedPlots.remove(sharedPlotId);
    // Also remove associated schedules
    ignore sharedFertilizerSchedules.remove(sharedPlotId);
    ignore sharedSpraySchedules.remove(sharedPlotId);
  };

  public shared ({ caller }) func renameSharedPlot(sharedPlotId : Nat, newCropName : Text, newPlotName : Text) : async () {
    checkAnonymous(caller);
    let plot = switch (sharedPlots.get(sharedPlotId)) {
      case (null) { Runtime.trap("Shared plot not found") };
      case (?p) { p };
    };
    if (plot.owner != caller) Runtime.trap("Only the owner can rename this shared plot");
    ignore sharedPlots.remove(sharedPlotId);
    sharedPlots.add(sharedPlotId, {
      id = plot.id;
      cropName = newCropName;
      plotName = newPlotName;
      owner = plot.owner;
      collaborators = plot.collaborators;
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
    let list = getOrCreateSharedFertList(sharedPlotId);
    list.add(newSchedule);
    nextSharedFertScheduleId += 1;
    newSchedule.id;
  };

  public shared ({ caller }) func deleteSharedFertilizerSchedule(sharedPlotId : Nat, scheduleId : Nat) : async () {
    checkAnonymous(caller);
    let plot = switch (sharedPlots.get(sharedPlotId)) {
      case (null) { Runtime.trap("Shared plot not found") };
      case (?p) { p };
    };
    switch (sharedFertilizerSchedules.get(sharedPlotId)) {
      case (null) { Runtime.trap("No schedules found") };
      case (?list) {
        let target = list.filter(func(s) { s.id == scheduleId });
        if (target.size() == 0) Runtime.trap("Schedule not found");
        let s = target.toArray()[0];
        if (plot.owner != caller and s.addedBy != caller) Runtime.trap("Not authorized");
        let arr = list.filter(func(s2) { s2.id != scheduleId }).toArray();
        let size = list.size();
        var i = 0;
        while (i < size) { ignore list.removeLast(); i += 1 };
        for (item in arr.vals()) { list.add(item) };
      };
    };
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
    let list = getOrCreateSharedSprayList(sharedPlotId);
    list.add(newSchedule);
    nextSharedSprayScheduleId += 1;
    newSchedule.id;
  };

  public shared ({ caller }) func deleteSharedSpraySchedule(sharedPlotId : Nat, scheduleId : Nat) : async () {
    checkAnonymous(caller);
    let plot = switch (sharedPlots.get(sharedPlotId)) {
      case (null) { Runtime.trap("Shared plot not found") };
      case (?p) { p };
    };
    switch (sharedSpraySchedules.get(sharedPlotId)) {
      case (null) { Runtime.trap("No schedules found") };
      case (?list) {
        let target = list.filter(func(s) { s.id == scheduleId });
        if (target.size() == 0) Runtime.trap("Schedule not found");
        let s = target.toArray()[0];
        if (plot.owner != caller and s.addedBy != caller) Runtime.trap("Not authorized");
        let arr = list.filter(func(s2) { s2.id != scheduleId }).toArray();
        let size = list.size();
        var i = 0;
        while (i < size) { ignore list.removeLast(); i += 1 };
        for (item in arr.vals()) { list.add(item) };
      };
    };
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
