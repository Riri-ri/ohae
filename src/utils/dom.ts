const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

/** Элемент, принимающий ввод с клавиатуры: не перехватываем его горячие клавиши. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return EDITABLE_TAGS.has(target.tagName) || target.isContentEditable;
}

/** Интерактивный элемент (кнопка, ссылка и т.п.): пробел должен активировать его, а не панорамировать. */
export function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return isEditableTarget(target) || target.closest('button, a, [role="button"]') !== null;
}
