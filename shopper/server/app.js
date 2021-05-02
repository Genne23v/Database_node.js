const basket = require("./routes/basket");

const express = require("express"),
    path = require("path"),
    bodyParser = require("body-parser"),
    session = require("express-session"),
    RedisStore = require("connect-redis")(session),
    UserService = require("./services/UserService"),
    BasketService = require("./services/BasketService"),
    routeHandler = require("./routes");

module.exports = (config) => {
    const app = express();
    //VIEW ENGINE SETUP
    app.set("views", path.join(__dirname, "views"));
    app.set("view engine", "pug");

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    app.set("trust proxy", 1);
    app.use(session({
        store: new RedisStore({ client: config.redis.client }),
        secret: "very secret secret to encrypt session",
        resave: false,
        saveUninitialized: false
    }));

    app.use(express.static(path.join(__dirname, "../client")));
    app.get("/favicon.icon", (req, res) => {
        res.status(204);
    });
    app.get("robots.txt", (req, res) => {
        res.status(204);
    });

    //DEFINE GLOBAL TEMPLATE VARIABLES
    app.use(async(req, res, next) => {
        res.locals.applicationName = config.applicationName;
        //SET UP FLASH MESSAGING
        if (!req.session.messages) {
            req.session.messages = [];
        }
        res.locals.messages = req.session.messages;

        if (req.session.userId) {
            try {
                res.locals.currentUser = await UserService.getOne(req.session.userId);
                const basket = new BasketService(config.redis.client, req.session.userId);

                let basketCount = 0;
                const basketContents = await basket.getAll();

                if (basketContents) {
                    Object.keys(basketContents).forEach((itemId) => {
                        basketCount += parseInt(basketContents[itemId], 10);
                    });
                }
                res.locals.basketCount = basketCount;
            } catch (err) {
                return next(err);
            }
        }
        return next();
    });

    app.use("/", routeHandler(config));

    //CATCH 404 AND FORWARD TO ERROR HANDLER
    app.use((req, res, next) => {
        const err = new Error(`Not Found (${req.url})`);
        err.status = 404;
        next(err);
    });

    //ERROR HANDLER
    app.use(((err, req, res) => {
        res.locals.message = err.message;
        res.locals.error = req.app.get("env") === "development" ? err : {};

        res.status(err.status || 500);
        res.render("error");
    }));

    return app;
}