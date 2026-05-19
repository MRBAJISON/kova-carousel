import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring, useVideoConfig, staticFile, Img } from "remotion";

const PURPLE = "#5B2BE8";
const PURPLE_SOFT = "#7A53F0";
const TEAL = "#0D9488";
const SLATE_900 = "#0F172A";
const SLATE_800 = "#1E293B";
const SLATE_700 = "#334155";
const SLATE_500 = "#64748B";
const SLATE_400 = "#94A3B8";
const SLATE_200 = "#E2E8F0";
const SLATE_100 = "#F1F5F9";
const SLATE_50 = "#F8FAFC";
const WHITE = "#FFFFFF";

// WhatsApp light mode colors
const WA_GREEN = "#008069";
const WA_HEADER = "#008069";
const WA_BG = "#EFEAE2";
const WA_CHAT_BG = "#EFEAE2";
const WA_INCOMING = "#FFFFFF";
const WA_OUTGOING = "#D9FDD3";
const WA_TEXT = "#111B21";
const WA_SECONDARY = "#667781";
const WA_LIST_BG = "#FFFFFF";
const WA_DIVIDER = "#E9EDEF";
const WA_LIGHT_GREEN = "#25D366";

const fontFamily = "'Geist', 'Inter', system-ui, -apple-system, sans-serif";

