import Common "common";

module {
  public type SessionId = Common.SessionId;
  public type PlayerId = Common.PlayerId;

  public type LeaderboardEntry = {
    playerName : Text;
    var kills : Nat;
    var wins : Nat;
    var gamesPlayed : Nat;
  };

  public type LeaderboardEntryPublic = {
    playerName : Text;
    kills : Nat;
    wins : Nat;
    gamesPlayed : Nat;
  };

  public type MatchResult = {
    playerName : Text;
    placement : Nat;
    kills : Nat;
    survivalTime : Int;
    matchId : SessionId;
  };
};
