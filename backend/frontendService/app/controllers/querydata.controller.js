const db = require("../models");
const Querydata = db.querydata;

exports.updateOneById = (updateId, updateContent) => {
    return new Promise((resolve, reject) => {
        Querydata.updateOne({ _id: updateId }, updateContent, (err, res) => {
            if (err) {
                reject(err);
            }
            if (!res.matchedCount) {
                reject("No QueryData found");
            }
            console.log("updated queryData");
            resolve();
        });
    });
}


exports.deleteMany = (idsToDelete) => {
    return new Promise((resolve, reject) => {
        Querydata.deleteMany({
            _id: {
                $in: idsToDelete
            }
        }, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

exports.insertMany = (qdToInsert) => {
    return new Promise((resolve, reject) => {
        Querydata.insertMany(qdToInsert, (err, data) => {
            if (err) {
                reject(err);
            } else {
                console.log("qd added");
                resolve(data);
            }
        });
    });

}



exports.findAllIds = () => {
    return new Promise((resolve, reject) => {
        Querydata.find({}, 'name _id', (err, qdIds) => {
            if (err) {
                reject(err);
            }
            if (!qdIds) {
                reject("no QueryData found");
            }
            resolve(qdIds);
        });
    });
}


exports.findById = (id) => {
    return new Promise((resolve, reject) => {
        Querydata.findById(id, (err, result) => {
            if (err) {
                reject(err);
            }
            if (!result) {
                reject("no QueryDataFound");
            }
            resolve(result);
        });
    });
}
