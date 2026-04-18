import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import LeaderboardTypes "../types/leaderboard";

module {
  // Get top 10 leaderboard entries sorted by kills
  public func getLeaderboard(
    leaderboard : Map.Map<Text, LeaderboardTypes.LeaderboardEntry>
  ) : [LeaderboardTypes.LeaderboardEntryPublic] {
    let all = leaderboard.entries();
    var entries : List.List<LeaderboardTypes.LeaderboardEntryPublic> = List.empty();
    for ((_, e) in all) {
      entries.add({
        playerName = e.playerName;
        kills = e.kills;
        wins = e.wins;
        gamesPlayed = e.gamesPlayed;
      });
    };
    let arr = entries.toArray();
    let sorted = arr.sort(func(a : LeaderboardTypes.LeaderboardEntryPublic, b : LeaderboardTypes.LeaderboardEntryPublic) : { #less; #equal; #greater } {
      if (a.kills > b.kills) { #less }
      else if (a.kills < b.kills) { #greater }
      else { #equal };
    });
    if (sorted.size() > 10) {
      sorted.sliceToArray(0, 10);
    } else {
      sorted;
    };
  };

  // Get last 5 match results for session
  public func getMatchHistory(
    matchHistory : Map.Map<LeaderboardTypes.SessionId, List.List<LeaderboardTypes.MatchResult>>,
    sessionId : LeaderboardTypes.SessionId,
  ) : [LeaderboardTypes.MatchResult] {
    switch (matchHistory.get(sessionId)) {
      case null { [] };
      case (?results) {
        let arr = results.toArray();
        if (arr.size() > 5) {
          arr.sliceToArray(arr.size() - 5 : Int, arr.size());
        } else {
          arr;
        };
      };
    };
  };

  // Record a match result and update leaderboard
  public func recordMatchResult(
    leaderboard : Map.Map<Text, LeaderboardTypes.LeaderboardEntry>,
    matchHistory : Map.Map<LeaderboardTypes.SessionId, List.List<LeaderboardTypes.MatchResult>>,
    sessionId : LeaderboardTypes.SessionId,
    playerName : Text,
    placement : Nat,
    kills : Nat,
    survivalTime : Int,
  ) : () {
    let result : LeaderboardTypes.MatchResult = {
      playerName;
      placement;
      kills;
      survivalTime;
      matchId = sessionId;
    };
    // Update match history
    switch (matchHistory.get(sessionId)) {
      case null {
        let list = List.empty<LeaderboardTypes.MatchResult>();
        list.add(result);
        matchHistory.add(sessionId, list);
      };
      case (?list) {
        list.add(result);
      };
    };
    // Update leaderboard
    let isWin = placement == 1;
    switch (leaderboard.get(playerName)) {
      case null {
        let entry : LeaderboardTypes.LeaderboardEntry = {
          playerName;
          var kills;
          var wins = if (isWin) { 1 } else { 0 };
          var gamesPlayed = 1;
        };
        leaderboard.add(playerName, entry);
      };
      case (?entry) {
        entry.kills += kills;
        if (isWin) { entry.wins += 1 };
        entry.gamesPlayed += 1;
      };
    };
  };
};
