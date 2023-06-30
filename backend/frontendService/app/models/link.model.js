const mongoose = require("mongoose");

const InfoLink = mongoose.model(
    "InfoLink",
    new mongoose.Schema({
        infoLinkTitle: String,
        infoLinkUrl: String,
        infoLinkDescription: String,
    })
);

module.exports = InfoLink;