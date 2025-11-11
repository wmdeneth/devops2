const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "authDB";

const client = new MongoClient(uri, {
  connectTimeoutMS: 5000,
  socketTimeoutMS: 30000,
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
});

let database;

async function connectDB() {
  try {
    await client.connect();
    database = client.db(dbName);
    console.log('✅ Connected to MongoDB');
    
    // Test the connection
    await database.command({ ping: 1 });
    console.log('✅ Database ping successful');
    
    return database;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

function getDB() {
  if (!database) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return database;
}

// Cleanup function for graceful shutdown
async function closeDB() {
  try {
    if (client) {
      await client.close();
      console.log('✅ MongoDB connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
  }
}

// Handle application shutdown gracefully
process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDB();
  process.exit(0);
});

module.exports = { connectDB, getDB, closeDB };