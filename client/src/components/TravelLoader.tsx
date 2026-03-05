import { useEffect, useMemo, useState } from "react";

const MESSAGES = [
  "Planning your perfect trip...",
  "Mapping your adventure...",
  "Packing your itinerary...",
  "Almost ready for takeoff!"
];

const FLIGHT_PATH = "path('M 50 250 Q 300 50 600 250')";

type TravelLoaderProps = {
  active: boolean;
};

export default function TravelLoader({ active }: TravelLoaderProps) {
  const [visible, setVisible] = useState(active);
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (active) {
      setVisible(true);
      setExiting(false);
      return;
    }

    setExiting(true);
    const t = setTimeout(() => {
      setVisible(false);
      setExiting(false);
      setProgress(0);
      setMessageIndex(0);
    }, 500);
    return () => clearTimeout(t);
  }, [active]);

  useEffect(() => {
    if (!active) return undefined;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 96) return prev;
        const step = prev < 40 ? 2.4 : prev < 75 ? 1.4 : 0.7;
        return Math.min(96, Number((prev + step).toFixed(1)));
      });
    }, 170);

    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2000);

    return () => {
      clearInterval(progressTimer);
      clearInterval(messageTimer);
    };
  }, [active]);

  const displayProgress = useMemo(() => (active ? progress : 100), [active, progress]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 9999,
        opacity: exiting ? 0 : 1,
        transition: "opacity 0.5s ease",
        background:
          "linear-gradient(180deg, rgba(218,238,255,0.97) 0%, rgba(238,247,255,0.98) 62%, rgba(246,251,255,0.98) 100%)",
        overflow: "hidden"
      }}
      aria-live="polite"
      role="status"
    >
      <style>{`
        .travel-loader-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(103, 145, 177, 0.09) 1px, transparent 1px),
            linear-gradient(90deg, rgba(103, 145, 177, 0.09) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: radial-gradient(circle at center, black 40%, transparent 78%);
          pointer-events: none;
        }
        .travel-loader-cloud {
          position: absolute;
          color: rgba(255, 255, 255, 0.92);
          filter: drop-shadow(0 6px 8px rgba(64, 107, 142, 0.18));
          font-size: 26px;
          animation: cloudDrift linear infinite;
          pointer-events: none;
        }
        .travel-loader-cloud.c1 { top: 18%; left: -10%; animation-duration: 28s; }
        .travel-loader-cloud.c2 { top: 30%; left: -22%; animation-duration: 36s; animation-delay: -6s; }
        .travel-loader-cloud.c3 { top: 12%; left: -30%; animation-duration: 42s; animation-delay: -10s; }
        @keyframes cloudDrift {
          from { transform: translateX(0); }
          to { transform: translateX(140vw); }
        }
        .travel-loader-plane {
          position: absolute;
          width: 24px;
          height: 24px;
          color: #ffffff;
          filter: drop-shadow(0 3px 6px rgba(10, 48, 89, 0.35));
          offset-path: ${FLIGHT_PATH};
          offset-rotate: auto 92deg;
          animation: planeRoute 6s linear infinite;
        }
        @keyframes planeRoute {
          from { offset-distance: 0%; transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
          to { offset-distance: 100%; transform: rotate(-4deg); }
        }
        .travel-loader-message {
          min-height: 26px;
          transition: opacity 0.4s ease, transform 0.4s ease;
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <div className="travel-loader-grid" />
      <span className="travel-loader-cloud c1">☁</span>
      <span className="travel-loader-cloud c2">☁</span>
      <span className="travel-loader-cloud c3">☁</span>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "48%",
          transform: "translate(-50%, -50%)",
          width: "min(92vw, 760px)"
        }}
      >
        <svg viewBox="0 0 650 300" width="100%" height="220" style={{ display: "block" }} aria-hidden="true">
          <path
            d="M50,250 Q300,50 600,250"
            fill="none"
            stroke="#8fb8d8"
            strokeWidth="3"
            strokeDasharray="8 10"
            strokeLinecap="round"
          />
          <foreignObject x="0" y="0" width="650" height="300">
            <div className="travel-loader-plane">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
                <path d="M22 16.5v-2L13.5 9V3.5a1.5 1.5 0 0 0-3 0V9L2 14.5v2l8.5-2.5v5L8 20.5V22l4-1 4 1v-1.5l-2.5-1.5v-5z" />
              </svg>
            </div>
          </foreignObject>
        </svg>

        <div
          style={{
            display: "grid",
            justifyItems: "center",
            gap: "12px",
            marginTop: "-16px"
          }}
        >
          <p
            key={messageIndex}
            className="travel-loader-message"
            style={{ margin: 0, fontWeight: 700, color: "#1d567d", fontSize: "1.06rem" }}
          >
            {MESSAGES[messageIndex]}
          </p>
          <div
            style={{
              width: "min(520px, 82vw)",
              height: "10px",
              borderRadius: "999px",
              background: "#deebf6",
              border: "1px solid #bcd3e6",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                width: `${displayProgress}%`,
                height: "100%",
                borderRadius: "inherit",
                transition: "width 0.25s ease",
                background: "linear-gradient(90deg, #1d7fcb 0%, #2db7a6 100%)"
              }}
            />
          </div>
          <p style={{ margin: 0, fontWeight: 700, color: "#35688a", fontSize: "0.9rem" }}>
            {Math.round(displayProgress)}%
          </p>
        </div>
      </div>
    </div>
  );
}
