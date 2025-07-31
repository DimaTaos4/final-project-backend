const messageList: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
};

class HttpException extends Error {
  status: number;

  constructor(status: number, message?: string) {
    super(message || messageList[status] || "Error");
    this.status = status;
    this.name = "HttpException";

    Object.setPrototypeOf(this, HttpException.prototype);
  }
}

export default HttpException;
