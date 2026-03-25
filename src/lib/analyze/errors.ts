export class AnalyzeError extends Error {
  status: number;
  exposeMessage: string;

  constructor(message: string, status = 500, exposeMessage = "Error durante el análisis") {
    super(message);
    this.name = "AnalyzeError";
    this.status = status;
    this.exposeMessage = exposeMessage;
  }
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "Error desconocido";
  }
}

export function classifyModelError(err: unknown): AnalyzeError {
  const rawMessage = getErrorMessage(err);
  const message = rawMessage.toLowerCase();

  if (
    message.includes("resource_exhausted") ||
    message.includes("quota") ||
    message.includes("429") ||
    message.includes("rate limit")
  ) {
    return new AnalyzeError(
      rawMessage,
      429,
      "La ia ha llegado a su limite diario porfavor inteta en unos minutos"
    );
  }

  if (
    message.includes("api key not valid") ||
    message.includes("permission_denied") ||
    message.includes("403") ||
    message.includes("unauthorized")
  ) {
    return new AnalyzeError(
      rawMessage,
      502,
      "Error de configuracion"
    );
  }

  if (
    message.includes("model") &&
    (message.includes("not found") || message.includes("unsupported"))
  ) {
    return new AnalyzeError(
      rawMessage,
      502,
      "El modelo configurado no está disponible. Revisa GEMINI_MODEL."
    );
  }

  if (
    message.includes("deadline") ||
    message.includes("timeout") ||
    message.includes("unavailable") ||
    message.includes("503")
  ) {
    return new AnalyzeError(
      rawMessage,
      503,
      "El servicio de IA está temporalmente no disponible. Intenta de nuevo."
    );
  }

  return new AnalyzeError(rawMessage);
}

export function isModelUnavailableError(err: unknown): boolean {
  const message = getErrorMessage(err).toLowerCase();
  return (
    message.includes("model") &&
    (message.includes("not found") || message.includes("unsupported") || message.includes("404"))
  );
}
