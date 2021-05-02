const MongoBackend = require("./services/backend/MongoBackend"),
    RedisBackend = require("./services/backend/RedisBackend"),
    MySQLBackend = require("./services/backend/MySQLBackend");

async function runMongo() {
    const mongoBackend = new MongoBackend();
    return mongoBackend.max();
}

async function runRedis() {
    const redisBackend = new RedisBackend();
    return redisBackend.max();
}

async function runMySQL() {
    const mySQLBackend = new MySQLBackend();
    return mySQLBackend.max();
}

runMySQL()
    .then((result) => {
        console.log(result);
    })
    .catch((err) => console.error(err));