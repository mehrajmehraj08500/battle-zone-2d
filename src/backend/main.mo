import Map "mo:core/Map";
import List "mo:core/List";
import GameLib "lib/game";
import LeaderboardTypes "types/leaderboard";
import GameApi "mixins/game-api";
import LeaderboardApi "mixins/leaderboard-api";

actor {
  // Game sessions keyed by SessionId
  let sessions = Map.empty<GameLib.SessionId, GameLib.Session>();
  var nextSessionId : Nat = 1;

  // Global leaderboard keyed by playerName
  let leaderboard = Map.empty<Text, LeaderboardTypes.LeaderboardEntry>();

  // Match history keyed by SessionId
  let matchHistory = Map.empty<LeaderboardTypes.SessionId, List.List<LeaderboardTypes.MatchResult>>();

  // Override createSession to update nextSessionId counter
  public func createSession(playerName : Text) : async GameLib.SessionId {
    let (sid, newNext) = GameLib.createSession(sessions, nextSessionId, playerName);
    nextSessionId := newNext;
    sid;
  };

  include GameApi(sessions, nextSessionId, leaderboard);
  include LeaderboardApi(leaderboard, matchHistory);
};
