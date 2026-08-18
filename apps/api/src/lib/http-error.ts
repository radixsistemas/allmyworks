export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown) {
    return new HttpError(400, message, details);
  }

  static unauthorized(message = "Não autenticado") {
    return new HttpError(401, message);
  }

  static forbidden(message = "Sem permissão para esta ação") {
    return new HttpError(403, message);
  }

  static notFound(message = "Recurso não encontrado") {
    return new HttpError(404, message);
  }

  static conflict(message: string) {
    return new HttpError(409, message);
  }
}
