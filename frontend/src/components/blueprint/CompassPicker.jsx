import React, { useCallback, useRef } from "react";
import { Compass } from "lucide-react";

// A photo of a blueprint can't tell an AI which way is North — that
// information simply isn't in the pixels. So Buildeye asks for it here,
// with a draggable compass needle, and every direction-based
// recommendation downstream (Vastu placement, ventilation) is computed
// from this one honest input rather than guessed by a model.
export default function CompassPicker({ angle, onChange }) {
  const dialRef = useRef(null);
  const dragging = useRef(false);

  const angleFromEvent = useCallback((clientX, clientY) => {
    const rect = dialRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    return Math.round((deg + 360) % 360);
  }, []);

  const handlePointerMove = useCallback(
    (e) => {
      if (!dragging.current) return;
      onChange(angleFromEvent(e.clientX, e.clientY));
    },
    [angleFromEvent, onChange]
  );

  const stopDragging = useCallback(() => {
    dragging.current = false;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", stopDragging);
  }, [handlePointerMove]);

  const startDragging = (e) => {
    dragging.current = true;
    onChange(angleFromEvent(e.clientX, e.clientY));
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
  };

  return (
    <div className="flex items-center gap-6">
      <div
        ref={dialRef}
        onPointerDown={startDragging}
        className="relative w-32 h-32 rounded-full border-2 border-ink-line bg-ink-panel cursor-grab active:cursor-grabbing select-none touch-none"
      >
        {/* tick marks */}
        {["N", "E", "S", "W"].map((label, i) => (
          <span
            key={label}
            className="absolute text-[10px] text-slate-soft font-mono"
            style={{
              top: i === 0 ? "4px" : i === 2 ? "auto" : "50%",
              bottom: i === 2 ? "4px" : "auto",
              left: i === 3 ? "6px" : i === 1 ? "auto" : "50%",
              right: i === 1 ? "6px" : "auto",
              transform: i === 0 || i === 2 ? "translateX(-50%)" : "translateY(-50%)",
            }}
          >
            {label}
          </span>
        ))}

        {/* needle */}
        <div
          className="absolute left-1/2 top-1/2 w-1 h-12 origin-bottom -translate-x-1/2 -translate-y-full rounded-full"
          style={{
            transform: `translate(-50%, -100%) rotate(${angle}deg)`,
            background: "linear-gradient(to top, #F2994A, #2F80ED)",
          }}
        />
        <div className="absolute left-1/2 top-1/2 w-2.5 h-2.5 rounded-full bg-mist -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div>
        <p className="flex items-center gap-2 text-mist font-display">
          <Compass size={16} className="text-signal" /> Set North
        </p>
        <p className="text-sm text-slate-soft mt-1 max-w-[220px]">
          Drag the needle to point toward true North on your uploaded plan.
          This is what makes the Vastu and ventilation guidance accurate.
        </p>
        <p className="tag-label mt-2">{angle}° FROM TOP OF IMAGE</p>
      </div>
    </div>
  );
}
