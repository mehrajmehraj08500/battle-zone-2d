import Map "mo:core/Map";
import List "mo:core/List";
import LeaderboardLib "../lib/leaderboard";
import LeaderboardTypes "../types/leaderboard";

mixin (
  leaderboard : Map.Map<Text, LeaderboardTypes.LeaderboardEntry>,
  matchHistory : Map.Map<LeaderboardTypes.SessionId, List.List<LeaderboardTypes.MatchResult>>,
) {
  // Returns all-time top 10 leaderboard entries by kills
  public query func getLeaderboard() : async [LeaderboardTypes.LeaderboardEntryPublic] {
    LeaderboardLib.getLeaderboard(leaderboard);
  };

  // Returns last 5 match results for a session
  public query func getMatchHistory(sessionId : LeaderboardTypes.SessionId) : async [LeaderboardTypes.MatchResult] {
    LeaderboardLib.getMatchHistory(matchHistory, sessionId);
  };
};
