db = db.getSiblingDB("smartcity-dashboard");

db.createUser({
  user: "smartcity",
  pwd: "xbox-anger-amiable2",
  roles: [{ role: "readWrite", db: "smartcity-dashboard" }],
});

db.createCollection("dashboards");
db.createCollection("querydatas");
db.createCollection("pois");
db.createCollection("tabs");
