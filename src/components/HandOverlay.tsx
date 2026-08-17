import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import handSvg from "vkeyboardhand/svg/hand.svg?raw";
import type { Finger } from "../features/typing/fingerMap";

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
const HAND_NUDGE_Y = -88;

export function HandOverlay({
  finger,
  keyName,
}: {
  finger: Finger | null;
  keyName?: string | null;
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

    // Shift the two hands apart (or together) by HAND_GAP screen px.
    const groups =
      overlay.querySelectorAll<SVGGraphicsElement>('[id^="hand-"]');
    for (const g of groups) {
      if (g.id === "hand-both") continue;
      const prev = g.style.display;
      g.style.display = "block";
      const b = g.getBBox();
      const isLeft = b.x + b.width / 2 < 358.15;
      const shift = ((isLeft ? -1 : 1) * HAND_GAP) / (width / 716.3);
      g.setAttribute("transform", shift !== 0 ? `translate(${shift} 0)` : "");
      g.style.display = prev;
    }
    for (const g of groups) {
      if (g.id !== "hand-both") g.style.display = "none";
    }
    const show = (suffix: string) => {
      const el = overlay.querySelector<SVGElement>(`#hand-${suffix}`);
      if (el) el.style.display = "block";
    };

    if (!finger) {
      show("neutral-left");
      show("neutral-right");
    } else if (finger === "th") {
      show("neutral-left");
      show("space");
    } else {
      const left = LEFT_HAND.has(finger);
      const groupId = keyName ? (HAND_GROUP[keyName] ?? keyName) : null;
      show(left ? "neutral-right" : "neutral-left");
      if (groupId) show(groupId);
    }

    svg.setAttribute("viewBox", VIEW_BOTH);

    overlay.style.width = `${width}px`;
    overlay.style.height = `${height}px`;
    overlay.style.left = `${kbRect.left - wrapRect.left + HAND_NUDGE_X}px`;
    // Overlay top aligns with the keyboard top; fingertips land on the home row.
    overlay.style.top = `${kbRect.top - wrapRect.top + HAND_NUDGE_Y}px`;
  }, [finger, keyName]);

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
