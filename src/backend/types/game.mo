import Common "common";

module {
  public type SessionId = Common.SessionId;
  public type PlayerId = Common.PlayerId;
  public type LootId = Common.LootId;
  public type Timestamp = Common.Timestamp;

  public type WeaponType = {
    #Pistol;
    #Rifle;
    #Shotgun;
    #Sniper;
  };

  public type ArmorTier = {
    #Light;
    #Medium;
    #Heavy;
  };

  public type LootType = {
    #Weapon;
    #Armor;
    #Health;
  };

  public type GamePhase = {
    #Lobby;
    #InGame;
    #GameOver;
  };

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
    var nextShrinkTime : Timestamp;
  };

  public type SafeZonePublic = {
    centerX : Float;
    centerY : Float;
    radius : Float;
    phase : Nat;
    damagePerTick : Nat;
    nextShrinkTime : Timestamp;
  };

  public type KillFeedEntry = {
    killerId : PlayerId;
    killerName : Text;
    victimId : PlayerId;
    victimName : Text;
    weapon : WeaponType;
    timestamp : Timestamp;
  };

  public type GameState = {
    sessionId : SessionId;
    phase : GamePhase;
    players : [PlayerPublic];
    loots : [LootPublic];
    safeZone : SafeZonePublic;
    killFeed : [KillFeedEntry];
    winner : ?Text;
    matchTime : Timestamp;
  };

  public type Session = {
    id : SessionId;
    var phase : GamePhase;
    players : List_Player;
    loots : List_Loot;
    safeZone : SafeZone;
    killFeed : List_KillFeedEntry;
    var winner : ?Text;
    var matchTime : Timestamp;
    var nextPlayerId : PlayerId;
    var nextLootId : LootId;
    var tickCount : Nat;
  };

  // We use opaque List aliases here to avoid import cycle; main.mo will use mo:core/List
  public type List_Player = { add : Player -> (); toArray : () -> [Player]; find : (Player -> Bool) -> ?Player; size : () -> Nat; mapInPlace : (Player -> Player) -> (); filter : (Player -> Bool) -> List_Player; forEach : (Player -> ()) -> () };
  public type List_Loot = { add : Loot -> (); toArray : () -> [Loot]; find : (Loot -> Bool) -> ?Loot; size : () -> Nat; forEach : (Loot -> ()) -> () };
  public type List_KillFeedEntry = { add : KillFeedEntry -> (); toArray : () -> [KillFeedEntry] };

  public type LeaderboardEntry = {
    playerName : Text;
    kills : Nat;
    wins : Nat;
    gamesPlayed : Nat;
  };

  public type MatchResult = {
    playerName : Text;
    placement : Nat;
    kills : Nat;
    survivalTime : Timestamp;
    matchId : SessionId;
  };
};
