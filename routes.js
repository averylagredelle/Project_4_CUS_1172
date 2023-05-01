const express = require("express");
const router = express.Router();
const session = require("express-session");
const pug = require("pug");

router.use(express.json());
router.use(express.urlencoded({extended: true}));
router.use(session({
    secret: "SecretCodeLoadedFromEnvironment",
    saveUninitialized: true,
    resave: false,
    cookie: {maxAge: 60000}
}));

router.get("/", function(req, res) {
    if(req.session.isAuthenticated) {
        res.send(getView("./Views/home.pug", {title: "Video Share App - Home"}));
    }
    else {
        res.send(getView("./Views/intro.pug", {title: "Video Share App - Welcome"}));
    }
});

router.get("/login", function(req, res) {
    res.send(getView("./Views/login.pug", {title: "Video Share App - Login"}));
})

router.post("/login", function(req, res) {
    const {username, password} = req.body
    for(user of db.model.users) {
        if(user.username == username && user.password == password) {
            req.session.userID = username;
            req.session.isAuthenticated = true;
            res.send(getView("./Views/home.pug", {title: "Video Share App - Home"}));
        }
    }
    res.send("Username or Password incorrect. Please go back and try again.")
})

router.get("/signup", function(req, res) {
    res.send(getView("./Views/create_account.pug", {title: "Video Share App - Sign Up"}));
})

router.post("/signup", function(req, res) {
    const {username, password, password_confirm} = req.body;
    let username_taken = false;
    let passwords_match = false;
    for(user of db.model.users) {
        if(user.username == username) {
            username_taken = true;
        }
    }

    if(password == password_confirm) {
        passwords_match = true;
    }

    if(passwords_match && !username_taken) {
        db.model.users.push({
            username: username,
            password: password,
            videos_posted: []
        });
        db.update();
        res.send(getView("./Views/home.pug", {title: "Video Share App - Home"}));
    }
    else {
        res.send("Sorry, there was an error. Please go back and try a different username.");
    }
})

module.exports = router;

function getView(view = "", model = {}) {
    const compiledView = pug.compileFile(view);
    return compiledView(model);
}