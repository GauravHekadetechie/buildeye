import React, { useCallback, useMemo, useRef, useState } from "react";
import { RotateCw, MousePointerClick } from "lucide-react";

const SECTIONS = [
  { key: "front", label: "Front", bandCenter: 16.65 }, // matches backend's 0-33.3 band
  { key: "middle", label: "Middle", bandCenter: 50 }, // 33.3-66.6 band
  { key: "rear", label: "Rear", bandCenter: 83.35 }, // 66.6-100 band
];

const MODEL_WIDTH = 170;
const FLOOR_HEIGHT = 46;

// Rooms are laid out on the same fixed 0-100 grid used everywhere else in
// the app (see RoomOverlay and the backend's buildSectionRooms), so the
// model's width/depth are just that grid scaled to pixels — this keeps the
// 3D view, the 2D room-box overlay, and the front/middle/rear click bands
// all pointing at the same layout, instead of each inventing its own shape.
function useFootprint() {
  return useMemo(() => ({ width: MODEL_WIDTH, depth: MODEL_WIDTH }), []);
}

export default function Massing3D({ floors = 1, rooms = [], plotSizeSqft = 1200, onSectionClick, activeSection }) {
  const [rotateY, setRotateY] = useState(-35);
  const [rotateX, setRotateX] = useState(-25);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const lastRef = useRef({ x: 0, y: 0 });

  const { width: W, depth: D } = useFootprint();
  const totalHeight = FLOOR_HEIGHT * floors;

  const onPointerMove = useCallback((e) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastRef.current.x;
    const dy = e.clientY - lastRef.current.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) movedRef.current = true;
    lastRef.current = { x: e.clientX, y: e.clientY };
    setRotateY((r) => r + dx * 0.4);
    setRotateX((r) => Math.max(-80, Math.min(-5, r + dy * 0.4)));
  }, []);

  const stopDrag = useCallback(() => {
    draggingRef.current = false;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", stopDrag);
  }, [onPointerMove]);

  const startDrag = (e) => {
    draggingRef.current = true;
    movedRef.current = false;
    lastRef.current = { x: e.clientX, y: e.clientY };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopDrag);
  };

  return (
    <div className="blueprint-frame border border-ink-line bg-ink-panel/40 rounded-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="tag-label flex items-center gap-2">
          <RotateCw size={12} /> DRAG TO ROTATE
        </p>
        <p className="tag-label text-signal flex items-center gap-1">
          <MousePointerClick size={12} /> CLICK A MARKER FOR A FUTURE LOOK
        </p>
      </div>

      <div
        onPointerDown={startDrag}
        className="h-96 flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none"
        style={{ perspective: "1100px" }}
      >
        <div
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            width: W,
            height: FLOOR_HEIGHT,
            position: "relative",
          }}
        >
          {Array.from({ length: floors }).map((_, floorIndex) =>
            rooms.length > 0 ? (
              rooms.map((room, i) => (
                <RoomBlock
                  key={`${floorIndex}-${room.name}-${i}`}
                  room={room}
                  floorIndex={floorIndex}
                  totalFloors={floors}
                  modelWidth={W}
                  modelDepth={D}
                />
              ))
            ) : (
              <FallbackFloorBox key={floorIndex} index={floorIndex} width={W} depth={D} height={FLOOR_HEIGHT} totalFloors={floors} />
            )
          )}

          {SECTIONS.map((s) => (
            <Hotspot
              key={s.key}
              section={s}
              modelDepth={D}
              totalHeight={totalHeight}
              active={activeSection === s.key}
              onSelect={() => {
                if (!movedRef.current) onSectionClick?.(s.key);
              }}
            />
          ))}
        </div>
      </div>

      <p className="text-center tag-label text-slate-soft/60 mt-2">
        {floors} FLOOR{floors > 1 ? "S" : ""} · ~{plotSizeSqft} SQ.FT · {rooms.length} ROOMS MODELLED FROM YOUR DETECTED LAYOUT
      </p>
    </div>
  );
}

