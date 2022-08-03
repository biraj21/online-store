import express from "express";
import Cart from "../models/cart.js";
import Product from "../models/product.js";

// URL: /products/...

const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        const products = await Product.getAll();
        res.render("pages/shop/products", {
            route: "/products",
            pageTitle: "Node Shop",
            products,
        });
    } catch (err) {
        next(err);
    }
});

router.get("/:productId", async (req, res, next) => {
    try {
        const product = await Product.getById(req.params.productId);
        if (!product) {
            next();
            return;
        }

        product.addedToCart = false;
        if (req.session.isLoggedIn) {
            const cart = await Cart.getItemsByUserId(req.session.user.id);
            for (const item of cart) {
                if (item.id == product.id) {
                    product.addedToCart = true;
                }
            }
        }

        res.render("pages/shop/product_details", {
            route: "/products",
            pageTitle: product.name,
            product,
        });
    } catch (err) {
        next(err);
    }
});

export default router;
