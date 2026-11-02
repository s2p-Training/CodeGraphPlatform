const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

// Ensure correct DB name 'test' for Production
const MONGO_URI_PROD = "mongodb+srv://root:root@quizdb.okp9bs9.mongodb.net/test?appName=QuizDB";
const MONGO_URI_LOCAL = "mongodb://127.0.0.1:27017/quizDB";

async function run() {
    console.log("Connecting Local Mongoose to", MONGO_URI_LOCAL);
    await mongoose.connect(MONGO_URI_LOCAL);
    
    console.log("Connecting Remote Native Client to Prod...");
    const prodClient = new MongoClient(MONGO_URI_PROD);
    await prodClient.connect();
    const prodDb = prodClient.db('test');
    
    // Load all models relative to the script execution path
    const modelsDir = path.join(__dirname, 'src', 'models');
    
    if (!fs.existsSync(modelsDir)) {
        console.error("Models directory not found at:", modelsDir);
        process.exit(1);
    }

    const modelFiles = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js'));
    console.log(`Found ${modelFiles.length} models. Migrating data based on their latest schemas...`);
    
    for (const file of modelFiles) {
        const modelPath = path.join(modelsDir, file);
        const Model = require(modelPath);
        
        if (Model && Model.collection && Model.collection.name) {
            const collName = Model.collection.name;
            console.log(`\n-----------------------------------------`);
            console.log(`Processing Model: ${Model.modelName} (Collection: ${collName})`);
            
            // Clear local collection using Mongoose
            await Model.deleteMany({});
            console.log(` - Cleared local ${collName}`);
            
            // Fetch remote data natively
            let rawDocs = await prodDb.collection(collName).find({}).toArray();
            console.log(` - Fetched ${rawDocs.length} raw docs from prod ${collName}`);
            
            // Fix "Unsupported BSON version" by stripping prototypes
            rawDocs = JSON.parse(JSON.stringify(rawDocs));
            
            if (rawDocs.length > 0) {
                try {
                    // Mongoose insertMany leverages the latest schema (defaults, validations, transforms)
                    // ordered: false skips docs that fail but inserts the rest successfully.
                    await Model.insertMany(rawDocs, { ordered: false });
                    console.log(` - Successfully migrated ${rawDocs.length} items for ${collName}`);
                } catch (e) {
                    if (e.name === 'BulkWriteError' || e.code === 11000) {
                        console.warn(` - Migrated with some constraint/duplicate warnings, but completed.`);
                    } else if (e.name === 'ValidationError') {
                        console.error(` - Validation Error migrating items for ${collName}:`, e.message);
                    } else {
                        console.error(` - Error inserting items for ${collName}:`, e.message);
                    }
                }
            } else {
                console.log(` - Collection is empty. Skipped.`);
            }
        }
    }
    
    console.log("\n====================================");
    console.log("Migration via Latest Models complete!");
    console.log("====================================");
    await mongoose.disconnect();
    await prodClient.close();
    process.exit(0);
}

run().catch(console.error);