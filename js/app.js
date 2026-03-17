// Game registry - loaded before game files
const App = { _games: {} };
App.registerGame = function(id, factory) {
  App._games[id] = factory;
};
