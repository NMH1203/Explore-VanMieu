export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    Object.assign(this, { status, code, details });
  }
}
export function ensure(condition, status, code, message, details) {
  if (!condition) throw new AppError(status, code, message, details);
}
