import bcrypt from "bcrypt";
import express from "express";
import validator from "validator";
import User from "../models/user.js";
import { ValidationError } from "../utils/error.js";
import { normalizeEmail, validateRequestBody } from "../utils/helpers.js";

const router = express.Router();

router.use(["/login", "/register"], (req, res, next) => {
    if (req.session.isLoggedIn) {
        res.redirect(req.session.user.type === "admin" ? "/admin" : "/");
        return;
    }

    next();
});

router.get("/login", async (req, res, next) => {
    try {
        res.render("pages/shop/login", {
            route: "/login",
            pageTitle: "Login",
            defaults: req.body,
        });
    } catch (err) {
        next(err);
    }
});

router.post("/login", async (req, res, next) => {
    try {
        validateRequestBody(req, ["email", "password"]);

        let { email, password } = req.body;
        email = email.trim();

        if (!validator.isEmail(email)) {
            throw new ValidationError("Invalid email!");
        }

        email = normalizeEmail(email);
        const user = await User.getByEmail(email);
        if (!user) {
            throw new ValidationError("Incorrect email or password!");
        } else if (!(await bcrypt.compare(password, user.password))) {
            throw new ValidationError("Incorrect email or password!");
        }

        req.session.isLoggedIn = true;
        req.session.user = { id: user.id, email: user.email, type: user.type };
        req.session.save((err) => {
            if (err) {
                next(err);
                return;
            }

            res.redirect(user.type === "admin" ? "/admin" : "/");
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            res.status(422).render("pages/shop/login", {
                route: "/login",
                pageTitle: "Login",
                errorMsg: err.message,
                defaults: req.body,
            });

            return;
        }

        next(err);
    }
});

router.get("/register", async (req, res, next) => {
    try {
        res.render("pages/shop/register", {
            route: "/register",
            pageTitle: "Create Account",
            defaults: {},
        });
    } catch (err) {
        next(err);
    }
});

router.post("/register", async (req, res, next) => {
    try {
        validateRequestBody(req, ["name", "email", "password", "confirmPassword"]);

        let { name, email, password, confirmPassword } = req.body;
        name = name.trim();
        email = email.trim();

        if (!validator.isAlpha(name, "en-US", { ignore: /[a-z]\s[a-z]/i })) {
            throw new ValidationError("Enter a valid name!");
        } else if (!validator.isEmail(email)) {
            throw new ValidationError("Enter a valid email!");
        } else if (await User.getByEmail(email)) {
            throw new ValidationError("Email is already taken!");
        } else if (validator.isEmpty(password, { ignore_whitespace: true })) {
            throw new ValidationError("Password cannot have spaces!");
        } else if (password.length < 8) {
            throw new ValidationError("Password should be at least 8 characters long!");
        } else if (password !== confirmPassword) {
            throw new ValidationError("Passwords do not match!");
        }

        email = normalizeEmail(email);
        const { insertId } = await User.create({ name, email, password });

        const user = await User.getById(insertId);
        req.session.user = { id: user.id, email: user.email, type: user.type };
        req.session.isLoggedIn = true;
        req.session.save((err) => {
            if (err) {
                next(err);
                return;
            }

            res.redirect("/");
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            res.status(422).render("pages/shop/register", {
                route: "/register",
                pageTitle: "Create Account",
                errorMsg: err.message,
                defaults: req.body,
            });

            return;
        }

        next(err);
    }
});

router.post("/logout", (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            next(err);
            return;
        }

        res.redirect("/");
    });
});

export default router;
