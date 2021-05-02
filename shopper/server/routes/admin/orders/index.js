const express = require("express");
const OrderService = require("../../../services/OrderService");

module.exports = (config) => {
    const router = express.Router();

    const order = new OrderService(config.mysql.client);

    router.get("/", async(req, res, next) => {
        try {
            const orderResult = await order.getAll();
            const orders = orderResult.map((item) => item.get({ plain: true }));
            return res.render("admin/orders", { orders });
        } catch (err) {
            req.session.messages.push({
                type: "danger",
                text: "There was an error fetching the orders"
            });
            console.error(err);
            return next(err);
        }
    });

    router.get("/setshipped/:orderId", async(req, res, next) => {
        try {
            await order.setStatus(req.params.orderId, "Shipped");
            req.session.messages.push({
                type: "success",
                text: "Status updated"
            });
            return res.redirect("/admin/orders");
        } catch (err) {
            req.session.messages.push({
                type: "danger",
                text: "There was an error updating the order"
            });
            console.error(err);
            return res.redirect("/admin/orders");
        }
    });

    return router;
}