// SCENE 1: Hook — Full-screen WhatsApp chat list, messages buzzing in
function SceneHook() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const buzz1 = frame > 20 && frame < 27;
  const buzz2 = frame > 45 && frame < 52;
  const buzz3 = frame > 65 && frame < 72;
  const buzz4 = frame > 82 && frame < 89;
  const isBuzzing = buzz1 || buzz2 || buzz3 || buzz4;
  const shakeX = isBuzzing ? Math.sin(frame * 2.5) * 4 : 0;

  const notifCount = frame > 82 ? 4 : frame > 65 ? 3 : frame > 45 ? 2 : frame > 20 ? 1 : 0;

  const overlayOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const overlayY = interpolate(frame, [0, 12], [20, 0], { extrapolateRight: "clamp" });

  const subOpacity = interpolate(frame, [90, 105], [0, 1], { extrapolateRight: "clamp" });

  const chats = [
    { name: "Ama", msg: "How much is a Brazilian?", time: "2:14 PM", delay: 22, color: "#E879F9" },
    { name: "Efua", msg: "Are you open Sunday?", time: "2:15 PM", delay: 47, color: "#60A5FA" },
    { name: "Nana", msg: "Can I book for 3 PM?", time: "2:16 PM", delay: 67, color: "#34D399" },
    { name: "Abena", msg: "Do you do locs?", time: "2:17 PM", delay: 84, color: "#FBBF24" },
  ];

  return (
    <AbsoluteFill style={{ background: WA_LIST_BG, fontFamily, transform: `translateX(${shakeX}px)` }}>
      {/* WhatsApp header */}
      <div style={{
        height: 160, background: WA_HEADER, padding: "50px 40px 20px",
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: WHITE }}>WhatsApp</div>
          <div style={{ display: "flex", gap: 28 }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="12" cy="19" r="2"/></svg>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ padding: "16px 40px" }}>
        <div style={{
          background: "#F0F2F5", borderRadius: 12, padding: "16px 24px",
          fontSize: 22, color: WA_SECONDARY,
        }}>
          Search or start new chat
        </div>
      </div>

      {/* Hook text overlay */}
      <div style={{
        position: "absolute", top: 200, left: 0, right: 0, zIndex: 10,
        textAlign: "center", opacity: overlayOpacity, transform: `translateY(${overlayY}px)`,
        padding: "0 40px",
      }}>
        <div style={{
          background: "rgba(0,0,0,0.85)", borderRadius: 20, padding: "24px 40px",
          display: "inline-block",
        }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: WHITE, lineHeight: 1.3 }}>
            You're in the middle of a blowout.
          </div>
        </div>
      </div>

      {/* Chat list — full width, large items */}
      <div style={{ flex: 1, padding: "0 0px" }}>
        {chats.map((chat, i) => {
          const showOpacity = interpolate(frame - chat.delay, [0, 10], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
          const slideY = interpolate(frame - chat.delay, [0, 10], [40, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
          const isNew = frame - chat.delay < 30;
          const flashBg = isNew && frame - chat.delay < 15
            ? interpolate(frame - chat.delay, [0, 15], [0.15, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" })
            : 0;

          return (
            <div key={i} style={{
              opacity: showOpacity, transform: `translateY(${slideY}px)`,
              background: `rgba(37, 211, 102, ${flashBg})`,
            }}>
              <div style={{
                display: "flex", gap: 24, padding: "28px 40px",
                borderBottom: `1px solid ${WA_DIVIDER}`,
                alignItems: "center",
              }}>
                <div style={{
                  width: 76, height: 76, borderRadius: 38, minWidth: 76,
                  background: chat.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 32, fontWeight: 700, color: WHITE,
                }}>{chat.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ fontSize: 28, fontWeight: 600, color: WA_TEXT }}>{chat.name}</div>
                    <div style={{ fontSize: 20, color: WA_LIGHT_GREEN, fontWeight: 500 }}>{chat.time}</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 24, color: WA_SECONDARY }}>{chat.msg}</div>
                    <div style={{
                      width: 30, height: 30, borderRadius: 15, background: WA_LIGHT_GREEN,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, fontWeight: 700, color: WHITE,
                    }}>1</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Existing older chats (static, dimmed) */}
        {[
          { name: "Supplier", msg: "Your order has been shipped", initial: "S", color: "#94A3B8" },
          { name: "Team Group", msg: "Akua: See you tomorrow!", initial: "T", color: "#6366F1" },
          { name: "Delivery", msg: "Package out for delivery", initial: "D", color: "#F97316" },
        ].map((chat, i) => (
          <div key={`old-${i}`} style={{
            display: "flex", gap: 24, padding: "28px 40px",
            borderBottom: `1px solid ${WA_DIVIDER}`, opacity: 0.5,
          }}>
            <div style={{
              width: 76, height: 76, borderRadius: 38, minWidth: 76,
              background: chat.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, fontWeight: 700, color: WHITE,
            }}>{chat.initial}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 28, fontWeight: 600, color: WA_TEXT, marginBottom: 6 }}>{chat.name}</div>
              <div style={{ fontSize: 24, color: WA_SECONDARY }}>{chat.msg}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom subtitle overlay */}
      <div style={{
        position: "absolute", bottom: 60, left: 0, right: 0,
        textAlign: "center", opacity: subOpacity, padding: "0 40px",
      }}>
        <div style={{
          background: "rgba(0,0,0,0.85)", borderRadius: 16, padding: "18px 32px",
          display: "inline-block",
        }}>
          <div style={{ fontSize: 28, fontWeight: 600, color: WHITE }}>
            Your phone buzzes. And buzzes. And buzzes.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// SCENE 2: Kova AI replying — full-screen WhatsApp light mode conversation
function SceneKovaReplies() {
  const frame = useCurrentFrame();

  const conversations = [
    { q: "How much is a Brazilian?", a: "Hi! A Brazilian blowout is GHS 350. Want me to book a slot?", delay: 10 },
    { q: "Are you open Sunday?", a: "Yes! We're open 9 AM – 6 PM on Sundays. Want to book?", delay: 55 },
    { q: "Can I book for 3 PM?", a: "Done! 3 PM is reserved for you. See you then!", delay: 100 },
    { q: "Do you do locs?", a: "We do! Locs start at GHS 200. Check our full menu?", delay: 140 },
  ];

  const bannerOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: WA_CHAT_BG, fontFamily }}>
      {/* Chat header */}
      <div style={{
        height: 140, background: WA_HEADER, padding: "40px 36px 20px",
        display: "flex", alignItems: "flex-end", gap: 20,
      }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        <div style={{
          width: 56, height: 56, borderRadius: 28, background: PURPLE,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: WHITE }}>K</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 26, fontWeight: 600, color: WHITE }}>Kova AI</div>
          <div style={{ fontSize: 17, color: "rgba(255,255,255,0.75)" }}>online</div>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.2)", borderRadius: 8, padding: "6px 14px",
          fontSize: 14, fontWeight: 700, color: WHITE, letterSpacing: "0.05em",
        }}>AI AGENT</div>
      </div>

      {/* Banner */}
      <div style={{
        padding: "16px 36px", opacity: bannerOpacity, textAlign: "center",
      }}>
        <div style={{
          background: `${PURPLE}12`, border: `1px solid ${PURPLE}25`,
          borderRadius: 12, padding: "12px 20px",
          fontSize: 19, fontWeight: 600, color: PURPLE,
        }}>
          Kova AI answers every message. Instantly.
        </div>
      </div>

      {/* Conversation bubbles — large and readable */}
      <div style={{
        flex: 1, padding: "12px 32px", display: "flex", flexDirection: "column",
        gap: 20, justifyContent: "center",
      }}>
        {conversations.map((conv, i) => {
          const qOpacity = interpolate(frame - conv.delay, [0, 8], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
          const aOpacity = interpolate(frame - conv.delay - 15, [0, 8], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
          const qX = interpolate(frame - conv.delay, [0, 8], [-40, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
          const aX = interpolate(frame - conv.delay - 15, [0, 8], [40, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Customer question */}
              <div style={{ opacity: qOpacity, transform: `translateX(${qX}px)`, alignSelf: "flex-start", maxWidth: "82%" }}>
                <div style={{
                  background: WA_INCOMING, borderRadius: "6px 20px 20px 20px",
                  padding: "18px 24px", fontSize: 30, color: WA_TEXT, lineHeight: 1.35,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                }}>{conv.q}</div>
              </div>
              {/* Kova AI reply */}
              <div style={{ opacity: aOpacity, transform: `translateX(${aX}px)`, alignSelf: "flex-end", maxWidth: "82%" }}>
                <div style={{
                  background: WA_OUTGOING, borderRadius: "20px 6px 20px 20px",
                  padding: "18px 24px", fontSize: 30, color: WA_TEXT, lineHeight: 1.35,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                }}>{conv.a}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// SCENE 3: Dashboard — full-screen, light mode
function SceneDashboard() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bookingCount = Math.min(Math.floor(interpolate(frame, [20, 70], [0, 4.99], { extrapolateRight: "clamp", extrapolateLeft: "clamp" })), 4);
  const counterScale = spring({ frame: frame - 20, fps, config: { damping: 10, stiffness: 120 } });

  const headOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const headY = interpolate(frame, [0, 12], [30, 0], { extrapolateRight: "clamp" });

  const statsOpacity = interpolate(frame, [12, 24], [0, 1], { extrapolateRight: "clamp" });
  const statsY = interpolate(frame, [12, 24], [30, 0], { extrapolateRight: "clamp" });

  const resultOpacity = interpolate(frame, [90, 108], [0, 1], { extrapolateRight: "clamp" });
  const resultScale = spring({ frame: frame - 90, fps, config: { damping: 12, stiffness: 100 } });

  return (
    <AbsoluteFill style={{ background: SLATE_50, fontFamily }}>
      {/* Top bar */}
      <div style={{
        padding: "60px 48px 0", display: "flex", alignItems: "center", justifyContent: "space-between",
        opacity: headOpacity, transform: `translateY(${headY}px)`,
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 500, color: SLATE_500, marginBottom: 4 }}>
            You finish the blowout. Check your dashboard.
          </div>
          <div style={{ fontSize: 42, fontWeight: 800, color: SLATE_900, letterSpacing: "-0.03em" }}>
            Dashboard
          </div>
        </div>
        <div style={{
          background: PURPLE, borderRadius: 14, padding: "10px 22px",
          fontSize: 18, fontWeight: 700, color: WHITE,
        }}>Kova AI</div>
      </div>

      {/* Stats cards — large */}
      <div style={{
        padding: "32px 48px", display: "flex", gap: 20,
        opacity: statsOpacity, transform: `translateY(${statsY}px)`,
      }}>
        {[
          { label: "Conversations", value: "8", sub: "today", accent: PURPLE },
          { label: "Bookings", value: String(bookingCount), sub: "confirmed", accent: TEAL },
          { label: "Revenue", value: bookingCount > 0 ? `GHS ${bookingCount * 300}` : "—", sub: "earned", accent: PURPLE_SOFT },
        ].map((stat, i) => (
          <div key={i} style={{
            flex: 1, background: WHITE, borderRadius: 24, padding: "32px 28px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            border: `1px solid ${SLATE_200}`,
          }}>
            <div style={{ fontSize: 17, color: SLATE_500, marginBottom: 6, fontWeight: 500 }}>{stat.label}</div>
            <div style={{
              fontSize: 48, fontWeight: 800, color: SLATE_900, letterSpacing: "-0.03em",
              transform: i === 1 ? `scale(${counterScale})` : "none",
              transformOrigin: "left center",
            }}>{stat.value}</div>
            <div style={{ fontSize: 15, color: stat.accent, fontWeight: 600, marginTop: 4 }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Appointments list — fills remaining space */}
      <div style={{ padding: "8px 48px", flex: 1 }}>
        <div style={{
          background: WHITE, borderRadius: 24, padding: "32px 36px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          border: `1px solid ${SLATE_200}`, height: "100%",
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: SLATE_900, marginBottom: 24 }}>
            New Appointments
          </div>

          {[
            { name: "Ama", service: "Brazilian Blowout", time: "3:00 PM", price: "GHS 350" },
            { name: "Efua", service: "Wash & Set", time: "4:00 PM", price: "GHS 200" },
            { name: "Nana", service: "Cut & Style", time: "3:00 PM", price: "GHS 250" },
            { name: "Abena", service: "Loc Maintenance", time: "5:00 PM", price: "GHS 400" },
          ].map((apt, i) => {
            const show = interpolate(frame - 35 - i * 12, [0, 10], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
            const slideX = interpolate(frame - 35 - i * 12, [0, 10], [30, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
            const colors = ["#E879F9", "#60A5FA", "#34D399", "#FBBF24"];
            return (
              <div key={i} style={{
                opacity: show, transform: `translateX(${slideX}px)`,
                display: "flex", alignItems: "center", gap: 20,
                padding: "22px 24px", marginBottom: 12,
                background: i < bookingCount ? `${TEAL}08` : "transparent",
                borderRadius: 18, border: `1px solid ${i < bookingCount ? `${TEAL}20` : SLATE_200}`,
              }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 30, minWidth: 60,
                  background: colors[i],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, fontWeight: 700, color: WHITE,
                }}>{apt.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 26, fontWeight: 600, color: SLATE_900 }}>{apt.name}</div>
                  <div style={{ fontSize: 22, color: SLATE_500, marginTop: 2 }}>{apt.service} · {apt.time}</div>
                </div>
                <div style={{
                  fontSize: 22, fontWeight: 700, color: TEAL,
                  background: `${TEAL}10`, borderRadius: 10, padding: "8px 16px",
                }}>{apt.price}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Result banner */}
      <div style={{
        padding: "24px 48px 60px", textAlign: "center",
        opacity: resultOpacity, transform: `scale(${resultScale})`,
      }}>
        <div style={{
          background: TEAL, borderRadius: 20, padding: "24px 40px",
          display: "inline-block",
        }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: WHITE, letterSpacing: "-0.02em" }}>
            4 new bookings. Zero effort.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// SCENE 4: CTA — purple gradient with Kova logo (unchanged)
function SceneCTA() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoOpacity = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: "clamp" });
  const logoScale = spring({ frame: frame - 5, fps, config: { damping: 12, stiffness: 80 } });
  const logoY = interpolate(frame, [5, 20], [30, 0], { extrapolateRight: "clamp" });

  const headlineOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" });
  const headlineY = interpolate(frame, [20, 35], [40, 0], { extrapolateRight: "clamp" });

  const subOpacity = interpolate(frame, [40, 55], [0, 1], { extrapolateRight: "clamp" });
  const subY = interpolate(frame, [40, 55], [30, 0], { extrapolateRight: "clamp" });

  const ctaOpacity = interpolate(frame, [60, 75], [0, 1], { extrapolateRight: "clamp" });
  const ctaScale = spring({ frame: frame - 60, fps, config: { damping: 10, stiffness: 100 } });

  const phoneOpacity = interpolate(frame, [80, 90], [0, 1], { extrapolateRight: "clamp" });
  const footerOpacity = interpolate(frame, [90, 105], [0, 1], { extrapolateRight: "clamp" });

  const pulseGlow = Math.sin(frame * 0.08) * 0.15 + 0.85;
  const bgProgress = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${PURPLE} 0%, #3B0FA3 40%, ${SLATE_900} 100%)`,
      fontFamily, justifyContent: "center", alignItems: "center",
    }}>
      {/* Subtle gradient orbs */}
      <div style={{
        position: "absolute", top: -200, right: -200, width: 600, height: 600,
        borderRadius: "50%", background: `radial-gradient(circle, ${TEAL}15, transparent 70%)`,
        opacity: bgProgress,
      }}/>
      <div style={{
        position: "absolute", bottom: -100, left: -100, width: 400, height: 400,
        borderRadius: "50%", background: `radial-gradient(circle, ${PURPLE_SOFT}20, transparent 70%)`,
        opacity: bgProgress,
      }}/>

      <div style={{ textAlign: "center", padding: "0 60px", zIndex: 1 }}>
        {/* Kova AI Logo */}
        <div style={{
          opacity: logoOpacity, transform: `scale(${logoScale}) translateY(${logoY}px)`,
          marginBottom: 50, display: "flex", justifyContent: "center",
        }}>
          <div style={{
            background: WHITE, borderRadius: 24, padding: "20px 44px",
            boxShadow: `0 8px 40px ${PURPLE}30`,
          }}>
            <Img src={staticFile("kova-wordmark-light.png")} style={{ height: 56 }} />
          </div>
        </div>

        {/* Headline */}
        <div style={{ opacity: headlineOpacity, transform: `translateY(${headlineY}px)`, marginBottom: 24 }}>
          <div style={{
            fontSize: 62, fontWeight: 800, color: WHITE,
            letterSpacing: "-0.04em", lineHeight: 1.1,
            filter: `brightness(${pulseGlow + 0.15})`,
          }}>
            Stop being your<br/>own receptionist.
          </div>
        </div>

        {/* Subtitle */}
        <div style={{ opacity: subOpacity, transform: `translateY(${subY}px)`, marginBottom: 50 }}>
          <div style={{ fontSize: 30, fontWeight: 400, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
            Let Kova AI handle your WhatsApp.<br/>You focus on what you do best.
          </div>
        </div>

        {/* CTA button */}
        <div style={{ opacity: ctaOpacity, transform: `scale(${ctaScale})`, marginBottom: 30 }}>
          <div style={{
            display: "inline-block", background: WHITE, borderRadius: 9999,
            padding: "22px 72px",
            boxShadow: "0 4px 30px rgba(255,255,255,0.2)",
          }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: PURPLE }}>trykovaai.com</div>
          </div>
        </div>

        {/* Phone number */}
        <div style={{ opacity: phoneOpacity }}>
          <div style={{ fontSize: 24, color: "rgba(255,255,255,0.5)", fontWeight: 500, letterSpacing: "0.05em" }}>
            0547605037
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: "absolute", bottom: 80, left: 0, right: 0,
        textAlign: "center", opacity: footerOpacity,
      }}>
        <div style={{
          fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.35)",
          letterSpacing: "0.2em",
        }}>
          KOVA AI — LINK IN BIO
        </div>
      </div>
    </AbsoluteFill>
  );
}

// MAIN COMPOSITION — 4 scenes, 750 frames (25s at 30fps)
export const SalonReel = () => {
  return (
    <AbsoluteFill style={{ background: WHITE }}>
      {/* Scene 1: Hook — WhatsApp notifications (0-4.3s) */}
      <Sequence from={0} durationInFrames={130}>
        <SceneHook />
      </Sequence>

      {/* Scene 2: Kova AI replying (4.3-10.3s) */}
      <Sequence from={130} durationInFrames={180}>
        <SceneKovaReplies />
      </Sequence>

      {/* Scene 3: Dashboard (10.3-15s) */}
      <Sequence from={310} durationInFrames={140}>
        <SceneDashboard />
      </Sequence>

      {/* Scene 4: CTA (15-25s) */}
      <Sequence from={450} durationInFrames={300}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
