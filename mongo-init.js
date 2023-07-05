db = db.getSiblingDB("smartcity-dashboard");

db.createCollection("dashboards");
db.createCollection("querydatas");
db.createCollection("roles");
db.createCollection("tabs");
db.createCollection("users");

// Roles insert
db.roles.insertOne({
  _id: ObjectId("61682bf1cce96b4598075644"),
  name: "admin",
});

// Users insert
db.users.insertOne({
  username: "dev-admin",
  password: "$2a$08$NIrP.cxtKw2sYl3JcqBzwuQopo3T82lzlAar3UIpM7Ei.Luh00Xcy",
  roles: [ObjectId("61682bf1cce96b4598075644")],
});
