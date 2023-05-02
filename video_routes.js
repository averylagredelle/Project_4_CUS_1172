const express = require("express");
const router = express.Router();
const pug = require("pug");

router.use(express.json());
router.use(express.urlencoded({extended: true}));

router.get("/", function(req, res) {
    if(req.session.isAuthenticated) {
        res.send(getView("./Views/Redirects/redirect_home.pug"));
    }
    else {
        res.send(getView("./Views/intro.pug", {title: "Video Share App - Welcome"}));
    }
});

router.get("/dashboard/:videofilter", function(req, res) {
    const video_filter = req.params;
    if(req.session.isAuthenticated) {
        var current_user_index;
        for(let i = 0; i < db.model.users.length; i++) {
            if(db.model.users[i].username == req.session.userID) {
                current_user_index = i;
            }
        }

        res.send(getView("./Views/home.pug", {title: "Video Share App - Home", 
        current_username: req.session.userID, 
        video_filter: video_filter,
        user_index: current_user_index}));
    }
    else {
        res.send(getView("./Views/Redirects/redirect_root.pug"));
    }
});

router.get("/new_video", function(req, res) {
    res.send(getView("./Views/add_video.pug", {title: "Video Share App - Post Video"}));
});

router.post("/new", function(req, res) {
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
})

module.exports = router;

function getView(view = "", model = {}) {
    const compiledView = pug.compileFile(view);
    return compiledView(model);
}