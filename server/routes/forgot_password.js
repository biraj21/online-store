import crypto from "node:crypto";
import express from "express";
import validator from "validator";
import ForgotPasswordToken from "../models/forgot_password_token.js";
import User from "../models/user.js";
import sendEmail from "../utils/email.js";
import { ValidationError } from "../utils/error.js";
import { normalizeEmail, validateRequestBody } from "../utils/helpers.js";

// URL: /forgot-password/...

const router = express.Router();

router.use("/", (req, res, next) => {
    if (req.session.isLoggedIn) {
        res.redirect(req.session.user.type === "admin" ? "/admin" : "/");
        return;
    }

    next();
});

router.get("/", (req, res, next) => {
    res.render("pages/shop/forgot_password", {
        route: "/forgot-password",
        pageTitle: "Forgot Password",
        defaults: {},
    });
});

router.post("/", async (req, res, next) => {
    try {
        validateRequestBody(req, ["email"]);

        let { email } = req.body;
        email = email.trim();

        if (!validator.isEmail(email)) {
            throw new ValidationError("Invalid email!");
        }

        email = normalizeEmail(email);
        if (!(await User.getByEmail(email))) {
            throw new ValidationError("No user found with this email!");
        }

        await ForgotPasswordToken.deleteByEmail(email);

        crypto.randomBytes(32, async (err, buf) => {
            if (err) throw err;

            const token = buf.toString("hex");
            await ForgotPasswordToken.create({
                email,
                token,
                expires: new Date(Date.now() + 900_000),
            });

            sendEmail({
                to: email,
                subject: "Shop Password Reset",
                html: `
                <p>You requested a password reset.</p>
                <p>Click <a href="${req.get(
                    "host"
                )}/forgot-password/${token}">this link</a> to reset your password.</p>
                <p>Note: This link will only be valid for the next 15 minutes.</p>`,
            });

            req.flash.set("success", "A password reset link was sent to your email.");
            res.redirect("/forgot-password");
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            res.status(422).render("pages/shop/forgot_password", {
                route: "/forgot-password",
                pageTitle: "Forgot Password",
                errorMsg: err.message,
                defaults: req.body,
            });

            return;
        }

        next(err);
    }
});

router.get("/:token", async (req, res, next) => {
    try {
        const { token } = req.params;
        const tokenData = await ForgotPasswordToken.getByToken(token);
        if (!tokenData) {
            next();
            return;
        }

        if (Date.now() > tokenData.expires) {
            req.flash.set("email", "The link was expired.");
            await ForgotPasswordToken.deleteByToken(token);
            res.redirect(410, "/forgot-password");
            return;
        }

        res.render("pages/shop/forgot_password", {
            route: "/forgot-password",
            pageTitle: "Forgot Password",
            token: req.params.token,
            defaults: {},
        });
    } catch (err) {
        next(err);
    }
});

router.post("/:token", async (req, res, next) => {
    try {
        validateRequestBody(req, ["email", "password", "confirmPassword", "token"]);

        let { email, password, confirmPassword, token } = req.body;
        email = email.trim();

        if (!validator.isEmail(email)) {
            throw new ValidationError("Invalid email!");
        }

        email = normalizeEmail(email);
        const tokenData = await ForgotPasswordToken.getByEmailAndToken(email, token);
        if (!tokenData) {
            throw new ValidationError("Incorrect email or link!");
        }

        if (Date.now() > tokenData.expires) {
            req.flash.set("email", "The link was expired.");
            await ForgotPasswordToken.deleteByToken(token);
            res.redirect(410, "/forgot-password");
            return;
        }

        if (password.length < 8) {
            throw new ValidationError("Password should be at least 8 characters long!");
        } else if (password !== confirmPassword) {
            throw new ValidationError("Passwords do not match!");
        }

        await User.updatePasswordByEmail(password, email);
        await ForgotPasswordToken.deleteByEmail(email);

        req.flash.set("success", "Password was successfully changed!");
        res.redirect("/login");
    } catch (err) {
        if (err instanceof ValidationError) {
            res.status(422).render("pages/shop/forgot_password", {
                route: "/forgot-password",
                pageTitle: "Forgot Password",
                token: req.params.token,
                errorMsg: err.message,
                defaults: req.body,
            });

            return;
        }

        next(err);
    }
});

export default router;
