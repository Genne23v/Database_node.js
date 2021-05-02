const http = require("http"),
    mongoose = require("mongoose"),
    Redis = require("ioredis"),
    Sequelize = require("sequelize"),
    config = require("../config"),
    App = require("../app");

async function connectToMongoose() {
    return mongoose.connect(config.mongodb.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    });
}

function connectToRedis() {
    const redis = new Redis(config.redis.port);

    redis.on("connect", () => {
        console.info("Successfully connected to Redis");
    });
    redis.on("errorr", (err) => {
        console.error(err);
        process.exit(1);
    });
    return redis;
}

function connectToMySQL() {
    const sequelize = new Sequelize(config.mysql.options);
    sequelize
        .authenticate()
        .then(() => {
            console.info("Successfully connected to MySQL");
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        })
    return sequelize;
}
const redis = connectToRedis();
config.redis.client = redis;

const mysql = connectToMySQL();
config.mysql.client = mysql;

const app = App(config);
console.log(`app - ${app}`); //TEMP
const port = process.env.PORT || "3000";
app.set("port", port);

function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }
    const bind = typeof port === "string" ?
        `Pipe ${port}` :
        `Port ${port}`;

    switch (error.code) {
        case "EACCES":
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

const server = http.createServer(app);

function onListening() {
    const addr = server.address();
    const bind = typeof addr === "string" ?
        `pipe ${addr}` :
        `port ${addr.port}`;

    console.info(`${config.applicationName} listening on ${bind}`);
}

server.on("Error", onError);
server.on("listening", onListening);

connectToMongoose()
    .then(() => {
        console.info("Successfully connected to MongoDB");
        server.listen(port);
    }).catch((error) => {
        console.error(error);
    })