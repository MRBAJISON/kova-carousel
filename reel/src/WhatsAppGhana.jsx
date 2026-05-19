import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

const TEAL = "#0D9488";
const TEAL_BRIGHT = "#2DD4BF";
const DARK_BG = "#0B141A";
const DARK_HEADER = "#1F2C34";
const DARK_INCOMING = "#1F2C34";
const DARK_OUTGOING = "#005C4B";
const TEXT_WHITE = "#E9EDEF";
const TEXT_SECONDARY = "#8696A0";

const fontFamily = "'Geist', 'Inter', system-ui, -apple-system, sans-serif";

export const WhatsAppGhana = () => {
  const frame = useCurrentFrame();

  const messages = [
    { type: "in", text: "Hi, please how much for box braids?", time: "2:32 PM", delay: 8 },
    { type: "out", text: "Hi! Thanks for reaching out 😊\n\nBox braids:\n• Shoulder length — GHS 250\n• Mid-back — GHS 350\n• Waist length — GHS 500", time: "2:32 PM", delay: 28 },
    { type: "in", text: "I want the mid-back. Tomorrow 2pm?", time: "2:33 PM", delay: 55 },
    { type: "out", text: "✅ Booked! Tomorrow at 2:00 PM\nMid-back box braids — GHS 350\n\nSee you then! 💜", time: "2:33 PM", delay: 72 },
  ];

  return (
    <AbsoluteFill style={{ background: DARK_BG, fontFamily }}>
      {/* Chat header */}
      <div style={{
        height: 110, background: DARK_HEADER, padding: "20px 28px",
        display: "flex", alignItems: "center", gap: 16,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill={TEXT_SECONDARY}><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        <div style={{
          width: 48, height: 48, borderRadius: 24, background: TEAL,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>K</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 21, fontWeight: 600, color: TEXT_WHITE }}>Kova AI</div>
          <div style={{ fontSize: 15, color: TEAL_BRIGHT }}>Online</div>
        </div>
      </div>

      {/* Chat body */}
      <div style={{
        flex: 1, padding: "20px 20px",
        display: "flex", flexDirection: "column", gap: 10,
        justifyContent: "flex-start",
        backgroundImage: "radial-gradient(circle at 50% 50%, rgba(13,148,136,0.03) 0%, transparent 70%)",
      }}>
        {messages.map((msg, i) => {
          const opacity = interpolate(frame - msg.delay, [0, 10], [0, 1], {
            extrapolateRight: "clamp", extrapolateLeft: "clamp",
          });
          const slideX = interpolate(frame - msg.delay, [0, 10], [msg.type === "in" ? -30 : 30, 0], {
            extrapolateRight: "clamp", extrapolateLeft: "clamp",
          });

          return (
            <div key={i} style={{
              opacity,
              transform: `translateX(${slideX}px)`,
              alignSelf: msg.type === "in" ? "flex-start" : "flex-end",
              maxWidth: "85%",
            }}>
              <div style={{
                background: msg.type === "in" ? DARK_INCOMING : DARK_OUTGOING,
                borderRadius: msg.type === "in" ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                padding: "14px 18px",
                position: "relative",
              }}>
                <div style={{
                  fontSize: 24, color: TEXT_WHITE, lineHeight: 1.45,
                  whiteSpace: "pre-line",
                }}>{msg.text}</div>
                <div style={{
                  fontSize: 13, color: TEXT_SECONDARY, textAlign: "right",
                  marginTop: 6,
                }}>
                  {msg.time}
                  {msg.type === "out" && <span style={{ marginLeft: 6, color: "#53BDEB" }}>✓✓</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input bar at bottom */}
      <div style={{
        padding: "12px 16px", display: "flex", gap: 10, alignItems: "center",
      }}>
        <div style={{
          flex: 1, background: DARK_HEADER, borderRadius: 24, padding: "14px 22px",
          fontSize: 18, color: TEXT_SECONDARY,
        }}>
          Type a message
        </div>
        <div style={{
          width: 48, height: 48, borderRadius: 24, background: TEAL,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};
