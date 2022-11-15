const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//get all players API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team ORDER BY player_id;`;
  const playersArray = await db.all(getPlayersQuery);
  let responseArr = [];
  for (let eachObj of playersArray) {
    responseArr.push(convertDbObjectToResponseObject(eachObj));
  }
  response.send(responseArr);
});

//post API
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const postQuery = `INSERT INTO cricket_team (player_name,jersey_number,role)
    VALUES(
        '${playerName}',
        ${jerseyNumber},
        '${role}'
    );`;
  const dbResponse = await db.run(postQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//get player by player ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerByIdQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
  const player = await db.get(getPlayerByIdQuery);
  response.send(convertDbObjectToResponseObject(player));
});

//put API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updateDetailsQuery = `
  UPDATE 
    cricket_team 
  SET 
    player_name='${playerName}',
    jersey_number=${jerseyNumber},
    role='${role}'
WHERE 
    player_id=${playerId};`;
  await db.run(updateDetailsQuery);
  response.send("Player Details Updated");
});

//delete API
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `DELETE FROM cricket_team WHERE player_id=${playerId};`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
