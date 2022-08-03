import express from "express";
import Cart from "../models/cart.js";

// URL: /cart/...

const router = express.Router();

router.use((req, res, next) => {
    if (!req.session.isLoggedIn) {
        res.redirect("/login");
        return;
    }

    next();
});

router.get("/", async (req, res, next) => {
    try {
        const cart = await Cart.getItemsByUserId(req.session.user.id);
        res.render("pages/shop/cart", {
            route: "/cart",
            pageTitle: "Cart",

            cart,
        });
    } catch (err) {
        next(err);
    }
});

router.post("/:productId", async (req, res, next) => {
    try {
        await Cart.addItem(
            parseInt(req.params.productId),
            parseInt(req.body.quantity),
            req.session.user.id
        );
        res.redirect("/cart");
    } catch (err) {
        next(err);
    }
});

router.post("/remove-item/:productId", async (req, res, next) => {
    try {
        await Cart.removeItem(parseInt(req.params.productId), req.session.user.id);
        res.redirect("/cart");
    } catch (err) {
        next(err);
    }
});

export default router;
