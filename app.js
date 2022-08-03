import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import csurf from "csurf";
import dotenv from "dotenv";
import { renderFile } from "eta";
import express from "express";
import session from "express-session";

import MariaStore from "./server/lib/connect_maria.js";
import flash from "./server/middlewares/flash.js";
import adminRouter from "./server/routes/admin.js";
import authRouter from "./server/routes/auth.js";
import cartRouter from "./server/routes/cart.js";
import forgotPasswordRouter from "./server/routes/forgot_password.js";
import ordersRouter from "./server/routes/orders.js";
import productsRouter from "./server/routes/products.js";
import dbPool from "./server/utils/database.js";

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

const app = express();
app.engine("eta", renderFile);
app.set("view engine", "eta");

app.use(express.static("./public"));
app.use(cookieParser());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: new MariaStore(dbPool),
    })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(csurf());
app.use(flash);

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn;
    res.locals.userType = req.session.user?.type;
    res.locals.errorMsg = req.flash.get("error");
    res.locals.successMsg = req.flash.get("success");
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(authRouter);
app.use("/admin", adminRouter);
app.use("/cart", cartRouter);
app.use("/forgot-password", forgotPasswordRouter);
app.use("/orders", ordersRouter);
app.use("/products", productsRouter);

app.get("/", (req, res, next) => {
    res.render("pages/shop/home", {
        pageTitle: "Node Shop",
        route: "/",
    });
});

app.use((req, res, next) => {
    res.status(404).render("pages/404", {
        route: req.url,
        pageTitle: "Page Not Found",
    });
});

app.use((err, req, res, next) => {
    if (err.message === "invalid csrf token") {
        res.status(400).send("Invalid csrf token");
        console.error(err.message);
        return;
    }

    console.error(err);
    res.status(502).send("internal server error");
});

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}...`));
