import type { CSSProperties } from "react";
import { cn } from "@/lib/format";

const INK = "#15262b";
const TQ = "#1faf9f";
const TQ_L = "#7ddcd0";
const TQ_D = "#12736a";
const PINK = "#f78fb0";
const PINK_L = "#fdd4e0";
const PINK_D = "#e24a7e";
const CREAM = "#fff9f5";

type CharProps = { style?: CSSProperties; className?: string };

function Face({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx="-6" cy="-1" r="2.2" fill={INK} />
      <circle cx="6" cy="-1" r="2.2" fill={INK} />
      <circle cx="-6.8" cy="-1.8" r="0.7" fill="#fff" />
      <circle cx="5.2" cy="-1.8" r="0.7" fill="#fff" />
      <path d="M-4.5 4.5 Q0 9 4.5 4.5" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="-11" cy="4.5" r="2.6" fill={PINK} opacity="0.75" />
      <circle cx="11" cy="4.5" r="2.6" fill={PINK} opacity="0.75" />
    </g>
  );
}

function Hand({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r="3" fill={CREAM} stroke={INK} strokeWidth="1.5" />;
}

/** A phone wearing pink headphones, waving hello. */
function PhoneBuddy({ style, className }: CharProps) {
  return (
    <svg viewBox="0 0 64 64" style={style} className={className}>
      <path d="M26 50 L24 57 M38 50 L40 57" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="23" cy="58.5" rx="4.5" ry="2.2" fill={PINK_D} />
      <ellipse cx="41" cy="58.5" rx="4.5" ry="2.2" fill={PINK_D} />
      <path d="M18 30 L8 22 M46 30 L56 20" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <Hand cx={8} cy={22} />
      <Hand cx={56} cy={20} />
      <rect x="18" y="10" width="28" height="42" rx="8" fill={TQ} />
      <rect x="21.5" y="14" width="21" height="30" rx="5" fill={TQ_L} />
      <rect x="27" y="11.5" width="10" height="2.5" rx="1.25" fill={TQ_D} />
      <Face x={32} y={28} s={0.85} />
      <path d="M15 24 Q15 3 32 3 Q49 3 49 24" stroke={PINK_D} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <rect x="11.5" y="22" width="7" height="13" rx="3.5" fill={PINK} />
      <rect x="45.5" y="22" width="7" height="13" rx="3.5" fill={PINK} />
    </svg>
  );
}

/** Two earbuds holding hands and dancing. */
function BudsTwins({ style, className }: CharProps) {
  return (
    <svg viewBox="0 0 64 64" style={style} className={className}>
      <g fill={PINK_D}>
        <ellipse cx="27" cy="15" rx="2.6" ry="2" />
        <rect x="28.6" y="5" width="1.8" height="10" rx="0.9" />
        <ellipse cx="37" cy="11.5" rx="2.6" ry="2" />
        <rect x="38.6" y="1.5" width="1.8" height="10" rx="0.9" />
      </g>
      <path d="M16 46 L13 54 M24 46 L27 54" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <rect x="16.5" y="32" width="7" height="16" rx="3.5" fill={PINK_L} />
      <circle cx="20" cy="26" r="11" fill={PINK} />
      <path d="M10 30 L4 24" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <Hand cx={4} cy={24} />
      <Face x={20} y={26} s={0.7} />
      <path d="M40 46 L37 54 M48 46 L51 54" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <rect x="40.5" y="32" width="7" height="16" rx="3.5" fill={TQ_L} />
      <circle cx="44" cy="26" r="11" fill={TQ} />
      <path d="M54 30 L60 24" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <Hand cx={60} cy={24} />
      <Face x={44} y={26} s={0.7} />
      <path d="M27 37 Q32 33 37 37" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** A smartwatch out on a morning run. */
function WatchRunner({ style, className }: CharProps) {
  return (
    <svg viewBox="0 0 64 64" style={style} className={className}>
      <path d="M5 16 h8 M3 23 h6" stroke={TQ_L} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="25" y="2" width="14" height="12" rx="4" fill={PINK_L} />
      <rect x="25" y="44" width="14" height="12" rx="4" fill={PINK_L} />
      <path d="M28 56 L24 61 M36 56 L40 61" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <rect x="18" y="11" width="28" height="36" rx="10" fill={TQ} />
      <rect x="21.5" y="14.5" width="21" height="29" rx="7" fill={TQ_L} />
      <rect x="46" y="23" width="4" height="9" rx="2" fill={TQ_D} />
      <path d="M18 32 L8 36 M46 32 L56 26" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <Hand cx={8} cy={36} />
      <Hand cx={56} cy={26} />
      <Face x={32} y={28} s={0.85} />
    </svg>
  );
}

/** A power bank cheering with its arms up. */
function PowerBankJumper({ style, className }: CharProps) {
  return (
    <svg viewBox="0 0 64 64" style={style} className={className}>
      <ellipse cx="32" cy="60.5" rx="14" ry="2.4" fill={TQ_L} opacity="0.6" />
      <path d="M14 26 L5 15 M50 26 L59 15" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <Hand cx={5} cy={15} />
      <Hand cx={59} cy={15} />
      <path d="M24 50 L20 57 M40 50 L44 57" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <rect x="20" y="14" width="5" height="5" rx="1.5" fill={TQ_D} />
      <rect x="27" y="14" width="5" height="5" rx="1.5" fill={TQ_D} />
      <rect x="14" y="18" width="36" height="32" rx="9" fill={TQ} />
      <rect x="18" y="22" width="28" height="24" rx="6" fill={TQ_L} />
      <Face x={27} y={33} s={0.8} />
      <path d="M44 25 L37 36 h4 l-2 7 l7 -10 h-4 z" fill={PINK_D} />
    </svg>
  );
}

/** A charger plug skipping rope with a pink cable. */
function ChargerSkipper({ style, className }: CharProps) {
  return (
    <svg viewBox="0 0 64 64" style={style} className={className}>
      <path d="M8 28 Q32 66 56 28" stroke={PINK_D} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path
        d="M14 48 Q32 58 50 48"
        stroke={PINK_D}
        strokeWidth="2"
        fill="none"
        strokeDasharray="3 6"
        strokeLinecap="round"
        opacity="0.6"
      />
      <rect x="24" y="33" width="5" height="10" rx="2" fill={INK} opacity="0.55" />
      <rect x="35" y="33" width="5" height="10" rx="2" fill={INK} opacity="0.55" />
      <path d="M18 22 L8 26 M46 22 L56 26" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <Hand cx={8} cy={26} />
      <Hand cx={56} cy={26} />
      <rect x="18" y="3" width="28" height="30" rx="8" fill={TQ} />
      <rect x="21.5" y="6.5" width="21" height="23" rx="5" fill={TQ_L} />
      <Face x={32} y={18} s={0.8} />
    </svg>
  );
}

/** A pink speaker bobbing to its own music. */
function SpeakerRocker({ style, className }: CharProps) {
  return (
    <svg viewBox="0 0 64 64" style={style} className={className}>
      <g fill={PINK_D}>
        <ellipse cx="9" cy="11" rx="2.6" ry="2" />
        <rect x="10.6" y="3" width="1.8" height="8" rx="0.9" />
        <ellipse cx="54" cy="9" rx="2.6" ry="2" />
        <rect x="55.6" y="1" width="1.8" height="8" rx="0.9" />
      </g>
      <path d="M16 30 L6 24 M48 30 L58 24" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <Hand cx={6} cy={24} />
      <Hand cx={58} cy={24} />
      <path d="M26 54 L24 60 M38 54 L40 60" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <rect x="16" y="14" width="32" height="40" rx="10" fill={PINK} />
      <rect x="21" y="19" width="22" height="18" rx="6" fill={PINK_L} />
      <Face x={32} y={28} s={0.7} />
      <g fill={PINK_D}>
        <circle cx="24" cy="44" r="1.7" />
        <circle cx="32" cy="44" r="1.7" />
        <circle cx="40" cy="44" r="1.7" />
        <circle cx="24" cy="49" r="1.7" />
        <circle cx="32" cy="49" r="1.7" />
        <circle cx="40" cy="49" r="1.7" />
      </g>
    </svg>
  );
}

/** A SIM card zooming past with tiny wings. */
function SimFlyer({ style, className }: CharProps) {
  return (
    <svg viewBox="0 0 64 64" style={style} className={className}>
      <path d="M4 50 h9 M2 56 h6" stroke={TQ_L} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 30 Q2 26 4 12 Q16 14 24 24 z" fill={PINK_L} />
      <path d="M42 30 Q62 26 60 12 Q48 14 40 24 z" fill={PINK_L} />
      <path
        d="M21 8 h16 l10 10 v36 a4 4 0 0 1 -4 4 h-22 a4 4 0 0 1 -4 -4 v-42 a4 4 0 0 1 4 -4 z"
        fill={TQ}
      />
      <Face x={32} y={24} s={0.7} />
      <rect x="24" y="36" width="16" height="12" rx="2.5" fill={PINK_D} />
      <path d="M24 40 h16 M24 44 h16 M30 36 v12 M34 36 v12" stroke={PINK_L} strokeWidth="1" />
    </svg>
  );
}

/** A braided cable swinging along with sparkles. */
function CableBuddy({ style, className }: CharProps) {
  return (
    <svg viewBox="0 0 64 64" style={style} className={className}>
      <path d="M8 56 Q16 36 28 44 Q40 52 46 34" stroke={PINK} strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="8" cy="56" r="5" fill={TQ_D} />
      <path d="M40 26 L32 20 M60 26 L62 16" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <Hand cx={32} cy={20} />
      <Hand cx={62} cy={16} />
      <rect x="40" y="14" width="20" height="22" rx="6" fill={TQ} />
      <rect x="45" y="6" width="10" height="10" rx="3" fill={TQ_D} />
      <Face x={50} y={25} s={0.6} />
      <path d="M15 13 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5 z" fill={PINK_D} />
      <path d="M29 6 l1.2 3.2 3.2 1.2 -3.2 1.2 -1.2 3.2 -1.2 -3.2 -3.2 -1.2 3.2 -1.2 z" fill={TQ} />
    </svg>
  );
}

const CHARACTERS = [
  PhoneBuddy,
  BudsTwins,
  WatchRunner,
  PowerBankJumper,
  ChargerSkipper,
  SpeakerRocker,
  SimFlyer,
  CableBuddy,
];

const MOTIONS = [
  "animate-hop",
  "animate-sway",
  "animate-hop",
  "animate-wiggle",
  "animate-hop",
  "animate-bob",
  "animate-float",
  "animate-sway",
];

/** Full-width marquee of cartoon characters playing with phones and accessories. */
export function CartoonStrip({ className, size = 46 }: { className?: string; size?: number }) {
  return (
    <div className={cn("marquee-mask overflow-hidden", className)} aria-hidden="true">
      <div className="marquee-track flex w-max animate-marquee items-center">
        {[0, 1].map((copy) =>
          CHARACTERS.map((Char, i) => (
            <span
              key={`${copy}-${i}`}
              className={cn("flex shrink-0 items-center pr-12", MOTIONS[i])}
              style={{ animationDelay: `${i * 0.23}s` }}
            >
              <Char style={{ width: size, height: size }} />
            </span>
          )),
        )}
      </div>
    </div>
  );
}
