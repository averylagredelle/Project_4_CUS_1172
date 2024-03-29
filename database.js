const fs = require("fs");

var loadDatabase = (file_name, format = {}) => {
    if(!fs.existsSync(file_name)) {
        fs.writeFileSync(file_name, JSON.stringify(format));
    }

    let model = require(file_name);

    var db = {
        model: model,
        fileName: file_name,
        update: () => {
            fs.writeFileSync(file_name, JSON.stringify(model));
        }
    }
    return db;
}

module.exports = loadDatabase;