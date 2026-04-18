import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import CommonTypes "../types/common";
import LeaderboardTypes "../types/leaderboard";

module {
  public type SessionId = CommonTypes.SessionId;
  public type PlayerId = CommonTypes.PlayerId;
  public type LootId = CommonTypes.LootId;

  public type WeaponType = { #Pistol; #Rifle; #Shotgun; #Sniper };
  public type ArmorTier = { #Light; #Medium; #Heavy };
  public type LootType = { #Weapon; #Armor; #Health };
  public type GamePhase = { #Lobby; #InGame; #GameOver };

  public type Player = {
    id : PlayerId;
    name : Text;
    var x : Float;
    var y : Float;
    var angle : Float;
    var health : Nat;
    var armor : Nat;
    var kills : Nat;
    var weapon : WeaponType;
    var ammo : Nat;
    var alive : Bool;
    isBot : Bool;
  };

  public type PlayerPublic = {
    id : PlayerId;
    name : Text;
    x : Float;
    y : Float;
    angle : Float;
    health : Nat;
    armor : Nat;
    kills : Nat;
    weapon : WeaponType;
    ammo : Nat;
    alive : Bool;
    isBot : Bool;
  };

  public type Loot = {
    id : LootId;
    var x : Float;
    var y : Float;
    lootType : LootType;
    weaponType : WeaponType;
    armorTier : ArmorTier;
    amount : Nat;
    var claimed : Bool;
  };

  public type LootPublic = {
    id : LootId;
    x : Float;
    y : Float;
    lootType : LootType;
    weaponType : WeaponType;
    armorTier : ArmorTier;
    amount : Nat;
    claimed : Bool;
  };

  public type SafeZone = {
    var centerX : Float;
    var centerY : Float;
    var radius : Float;
    var phase : Nat;
    var damagePerTick : Nat;
    var nextShrinkTime : Int;
  };

  public type SafeZonePublic = {
    centerX : Float;
    centerY : Float;
    radius : Float;
    phase : Nat;
    damagePerTick : Nat;
    nextShrinkTime : Int;
  };

  public type KillFeedEntry = {
    killerId : PlayerId;
    killerName : Text;
    victimId : PlayerId;
    victimName : Text;
    weapon : WeaponType;
    timestamp : Int;
  };

  public type GameState = {
    sessionId : SessionId;
    phase : GamePhase;
    players : [PlayerPublic];
    loots : [LootPublic];
    safeZone : SafeZonePublic;
    killFeed : [KillFeedEntry];
    winner : ?Text;
    matchTime : Int;
  };

  public type Session = {
    id : SessionId;
    var phase : GamePhase;
    players : List.List<Player>;
    loots : List.List<Loot>;
    safeZone : SafeZone;
    killFeed : List.List<KillFeedEntry>;
    var winner : ?Text;
    var matchTime : Int;
    var nextPlayerId : PlayerId;
    var nextLootId : LootId;
    var tickCount : Nat;
    matchResults : List.List<LeaderboardTypes.MatchResult>;
  };

  // --- Constants ---
  let MAP_SIZE : Float = 1000.0;
  let BOT_COUNT : Nat = 3;
  let LOOT_COUNT : Nat = 20;
  let LOOT_RESPAWN_MIN : Nat = 5;
  // Zone phases: radius shrinks over 4 phases (every ~30 ticks = 30 seconds at 1 tick/s)
  let _ZONE_PHASE_TICKS : Nat = 30;
  let ZONE_RADII : [Float] = [500.0, 300.0, 150.0, 60.0, 0.0];
  let ZONE_DAMAGES : [Nat] = [0, 5, 10, 20, 30];

  // Weapon damage values
  let PISTOL_DAMAGE : Nat = 10;
  let RIFLE_DAMAGE : Nat = 25;
  let SHOTGUN_DAMAGE : Nat = 40;
  let SNIPER_DAMAGE : Nat = 50;
  let SHOTGUN_RANGE : Float = 80.0;
  let MAX_RANGE : Float = 600.0;

  // Armor mitigation (percent * 100 as integer)
  // Light=10%, Medium=25%, Heavy=40%
  func _armorMitigation(tier : ArmorTier) : Float {
    switch tier {
      case (#Light)  { 0.10 };
      case (#Medium) { 0.25 };
      case (#Heavy)  { 0.40 };
    };
  };

  func weaponDamage(weapon : WeaponType, dist : Float) : Nat {
    switch weapon {
      case (#Pistol)  { PISTOL_DAMAGE };
      case (#Rifle)   { RIFLE_DAMAGE };
      case (#Shotgun) {
        if (dist <= SHOTGUN_RANGE) { SHOTGUN_DAMAGE } else { 5 };
      };
      case (#Sniper)  { SNIPER_DAMAGE };
    };
  };

  func weaponAmmo(weapon : WeaponType) : Nat {
    switch weapon {
      case (#Pistol)  { 12 };
      case (#Rifle)   { 30 };
      case (#Shotgun) { 8 };
      case (#Sniper)  { 5 };
    };
  };

  func dist(ax : Float, ay : Float, bx : Float, by : Float) : Float {
    let dx = ax - bx;
    let dy = ay - by;
    Float.sqrt(dx * dx + dy * dy);
  };

  // Deterministic pseudo-random based on seed
  func pseudoRand(seed : Nat) : Float {
    let n = (seed * 1664525 + 1013904223) % 1_000_000;
    (n.toFloat()) / 1_000_000.0;
  };

  func pseudoRandRange(seed : Nat, lo : Float, hi : Float) : Float {
    lo + pseudoRand(seed) * (hi - lo);
  };

  // Convert Player to PlayerPublic
  public func playerToPublic(p : Player) : PlayerPublic {
    {
      id = p.id;
      name = p.name;
      x = p.x;
      y = p.y;
      angle = p.angle;
      health = p.health;
      armor = p.armor;
      kills = p.kills;
      weapon = p.weapon;
      ammo = p.ammo;
      alive = p.alive;
      isBot = p.isBot;
    };
  };

  // Convert Loot to LootPublic
  public func lootToPublic(l : Loot) : LootPublic {
    {
      id = l.id;
      x = l.x;
      y = l.y;
      lootType = l.lootType;
      weaponType = l.weaponType;
      armorTier = l.armorTier;
      amount = l.amount;
      claimed = l.claimed;
    };
  };

  // Convert SafeZone to SafeZonePublic
  public func safeZoneToPublic(z : SafeZone) : SafeZonePublic {
    {
      centerX = z.centerX;
      centerY = z.centerY;
      radius = z.radius;
      phase = z.phase;
      damagePerTick = z.damagePerTick;
      nextShrinkTime = z.nextShrinkTime;
    };
  };

  // Build a GameState snapshot from session
  public func buildGameState(session : Session) : GameState {
    let players = session.players.map<Player, PlayerPublic>(func(p) { playerToPublic(p) });
    let loots = session.loots.map<Loot, LootPublic>(func(l) { lootToPublic(l) });
    {
      sessionId = session.id;
      phase = session.phase;
      players = players.toArray();
      loots = loots.toArray();
      safeZone = safeZoneToPublic(session.safeZone);
      killFeed = session.killFeed.toArray();
      winner = session.winner;
      matchTime = session.matchTime;
    };
  };

  // Create a new session
  public func createSession(
    sessions : Map.Map<SessionId, Session>,
    nextSessionId : Nat,
    playerName : Text,
  ) : (SessionId, Nat) {
    let sid = nextSessionId;
    let now = Time.now();
    let zone : SafeZone = {
      var centerX = MAP_SIZE / 2.0;
      var centerY = MAP_SIZE / 2.0;
      var radius = ZONE_RADII[0];
      var phase = 0;
      var damagePerTick = ZONE_DAMAGES[0];
      var nextShrinkTime = now + 30_000_000_000; // 30 seconds
    };
    let hostPlayer : Player = {
      id = 0;
      name = playerName;
      var x = MAP_SIZE / 2.0;
      var y = MAP_SIZE / 2.0;
      var angle = 0.0;
      var health = 100;
      var armor = 0;
      var kills = 0;
      var weapon = #Pistol;
      var ammo = weaponAmmo(#Pistol);
      var alive = true;
      isBot = false;
    };
    let players = List.empty<Player>();
    players.add(hostPlayer);
    let session : Session = {
      id = sid;
      var phase = #Lobby;
      players = players;
      loots = List.empty<Loot>();
      safeZone = zone;
      killFeed = List.empty<KillFeedEntry>();
      var winner = null;
      var matchTime = now;
      var nextPlayerId = 1;
      var nextLootId = 0;
      var tickCount = 0;
      matchResults = List.empty<LeaderboardTypes.MatchResult>();
    };
    sessions.add(sid, session);
    (sid, nextSessionId + 1);
  };

  // Join an existing session
  public func joinSession(
    sessions : Map.Map<SessionId, Session>,
    sessionId : SessionId,
    playerName : Text,
  ) : { #ok : PlayerId; #err : Text } {
    switch (sessions.get(sessionId)) {
      case null { #err("Session not found") };
      case (?session) {
        if (session.phase != #Lobby) {
          return #err("Game already started");
        };
        let pid = session.nextPlayerId;
        session.nextPlayerId += 1;
        let p : Player = {
          id = pid;
          name = playerName;
          var x = pseudoRandRange(pid * 7, 100.0, 900.0);
          var y = pseudoRandRange(pid * 13, 100.0, 900.0);
          var angle = 0.0;
          var health = 100;
          var armor = 0;
          var kills = 0;
          var weapon = #Pistol;
          var ammo = weaponAmmo(#Pistol);
          var alive = true;
          isBot = false;
        };
        session.players.add(p);
        #ok(pid);
      };
    };
  };

  // Start game from lobby
  public func startGame(
    sessions : Map.Map<SessionId, Session>,
    sessionId : SessionId,
  ) : { #ok : Bool; #err : Text } {
    switch (sessions.get(sessionId)) {
      case null { #err("Session not found") };
      case (?session) {
        if (session.phase != #Lobby) {
          return #err("Game not in lobby");
        };
        session.phase := #InGame;
        session.matchTime := Time.now();
        // Reset zone schedule
        session.safeZone.nextShrinkTime := Time.now() + 30_000_000_000;
        spawnBots(session);
        spawnInitialLoot(session);
        #ok(true);
      };
    };
  };

  // Move player
  public func movePlayer(
    sessions : Map.Map<SessionId, Session>,
    sessionId : SessionId,
    playerId : PlayerId,
    x : Float,
    y : Float,
    angle : Float,
  ) : { #ok : Bool; #err : Text } {
    switch (sessions.get(sessionId)) {
      case null { #err("Session not found") };
      case (?session) {
        if (session.phase != #InGame) {
          return #err("Game not in progress");
        };
        switch (session.players.find(func(p : Player) : Bool { p.id == playerId })) {
          case null { #err("Player not found") };
          case (?p) {
            if (not p.alive) { return #err("Player is dead") };
            // Clamp to map bounds
            p.x := Float.max(0.0, Float.min(MAP_SIZE, x));
            p.y := Float.max(0.0, Float.min(MAP_SIZE, y));
            p.angle := angle;
            #ok(true);
          };
        };
      };
    };
  };

  // Apply armor mitigation to damage
  func applyArmor(rawDmg : Nat, armorVal : Nat) : Nat {
    // armorVal represents armor tier: 0=none,1=light,2=medium,3=heavy
    // We store armor as a raw HP-like value (max 100) but use tier mapping
    let mit : Float = if (armorVal >= 60) { 0.40 } else if (armorVal >= 30) { 0.25 } else if (armorVal > 0) { 0.10 } else { 0.0 };
    let finalDmg = (rawDmg.toFloat() * (1.0 - mit)).toInt();
    let result = Int.abs(finalDmg);
    if (result == 0) { 1 } else { result };
  };

  // Shoot bullet — compute hit detection
  public func shootBullet(
    sessions : Map.Map<SessionId, Session>,
    sessionId : SessionId,
    playerId : PlayerId,
    targetX : Float,
    targetY : Float,
    killFeedAppend : (KillFeedEntry) -> (),
  ) : { #ok : Bool; #err : Text } {
    switch (sessions.get(sessionId)) {
      case null { #err("Session not found") };
      case (?session) {
        if (session.phase != #InGame) {
          return #err("Game not in progress");
        };
        // Find shooter
        switch (session.players.find(func(p : Player) : Bool { p.id == playerId })) {
          case null { #err("Player not found") };
          case (?shooter) {
            if (not shooter.alive) { return #err("Player is dead") };
            if (shooter.ammo == 0) { return #err("No ammo") };
            shooter.ammo -= 1;
            // Find nearest alive enemy within range along shot direction
            var hit = false;
            session.players.forEach(func(target : Player) {
              if (target.id != playerId and target.alive) {
                let d = dist(target.x, target.y, targetX, targetY);
                let shooterDist = dist(shooter.x, shooter.y, targetX, targetY);
                // Target must be near the aim point and within weapon range
                if (d < 40.0 and shooterDist < MAX_RANGE) {
                  let rawDmg = weaponDamage(shooter.weapon, shooterDist);
                  let finalDmg = applyArmor(rawDmg, target.armor);
                  if (finalDmg >= target.health) {
                    target.health := 0;
                    target.alive := false;
                    shooter.kills += 1;
                    hit := true;
                    let entry : KillFeedEntry = {
                      killerId = shooter.id;
                      killerName = shooter.name;
                      victimId = target.id;
                      victimName = target.name;
                      weapon = shooter.weapon;
                      timestamp = Time.now();
                    };
                    killFeedAppend(entry);
                  } else {
                    target.health -= finalDmg;
                    hit := true;
                  };
                };
              };
            });
            #ok(hit);
          };
        };
      };
    };
  };

  // Pickup loot
  public func pickupLoot(
    sessions : Map.Map<SessionId, Session>,
    sessionId : SessionId,
    playerId : PlayerId,
    lootId : LootId,
  ) : { #ok : Bool; #err : Text } {
    switch (sessions.get(sessionId)) {
      case null { #err("Session not found") };
      case (?session) {
        if (session.phase != #InGame) {
          return #err("Game not in progress");
        };
        switch (session.players.find(func(p : Player) : Bool { p.id == playerId })) {
          case null { #err("Player not found") };
          case (?player) {
            if (not player.alive) { return #err("Player is dead") };
            switch (session.loots.find(func(l : Loot) : Bool { l.id == lootId and not l.claimed })) {
              case null { #err("Loot not found or already claimed") };
              case (?loot) {
                // Must be close enough to pick up
                let d = dist(player.x, player.y, loot.x, loot.y);
                if (d > 60.0) {
                  return #err("Too far from loot");
                };
                loot.claimed := true;
                switch (loot.lootType) {
                  case (#Weapon) {
                    player.weapon := loot.weaponType;
                    player.ammo := weaponAmmo(loot.weaponType);
                  };
                  case (#Armor) {
                    let bonus = switch (loot.armorTier) {
                      case (#Light)  { 30 };
                      case (#Medium) { 60 };
                      case (#Heavy)  { 100 };
                    };
                    player.armor := Nat.min(100, player.armor + bonus);
                  };
                  case (#Health) {
                    player.health := Nat.min(100, player.health + loot.amount);
                  };
                };
                #ok(true);
              };
            };
          };
        };
      };
    };
  };

  // Use health item — restore 30 HP if player has health items
  public func useHealthItem(
    sessions : Map.Map<SessionId, Session>,
    sessionId : SessionId,
    playerId : PlayerId,
  ) : { #ok : Bool; #err : Text } {
    switch (sessions.get(sessionId)) {
      case null { #err("Session not found") };
      case (?session) {
        if (session.phase != #InGame) {
          return #err("Game not in progress");
        };
        switch (session.players.find(func(p : Player) : Bool { p.id == playerId })) {
          case null { #err("Player not found") };
          case (?player) {
            if (not player.alive) { return #err("Player is dead") };
            if (player.health >= 100) {
              return #err("Health already full");
            };
            player.health := Nat.min(100, player.health + 30);
            #ok(true);
          };
        };
      };
    };
  };

  // Advance game tick: bots, zone damage, zone shrink, loot respawn
  public func tickGame(
    sessions : Map.Map<SessionId, Session>,
    sessionId : SessionId,
    leaderboard : Map.Map<Text, LeaderboardTypes.LeaderboardEntry>,
  ) : { #ok : GameState; #err : Text } {
    switch (sessions.get(sessionId)) {
      case null { #err("Session not found") };
      case (?session) {
        if (session.phase != #InGame) {
          return #ok(buildGameState(session));
        };
        session.tickCount += 1;
        session.matchTime := Time.now();

        // Bot AI
        tickBots(session, func(entry : KillFeedEntry) {
          session.killFeed.add(entry);
        });

        // Safe zone damage
        applyZoneDamage(session);

        // Zone shrink
        tryShrinkZone(session);

        // Loot respawn
        respawnLoot(session);

        // Win condition check
        checkWinCondition(session, leaderboard);

        #ok(buildGameState(session));
      };
    };
  };

  // Spawn initial bots for a session
  public func spawnBots(session : Session) : () {
    var i : Nat = 0;
    let baseId = session.nextPlayerId;
    while (i < BOT_COUNT) {
      let pid = baseId + i;
      session.nextPlayerId += 1;
      let weapons : [WeaponType] = [#Pistol, #Rifle, #Shotgun, #Sniper];
      let wi = pid % 4;
      let w = weapons[wi];
      let bot : Player = {
        id = pid;
        name = "Bot-" # (i + 1).toText();
        var x = pseudoRandRange(pid * 3 + 1, 50.0, 950.0);
        var y = pseudoRandRange(pid * 7 + 2, 50.0, 950.0);
        var angle = 0.0;
        var health = 100;
        var armor = 30 * (i % 3); // varied armor
        var kills = 0;
        var weapon = w;
        var ammo = weaponAmmo(w);
        var alive = true;
        isBot = true;
      };
      session.players.add(bot);
      i += 1;
    };
  };

  // Spawn initial loot for a session
  public func spawnInitialLoot(session : Session) : () {
    var i : Nat = 0;
    while (i < LOOT_COUNT) {
      spawnOneLoot(session, i);
      i += 1;
    };
  };

  func spawnOneLoot(session : Session, seed : Nat) : () {
    let lid = session.nextLootId;
    session.nextLootId += 1;
    let lootTypes : [LootType] = [#Weapon, #Armor, #Health, #Weapon, #Health];
    let weapons : [WeaponType] = [#Pistol, #Rifle, #Shotgun, #Sniper, #Pistol, #Rifle];
    let armors : [ArmorTier] = [#Light, #Medium, #Heavy, #Light];
    let ti = (lid + seed) % 5;
    let lt = lootTypes[ti];
    let wi = (lid * 3 + seed) % 6;
    let ai = (lid + seed * 2) % 4;
    let loot : Loot = {
      id = lid;
      var x = pseudoRandRange(lid * 17 + seed + 5, 30.0, 970.0);
      var y = pseudoRandRange(lid * 11 + seed + 9, 30.0, 970.0);
      lootType = lt;
      weaponType = weapons[wi];
      armorTier = armors[ai];
      amount = 25; // health amount
      var claimed = false;
    };
    session.loots.add(loot);
  };

  // Bot AI tick: move toward nearest loot/enemy, shoot when in range
  public func tickBots(
    session : Session,
    killFeedAppend : (KillFeedEntry) -> (),
  ) : () {
    session.players.forEach(func(bot : Player) {
      if (bot.isBot and bot.alive) {
        // Find nearest alive enemy
        var nearestEnemy : ?Player = null;
        var nearestEnemyDist : Float = 9999.0;
        session.players.forEach(func(p : Player) {
          if (p.id != bot.id and p.alive) {
            let d = dist(bot.x, bot.y, p.x, p.y);
            if (d < nearestEnemyDist) {
              nearestEnemyDist := d;
              nearestEnemy := ?p;
            };
          };
        });
        // Find nearest unclaimed loot
        var nearestLoot : ?Loot = null;
        var nearestLootDist : Float = 9999.0;
        session.loots.forEach(func(l : Loot) {
          if (not l.claimed) {
            let d = dist(bot.x, bot.y, l.x, l.y);
            if (d < nearestLootDist) {
              nearestLootDist := d;
              nearestLoot := ?l;
            };
          };
        });
        let speed : Float = 8.0;
        // Decide action: shoot enemy if close, else seek loot, else approach enemy
        switch (nearestEnemy) {
          case (?enemy) {
            if (nearestEnemyDist < 200.0 and bot.ammo > 0) {
              // Shoot at enemy
              bot.angle := Float.arctan2(enemy.y - bot.y, enemy.x - bot.x);
              let rawDmg = weaponDamage(bot.weapon, nearestEnemyDist);
              let finalDmg = applyArmor(rawDmg, enemy.armor);
              if (finalDmg >= enemy.health) {
                enemy.health := 0;
                enemy.alive := false;
                bot.kills += 1;
                bot.ammo -= 1;
                let entry : KillFeedEntry = {
                  killerId = bot.id;
                  killerName = bot.name;
                  victimId = enemy.id;
                  victimName = enemy.name;
                  weapon = bot.weapon;
                  timestamp = Time.now();
                };
                killFeedAppend(entry);
              } else {
                enemy.health -= finalDmg;
                bot.ammo -= 1;
              };
            } else {
              // Move toward loot first if it's close, otherwise approach enemy
              switch (nearestLoot) {
                case (?loot) {
                  if (nearestLootDist < nearestEnemyDist or bot.ammo == 0) {
                    let dx = loot.x - bot.x;
                    let dy = loot.y - bot.y;
                    let d = Float.sqrt(dx * dx + dy * dy);
                    if (d > 0.1) {
                      bot.x += (dx / d) * speed;
                      bot.y += (dy / d) * speed;
                      bot.angle := Float.arctan2(dy, dx);
                    };
                    // Auto-pickup if close
                    if (d < 60.0) {
                      loot.claimed := true;
                      switch (loot.lootType) {
                        case (#Weapon) {
                          bot.weapon := loot.weaponType;
                          bot.ammo := weaponAmmo(loot.weaponType);
                        };
                        case (#Armor) {
                          let bonus = switch (loot.armorTier) {
                            case (#Light)  { 30 };
                            case (#Medium) { 60 };
                            case (#Heavy)  { 100 };
                          };
                          bot.armor := Nat.min(100, bot.armor + bonus);
                        };
                        case (#Health) {
                          bot.health := Nat.min(100, bot.health + loot.amount);
                        };
                      };
                    };
                  } else {
                    let dx = enemy.x - bot.x;
                    let dy = enemy.y - bot.y;
                    let d = Float.sqrt(dx * dx + dy * dy);
                    if (d > 0.1) {
                      bot.x += (dx / d) * speed;
                      bot.y += (dy / d) * speed;
                      bot.angle := Float.arctan2(dy, dx);
                    };
                  };
                };
                case null {
                  let dx = enemy.x - bot.x;
                  let dy = enemy.y - bot.y;
                  let d = Float.sqrt(dx * dx + dy * dy);
                  if (d > 0.1) {
                    bot.x += (dx / d) * speed;
                    bot.y += (dy / d) * speed;
                    bot.angle := Float.arctan2(dy, dx);
                  };
                };
              };
            };
          };
          case null {
            // No enemies, seek loot or wander
            switch (nearestLoot) {
              case (?loot) {
                let dx = loot.x - bot.x;
                let dy = loot.y - bot.y;
                let d = Float.sqrt(dx * dx + dy * dy);
                if (d > 0.1) {
                  bot.x += (dx / d) * speed;
                  bot.y += (dy / d) * speed;
                };
                if (d < 60.0) {
                  loot.claimed := true;
                };
              };
              case null {};
            };
          };
        };
        // Keep bot inside map
        bot.x := Float.max(0.0, Float.min(MAP_SIZE, bot.x));
        bot.y := Float.max(0.0, Float.min(MAP_SIZE, bot.y));
      };
    });
  };

  // Apply safe zone damage to out-of-zone players
  public func applyZoneDamage(session : Session) : () {
    let zone = session.safeZone;
    if (zone.damagePerTick == 0) { return };
    session.players.forEach(func(p : Player) {
      if (p.alive) {
        let d = dist(p.x, p.y, zone.centerX, zone.centerY);
        if (d > zone.radius) {
          let dmg = zone.damagePerTick;
          if (dmg >= p.health) {
            p.health := 0;
            p.alive := false;
          } else {
            p.health -= dmg;
          };
        };
      };
    });
  };

  // Shrink safe zone if scheduled
  public func tryShrinkZone(session : Session) : () {
    let zone = session.safeZone;
    let now = Time.now();
    if (now >= zone.nextShrinkTime and zone.phase < 4) {
      let nextPhase = zone.phase + 1;
      zone.phase := nextPhase;
      zone.radius := ZONE_RADII[Nat.min(nextPhase, 4)];
      zone.damagePerTick := ZONE_DAMAGES[Nat.min(nextPhase, 4)];
      // Next shrink in 30 seconds
      zone.nextShrinkTime := now + 30_000_000_000;
    };
  };

  // Check win condition — set winner if only 1 alive
  public func checkWinCondition(
    session : Session,
    leaderboard : Map.Map<Text, LeaderboardTypes.LeaderboardEntry>,
  ) : () {
    if (session.phase != #InGame) { return };
    let alivePlayers : List.List<Player> = List.empty<Player>();
    session.players.forEach(func(p : Player) {
      if (p.alive) { alivePlayers.add(p) };
    });
    let aliveCount = alivePlayers.size();
    if (aliveCount <= 1) {
      session.phase := #GameOver;
      // Record results
      let now = Time.now();
      let startTime = session.matchTime;
      var placement = 1;
      alivePlayers.forEach(func(p : Player) {
        session.winner := ?p.name;
        let result : LeaderboardTypes.MatchResult = {
          playerName = p.name;
          placement = 1;
          kills = p.kills;
          survivalTime = now - startTime;
          matchId = session.id;
        };
        session.matchResults.add(result);
        // Update leaderboard
        switch (leaderboard.get(p.name)) {
          case null {
            let entry : LeaderboardTypes.LeaderboardEntry = {
              playerName = p.name;
              var kills = p.kills;
              var wins = 1;
              var gamesPlayed = 1;
            };
            leaderboard.add(p.name, entry);
          };
          case (?entry) {
            entry.kills += p.kills;
            entry.wins += 1;
            entry.gamesPlayed += 1;
          };
        };
        placement += 1;
      });
      // Record dead players too (non-winners)
      session.players.forEach(func(p : Player) {
        if (not p.alive and not p.isBot) {
          let result : LeaderboardTypes.MatchResult = {
            playerName = p.name;
            placement = placement;
            kills = p.kills;
            survivalTime = now - startTime;
            matchId = session.id;
          };
          session.matchResults.add(result);
          switch (leaderboard.get(p.name)) {
            case null {
              let entry : LeaderboardTypes.LeaderboardEntry = {
                playerName = p.name;
                var kills = p.kills;
                var wins = 0;
                var gamesPlayed = 1;
              };
              leaderboard.add(p.name, entry);
            };
            case (?entry) {
              entry.kills += p.kills;
              entry.gamesPlayed += 1;
            };
          };
          placement += 1;
        };
      });
    };
  };

  // Respawn loot items if count drops below threshold
  public func respawnLoot(session : Session) : () {
    var available : Nat = 0;
    session.loots.forEach(func(l : Loot) {
      if (not l.claimed) { available += 1 };
    });
    if (available < LOOT_RESPAWN_MIN) {
      let toSpawn = if (available >= LOOT_RESPAWN_MIN) { 0 } else { LOOT_RESPAWN_MIN - available };
      var i : Nat = 0;
      while (i < toSpawn) {
        spawnOneLoot(session, session.tickCount + i);
        i += 1;
      };
    };
  };
};
