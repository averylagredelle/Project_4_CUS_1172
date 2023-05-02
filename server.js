const express = require("express");
const app = express();
const session = require("express-session");
const auth_router = require("./auth_routes.js");
const video_router = require("./video_routes.js");

let db_file = "./Resources/database.json";
let db_format = {
    users: [],
    videos: []
}

global.db = require("./database.js")(db_file, db_format);

app.use(session({
    secret: "SecretCodeLoadedFromEnvironment",
    saveUninitialized: true,
    resave: false,
    cookie: {maxAge: 300000}
}));
app.use("/auth", auth_router);
app.use("/video", video_router);

app.listen(3000, function() {
    console.log("Server is listening on port 3000!")
});
