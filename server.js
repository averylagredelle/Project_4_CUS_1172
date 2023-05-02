const express = require("express");
const app = express();
const router = require("./routes.js");

let db_file = "./Resources/database.json";
let db_format = {
    users: [],
    videos: []
}

global.db = require("./database.js")(db_file, db_format);

app.use("/app", router);

app.listen(3000, function() {
    console.log("Server is listening on port 3000!")
});
