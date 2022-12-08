const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

// Extend the default timeout so MongoDB binaries can download
jest.setTimeout(60000);

// List all of your collection names here - I'll add some examples
const COLLECTIONS = ["users", "roles", "dashboards", "querydatas", "tabs"];

class DBManager {
  constructor() {
    this.db = null;
    this.connection = null;
  }

  // Spin up a new in-memory mongo instance
  async start() {
    this.server = await MongoMemoryServer.create();
    const url = await this.server.getUri();
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.connection = mongoose.connection;
  }

  // Close the connection and halt the mongo instance
  stop() {
    this.connection.close();
    return this.server.stop();
  }

  // Remove all documents from the entire database - useful between tests
  async cleanup() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  }
}

module.exports = DBManager;
