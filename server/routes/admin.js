import express from "express";
import validator from "validator";
import Order from "../models/order.js";
import Product from "../models/product.js";
import { ValidationError } from "../utils/error.js";
import { splitDatetime, validateRequestBody } from "../utils/helpers.js";

// URL: /admin/...

const router = express.Router();

router.use("/", async (req, res, next) => {
    if (!req.session.isLoggedIn || req.session.user.type !== "admin") {
        res.status(403).send("forbidden");
        return;
    }

    next();
});

router.get("/", async (req, res, next) => {
    res.render("pages/admin/home", {
        route: "/admin",
        pageTitle: "Admin",
    });
});

router.get("/products", async (req, res, next) => {
    try {
        const products = await Product.getAll();
        res.render("pages/admin/products", {
            route: "/admin/products",
            pageTitle: "Admin | Products",
            products,
        });
    } catch (err) {
        next(err);
    }
});

router.get("/add-product", (req, res, next) => {
    res.render("pages/admin/edit_product", {
        route: "/admin/products",
        pageTitle: "Admin | Add Product",
    });
});

router.post("/add-product", async (req, res, next) => {
    try {
        validateRequestBody(req, ["name", "price", "description", "imageUrl"]);

        let { name, price, description, imageUrl } = req.body;
        name = name.trim();
        price = price.trim();
        description = description.trim();
        imageUrl = imageUrl.trim();

        if (name.length < 5) {
            throw new ValidationError("Enter a valid name!");
        } else if (!validator.isNumeric(price) || Number(price) < 0) {
            throw new ValidationError("Enter a valid price!");
        } else if (description.length < 20) {
            throw new ValidationError("Enter a valid description!");
        } else if (!validator.isURL(imageUrl, { require_protocol: true })) {
            throw new ValidationError("Enter a valid image URL!");
        }

        req.flash.set("success", "Product was successfully added!");
        await Product.create({ name, price, description, imageUrl, userId: req.session.user.id });
        res.redirect("/admin/products");
    } catch (err) {
        if (err instanceof ValidationError) {
            res.status(422).render("pages/admin/edit_product", {
                route: "/admin/products",
                pageTitle: "Admin | Add Product",
                errorMsg: err.message,
                product: req.body,
            });

            return;
        }

        next(err);
    }
});

router.get("/edit-product/:productId", async (req, res, next) => {
    try {
        const product = await Product.getById(req.params.productId);
        if (!product) {
            next();
            return;
        }

        res.render("pages/admin/edit_product", {
            route: "/admin/products",
            pageTitle: "Admin | Edit Product",
            editing: true,
            product,
        });
    } catch (err) {
        next(err);
    }
});

router.post("/edit-product/:productId", async (req, res, next) => {
    const { productId } = req.params;

    try {
        if (!(await Product.existsId(productId))) {
            next();
            return;
        }

        let { name, price, description, imageUrl } = req.body;
        name = name.trim();
        price = price.trim();
        description = description.trim();
        imageUrl = imageUrl.trim();

        if (name.length < 5) {
            throw new ValidationError("Enter a valid name!");
        } else if (!validator.isNumeric(price) || Number(price) < 0) {
            throw new ValidationError("Enter a valid price!");
        } else if (description.length < 20) {
            throw new ValidationError("Enter a valid description!");
        } else if (!validator.isURL(imageUrl, { require_protocol: true })) {
            throw new ValidationError("Enter a valid image URL!");
        }

        await Product.updateById({ name, price, description, imageUrl }, productId);
        req.flash.set("success", "Product was successfully updated!");
        res.redirect("/admin/products");
    } catch (err) {
        if (err instanceof ValidationError) {
            res.status(422).render("pages/admin/edit_product", {
                route: "/admin/products",
                pageTitle: "Admin | Edit Product",
                editing: true,
                errorMsg: err.message,
                product: { id: productId, ...req.body },
            });

            return;
        }

        next(err);
    }
});

router.post("/delete-product/:productId", async (req, res, next) => {
    try {
        const result = await Product.deleteById(req.params.productId);
        if (result.affectedRows == 0) {
            next();
            return;
        }

        req.flash.set("success", "Product was successfully deleted!");
        res.redirect("/admin/products");
    } catch (err) {
        next(err);
    }
});

router.get("/orders", async (req, res, next) => {
    try {
        const orders = await Order.getAll();
        for (const order of orders) {
            order.orderDate = splitDatetime(order.orderDate).join(", ");
        }

        res.render("pages/admin/orders", {
            route: "/admin/orders",
            pageTitle: "Admin | Orders",
            orders,
        });
    } catch (err) {
        next(err);
    }
});

router.get("/orders/:orderId", async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const order = await Order.getById(orderId);
        if (!order) {
            next();
            return;
        }

        order.orderDate = splitDatetime(order.orderDate).join(", ");

        res.render("pages/admin/order_details", {
            route: "/Admin/orders",
            pageTitle: "Admin | Orders",
            order,
        });
    } catch (err) {
        next(err);
    }
});

export default router;
