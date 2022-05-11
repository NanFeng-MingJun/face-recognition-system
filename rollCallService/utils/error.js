class AppError extends Error {
    constructor(code, message, detail = null) {
        super(message);
        this.detail = detail;
        this.statusCode = code;
    }
}

module.exports = AppError