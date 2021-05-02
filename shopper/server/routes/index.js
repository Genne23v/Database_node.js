const express = require("express"),
    userRoute = require("./admin/user"),
    itemRoute = require("./admin/item"),
    orderRoute = require("./admin/orders"),
    shopRoute = require("./shop"),
    basketRoute = require("./basket");

module.exports = (config) => {

    const router = express.Router();
    console.log(`config - ${config}`); //TEMP
    console.log(`router - ${router}`); //TEMP

    router.get("/", (req, res) => {
        res.render("index");
    });

    router.use("/shop", shopRoute(config));
    router.use("/basket", basketRoute(config));

    router.use("/admin/user", userRoute(config));
    router.use("/admin/item", itemRoute(config));
    router.use("/admin/orders", orderRoute(config));

    return router;
}