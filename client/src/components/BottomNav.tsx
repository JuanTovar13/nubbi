import { colors, fonts } from "../tokens";
import type { Screen } from "../types"; // 👈 import type

interface NavItem {
  icon: string;
  label: string;
  screen: Screen;
}

export const familiaNav: NavItem[] = [
  { icon: "🏠", label: "Inicio",      screen: "home-familia" },
  { icon: "🎯", label: "Actividades", screen: "progreso"     },
  { icon: "👥", label: "Comunidad",   screen: "comunidad"    },
  { icon: "📷", label: "Escanear",    screen: "escanear-qr"  },
  { icon: "👤", label: "Perfil",      screen: "home-familia" },
];

export const gestorNav: NavItem[] = [
  { icon: "🏠", label: "Inicio",      screen: "home-gestor"     },
  { icon: "🎯", label: "Actividades", screen: "crear-actividad" },
  { icon: "👥", label: "Comunidad",   screen: "home-gestor"     },
  { icon: "📷", label: "Escanear",    screen: "home-gestor"     },
  { icon: "📊", label: "Dashboard",   screen: "dashboard"       },
];

export const BottomNav = ({
  active,
  onNav,
  items,
}: {
  active: Screen;
  onNav: (s: Screen) => void;
  items: NavItem[];
}) => (
  <div style={{
    display: "flex",
    background: "white",
    borderTop: `1px solid ${colors.gray200}`,
    padding: "6px 0 10px",
    flexShrink: 0,
    boxShadow: "0 -4px 12px rgba(0,0,0,0.06)",
  }}>
    {items.map((item) => (
      <button
        key={item.screen + item.label}
        onClick={() => onNav(item.screen)}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px 0",
          color: active === item.screen ? colors.orange : colors.gray500,
          transition: "color 0.2s",
        }}
      >
        <span style={{ fontSize: 20 }}>{item.icon}</span>
        <span style={{
          fontSize: 9,
          fontFamily: fonts.body,
          fontWeight: active === item.screen ? 700 : 400,
        }}>
          {item.label}
        </span>
        {active === item.screen && (
          <div style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: colors.orange,
          }} />
        )}
      </button>
    ))}
  </div>
);