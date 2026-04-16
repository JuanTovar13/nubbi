import { colors, fonts } from "../tokens";

export const NubbiOwl = ({ size = 80 }: { size?: number }) => (
  <img
    src="/owl-familia.png"
    alt="Mascota Nubbi"
    width={size}
    height={size}
    style={{ objectFit: "contain" }}
  />
);

export const NubbiOwlGestor = ({ size = 80 }: { size?: number }) => (
  <img
    src="/owl-gestor.png"
    alt="Mascota Nubbi Gestor"
    width={size}
    height={size}
    style={{ objectFit: "contain" }}
  />
);

export const NubbiLogo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <NubbiOwl size={32} />
    <div>
      <div style={{
        fontFamily: fonts.display,
        fontSize: 20,
        color: colors.orange,
        lineHeight: 1,
        letterSpacing: "0.5px",
      }}>
        NÜBBI
      </div>
      <div style={{
        fontFamily: fonts.body,
        fontSize: 8,
        color: colors.textLight,
        letterSpacing: "1px",
      }}>
        Soadora Siempre
      </div>
    </div>
  </div>
);