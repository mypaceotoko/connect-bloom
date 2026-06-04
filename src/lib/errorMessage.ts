type ErrorLike = {
  message?: unknown;
  details?: unknown;
  hint?: unknown;
  code?: unknown;
  phase?: unknown;
};

const sensitiveKeyPattern = /token|secret|password|authorization|apikey|api_key|supabase.*key|access_token|refresh_token/i;
const sensitiveValuePattern = /(eyJ[A-Za-z0-9_-]{20,}|sb-[A-Za-z0-9_-]{20,}|[A-Za-z0-9_-]{40,})/g;

function asErrorLike(error: unknown): ErrorLike {
  return error && typeof error === 'object' ? (error as ErrorLike) : {};
}

function toSafeString(value: unknown, maxLength = 160) {
  if (typeof value !== 'string') return undefined;
  const sanitized = value.replace(sensitiveValuePattern, '[redacted]').trim();
  return sanitized.length > maxLength ? `${sanitized.slice(0, maxLength)}…` : sanitized;
}

function normalizeMessage(message: string) {
  if (/block|blocked|ブロック/i.test(message)) return 'ブロック中のため操作できません。';
  if (/auth|login|ログイン/i.test(message)) return 'ログイン状態を確認できませんでした。';
  return '';
}

export function getShortErrorMessage(error: unknown, fallbackMessage: string) {
  const message = asErrorLike(error).message;
  if (typeof message === 'string') {
    const normalizedMessage = normalizeMessage(message);
    if (normalizedMessage) return normalizedMessage;
  }
  return fallbackMessage;
}

export const getUserFriendlyErrorMessage = getShortErrorMessage;

export function getErrorDebugInfo(error: unknown, phase?: string) {
  const errorLike = asErrorLike(error);
  const debugParts = [
    phase ? `phase=${phase}` : '',
    typeof errorLike.phase === 'string' ? `phase=${toSafeString(errorLike.phase, 60)}` : '',
    typeof errorLike.code === 'string' ? `code=${toSafeString(errorLike.code, 40)}` : '',
  ].filter(Boolean);

  return Array.from(new Set(debugParts)).join(' / ');
}

export function getSafeErrorLog(error: unknown, phase?: string) {
  const errorLike = asErrorLike(error);
  const safeLog: Record<string, string | boolean | undefined> = {
    success: false,
    phase,
    message: toSafeString(errorLike.message, 180) ?? (error instanceof Error ? toSafeString(error.message, 180) : undefined),
    details: toSafeString(errorLike.details, 180),
    hint: toSafeString(errorLike.hint, 120),
    code: toSafeString(errorLike.code, 40),
  };

  for (const key of Object.keys(safeLog)) {
    if (safeLog[key] === undefined || sensitiveKeyPattern.test(key)) delete safeLog[key];
  }

  return safeLog;
}
