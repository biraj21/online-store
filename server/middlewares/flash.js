export default function flash(req, res, next) {
    req.flash = {
        set: setFlash.bind(req),
        get: getFlash.bind(req),
    };

    next();
}

function setFlash(key, value) {
    if (!this.session) {
        throw new Error("session is required to use flash");
    }

    const flash = this.session.flash || {};
    flash[key] = value;
    this.session.flash = flash;
}

function getFlash(key) {
    if (!this.session) {
        throw new Error("session is required to use flash");
    }

    const flash = this.session.flash || {};
    const value = flash[key];
    delete flash[key];
    return value;
}
