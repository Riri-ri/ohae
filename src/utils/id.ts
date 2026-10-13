/**
 * Уникальный id с фолбэком для небезопасных контекстов (http по локальной сети),
 * где `crypto.randomUUID` может отсутствовать.
 */
export function uid(): string {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
