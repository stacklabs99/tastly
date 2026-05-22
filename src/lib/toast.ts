type ToastType = "success" | "error" | "info";
export type ToastEvent = { id: string; message: string; type: ToastType };

type Listener = (t: ToastEvent) => void;
const listeners = new Set<Listener>();

export function subscribeToast(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function showToast(message: string, type: ToastType = "success") {
  const id = Math.random().toString(36).slice(2, 9);
  listeners.forEach((fn) => fn({ id, message, type }));
}
