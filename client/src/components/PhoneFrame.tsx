import { colors, fonts } from "../tokens";
import { NubbiLogo } from "./NubbiLogo";
import type { Screen } from "../types"; 

export const TopBar = ({
  onBack,
  title,
}: {
  onBack?: () => void;
  title?: string;
}) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    padding: "10px 16px",
    background: "white",
    borderBottom: `1px solid ${colors.gray200}`,
    flexShrink: 0,
  }}>
    {onBack && (
      <button onClick={onBack} style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: 22,
        color: colors.gray700,
        marginRight: 8,
        padding: 0,
        lineHeight: 1,
      }}>
        ‹
      </button>
    )}
    <NubbiLogo />
    {title && (
      <span style={{
        marginLeft: "auto",
        fontSize: 13,
        fontWeight: 700,
        color: colors.gray700,
        fontFamily: fonts.body,
      }}>
        {title}
      </span>
    )}
  </div>
);

export const PhoneFrame = ({
  children,
  bgColor = colors.offWhite,
}: {
  children: any; // 👈 cambiamos ComponentChildren por any, más simple
  bgColor?: string;
}) => (
  <div style={{
    width: 320,
    height: 640,
    background: bgColor,
    borderRadius: 36,
    boxShadow: `
      0 24px 60px rgba(0,0,0,0.18),
      0 8px 24px rgba(0,0,0,0.12),
      inset 0 0 0 2px rgba(255,255,255,0.8)
    `,
    overflow: "hidden",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    fontFamily: fonts.body,
  }}>
    {/* Barra de estado del celular */}
    <div style={{
      height: 28,
      background: "rgba(255,255,255,0.85)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      fontSize: 10,
      color: colors.gray700,
      flexShrink: 0,
    }}>
      <span style={{ fontWeight: 700 }}>9:41</span>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <span>●●●</span>
        <span>WiFi</span>
        <span>🔋</span>
      </div>
    </div>

    {/* Contenido de la pantalla */}
    <div style={{
      flex: 1,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      {children}
    </div>
  </div>
);