// Renders one room as its own extruded block, positioned and sized to
// match its actual detected box on the 0-100 layout grid — this is what
// makes the model reflect the real analyzed plan rather than a generic
// guessed silhouette. Upper floors reuse the same footprint (Buildeye
// doesn't have a separate plan per floor to draw from), shaded slightly
// darker per floor for visual separation.
function RoomBlock({ room, floorIndex, totalFloors, modelWidth, modelDepth }) {
  const [hover, setHover] = useState(false);

  const w = (room.box.wPct / 100) * modelWidth;
  const d = (room.box.hPct / 100) * modelDepth;
  const centerXPct = room.box.xPct + room.box.wPct / 2;
  const centerYPct = room.box.yPct + room.box.hPct / 2;
  const x = (centerXPct / 100) * modelWidth - modelWidth / 2 - w / 2;
  // yPct=0 (top of image / front band) maps to +Z (near viewer), matching
  // the backend's front/middle/rear band convention.
  const z = modelDepth / 2 - (centerYPct / 100) * modelDepth - d / 2;
  const liftFromGround = floorIndex * FLOOR_HEIGHT;
  const shade = 1 - (floorIndex / Math.max(1, totalFloors)) * 0.3;

  const frontColor = hover ? `rgba(242, 153, 74, 0.35)` : `rgba(47, 128, 237, ${0.14 + shade * 0.12})`;
  const sideColor = `rgba(16, 24, 40, 0.88)`;

  const faceBase = { position: "absolute", top: 0, left: 0, border: `1px solid ${hover ? "#F2994A" : "rgba(47,128,237,0.35)"}` };

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "absolute",
        left: modelWidth / 2 + x,
        top: 0,
        width: Math.max(6, w),
        height: FLOOR_HEIGHT,
        transformStyle: "preserve-3d",
        transform: `translateY(${-liftFromGround}px) translateZ(${z}px)`,
      }}
    >
      <div style={{ ...faceBase, width: Math.max(6, w), height: FLOOR_HEIGHT, background: frontColor, transform: `translateZ(${d / 2}px)` }} />
      <div
        style={{
          ...faceBase,
          width: Math.max(6, d),
          height: FLOOR_HEIGHT,
          background: sideColor,
          transform: `translateX(${w / 2}px) translateZ(${w / 2 - d / 2}px) rotateY(90deg)`,
          transformOrigin: "left",
        }}
      />
      {hover && (
        <span
          className="absolute tag-label bg-ink/95 border border-beam/60 text-beam px-2 py-0.5 rounded-sm whitespace-nowrap"
          style={{ top: -22, left: "50%", transform: "translateX(-50%) translateZ(40px)" }}
        >
          {room.name}
        </span>
      )}
    </div>
  );
}

// Used only if a project somehow has zero detected rooms — keeps the
// viewer from rendering an empty scene.
function FallbackFloorBox({ index, width, depth, height, totalFloors }) {
  const liftFromGround = index * height;
  const shade = 1 - (index / Math.max(1, totalFloors)) * 0.35;
  const faceBase = { position: "absolute", top: 0, left: 0, border: "1px solid rgba(47,128,237,0.35)" };

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width, height, transformStyle: "preserve-3d", transform: `translateY(${-liftFromGround}px)` }}>
      <div style={{ ...faceBase, width, height, background: `rgba(47,128,237,${0.16 + shade * 0.1})`, transform: `translateZ(${depth / 2}px)` }} />
      <div
        style={{
          ...faceBase,
          width: depth,
          height,
          background: "rgba(16,24,40,0.9)",
          transform: `translateX(${width / 2}px) translateZ(${width / 2 - depth / 2}px) rotateY(90deg)`,
          transformOrigin: "left",
        }}
      />
    </div>
  );
}

function Hotspot({ section, modelDepth, totalHeight, active, onSelect }) {
  const [hover, setHover] = useState(false);
  // bandCenter is a 0-100 position on the same grid as room boxes, so this
  // marker sits exactly where the backend's buildSectionRooms band for
  // this section actually is.
  const z = modelDepth / 2 - (section.bandCenter / 100) * modelDepth;

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "absolute",
        left: "50%",
        top: 0,
        transform: `translateX(-50%) translateY(${-totalHeight - 26}px) translateZ(${z}px)`,
        transformStyle: "preserve-3d",
        cursor: "pointer",
      }}
    >
      <div className="flex flex-col items-center gap-1">
        <div
          className={`w-4 h-4 rounded-full border-2 transition-all ${
            active
              ? "bg-beam border-beam scale-125"
              : hover
              ? "bg-signal border-signal scale-110"
              : "bg-ink border-signal/60"
          }`}
        />
        {(hover || active) && (
          <span className="tag-label bg-ink/95 border border-ink-line px-2 py-0.5 rounded-sm whitespace-nowrap text-mist">
            {section.label}
          </span>
        )}
      </div>
    </div>
  );
}
