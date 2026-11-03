import { describe, expect, it, vi } from "vitest";
import { trackDragPress } from "./trackDragPress";

function send(type: string, buttons = 0, pointerId = 1) {
  window.dispatchEvent(new PointerEvent(type, { buttons, pointerId }));
}

function press() {
  const move = vi.fn();
  const up = vi.fn();
  const cancel = vi.fn();
  trackDragPress(1, move, up, cancel);
  return { move, up, cancel };
}

describe("trackDragPress", () => {
  it("ignores hover after a tap even when the release was missed", () => {
    const drag = press();
    send("pointermove");
    send("pointermove", 1);
    send("pointerup");
    expect(drag.move).not.toHaveBeenCalled();
    expect(drag.up).not.toHaveBeenCalled();
    expect(drag.cancel).toHaveBeenCalledTimes(1);
  });

  it("tracks a held primary button and finishes only for the initiating pointer", () => {
    const drag = press();
    send("pointermove", 1, 2);
    send("pointerup", 0, 2);
    send("pointermove", 1);
    send("pointerup");
    send("pointermove");
    expect(drag.move).toHaveBeenCalledTimes(1);
    expect(drag.up).toHaveBeenCalledTimes(1);
    expect(drag.cancel).not.toHaveBeenCalled();
  });

  it.each(["pointercancel", "pointerdown", "blur"])("abandons an active drag on %s without dropping", (type) => {
    const drag = press();
    send("pointermove", 1);
    send(type);
    send("pointerup");
    expect(drag.cancel).toHaveBeenCalledTimes(1);
    expect(drag.up).not.toHaveBeenCalled();
  });
});
