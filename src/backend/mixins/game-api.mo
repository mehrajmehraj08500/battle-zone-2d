import Map "mo:core/Map";
import GameLib "../lib/game";
import LeaderboardTypes "../types/leaderboard";

mixin (
  sessions : Map.Map<GameLib.SessionId, GameLib.Session>,
  nextSessionId : Nat,
  leaderboard : Map.Map<Text, LeaderboardTypes.LeaderboardEntry>,
) {
  // Join an existing session
  public func joinSession(sessionId : GameLib.SessionId, playerName : Text) : async { #ok : GameLib.PlayerId; #err : Text } {
    GameLib.joinSession(sessions, sessionId, playerName);
  };

  // Poll full game state
  public query func getGameState(sessionId : GameLib.SessionId) : async { #ok : GameLib.GameState; #err : Text } {
    switch (sessions.get(sessionId)) {
      case null { #err("Session not found") };
      case (?session) { #ok(GameLib.buildGameState(session)) };
    };
  };

  // Start game from lobby
  public func startGame(sessionId : GameLib.SessionId) : async { #ok : Bool; #err : Text } {
    GameLib.startGame(sessions, sessionId);
  };

  // Move player position and angle
  public func movePlayer(sessionId : GameLib.SessionId, playerId : GameLib.PlayerId, x : Float, y : Float, angle : Float) : async { #ok : Bool; #err : Text } {
    GameLib.movePlayer(sessions, sessionId, playerId, x, y, angle);
  };

  // Shoot bullet toward target coordinates
  public func shootBullet(sessionId : GameLib.SessionId, playerId : GameLib.PlayerId, targetX : Float, targetY : Float) : async { #ok : Bool; #err : Text } {
    GameLib.shootBullet(sessions, sessionId, playerId, targetX, targetY, func(entry) {
      switch (sessions.get(sessionId)) {
        case null {};
        case (?session) { session.killFeed.add(entry) };
      };
    });
  };

  // Pick up a loot item
  public func pickupLoot(sessionId : GameLib.SessionId, playerId : GameLib.PlayerId, lootId : GameLib.LootId) : async { #ok : Bool; #err : Text } {
    GameLib.pickupLoot(sessions, sessionId, playerId, lootId);
  };

  // Use a health item from inventory
  public func useHealthItem(sessionId : GameLib.SessionId, playerId : GameLib.PlayerId) : async { #ok : Bool; #err : Text } {
    GameLib.useHealthItem(sessions, sessionId, playerId);
  };

  // Advance game logic tick (bots, zone, loot respawn)
  public func tickGame(sessionId : GameLib.SessionId) : async { #ok : GameLib.GameState; #err : Text } {
    GameLib.tickGame(sessions, sessionId, leaderboard);
  };
};
