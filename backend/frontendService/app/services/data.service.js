require("dotenv").config();
const https = require("node:https");
var fs = require("fs");
const path = require("node:path");
const axios = require("axios");

module.exports.getCollections = async (req, res) => {
  if (process.env.API_URL == undefined || process.env.API_URL == "") {
    console.log("API_URL not set");
    res.status(500).send({ message: "Internal error, when fetching data." });
    return;
  }

  var httpsAgent;

  try {
    httpsAgent = await getHttpsAgent();
    console.log(httpsAgent);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ message: "Couldn't create secure connection to api" });
    return;
  }

  let url = `${process.env.API_URL}/collections`;
  let resp = await axios
    .get(url, {
      httpsAgent: httpsAgent,
    })
    .catch((err) => {
      console.log("tried to connect to url: " + url);
      console.log(err);
      res.status(500).send({ message: err.message });
      return;
    });

  if (resp) {
    console.log(resp.data);
    res.status(200).send(resp.data);
  }
};

module.exports.getSensors = async (req, res) => {
  if (process.env.API_URL == undefined || process.env.API_URL == "") {
    console.log("API_URL not set");
    res.status(500).send({ message: "Internal error, when fetching data." });
    return;
  }

  if (!req.query.source) {
    res.status(400).send({ message: "Missing source parameter" });
    return;
  }
  if (!req.query.collection) {
    res.status(400).send({ message: "Missing collection parameter" });
    return;
  }

  try {
    httpsAgent = await getHttpsAgent();
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .send({ message: "Couldn't create secure connection to api" });
    return;
  }

  var filter = "";

  if (req.query.attribute !== undefined && req.query.attribute !== "") {
    filter = `?${req.query.attribute}`;
  }

  let url = `${process.env.API_URL}/collections/${req.query.collection}/${req.query.source}/entities${filter}`;

  let resp = await axios
    .get(url, {
      httpsAgent: httpsAgent,
    })
    .catch((err) => {
      console.log("tried to connect to url: " + url);
      console.log(err);
      res.status(500).send({ message: err.message });
      return;
    });

  if (resp) {
    console.log(resp.data);
    res.status(200).send(resp.data);
  }
};

module.exports.getSources = async (req, res) => {
  if (process.env.API_URL == undefined || process.env.API_URL == "") {
    console.log("API_URL not set");
    res.status(500).send({ message: "Internal error, when fetching data." });
    return;
  }

  if (!req.query.collection) {
    res.status(400).send({ message: "Missing collection parameter" });
    return;
  }

  var httpsAgent;

  try {
    httpsAgent = await getHttpsAgent();
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ message: "Couldn't create secure connection to api" });
    return;
  }

  let url = `${process.env.API_URL}/collections/${req.query.collection}`;

  let resp = await axios
    .get(url, {
      httpsAgent: httpsAgent,
    })
    .catch((err) => {
      console.log("tried to connect to url: " + url);
      console.log(err);
      res.status(500).send({ message: err.message });
      return;
    });

  if (resp) {
    console.log(resp.data);
    res.status(200).send(resp.data);
  }
};

module.exports.getSourceAttributes = async (req, res) => {
  if (process.env.API_URL == undefined || process.env.API_URL == "") {
    console.log("API_URL not set");
    res.status(500).send({ message: "Internal error, when fetching data." });
    return;
  }

  if (!req.query.source) {
    res.status(400).send({ message: "Missing source parameter" });
    return;
  }
  if (!req.query.collection) {
    res.status(400).send({ message: "Missing collection parameter" });
    return;
  }

  var httpsAgent;

  try {
    httpsAgent = await getHttpsAgent();
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .send({ message: "Couldn't create secure connection to api" });
    return;
  }

  let url = `${process.env.API_URL}/collections/${req.query.collection}/${req.query.source}/dictionary`;

  let resp = await axios
    .get(url, {
      httpsAgent: httpsAgent,
    })
    .catch((err) => {
      console.log("tried to connect to url: " + url);
      console.log(err);
      res.status(500).send({ message: err.message });
      return;
    });

  if (resp) {
    console.log(resp.data);
    res.status(200).send(Object.keys(resp.data));
  }
};

async function getHttpsAgent() {
  var certificate;
  var httpsAgentConfig = {};
  if (
    process.env.API_CERTIFICATE_PASSWORD != undefined &&
    process.env.API_CERTIFICATE_PASSWORD != ""
  ) {
    certificate = await getCertificate();
    httpsAgentConfig = {
      pfx: certificate,
      passphrase: process.env.API_CERTIFICATE_PASSWORD,
    };
  }

  return new https.Agent(httpsAgentConfig);
}

function getCertificate() {
  return new Promise((resolve, reject) => {
    try {
      resolve(
        fs.readFileSync(path.join(__dirname, "..", "..", "api_certificate.p12"))
      );
    } catch (err) {
      reject(err);
    }
  });
}
