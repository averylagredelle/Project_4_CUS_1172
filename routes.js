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
    cookie: {maxAge: 300000}
}));

router.get("/", function(req, res) {
    if(req.session.isAuthenticated) {
        res.send(getView("./Views/Redirects/redirect_home.pug"));
    }
    else {
        res.send(getView("./Views/intro.pug", {title: "Video Share App - Welcome"}));
    }
})

router.get("/home", function(req, res) {
    if(req.session.isAuthenticated) {
        res.send(getView("./Views/home.pug", {title: "Video Share App - Home", current_username: req.session.userID}));
    }
    else {
        res.send(getView("./Views/Redirects/redirect_root.pug"));
    }
});

router.get("/login", function(req, res) {
    res.send(getView("./Views/login.pug", {title: "Video Share App - Login"}));
});

router.post("/login", function(req, res) {
    const {username, password} = req.body
    for(user of db.model.users) {
        if(user.username == username && user.password == password) {
            req.session.userID = username;
            req.session.isAuthenticated = true;
        }
    }
    if(req.session.isAuthenticated) {
        res.send(getView("./Views/Redirects/redirect_home.pug"));
    }
    else {
        res.send("Username or Password incorrect. Please go back and try again.");
    }
});

router.get("/signup", function(req, res) {
    res.send(getView("./Views/create_account.pug", {title: "Video Share App - Sign Up"}));
});

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
        req.session.userID = username;
        req.session.isAuthenticated = true;
        res.send(getView("./Views/Redirects/redirect_home.pug"));
    }
    else {
        res.send("Sorry, there was an error. Please go back and try a different username.");
    }
});

router.get("/post-video", function(req, res) {
    res.send(getView("./Views/add_video.pug", {title: "Video Share App - Post Video"}));
});

router.post("/post-video", function(req, res) {
    const {title, description, link} = req.body;
    var current_user_index = -1;
    for(let i = 0; i < db.model.users.length; i++) {
        if(db.model.users[i].username == req.session.userID) {
            current_user_index = i;
        }
    }
    if(current_user_index >= 0) {
        const new_video = {
            title: title,
            description: description,
            link: link
        }
        db.model.users[current_user_index].videos_posted.push(new_video);
        db.model.videos.push(new_video);
        db.update();
        res.send(getView("./Views/Redirects/redirect_home.pug"));
    }
    else {
        res.send(getView("./Views/Redirects/redirect_root.pug"));
    }
});

router.get("/signout", function(req, res) {
    req.session.destroy((err)=>{
        if(err) {
            res.send(err);
        }
        else {
            res.send(getView("./Views/Redirects/redirect_root.pug"));
        }
    });
});

module.exports = router;

function getView(view = "", model = {}) {
    const compiledView = pug.compileFile(view);
    return compiledView(model);
}