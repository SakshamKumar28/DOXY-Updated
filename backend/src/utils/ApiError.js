class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong") {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
        this.data = null;

        Error.captureStackTrace(this, this.constructor);
    }
}

export { ApiError };