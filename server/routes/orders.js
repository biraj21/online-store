import express from "express";
import Cart from "../models/cart.js";
import Order from "../models/order.js";
import { splitDatetime } from "../utils/helpers.js";

// URL: /orders/...

const router = express.Router();

router.use("/", (req, res, next) => {
    if (!req.session.isLoggedIn) {
        res.redirect("/login");
        return;
    }

    next();
});

router.get("/", async (req, res, next) => {
    try {
        const orders = await Order.getAllByUserId(req.session.user.id);
        for (const order of orders) {
            order.orderDate = splitDatetime(order.orderDate).join(", ");
        }

        res.render("pages/shop/orders", {
            route: "/orders",
            pageTitle: "Orders",
            orders,
        });
    } catch (err) {
        next(err);
    }
});

router.get("/:orderId", async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const order = await Order.getByIdAndUser(orderId, req.session.user.id);
        if (!order) {
            next();
            return;
        }

        order.orderDate = splitDatetime(order.orderDate).join(", ");

        res.render("pages/shop/order_details", {
            route: "/orders",
            pageTitle: "Order Details",
            order,
        });
    } catch (err) {
        next(err);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const cart = await Cart.getItemsByUserId(req.session.user.id);
        await Order.create({ cart, userId: req.session.user.id });
        await Cart.deleteByUserId(req.session.user.id);
        res.redirect("/orders");
    } catch (err) {
        next(err);
    }
});

export default router;
