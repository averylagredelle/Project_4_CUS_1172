const express = require("express");
const router = express.Router();
const pug = require("pug");

router.use(express.json());
router.use(express.urlencoded({extended: true}));

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
        res.send(getView("./Views/error.pug", {title: "Error Occurred"}));
    }
});

router.get("/register", function(req, res) {
    res.send(getView("./Views/create_account.pug", {title: "Video Share App - Sign Up"}));
});

router.post("/register", function(req, res) {
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
        res.send(getView("./Views/error.pug", {title: "Error Occurred"}));
    }
});

router.get("/signout", function(req, res) {
    req.session.destroy((err)=>{
        if(err) {
            console.log(err);
            res.send(getView("./Views/error.pug", {title: "Error Occurred"}));
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