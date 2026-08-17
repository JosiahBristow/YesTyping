import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import handSvg from "vkeyboardhand/svg/hand.svg?raw";
import { KEYBOARD_ROWS, type Finger } from "../features/typing/fingerMap";

// Styles ship scoped in global.css (`.hand-overlay .st0` … `.st5`).
const HAND_SVG = handSvg.replace(/<style[\s\S]*?<\/style>/, "");

/** Base key (keyForChar output) → suffix of the `hand-<suffix>` gesture group. */
const HAND_GROUP: Record<string, string> = {
  "`": "tilda",
  "-": "minus",
  "=": "equal",
  "[": "left-center-bracket",
  "]": "right-center-bracket",
  "\\": "backslash",
  ";": "semicolon",
  "'": "single-quote",
  ",": "comma",
  ".": "dot",
  "/": "slash",
  space: "space",
};

const LEFT_HAND = new Set<Finger>(["lp", "lr", "lm", "li"]);

/** Top row of the keyboard (numbers + their shifted symbols). */
const TOP_ROW = new Set(KEYBOARD_ROWS[0]);

// The full 716×380 scene shows both hands; fingertips sit near the top of the
// hand bodies (svg y ≈ 130), which lands on the keyboard's home row when the
// overlay's top edge is aligned with the keyboard's top edge.
const VIEW_BOTH = "0 0 716.3 380";

// ---------------------------------------------------------------------------
// Manual tuning knobs — adjust these freely.
// ---------------------------------------------------------------------------

/** Overall hand size. 1 = hands span the keyboard width. >1 bigger, <1 smaller. */
const HAND_SIZE = 1.6;

/** Extra horizontal gap between the two hands, in screen px. Positive spreads
 *  them apart, negative pulls them together. 0 = keep the SVG's natural gap. */
const HAND_GAP = 5;

/** Nudge the whole overlay, in screen px. */
const HAND_NUDGE_X = -145;
const HAND_NUDGE_Y = -90;

/** How many px the hand reaching a top-row key (numbers & shifted symbols)
 *  lifts up toward that row. 0 disables. */
const TOP_ROW_LIFT = 20;

export function HandOverlay({
  finger,
  keyName,
  shiftSide,
}: {
  finger: Finger | null;
  keyName?: string | null;
  /** Which Shift key is held ('left'/'right'); the opposite hand presses it. */
  shiftSide?: "left" | "right" | null;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const measure = useCallback(() => {
    const overlay = overlayRef.current;
    const wrap = overlay?.parentElement;
    const kb = wrap?.querySelector<HTMLElement>(".kb");
    if (!overlay || !wrap || !kb) return;
    const svg = overlay.querySelector("svg");
    if (!svg) return;

    const kbRect = kb.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    const width = kbRect.width * HAND_SIZE;
    const height = width * (380 / 716.3);
    const scale = width / 716.3;

    // Stash the HAND_GAP shift per hand group (left hands left, right hands right).
    const gapShift = new Map<string, number>();
    const groups =
      overlay.querySelectorAll<SVGGraphicsElement>('[id^="hand-"]');
    for (const g of groups) {
      if (g.id === "hand-both") continue;
      const prev = g.style.display;
      g.style.display = "block";
      const b = g.getBBox();
      const isLeft = b.x + b.width / 2 < 358.15;
      gapShift.set(g.id, ((isLeft ? -1 : 1) * HAND_GAP) / scale);
      g.style.display = prev;
    }
    for (const g of groups) {
      if (g.id !== "hand-both") g.style.display = "none";
      g.setAttribute("transform", "");
    }

    const show = (suffix: string, liftPx = 0) => {
      const el = overlay.querySelector<SVGGraphicsElement>(`#hand-${suffix}`);
      if (!el) return;
      el.style.display = "block";
      const x = gapShift.get(el.id) ?? 0;
      const y = -liftPx / scale;
      el.setAttribute(
        "transform",
        x !== 0 || y !== 0 ? `translate(${x} ${y})` : "",
      );
    };

    const onTopRow = keyName != null && TOP_ROW.has(keyName);
    const lift = onTopRow ? TOP_ROW_LIFT : 0;

    if (!finger) {
      show("neutral-left");
      show("neutral-right");
    } else if (finger === "th") {
      show("neutral-left");
      show("space");
    } else {
      const left = LEFT_HAND.has(finger);
      const groupId = keyName ? (HAND_GROUP[keyName] ?? keyName) : null;
      if (shiftSide) {
        show(`shift-${shiftSide}`);
      } else {
        show(left ? "neutral-right" : "neutral-left");
      }
      if (groupId) show(groupId, lift);
    }

    svg.setAttribute("viewBox", VIEW_BOTH);

    overlay.style.width = `${width}px`;
    overlay.style.height = `${height}px`;
    overlay.style.left = `${kbRect.left - wrapRect.left + HAND_NUDGE_X}px`;
    // Overlay top aligns with the keyboard top; fingertips land on the home row.
    overlay.style.top = `${kbRect.top - wrapRect.top + HAND_NUDGE_Y}px`;
  }, [finger, keyName, shiftSide]);

  useLayoutEffect(() => {
    measure();
  });

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);

  return (
    <div
      className="hand-overlay"
      ref={overlayRef}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: HAND_SVG }}
    />
  );
}
