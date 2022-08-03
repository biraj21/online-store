import validator from "validator";
import { ValidationError } from "./error.js";

export const normalizeEmail = (email) => {
    return validator.normalizeEmail(email, {
        gmail_remove_dots: false,
        gmail_remove_subaddress: false,
        outlookdotcom_remove_subaddress: false,
        yahoo_remove_subaddress: false,
        icloud_remove_subaddress: false,
    });
};

export function splitDatetime(date) {
    return [date.toDateString(), date.toLocaleTimeString()];
}

export function validateRequestBody(req, expected) {
    for (const key of expected) {
        if (!(key in req.body)) {
            throw new ValidationError(`'${key}' expected!`);
        }
    }
}
