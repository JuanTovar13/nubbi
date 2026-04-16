// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
// Aquí se decide qué pantalla mostrar según el rol y la navegación.
// No hay librería de rutas — el estado maneja todo con useState.

import { useState } from "preact/hooks";
import { BrowserRouter } from "react-router-dom";
import type { UserRole, Screen } from "./types";

// Selector de rol
import { RoleSelector } from "./screens/RoleSelector";

// Pantallas de Familia
import { HomeFamiliaScreen   } from "./screens/familia/HomeFamilia";
import { ComunidadScreen     } from "./screens/familia/Comunidad";
import { EscanearQRScreen    } from "./screens/familia/EscanearQR";
import { ProgresoScreen      } from "./screens/familia/Progreso";

// Pantallas de Gestor
import { HomeGestorScreen    } from "./screens/gestor/HomeGestor";
import { CrearActividadScreen} from "./screens/gestor/CrearActividad";
import { DashboardScreen     } from "./screens/gestor/Dashboard";

import { fonts, colors } from "./tokens";

export const App = () => {
  // null = todavía no eligió rol
  const [rol,     setRol    ] = useState<UserRole | null>(null);
  const [pantalla, setPantalla] = useState<Screen>("home-familia");

  // Cuando elige el rol, definimos la pantalla inicial según cuál eligió
  const elegirRol = (r: UserRole) => {
    setRol(r);
    setPantalla(r === "familia" ? "home-familia" : "home-gestor");
  };

  // Función que pasan todas las pantallas para navegar entre ellas
  const navegar = (s: Screen) => setPantalla(s);

  // Si no eligió rol todavía, mostramos el selector
  if (!rol) return <RoleSelector onSelect={elegirRol} />;

  return (
    <BrowserRouter>
      <div style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, #F8F4EF 0%, #EFF8F7 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        fontFamily: fonts.body,
      }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}>

          {/* Botonera de navegación rápida — para presentar el proyecto */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>

            {/* Botón para volver a elegir rol */}
            <button
              onClick={() => setRol(null)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: "none",
                background: colors.gray200,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 700,
                fontFamily: fonts.body,
              }}
            >
              ← Roles
            </button>

            {/* Botones de pantallas según el rol activo */}
            {rol === "familia" ? (
              <>
                {[
                  { s: "home-familia" as Screen, l: "🏠 Home"      },
                  { s: "comunidad"    as Screen, l: "👥 Comunidad"  },
                  { s: "escanear-qr" as Screen, l: "📷 QR"         },
                  { s: "progreso"    as Screen, l: "🗺 Progreso"   },
                ].map(({ s, l }) => (
                  <button
                    key={s}
                    onClick={() => setPantalla(s)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      border: "none",
                      background: pantalla === s ? colors.orange : "white",
                      color: pantalla === s ? "white" : colors.text,
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: fonts.body,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    }}
                  >
                    {l}
                  </button>
                ))}
              </>
            ) : (
              <>
                {[
                  { s: "home-gestor"      as Screen, l: "🏠 Home"        },
                  { s: "crear-actividad"  as Screen, l: "🎯 Actividades" },
                  { s: "dashboard"        as Screen, l: "📊 Dashboard"   },
                ].map(({ s, l }) => (
                  <button
                    key={s}
                    onClick={() => setPantalla(s)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      border: "none",
                      background: pantalla === s ? colors.teal : "white",
                      color: pantalla === s ? "white" : colors.text,
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: fonts.body,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    }}
                  >
                    {l}
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Badge que muestra qué usuario está activo */}
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: "white",
            background: rol === "familia" ? colors.orange : colors.teal,
            borderRadius: 20,
            padding: "4px 14px",
            fontFamily: fonts.body,
          }}>
            {rol === "familia" ? "👨‍👩‍👧‍👦 Miembro de Familia: Juan" : "👩‍💼 Miembro Gestor: Julian"}
          </div>

          {/* La pantalla activa */}
          {pantalla === "home-familia"    && <HomeFamiliaScreen    onNav={navegar} />}
          {pantalla === "comunidad"       && <ComunidadScreen      onNav={navegar} />}
          {pantalla === "escanear-qr"     && <EscanearQRScreen     onNav={navegar} />}
          {pantalla === "progreso"        && <ProgresoScreen       onNav={navegar} />}
          {pantalla === "home-gestor"     && <HomeGestorScreen     onNav={navegar} />}
          {pantalla === "crear-actividad" && <CrearActividadScreen onNav={navegar} />}
          {pantalla === "dashboard"       && <DashboardScreen      onNav={navegar} />}

        </div>
      </div>
    </BrowserRouter>
  );
};