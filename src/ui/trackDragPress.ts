// Stop tracking if the webview missed the release. A later hover must never
// start a drag or commit a drop on behalf of the previous press.
export function trackDragPress(
  pointerId: number,
  move: (event: PointerEvent) => void,
  up: (event: PointerEvent) => void,
  cancel: () => void,
) {
  const controller = new AbortController();
  const options = { signal: controller.signal, capture: true };
  const stop = () => controller.abort();
  const abort = () => {
    stop();
    cancel();
  };
  window.addEventListener("pointermove", (event) => {
    if (event.pointerId !== pointerId) return;
    if ((event.buttons & 1) === 0) abort();
    else move(event);
  }, options);
  window.addEventListener("pointerup", (event) => {
    if (event.pointerId !== pointerId) return;
    stop();
    up(event);
  }, options);
  const interrupt = (event: PointerEvent) => {
    if (event.pointerId === pointerId) abort();
  };
  window.addEventListener("pointercancel", interrupt, options);
  window.addEventListener("pointerdown", interrupt, options);
  window.addEventListener("blur", abort, { signal: controller.signal });
  return stop;
}
