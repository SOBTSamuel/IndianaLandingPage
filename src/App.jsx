import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Calendar, Clock, ShoppingBag, User, Users, Building2, Layers, MessageCircle,
  TrendingUp, Plus, Check, ChevronLeft, ChevronRight, MapPin, Wallet, Percent, Star, X,
  BedDouble, Package, Crown, Bell, Ruler, Heart, ArrowUpRight, Eye, EyeOff,
  Briefcase, FileText, Phone, Sparkles, Shield, Award, Image as ImageIcon,
  Filter, BellRing, Loader
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell, LineChart, Line
} from "recharts";

/* ══════════════════════════════════════════════════════════════════
   CONFIGURACIÓN — LO ÚNICO QUE HAY QUE CAMBIAR PARA SALIR EN VIVO
   1. WA_INDIANA ya apunta al celular real de Indiana.
   2. FOTOS: no se pueden extraer de Instagram (bloquea el acceso
      automatizado). Se cargan desde Administradora → Fotos pegando
      la URL de cada imagen. Mientras tanto van las ilustraciones.
   3. PASARELA: hoy simula la transacción. Para cobrar de verdad,
      conectar Wompi (Bancolombia) o Bold. Ver PASARELA abajo.
   ══════════════════════════════════════════════════════════════════ */
const CEL_INDIANA = "573204414995";
const CEL_VISIBLE = "+57 (320) 441-4995";
const APP_NOMBRE = "Indiana Sánchez";
const APP_SUB = "ARCHITECT OF LOOKS";
const APP_LEMA = "Arquitecta de Miradas";
const fmtCel = (c) => (c && c.length === 10 ? `(${c.slice(0, 3)}) ${c.slice(3, 6)}-${c.slice(6)}` : c);
const WA_INDIANA = `https://wa.me/${CEL_INDIANA}`;
const SALUDO_WA = "Te elegí INDIANA, ¡Arquitecta de miradas!";
const waLink = (t) => {
  const cuerpo = String(t || "").replace(/^\s*Hola\s+Indiana[,.!]?\s*/i, "");
  return `${WA_INDIANA}?text=${encodeURIComponent(`${SALUDO_WA}\n\n${cuerpo}`)}`;
};

const PASARELA = {
  // Tarifas de referencia verificadas en 2026. Ajustar a lo que negocie.
  nequi: { n: "Nequi", tarifa: "1,79%", icono: "N" },
  pse: { n: "PSE o botón Bancolombia", tarifa: "1,49% + $1.200", icono: "B" },
  tarjeta: { n: "Tarjeta débito o crédito", tarifa: "2,99% + $600", icono: "T" },
  daviplata: { n: "Daviplata", tarifa: "1,79%", icono: "D" },
  efectivo: { n: "Efectivo en el atelier", tarifa: "sin costo", icono: "E" },
};

/* ═════════  ACCESO DEL EQUIPO  ═════════
   Se entra con celular y se verifica con cédula. Nadie ve los módulos
   internos sin estar en esta tabla. Las cédulas del equipo operativo son
   de demostración; las de Samuel e Indiana son las reales. */
const EQUIPO_ACCESO = {
  "3208389367": { cc: "1015996392", nombre: "Samuel", completo: "Samuel Oved Bustos Triana", rol: "super", titulo: "Súper administrador" },
  "3204414995": { cc: "1090540591", nombre: "Indiana", completo: "Indiana Sánchez Méndez", rol: "admin", estId: "ind", titulo: "Administradora · Arquitecta de miradas" },
  "3142228844": { cc: "1020445781", nombre: "Daniela", completo: "Daniela Ferrer Alzate", rol: "especialista", estId: "dan", titulo: "Lash artist senior" },
  "3163337766": { cc: "1032556914", nombre: "Mariana", completo: "Mariana Ospina Ruiz", rol: "especialista", estId: "mar", titulo: "Brow artist" },
  "3125554411": { cc: "1018334227", nombre: "Isabela", completo: "Isabela Quintero Navas", rol: "especialista", estId: "isa", titulo: "Especialista en semipermanente" },
  "3197778822": { cc: "1023887450", nombre: "Sara", completo: "Sara Moreno Cifuentes", rol: "especialista", estId: "sar", titulo: "Lash y brow junior" },
  "3133332211": { cc: "1014229663", nombre: "Natalia", completo: "Natalia Bermúdez Rojas", rol: "especialista", estId: "nat", titulo: "Manicurista y nail artist" },
  "3114447733": { cc: "1026771308", nombre: "Victoria", completo: "Victoria Lemus Garzón", rol: "especialista", estId: "vic", titulo: "Maquilladora y estilista" },
  "3186669911": { cc: "79855412", nombre: "Alejandro", completo: "Alejandro Peña Mora", rol: "especialista", estId: "ale", titulo: "Barbero" },
};

const CLIENTAS_BASE = {
  "3103020415": { nombre: "Sam", apellido: "Bustos Triana", desde: "abril de 2024", visitas: 11, ultima: "6 de septiembre", fav: "Diseño y epilación de cejas", nota: "Agenda siempre fuera de horario de oficina. Trae el pago listo.", retrato: { id: "c0", piel: "media", pelo: "negro", masa: "bob", flequillo: "lado", fondo: "#EBE4D7" } },
  "3115557788": { nombre: "Camila", apellido: "Restrepo Gaviria", desde: "marzo de 2024", visitas: 14, ultima: "25 de agosto", fav: "Brow Lamination", nota: "Prefiere hilo en el entrecejo, la cera se lo irrita.", retrato: { id: "c1", piel: "clara", pelo: "castano", masa: "ondas", flequillo: "lado", fondo: "#EDE6DA" } },
  "3007654321": { nombre: "Juliana", apellido: "Castro Bernal", desde: "enero de 2025", visitas: 7, ultima: "2 de septiembre", fav: "Volumen ruso", nota: "Siempre pide la primera cita de la mañana.", retrato: { id: "c2", piel: "canela", pelo: "negro", masa: "recogido", flequillo: "abierto", fondo: "#E8E0D4" } },
  "3129998877": { nombre: "Andrea", apellido: "Mejía Lozano", desde: "julio de 2023", visitas: 22, ultima: "9 de septiembre", fav: "Lash Lifting", nota: "Socia de Le Cercle, nivel Ámbar, desde mayo.", retrato: { id: "c3", piel: "media", pelo: "miel", masa: "suelto", flequillo: "ninguno", fondo: "#EFE7DC" } },
  "3182223344": { nombre: "Valentina", apellido: "Sáenz Duque", desde: "agosto de 2025", visitas: 3, ultima: "30 de agosto", fav: "Diseño y epilación de cejas", nota: "Llegó por Instagram. Le interesa el sombreado.", retrato: { id: "c4", piel: "morena", pelo: "negro", masa: "bob", flequillo: "recto", fondo: "#E9E2D6" } },
  "3204567890": { nombre: "Paola", apellido: "Rincón Arévalo", desde: "febrero de 2026", visitas: 2, ultima: "12 de septiembre", fav: "Extensiones híbridas", nota: "Trabaja a dos cuadras. Entra a última hora si se libera un cupo.", retrato: { id: "c5", piel: "clara", pelo: "cobre", masa: "coleta", flequillo: "lado", fondo: "#EDE5D9" } },
  "3156668899": { nombre: "Ximena", apellido: "Aguirre Peña", desde: "octubre de 2024", visitas: 9, ultima: "4 de septiembre", fav: "Sombreado de cejas", nota: "Llegó con un sombreado gris de otro sitio. Isabela se lo corrigió.", retrato: { id: "c6", piel: "canela", pelo: "chocolate", masa: "ondas", flequillo: "abierto", fondo: "#EAE2D5" } },
  "3013334477": { nombre: "Lorena", apellido: "Prieto Salas", desde: "mayo de 2025", visitas: 6, ultima: "11 de septiembre", fav: "Volumen tecnológico", nota: "Socia de Le Cercle, nivel Nácar. Muy puntual.", retrato: { id: "c7", piel: "clara", pelo: "rubio", masa: "suelto", flequillo: "recto", fondo: "#EEE7DB" } },
  "3192225566": { nombre: "Natalia", apellido: "Ríos Cabrera", desde: "diciembre de 2024", visitas: 8, ultima: "29 de agosto", fav: "Extensiones clásicas", nota: "Pestaña natural fina. No pasar de 0,07 mm.", retrato: { id: "c8", piel: "media", pelo: "negro", masa: "recogido", flequillo: "ninguno", fondo: "#E8E1D5" } },
  "3175551122": { nombre: "Tatiana", apellido: "Guzmán Vélez", desde: "julio de 2026", visitas: 1, ultima: "13 de septiembre", fav: "Henna y perfilado", nota: "Primera cita. Vino recomendada por Andrea.", retrato: { id: "c9", piel: "oscura", pelo: "negro", masa: "coleta", flequillo: "abierto", fondo: "#EBE3D6" } },
  "3138887744": { nombre: "Diana", apellido: "Moreno Tovar", desde: "marzo de 2025", visitas: 5, ultima: "8 de septiembre", fav: "Ritual completo", nota: "Reserva siempre los sábados. Viene con su hija.", retrato: { id: "c10", piel: "morena", pelo: "chocolate", masa: "ondas", flequillo: "lado", fondo: "#E9E1D4" } },
  "3025556611": { nombre: "Laura", apellido: "Vargas Chacón", desde: "junio de 2026", visitas: 2, ultima: "10 de septiembre", fav: "Lash Lifting", nota: "Le gusta la franja de las 12, que suele estar libre.", retrato: { id: "c11", piel: "clara", pelo: "miel", masa: "bob", flequillo: "lado", fondo: "#EFE8DC" } },
};

/* ─────────────────  PALETA  ───────────────── */
const T = {
  papel: "#F4F0EA", crema: "#EAE4DA", linea: "#DCD3C6", greige: "#C4B8A8",
  bronce: "#A8875C", bronceOsc: "#8A6E49", tinta: "#3B352E", mute: "#8C8277",
  verde: "#25D366", ok: "#7D8F6E", alerta: "#B5714F",
  piel: "#E8D3C4", pielOsc: "#D4B59E",
};
const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Jost', system-ui, sans-serif";

/* ─────────────────  LOGO  ───────────────── */
const Monograma = ({ s = 56 }) => (
  <svg width={s} height={s} viewBox="0 0 96 96" fill="none">
    <defs>
      <linearGradient id="br" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#C9AC7F" /><stop offset="50%" stopColor="#A8875C" /><stop offset="100%" stopColor="#7E6340" />
      </linearGradient>
    </defs>
    <path d="M14 80 L44 14" stroke="url(#br)" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M44 14 L64 62" stroke="url(#br)" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M25 58 Q 44 50 58 58" stroke="url(#br)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    <path d="M64 62 Q 74 82 88 70" stroke="url(#br)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
  </svg>
);
const Wordmark = ({ size = 9 }) => (
  <div style={{ fontFamily: SANS, fontSize: size, letterSpacing: "0.34em", color: T.bronceOsc, fontWeight: 300 }}>ARCHITECT OF LOOKS</div>
);

/* ═════════  RETRATO VECTORIAL DE CADA SERVICIO  ═════════ */
const P0 = [40, 88], P1 = [100, 44], P2 = [160, 88];
function puntosPestana(n) {
  return Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n;
    const x = (1 - t) ** 2 * P0[0] + 2 * (1 - t) * t * P1[0] + t ** 2 * P2[0];
    const y = (1 - t) ** 2 * P0[1] + 2 * (1 - t) * t * P1[1] + t ** 2 * P2[1];
    const dx = 2 * (1 - t) * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]);
    const dy = 2 * (1 - t) * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1]);
    const L = Math.hypot(dx, dy);
    return { x, y, nx: dy / L, ny: -dx / L, t };
  });
}

const SETS = {
  corta: { n: 9, L: 5.5, c: 1.2, w: 0.8 },
  natural: { n: 10, L: 7, c: 1.8, w: 0.9 },
  lift: { n: 13, L: 15, c: 9, w: 1.25 },
  clasica: { n: 14, L: 16, c: 6, w: 1.25 },
  hibrida: { n: 17, L: 19, c: 8, w: 1.45 },
  tecno: { n: 21, L: 21, c: 9, w: 1.6 },
  ruso: { n: 26, L: 24, c: 10, w: 1.85 },
  retoque: { n: 15, L: 17, c: 7, w: 1.35 },
};

function Pestanas({ set, color = "#241F1A" }) {
  const s = SETS[set] || SETS.natural;
  const pts = puntosPestana(s.n);
  return (
    <g>
      {pts.map((p, i) => {
        const k = Math.min(i, s.n - 1 - i);
        const escala = (0.5 + Math.sin(p.t * Math.PI) * 0.62) * (0.94 + ((k * 29) % 9) / 90);
        const L = s.L * escala;
        const curl = s.c * (p.t - 0.5) * 2.6;
        const ex = p.x + p.nx * L + curl;
        const ey = p.y + p.ny * L - L * 0.16;
        const cx = p.x + p.nx * L * 0.42 + curl * 0.15;
        const cy = p.y + p.ny * L * 0.58;
        // grosor decreciente: se dibuja como cuerpo relleno, no como línea
        const w = s.w * 1.25;
        const dx = ex - p.x, dy = ey - p.y, len = Math.hypot(dx, dy) || 1;
        const px = -dy / len, py = dx / len;
        const d = `M${p.x + px * w} ${p.y + py * w}`
          + ` Q${cx + px * w * 0.35} ${cy + py * w * 0.35} ${ex} ${ey}`
          + ` Q${cx - px * w * 0.35} ${cy - py * w * 0.35} ${p.x - px * w} ${p.y - py * w} Z`;
        return <path key={i} d={d} fill={color} opacity={0.95} />;
      })}
    </g>
  );
}

function PestanasBajas({ color = "#241F1A" }) {
  const n = 9;
  return (
    <g opacity="0.7">
      {Array.from({ length: n }).map((_, i) => {
        const t = (i + 0.5) / n;
        const x = 46 + t * 108;
        const y = 88 + Math.sin(t * Math.PI) * 22;
        const L = 3.4 + Math.sin(t * Math.PI) * 3.2;
        return <path key={i} d={`M${x} ${y} q${(t - 0.5) * 4} ${L * 0.6} ${(t - 0.5) * 7} ${L}`}
          stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" />;
      })}
    </g>
  );
}

function Ceja({ modo }) {
  const forma = "M30 44 Q 84 12 168 32 Q 106 28 34 56 Z";
  if (modo === "rala") return (
    <g opacity="0.85">
      {Array.from({ length: 22 }).map((_, i) => {
        const t = i / 21, x = 34 + t * 128, y = 50 - Math.sin(t * Math.PI * 0.8) * 16 + t * 6;
        return <path key={i} d={`M${x} ${y} q 4 ${-3 - (i % 3)} 8 ${-4}`} stroke="#3A322A" strokeWidth={1 + (i % 2) * 0.4} fill="none" strokeLinecap="round" opacity={0.5 + (i % 3) * 0.15} />;
      })}
    </g>
  );
  if (modo === "lamin") return (
    <g>
      <path d={forma} fill="#2E271F" />
      {Array.from({ length: 20 }).map((_, i) => {
        const t = i / 19, x = 34 + t * 126, y = 48 - Math.sin(t * Math.PI * 0.9) * 14 + t * 8;
        return <path key={i} d={`M${x} ${y} q 2 -9 7 -13`} stroke="#463C31" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.8" />;
      })}
    </g>
  );
  if (modo === "sombreado") return (
    <g>
      <path d={forma} fill="#3A3128" opacity="0.28" />
      <path d={forma} fill="none" stroke="#3A3128" strokeWidth="1" opacity="0.6" />
      {Array.from({ length: 70 }).map((_, i) => {
        const t = (i % 35) / 34, fila = Math.floor(i / 35);
        const x = 34 + t * 128, y = 44 - Math.sin(t * Math.PI * 0.9) * 15 + t * 9 + fila * 6;
        return <circle key={i} cx={x} cy={y} r={1 - fila * 0.25} fill="#2E271F" opacity={0.55 - fila * 0.15} />;
      })}
    </g>
  );
  if (modo === "diseno") return (
    <g>
      <path d={forma} fill="#2E271F" opacity="0.9" />
      <line x1="30" y1="8" x2="30" y2="116" stroke={T.bronce} strokeWidth="0.9" strokeDasharray="4 4" />
      <line x1="88" y1="8" x2="88" y2="116" stroke={T.bronce} strokeWidth="0.9" strokeDasharray="4 4" />
      <line x1="168" y1="8" x2="168" y2="116" stroke={T.bronce} strokeWidth="0.9" strokeDasharray="4 4" />
      <circle cx="88" cy="20" r="3" fill={T.bronce} />
    </g>
  );
  return <path d={forma} fill="#332C24" opacity="0.92" />;
}

function Retrato({ lash = "natural", brow = "normal", alto = 200, src, sinMarco }) {
  if (src) return <div style={{ height: alto, background: `url(${src}) center/cover`, border: sinMarco ? "none" : `1px solid ${T.linea}` }} />;
  return (
    <div style={{ height: alto, position: "relative", overflow: "hidden", border: sinMarco ? "none" : `1px solid ${T.linea}` }}>
      <svg viewBox="0 0 200 130" style={{ width: "100%", height: "100%", display: "block" }} preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="piel" cx="50%" cy="34%" r="78%">
            <stop offset="0%" stopColor="#FAEFE5" /><stop offset="52%" stopColor={T.piel} /><stop offset="100%" stopColor={T.pielOsc} />
          </radialGradient>
          <radialGradient id="iris" cx="50%" cy="34%" r="66%">
            <stop offset="0%" stopColor="#B08F66" /><stop offset="48%" stopColor="#7A5D3A" /><stop offset="88%" stopColor="#412F1C" /><stop offset="100%" stopColor="#2A1D10" />
          </radialGradient>
          <radialGradient id="esclera" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" /><stop offset="72%" stopColor="#F7F2EC" /><stop offset="100%" stopColor="#E4D9CF" />
          </radialGradient>
          <linearGradient id="sombraLid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B08A6E" stopOpacity="0.32" /><stop offset="100%" stopColor="#B08A6E" stopOpacity="0" />
          </linearGradient>
          <clipPath id="ojoClip"><path d="M40 88 Q100 44 160 88 Q100 116 40 88 Z" /></clipPath>
        </defs>

        <rect width="200" height="130" fill="url(#piel)" />

        {/* volumen del párpado y hueco del arco superciliar */}
        <path d="M34 92 Q100 30 166 92 Q100 62 34 92 Z" fill="url(#sombraLid)" />
        <path d="M42 78 Q100 38 158 78" stroke={T.pielOsc} strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round" />
        <path d="M46 100 Q100 122 154 100" stroke={T.pielOsc} strokeWidth="1.1" fill="none" opacity="0.35" strokeLinecap="round" />

        <Ceja modo={brow} />

        {/* globo */}
        <path d="M40 88 Q100 44 160 88 Q100 116 40 88 Z" fill="url(#esclera)" />
        <g clipPath="url(#ojoClip)">
          <circle cx="100" cy="86" r="21" fill="url(#iris)" />
          {Array.from({ length: 22 }).map((_, i) => {
            const a2 = (i / 22) * Math.PI * 2;
            return <line key={i} x1={100 + Math.cos(a2) * 9.5} y1={86 + Math.sin(a2) * 9.5}
              x2={100 + Math.cos(a2) * 19.5} y2={86 + Math.sin(a2) * 19.5}
              stroke="#2E2114" strokeWidth="0.7" opacity="0.28" />;
          })}
          <circle cx="100" cy="86" r="21" fill="none" stroke="#241A0F" strokeWidth="2" opacity="0.85" />
          <circle cx="100" cy="86" r="8.6" fill="#120E08" />
          <ellipse cx="100" cy="76" rx="13" ry="6" fill="#2A1D10" opacity="0.28" />
          <circle cx="93" cy="79.5" r="3.4" fill="#FFF" opacity="0.92" />
          <circle cx="107" cy="79.5" r="3.4" fill="#FFF" opacity="0.92" />
          <circle cx="100" cy="95" r="2" fill="#FFF" opacity="0.4" />
          {/* sombra que proyecta el párpado sobre el ojo */}
          <path d="M40 88 Q100 44 160 88 Q100 58 40 88 Z" fill="#6B523C" opacity="0.2" />
        </g>

        {/* lagrimales, en pareja */}
        <path d="M40 88 q5 -3 8 0 q-4 3 -8 0 Z" fill="#D89B90" opacity="0.75" />
        <path d="M160 88 q-5 -3 -8 0 q4 3 8 0 Z" fill="#D89B90" opacity="0.75" />

        {/* línea de agua inferior y línea de pestañas superior, con grosor real */}
        <path d="M40 88 Q100 116 160 88 Q100 114 40 88 Z" fill="#7A6450" opacity="0.8" />
        <path d="M40 88 Q100 44 160 88 Q100 48.4 40 88 Z" fill="#241F1A" />

        <PestanasBajas />
        <Pestanas set={lash} />
      </svg>
    </div>
  );
}

const ETAPAS = {
  pestanas: [
    { l: "Antes", set: { lash: "corta", brow: "normal" }, pie: "Tu pestaña natural, sin nada encima." },
    { l: "1 pelo", set: { lash: "clasica", brow: "normal" }, pie: "Una extensión sobre cada pestaña. Clásicas." },
    { l: "2 pelos", set: { lash: "hibrida", brow: "normal" }, pie: "Abanico de dos hilos. Híbridas." },
    { l: "3 pelos", set: { lash: "tecno", brow: "normal" }, pie: "Abanico de tres. Volumen tecnológico." },
    { l: "4 pelos", set: { lash: "ruso", brow: "normal" }, pie: "Abanico de cuatro, hecho a mano. Volumen ruso." },
  ],
  cejas: [
    { l: "Antes", set: { lash: "natural", brow: "rala" }, pie: "La ceja como está hoy, sin diseño." },
    { l: "Diseño", set: { lash: "natural", brow: "diseno" }, pie: "Mapeada y depilada según tu rostro." },
    { l: "Lamination", set: { lash: "natural", brow: "lamin" }, pie: "El vello alisado y peinado hacia arriba." },
    { l: "Sombreado", set: { lash: "natural", brow: "sombreado" }, pie: "Semipermanente. Despiertas maquillada." },
  ],
};

/* Barra que recorre la transformación paso a paso, sin partir la imagen */
function Progresion({ tipo = "pestanas", alto = 250, inicial = 0 }) {
  const etapas = ETAPAS[tipo] || ETAPAS.pestanas;
  const [i, setI] = useState(inicial);
  const ref = useRef(null);
  const mover = (clientX) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    setI(Math.round(p * (etapas.length - 1)));
  };
  const pct = (i / (etapas.length - 1)) * 100;
  const e = etapas[i];

  return (
    <div>
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div key={i} style={{ animation: "aparecer 380ms ease" }}>
          <Retrato lash={e.set.lash} brow={e.set.brow} alto={alto} sinMarco />
        </div>
        <span style={{
          position: "absolute", top: 12, left: 12, background: "rgba(59,53,46,0.78)", color: "#FFF",
          fontSize: 8.5, letterSpacing: "0.2em", padding: "5px 10px", fontFamily: SANS,
        }}>{e.l.toUpperCase()}</span>
      </div>

      <div style={{ padding: "16px 14px 14px", borderTop: `1px solid ${T.linea}` }}>
        <div ref={ref}
          onPointerDown={(ev) => { ev.currentTarget.setPointerCapture(ev.pointerId); mover(ev.clientX); }}
          onPointerMove={(ev) => { if (ev.buttons === 1) mover(ev.clientX); }}
          style={{ position: "relative", height: 26, touchAction: "none", cursor: "ew-resize", userSelect: "none" }}>
          <div style={{ position: "absolute", top: 12, left: 0, right: 0, height: 2, background: T.linea }} />
          <div style={{ position: "absolute", top: 12, left: 0, width: `${pct}%`, height: 2, background: T.bronce, transition: "width 260ms ease" }} />
          {etapas.map((_, k) => (
            <div key={k} style={{
              position: "absolute", top: 8, left: `${(k / (etapas.length - 1)) * 100}%`, transform: "translateX(-50%)",
              width: 10, height: 10, borderRadius: 999,
              background: k <= i ? T.bronce : T.papel, border: `1px solid ${k <= i ? T.bronce : T.linea}`,
              transition: "background 260ms ease",
            }} />
          ))}
          <div style={{
            position: "absolute", top: 0, left: `${pct}%`, transform: "translateX(-50%)",
            width: 26, height: 26, borderRadius: 999, background: "#FFF", border: `1px solid ${T.bronce}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.14)", display: "grid", placeItems: "center",
            transition: "left 260ms ease",
          }}>
            <span style={{ fontFamily: SERIF, fontSize: 13, color: T.bronceOsc, lineHeight: 1 }}>{i === 0 ? "·" : i}</span>
          </div>
        </div>

        <div className="flex" style={{ marginTop: 10 }}>
          {etapas.map((x, k) => (
            <button key={k} onClick={() => setI(k)} style={{
              flex: 1, background: "none", border: "none", padding: 0, cursor: "pointer",
              fontFamily: SANS, fontSize: 8.5, letterSpacing: "0.1em",
              color: k === i ? T.tinta : T.greige, textAlign: "center",
            }}>{x.l.toUpperCase()}</button>
          ))}
        </div>

        <div style={{ fontFamily: SANS, fontSize: 11.5, color: T.mute, marginTop: 12, lineHeight: 1.55, textAlign: "center" }}>
          {e.pie}
        </div>
      </div>
    </div>
  );
}

/* ═════════  RETRATO DE CADA MUJER DEL EQUIPO  ═════════
   Ilustración de marca. Se reemplaza sola cuando haya `foto`. */
const PIELES = {
  clara: ["#F6E1CF", "#E3C1A7"], media: ["#EDC9A8", "#D4A483"],
  canela: ["#DBAA80", "#BE8A5E"], morena: ["#B67F58", "#90603D"], oscura: ["#8C5C3C", "#6A4027"],
};
const CABELLOS = { negro: "#241C16", chocolate: "#3A281C", castano: "#4C3626", miel: "#8A6134", rubio: "#B8905A", cobre: "#8E4A29" };
const MASAS = {
  recogido: "M34 70 Q 30 24 60 24 Q 90 24 86 70 Z",
  suelto: "M31 70 Q 27 24 60 24 Q 93 24 89 70 L93 116 Q 76 106 78 78 L42 78 Q 44 106 27 116 Z",
  bob: "M33 70 Q 30 24 60 24 Q 90 24 87 70 L88 90 Q 74 94 74 70 L46 70 Q 46 94 32 90 Z",
  ondas: "M30 70 Q 26 23 60 23 Q 94 23 90 70 Q 96 94 88 110 Q 83 96 80 80 L40 80 Q 37 96 32 110 Q 24 94 30 70 Z",
  coleta: "M34 70 Q 30 24 60 24 Q 90 24 86 70 Z",
};
const FLEQUILLOS = {
  abierto: "M38 51 Q 44 32 60 32 Q 76 32 82 51 Q 74 40 60 40 Q 46 40 38 51 Z",
  lado: "M37 52 Q 41 30 62 31 Q 81 32 83 49 Q 72 36 56 38 Q 44 40 37 52 Z",
  recto: "M38 45 Q 60 31 82 45 L82 49 Q 60 39 38 49 Z",
  ninguno: "",
};

function RetratoPersona({ p, alto = 120, src, redondo }) {
  const r = p || {};
  const piel = PIELES[r.piel] || PIELES.media;
  const pelo = CABELLOS[r.pelo] || CABELLOS.negro;
  const fondo = r.fondo || T.crema;
  const id = r.id || "p";
  if (src) return <div style={{ height: alto, background: `url(${src}) center/cover`, borderRadius: redondo ? 999 : 0 }} />;
  const ojo = (cx) => (
    <g key={cx}>
      <path d={`M${cx - 6} 58 Q ${cx} 53.4 ${cx + 6} 58 Q ${cx} 61.2 ${cx - 6} 58 Z`} fill="#FCFAF7" />
      <circle cx={cx} cy={57.8} r="2.7" fill={pelo} />
      <circle cx={cx - 0.9} cy={57} r="0.9" fill="#FFF" opacity="0.9" />
      <path d={`M${cx - 6} 58 Q ${cx} 53.4 ${cx + 6} 58`} stroke="#241F1A" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      {[-5, -2.5, 0, 2.5, 5].map((o, i) => (
        <path key={i} d={`M${cx + o} ${56.2 + Math.abs(o) * 0.22} l${o * 0.34 - 0.5} -2.5`} stroke="#241F1A" strokeWidth="0.9" strokeLinecap="round" />
      ))}
    </g>
  );
  return (
    <div style={{ height: alto, overflow: "hidden", borderRadius: redondo ? 999 : 0 }}>
      <svg viewBox="0 0 120 150" style={{ width: "100%", height: "100%", display: "block" }} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={`bg${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor={fondo} />
          </linearGradient>
          <linearGradient id={`pl${id}`} x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor={piel[0]} /><stop offset="100%" stopColor={piel[1]} />
          </linearGradient>
        </defs>
        <rect width="120" height="150" fill={`url(#bg${id})`} />
        <path d={MASAS[r.masa] || MASAS.suelto} fill={pelo} />
        {r.masa === "recogido" && <circle cx="60" cy="19" r="10" fill={pelo} />}
        {r.masa === "coleta" && <path d="M84 46 Q 102 58 97 88 Q 90 100 84 90 Q 93 70 81 54 Z" fill={pelo} />}
        <path d="M6 150 Q 24 112 46 103 L74 103 Q 96 112 114 150 Z" fill={T.tinta} opacity="0.92" />
        <path d="M51 80 h18 v22 q-9 8 -18 0 Z" fill={`url(#pl${id})`} />
        <path d="M51 86 q9 9 18 0" fill="#2A1F16" opacity="0.13" />
        <ellipse cx="38.6" cy="60" rx="3.6" ry="5" fill={piel[1]} />
        <ellipse cx="81.4" cy="60" rx="3.6" ry="5" fill={piel[1]} />
        <ellipse cx="60" cy="58" rx="21.5" ry="26" fill={`url(#pl${id})`} />
        <ellipse cx="47" cy="66" rx="5" ry="3" fill="#C8735E" opacity="0.16" />
        <ellipse cx="73" cy="66" rx="5" ry="3" fill="#C8735E" opacity="0.16" />
        <path d="M45.5 50.5 Q 52 45.2 58.5 48.4" stroke={pelo} strokeWidth="2.9" fill="none" strokeLinecap="round" />
        <path d="M74.5 50.5 Q 68 45.2 61.5 48.4" stroke={pelo} strokeWidth="2.9" fill="none" strokeLinecap="round" />
        {[52, 68].map(ojo)}
        <path d="M60 60.5 q1.8 5.2 -1.6 6.6" stroke={piel[1]} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M54.4 72 Q 60 69.2 65.6 72 Q 60 76.4 54.4 72 Z" fill="#B3705E" />
        <path d="M54.4 72 Q 60 73 65.6 72" stroke="#8E5244" strokeWidth="0.7" fill="none" />
        {FLEQUILLOS[r.flequillo] ? <path d={FLEQUILLOS[r.flequillo]} fill={pelo} /> : null}
        <circle cx="38.6" cy="66.5" r="1.9" fill={T.bronce} />
        <circle cx="81.4" cy="66.5" r="1.9" fill={T.bronce} />
      </svg>
    </div>
  );
}

/* ═════════  ROSTRO COMPLETO — LA IMAGEN GRANDE DEL SERVICIO  ═════════ */
const MODELO = { piel: "media", pelo: "chocolate", masa: "suelto", flequillo: "ninguno" };

function pestanasOjo(cx, cy, w, set, lado) {
  const s = SETS[set] || SETS.natural;
  const k = w / 120;
  const A = [cx - w / 2, cy], B = [cx, cy - w * 0.46], C = [cx + w / 2, cy];
  return Array.from({ length: s.n }, (_, i) => {
    const t = (i + 0.5) / s.n;
    const x = (1 - t) ** 2 * A[0] + 2 * (1 - t) * t * B[0] + t ** 2 * C[0];
    const y = (1 - t) ** 2 * A[1] + 2 * (1 - t) * t * B[1] + t ** 2 * C[1];
    const dx = 2 * (1 - t) * (B[0] - A[0]) + 2 * t * (C[0] - B[0]);
    const dy = 2 * (1 - t) * (B[1] - A[1]) + 2 * t * (C[1] - B[1]);
    const L2 = Math.hypot(dx, dy), nx = dy / L2, ny = -dx / L2;
    const k2 = Math.min(i, s.n - 1 - i);
    const esc = (0.52 + Math.sin(t * Math.PI) * 0.56) * (0.94 + ((k2 * 29) % 9) / 90);
    const len = s.L * k * esc * 1.3;
    const curl = s.c * k * (t - 0.28) * lado * 3.2;
    const ex = x + nx * len + curl, ey = y + ny * len - len * 0.16;
    const cx2 = x + nx * len * 0.42 + curl * 0.15, cy2 = y + ny * len * 0.58;
    const w = Math.max(0.5, s.w * k * 1.3);
    const ddx = ex - x, ddy = ey - y, dl = Math.hypot(ddx, ddy) || 1;
    const px = -ddy / dl, py = ddx / dl;
    return (
      <path key={i} fill="#241F1A" opacity={0.95}
        d={`M${x + px * w} ${y + py * w} Q${cx2 + px * w * 0.35} ${cy2 + py * w * 0.35} ${ex} ${ey} Q${cx2 - px * w * 0.35} ${cy2 - py * w * 0.35} ${x - px * w} ${y - py * w} Z`} />
    );
  });
}

function cejaRostro(cx, cy, modo, pelo) {
  const forma = `M${cx - 24} ${cy + 6} Q ${cx - 4} ${cy - 9} ${cx + 22} ${cy - 1} Q ${cx - 2} ${cy - 1} ${cx - 22} ${cy + 13} Z`;
  if (modo === "rala")
    return <g opacity="0.8">{Array.from({ length: 14 }).map((_, i) => {
      const t = i / 13, x = cx - 22 + t * 44, y = cy + 9 - Math.sin(t * Math.PI * 0.85) * 8 + t * 2;
      return <path key={i} d={`M${x} ${y} q 2.5 -2.5 5 -3.5`} stroke={pelo} strokeWidth={1 + (i % 2) * 0.4} fill="none" strokeLinecap="round" opacity={0.55 + (i % 3) * 0.15} />;
    })}</g>;
  if (modo === "lamin")
    return <g><path d={forma} fill="#2E271F" />{Array.from({ length: 13 }).map((_, i) => {
      const t = i / 12, x = cx - 21 + t * 42, y = cy + 7 - Math.sin(t * Math.PI * 0.9) * 7 + t * 3;
      return <path key={i} d={`M${x} ${y} q 1.5 -6 5 -8.5`} stroke="#4A3F33" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.85" />;
    })}</g>;
  if (modo === "sombreado")
    return <g>
      <path d={forma} fill="#3A3128" opacity="0.3" />
      <path d={forma} fill="none" stroke="#3A3128" strokeWidth="0.9" opacity="0.65" />
      {Array.from({ length: 44 }).map((_, i) => {
        const t = (i % 22) / 21, fila = Math.floor(i / 22);
        const x = cx - 22 + t * 44, y = cy + 4 - Math.sin(t * Math.PI * 0.9) * 8 + t * 4 + fila * 3.6;
        return <circle key={i} cx={x} cy={y} r={0.9 - fila * 0.25} fill="#2E271F" opacity={0.55 - fila * 0.18} />;
      })}
    </g>;
  return <path d={forma} fill="#2E271F" opacity="0.94" />;
}

function RostroCompleto({ lash = "natural", brow = "normal", modelo, alto = 280, src, sinMarco, look = "mirada" }) {
  const m = { ...MODELO, ...(modelo || {}) };
  const piel = PIELES[m.piel] || PIELES.media;
  const pelo = CABELLOS[m.pelo] || CABELLOS.chocolate;
  const gid = `${m.piel}${lash}${brow}${look}`.replace(/[^a-z0-9]/gi, "");
  const esBarba = look === "barberia";
  const esMaquillaje = look === "maquillaje";
  const esPelo = look === "peluqueria";
  if (src) return <div style={{ height: alto, background: `url(${src}) center/cover`, border: sinMarco ? "none" : `1px solid ${T.linea}` }} />;

  const ojoDer = (
    <g>
      <path d="M108 108 Q 128 92 148 108 Q 128 121 108 108 Z" fill="#FCFAF7" />
      <g clipPath="url(#ojoD)">
        <circle cx="128" cy="107" r="10.5" fill={`url(#irisG${gid})`} />
        <circle cx="128" cy="107" r="10.5" fill="none" stroke="#2A2014" strokeWidth="0.9" />
        <circle cx="128" cy="107" r="4.3" fill="#14100B" />
        <circle cx="125" cy="104" r="1.9" fill="#FFF" opacity="0.92" />
      </g>
      <path d="M108 108 Q 128 92 148 108" stroke="#241F1A" strokeWidth="1.7" fill="none" strokeLinecap="round" />
      <path d="M108 108 Q 128 121 148 108" stroke="#6A5947" strokeWidth="0.9" fill="none" opacity="0.8" />
      <path d="M110 101 Q 128 94 147 101" stroke={piel[1]} strokeWidth="0.9" fill="none" opacity="0.7" />
      {esMaquillaje && <path d="M110 102 Q 128 92 147 102 Q 128 98 110 102 Z" fill="#8C6E63" opacity="0.4" />}
      {esMaquillaje && <path d="M146 107 q 9 -2 13 -7" stroke="#241F1A" strokeWidth="2.1" fill="none" strokeLinecap="round" />}
      {pestanasOjo(128, 108, 40, lash, 1)}
      {cejaRostro(128, 78, brow, pelo)}
      {esBarba && <path d="M104 80 Q 128 68 152 76 Q 128 74 106 86 Z" fill="#241F1A" opacity="0.95" />}
    </g>
  );

  return (
    <div style={{ height: alto, overflow: "hidden", border: sinMarco ? "none" : `1px solid ${T.linea}` }}>
      <svg viewBox="0 0 200 240" style={{ width: "100%", height: "100%", display: "block" }} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={`fdo${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor={T.crema} />
          </linearGradient>
          <linearGradient id={`plG${gid}`} x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor={piel[0]} /><stop offset="100%" stopColor={piel[1]} />
          </linearGradient>
          <radialGradient id={`irisG${gid}`} cx="42%" cy="38%" r="65%">
            <stop offset="0%" stopColor="#A9855E" /><stop offset="55%" stopColor="#6E5436" /><stop offset="100%" stopColor="#3A2C1C" />
          </radialGradient>
          <clipPath id="ojoD"><path d="M108 108 Q 128 92 148 108 Q 128 121 108 108 Z" /></clipPath>
        </defs>
        <rect width="200" height="240" fill={`url(#fdo${gid})`} />
        {esBarba ? (
          <path d="M52 108 Q 48 34 100 34 Q 152 34 148 108 Q 142 72 100 68 Q 58 72 52 108 Z" fill={pelo} />
        ) : esPelo ? (
          <g>
            <path d="M38 132 Q 26 24 100 24 Q 174 24 162 132 Q 176 186 166 226 Q 146 196 138 140 L62 140 Q 54 196 34 226 Q 24 186 38 132 Z" fill={pelo} />
            <path d="M58 60 Q 78 38 104 40 Q 84 52 70 84 Q 62 108 62 138 Q 50 100 58 60 Z" fill="#FFFFFF" opacity="0.13" />
            <path d="M150 96 Q 156 140 148 182 Q 142 146 140 108 Z" fill="#FFFFFF" opacity="0.1" />
          </g>
        ) : (
          <path d="M46 126 Q 36 30 100 30 Q 164 30 154 126 L164 214 Q 130 198 136 134 L64 134 Q 70 198 36 214 Z" fill={pelo} />
        )}
        <path d="M2 240 Q 38 198 78 188 L122 188 Q 162 198 198 240 Z" fill={T.tinta} opacity="0.93" />
        <path d="M84 156 h32 v36 q-16 12 -32 0 Z" fill={`url(#plG${gid})`} />
        <path d="M84 164 q16 13 32 0" fill="#2A1F16" opacity="0.13" />
        <ellipse cx="49" cy="112" rx="7.5" ry="11" fill={piel[1]} />
        <ellipse cx="151" cy="112" rx="7.5" ry="11" fill={piel[1]} />
        <ellipse cx="100" cy="108" rx="50" ry="62" fill={`url(#plG${gid})`} />
        <ellipse cx="66" cy="128" rx={esMaquillaje ? 16 : 13} ry={esMaquillaje ? 8 : 7} fill="#C8735E" opacity={esMaquillaje ? 0.3 : 0.15} />
        <ellipse cx="134" cy="128" rx={esMaquillaje ? 16 : 13} ry={esMaquillaje ? 8 : 7} fill="#C8735E" opacity={esMaquillaje ? 0.3 : 0.15} />
        {ojoDer}
        <g transform="translate(200,0) scale(-1,1)">{ojoDer}</g>
        {brow === "diseno" && (
          <g stroke={T.bronce} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.9">
            <line x1="100" y1="52" x2="100" y2="176" />
            <line x1="92" y1="140" x2="106" y2="72" /><line x1="108" y1="140" x2="94" y2="72" />
            <line x1="92" y1="140" x2="152" y2="76" /><line x1="108" y1="140" x2="48" y2="76" />
            <circle cx="128" cy="70" r="2.6" fill={T.bronce} stroke="none" />
            <circle cx="72" cy="70" r="2.6" fill={T.bronce} stroke="none" />
          </g>
        )}
        <path d="M100 116 Q 107 136 98 139 Q 92 140 91 135" stroke={piel[1]} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <ellipse cx="93" cy="139" rx="2.2" ry="1.4" fill="#A5795A" opacity="0.5" />
        <ellipse cx="107" cy="139" rx="2.2" ry="1.4" fill="#A5795A" opacity="0.5" />
        {esBarba && (
          <g>
            <path d="M54 122 Q 56 172 100 180 Q 144 172 146 122 Q 138 150 100 152 Q 62 150 54 122 Z" fill={pelo} opacity="0.92" />
            <path d="M88 150 Q 100 146 112 150 Q 100 156 88 150 Z" fill="#B3705E" />
            <path d="M86 140 Q 100 134 114 140 Q 100 138 86 140 Z" fill={pelo} />
          </g>
        )}
        {!esBarba && (
          <g>
            <path d="M84 158 Q 92 150 100 154 Q 108 150 116 158 Q 108 168 100 168 Q 92 168 84 158 Z" fill={esMaquillaje ? "#A33F4C" : "#B3705E"} />
            <path d="M84 158 Q 100 161 116 158" stroke={esMaquillaje ? "#7C2C37" : "#8E5244"} strokeWidth="0.8" fill="none" />
            {esMaquillaje && <path d="M92 155 Q 100 152 108 155" stroke="#FFFFFF" strokeWidth="0.8" fill="none" opacity="0.35" />}
          </g>
        )}
        {m.flequillo === "lado" && !esBarba && !esPelo && <path d="M54 92 Q 62 46 104 48 Q 146 50 150 86 Q 132 58 96 62 Q 68 66 54 92 Z" fill={pelo} />}
        {!esBarba && <circle cx="49" cy="124" r="3.4" fill={T.bronce} />}
        {!esBarba && <circle cx="151" cy="124" r="3.4" fill={T.bronce} />}
      </svg>
    </div>
  );
}

/* ═════════  LOS PRODUCTOS, RENDERIZADOS  ═════════ */
function Frasco({ tipo = "gotero", alto = 220, src, fondo }) {
  if (src) return <div style={{ height: alto, background: `url(${src}) center/cover` }} />;
  const g = "urlVidrio", b = "urlBronce";
  const etiqueta = (x, y, w, h) => (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#FBF8F3" stroke="#E2D9CB" strokeWidth="0.6" />
      <text x={x + w / 2} y={y + h * 0.44} textAnchor="middle" fill="#8A6E49" style={{ fontFamily: "Cormorant Garamond, serif", fontSize: h * 0.34, fontStyle: "italic" }}>A</text>
      <rect x={x + w * 0.22} y={y + h * 0.6} width={w * 0.56} height="1" fill="#C4B8A8" />
      <rect x={x + w * 0.3} y={y + h * 0.72} width={w * 0.4} height="0.8" fill="#D3C8B8" />
    </g>
  );
  const cuerpos = {
    gotero: (
      <g>
        <rect x="70" y="104" width="60" height="106" rx="7" fill={`url(#${g})`} stroke="#CFC2AE" strokeWidth="0.8" />
        <path d="M78 104 Q 78 90 88 86 L112 86 Q 122 90 122 104 Z" fill={`url(#${g})`} stroke="#CFC2AE" strokeWidth="0.8" />
        <rect x="88" y="72" width="24" height="16" fill="#E6DED0" />
        <rect x="82" y="38" width="36" height="36" rx="4" fill={`url(#${b})`} />
        <rect x="82" y="38" width="36" height="6" rx="2" fill="#C9AC7F" opacity="0.7" />
        {etiqueta(78, 128, 44, 58)}
        <rect x="76" y="118" width="5" height="76" rx="2.5" fill="#FFF" opacity="0.4" />
      </g>
    ),
    bomba: (
      <g>
        <rect x="66" y="108" width="68" height="104" rx="5" fill={`url(#${g})`} stroke="#CFC2AE" strokeWidth="0.8" />
        <rect x="86" y="92" width="28" height="18" fill="#E6DED0" />
        <rect x="84" y="74" width="32" height="20" rx="3" fill={`url(#${b})`} />
        <rect x="96" y="52" width="9" height="24" fill={`url(#${b})`} />
        <path d="M96 52 L78 52 L78 60 L96 60 Z" fill={`url(#${b})`} />
        {etiqueta(76, 132, 48, 58)}
        <rect x="72" y="122" width="5" height="76" rx="2.5" fill="#FFF" opacity="0.4" />
      </g>
    ),
    tubo: (
      <g>
        <rect x="84" y="96" width="32" height="116" rx="15" fill={`url(#${g})`} stroke="#CFC2AE" strokeWidth="0.8" />
        <rect x="80" y="48" width="40" height="50" rx="7" fill={`url(#${b})`} />
        <rect x="80" y="48" width="40" height="6" rx="3" fill="#C9AC7F" opacity="0.7" />
        {etiqueta(85, 126, 30, 56)}
        <rect x="88" y="110" width="4" height="86" rx="2" fill="#FFF" opacity="0.4" />
      </g>
    ),
    spray: (
      <g>
        <rect x="74" y="110" width="52" height="102" rx="6" fill={`url(#${g})`} stroke="#CFC2AE" strokeWidth="0.8" />
        <rect x="88" y="94" width="24" height="18" fill="#E6DED0" />
        <rect x="84" y="72" width="32" height="24" rx="3" fill={`url(#${b})`} />
        <path d="M84 78 L66 74 L66 80 L84 84 Z" fill={`url(#${b})`} />
        {[0, 1, 2].map((i) => <circle key={i} cx={56 - i * 9} cy={70 - i * 5} r={1.6 - i * 0.3} fill="#C9AC7F" opacity={0.6 - i * 0.15} />)}
        {etiqueta(80, 134, 40, 56)}
      </g>
    ),
    caja: (
      <g>
        <path d="M52 92 L100 76 L148 92 L100 108 Z" fill="#EFE7DA" stroke="#D7CBB9" strokeWidth="0.8" />
        <path d="M52 92 L52 200 L100 216 L100 108 Z" fill="#E4DACA" stroke="#D0C3AF" strokeWidth="0.8" />
        <path d="M148 92 L148 200 L100 216 L100 108 Z" fill="#F3ECE1" stroke="#D0C3AF" strokeWidth="0.8" />
        <path d="M100 108 L100 216" stroke="#C9AC7F" strokeWidth="2" opacity="0.65" />
        <path d="M76 100 L76 208" stroke="#C9AC7F" strokeWidth="1.4" opacity="0.45" />
        <text x="124" y="160" textAnchor="middle" fill="#8A6E49" style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 26, fontStyle: "italic" }}>A</text>
      </g>
    ),
    cepillo: (
      <g>
        <rect x="94" y="72" width="12" height="118" rx="6" fill={`url(#${b})`} />
        <rect x="90" y="176" width="20" height="16" rx="3" fill="#8A6E49" />
        <path d="M100 192 L100 214" stroke="#3B352E" strokeWidth="5" strokeLinecap="round" />
        {Array.from({ length: 16 }).map((_, i) => (
          <g key={i}>
            <path d={`M100 ${60 - 0} `} />
            <path d={`M96 ${64 + i * 3.4} l-9 -2.6`} stroke="#3B352E" strokeWidth="1.1" strokeLinecap="round" />
            <path d={`M104 ${64 + i * 3.4} l9 -2.6`} stroke="#3B352E" strokeWidth="1.1" strokeLinecap="round" />
          </g>
        ))}
        <rect x="96" y="58" width="8" height="62" rx="4" fill="#2E271F" />
      </g>
    ),
  };
  return (
    <div style={{ height: alto, overflow: "hidden", background: fondo || `radial-gradient(120% 90% at 50% 26%, #FFFFFF 0%, ${T.crema} 62%, ${T.greige}55 100%)` }}>
      <svg viewBox="0 0 200 250" style={{ width: "100%", height: "100%", display: "block" }} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="urlVidrio" x1="0" y1="0" x2="1" y2="0.3">
            <stop offset="0%" stopColor="#FFFFFF" /><stop offset="42%" stopColor="#F2ECE2" /><stop offset="100%" stopColor="#DCD0BD" />
          </linearGradient>
          <linearGradient id="urlBronce" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D2B685" /><stop offset="45%" stopColor="#A8875C" /><stop offset="100%" stopColor="#7A5F3E" />
          </linearGradient>
        </defs>
        <ellipse cx="100" cy="220" rx="52" ry="7" fill="#3B352E" opacity="0.1" />
        {cuerpos[tipo] || cuerpos.gotero}
      </svg>
    </div>
  );
}

/* ─────────────────  CATÁLOGO  ───────────────── */
const SERVICIOS_BASE = [
  { id: 1, n: "Diseño y epilación de cejas", cat: "Cejas", d: 45, p: 70000, foto: null, antes: { lash: "natural", brow: "rala" }, despues: { lash: "natural", brow: "diseno" }, desc: "Hilo o cera, con diseño según la proporción de tu rostro.", promesa: "Sales con la mirada ordenada. Es el punto de partida de todo.", dura: "3 a 4 semanas", top: false },
  { id: 2, n: "Brow Lamination", cat: "Cejas", d: 60, p: 150000, foto: null, antes: { lash: "natural", brow: "rala" }, despues: { lash: "natural", brow: "lamin" }, desc: "Alisado y fijación del vello con nutrición.", promesa: "Cejas peinadas hacia arriba, llenas, durante seis semanas.", dura: "6 a 8 semanas", top: true },
  { id: 3, n: "Sombreado de cejas", cat: "Semipermanente", d: 150, p: 550000, foto: null, antes: { lash: "natural", brow: "rala" }, despues: { lash: "natural", brow: "sombreado" }, desc: "Maquillaje semipermanente. Incluye retoque a 30 días.", promesa: "Despiertas maquillada. Dura entre uno y dos años.", dura: "1 a 2 años", top: false },
  { id: 4, n: "Lash Lifting", cat: "Pestañas", d: 70, p: 150000, foto: null, antes: { lash: "corta", brow: "normal" }, despues: { lash: "lift", brow: "normal" }, desc: "Curvatura desde la raíz con tinte y keratina.", promesa: "Tu pestaña, levantada. Sin extensiones y sin mantenimiento.", dura: "6 a 8 semanas", top: true },
  { id: 5, n: "Extensiones clásicas", cat: "Pestañas", d: 120, p: 160000, foto: null, antes: { lash: "corta", brow: "normal" }, despues: { lash: "clasica", brow: "normal" }, desc: "Una extensión por pestaña natural.", promesa: "Nadie nota que las tienes. Solo notan que te ves descansada.", dura: "3 semanas", top: false },
  { id: 6, n: "Extensiones híbridas", cat: "Pestañas", d: 135, p: 190000, foto: null, antes: { lash: "corta", brow: "normal" }, despues: { lash: "hibrida", brow: "normal" }, desc: "Mezcla de clásico y volumen.", promesa: "El punto medio perfecto: natural con densidad.", dura: "3 semanas", top: false },
  { id: 7, n: "Volumen tecnológico", cat: "Pestañas", d: 150, p: 220000, foto: null, antes: { lash: "corta", brow: "normal" }, despues: { lash: "tecno", brow: "normal" }, desc: "Abanicos prearmados de aplicación precisa.", promesa: "Densidad pareja, en menos tiempo de camilla.", dura: "3 a 4 semanas", top: false },
  { id: 8, n: "Volumen ruso", cat: "Pestañas", d: 165, p: 250000, foto: null, antes: { lash: "corta", brow: "normal" }, despues: { lash: "ruso", brow: "normal" }, desc: "Abanicos hechos a mano de 4 a 6 hilos.", promesa: "El máximo. Mirada de alfombra roja que aguanta el día entero.", dura: "3 a 4 semanas", top: true },
  { id: 9, n: "Retoque de extensiones", cat: "Pestañas", d: 75, p: 110000, foto: null, antes: { lash: "corta", brow: "normal" }, despues: { lash: "retoque", brow: "normal" }, desc: "Hasta 21 días desde la aplicación.", promesa: "Vuelven a estar como el primer día.", dura: "3 semanas", top: false },
  { id: 10, n: "Depilación corporal", cat: "Cuerpo", d: 30, p: 60000, foto: null, antes: { lash: "natural", brow: "normal" }, despues: { lash: "natural", brow: "normal" }, desc: "Cera tibia por zona.", promesa: "Piel lisa, sin irritación, en media hora.", dura: "3 a 4 semanas", top: false },
  { id: 11, n: "Maquillaje social", cat: "Maquillaje", d: 60, p: 180000, foto: null, look: "maquillaje", antes: { lash: "natural", brow: "rala" }, despues: { lash: "tecno", brow: "lamin" }, desc: "Piel, ojo y labio para una noche. Fijado de larga duración.", promesa: "Sales lista para la foto y llegas igual a las dos de la mañana.", dura: "la noche entera", top: false },
  { id: 12, n: "Maquillaje de novia con prueba", cat: "Maquillaje", d: 150, p: 650000, foto: null, look: "maquillaje", antes: { lash: "natural", brow: "rala" }, despues: { lash: "ruso", brow: "lamin" }, desc: "Incluye prueba previa, el día del matrimonio y retoque en el cambio.", promesa: "Nada se improvisa. Lo probamos antes y sabemos exactamente cómo vas a verte.", dura: "todo el día", top: true },
  { id: 13, n: "Maquillaje de producción", cat: "Maquillaje", d: 90, p: 320000, foto: null, look: "maquillaje", antes: { lash: "natural", brow: "normal" }, despues: { lash: "tecno", brow: "lamin" }, desc: "Editorial, video o pauta. Pensado para cámara y luz dura.", promesa: "Aguanta el lente de cerca y las horas de set.", dura: "la jornada", top: false },
  { id: 14, n: "Corte y estilizado", cat: "Peluquería", d: 60, p: 85000, foto: null, look: "peluqueria", antes: { lash: "natural", brow: "normal" }, despues: { lash: "natural", brow: "normal" }, desc: "Diagnóstico, corte según tu rostro, lavado y secado con forma.", promesa: "Un corte que te sirve también el día que no tienes tiempo de arreglarte.", dura: "6 a 8 semanas", top: false },
  { id: 15, n: "Balayage o iluminación", cat: "Peluquería", d: 210, p: 520000, foto: null, look: "peluqueria", antes: { lash: "natural", brow: "normal" }, despues: { lash: "natural", brow: "normal" }, desc: "Aclarado a mano alzada con matización y tratamiento de cierre.", promesa: "Crece bonito. No te deja la raíz marcada a los dos meses.", dura: "4 a 5 meses", top: true },
  { id: 16, n: "Tratamiento de keratina", cat: "Peluquería", d: 120, p: 280000, foto: null, look: "peluqueria", antes: { lash: "natural", brow: "normal" }, despues: { lash: "natural", brow: "normal" }, desc: "Alisado progresivo sin formol, con sellado de cutícula.", promesa: "Te ahorra veinte minutos de plancha cada mañana.", dura: "3 a 4 meses", top: false },
  { id: 17, n: "Peinado para evento", cat: "Peluquería", d: 60, p: 140000, foto: null, look: "peluqueria", antes: { lash: "natural", brow: "normal" }, despues: { lash: "natural", brow: "normal" }, desc: "Recogido, semirecogido u ondas, con fijación para la jornada.", promesa: "Se sostiene hasta que termine la fiesta.", dura: "el evento", top: false },
  { id: 18, hombres: true, n: "Corte clásico de caballero", cat: "Barbería", d: 45, p: 55000, foto: null, look: "barberia", antes: { lash: "natural", brow: "normal" }, despues: { lash: "natural", brow: "normal" }, desc: "Tijera y máquina, con perfilado de contornos.", promesa: "Sales con la línea limpia y la nuca bien resuelta.", dura: "3 a 4 semanas", top: false },
  { id: 19, hombres: true, n: "Corte y perfilado de barba", cat: "Barbería", d: 70, p: 85000, foto: null, look: "barberia", antes: { lash: "natural", brow: "normal" }, despues: { lash: "natural", brow: "normal" }, desc: "Corte, diseño de barba a navaja y aceite de acabado.", promesa: "La barba deja de ser descuido y se vuelve forma.", dura: "3 semanas", top: true },
  { id: 20, hombres: true, n: "Afeitado a navaja", cat: "Barbería", d: 45, p: 70000, foto: null, look: "barberia", antes: { lash: "natural", brow: "normal" }, despues: { lash: "natural", brow: "normal" }, desc: "Toalla caliente, doble pasada y bálsamo frío.", promesa: "El ritual completo. No es un afeitado, es media hora tuya.", dura: "2 a 3 días", top: false },
  { id: 21, n: "Perfilado de cejas para hombre", cat: "Cejas", d: 30, p: 45000, foto: null, hombres: true, antes: { lash: "natural", brow: "rala" }, despues: { lash: "natural", brow: "normal" }, desc: "Limpieza de contorno y entrecejo, sin cambiar la forma natural.", promesa: "No se nota que fuiste. Solo se nota que te ves ordenado.", dura: "3 a 4 semanas", top: false },
  { id: 22, n: "Masaje relajante", cat: "Spa", d: 60, p: 160000, foto: null, look: "spa", antes: { lash: "natural", brow: "normal" }, despues: { lash: "natural", brow: "normal" }, desc: "Cuerpo completo con aceite tibio y presión media.", promesa: "Una hora en la que nadie te puede escribir.", dura: "una semana liviana", top: false },
  { id: 23, n: "Masaje descontracturante", cat: "Spa", d: 75, p: 190000, foto: null, look: "spa", hombres: true, antes: { lash: "natural", brow: "normal" }, despues: { lash: "natural", brow: "normal" }, desc: "Cuello, espalda alta y trapecios. Presión profunda.", promesa: "Para el que trabaja doce horas frente a una pantalla.", dura: "2 a 3 semanas", top: true },
  { id: 24, n: "Masaje capilar y cuero cabelludo", cat: "Spa", d: 40, p: 95000, foto: null, look: "spa", hombres: true, antes: { lash: "natural", brow: "normal" }, despues: { lash: "natural", brow: "normal" }, desc: "Drenaje del cuero cabelludo con aceites y lavado de cierre.", promesa: "Baja la cabeza y activa el crecimiento. Es adictivo.", dura: "2 semanas", top: false },
  { id: 25, n: "Ritual de spa para dos", cat: "Spa", d: 120, p: 420000, foto: null, look: "spa", antes: { lash: "natural", brow: "normal" }, despues: { lash: "natural", brow: "normal" }, desc: "Dos camillas, masaje simultáneo, infusión y aromaterapia.", promesa: "El regalo de aniversario que sí se recuerda.", dura: "la tarde entera", top: false },
  { id: 26, n: "Curso de Lash Lifting", cat: "Capacitaciones", d: 480, p: 850000, foto: null, antes: { lash: "corta", brow: "normal" }, despues: { lash: "lift", brow: "normal" }, desc: "Un día. Teoría, bioseguridad, práctica en modelo y kit incluido.", promesa: "Sales con certificado y con el kit para cobrar desde la semana siguiente.", dura: "certificado", top: false },
  { id: 27, n: "Curso de Volumen Ruso", cat: "Capacitaciones", d: 480, p: 2400000, foto: null, antes: { lash: "corta", brow: "normal" }, despues: { lash: "ruso", brow: "normal" }, desc: "Tres sesiones. Armado de abanicos a mano, aislamiento y corrección.", promesa: "La técnica que más se paga en Bogotá, enseñada por Indiana.", dura: "certificado", top: true },
  { id: 28, n: "Curso de Brow Lamination y diseño", cat: "Capacitaciones", d: 420, p: 1500000, foto: null, antes: { lash: "natural", brow: "rala" }, despues: { lash: "natural", brow: "lamin" }, desc: "Dos sesiones. Mapeo con proporción, químicos y manejo de piel sensible.", promesa: "Aprendes a medir la ceja, no a copiarla de una foto.", dura: "certificado", top: false },
  { id: 29, n: "Masterclass de barbería clásica", cat: "Capacitaciones", d: 420, p: 680000, foto: null, look: "barberia", hombres: true, antes: { lash: "natural", brow: "normal" }, despues: { lash: "natural", brow: "normal" }, desc: "Un día con Alejandro. Tijera, navaja y diseño de barba.", promesa: "Ocho años de silla, condensados en una jornada.", dura: "certificado", top: false },
  { id: 30, n: "Manicure spa", cat: "Uñas", d: 45, p: 55000, foto: null, look: "unas", antes: { lash: "natural", brow: "normal" }, despues: { lash: "natural", brow: "normal" }, desc: "Retiro de cutícula en seco, exfoliación, masaje y esmalte tradicional.", promesa: "La mano se ve cuidada, no arreglada. Que es distinto.", dura: "1 a 2 semanas", top: false },
  { id: 31, n: "Pedicure spa", cat: "Uñas", d: 60, p: 75000, foto: null, look: "unas", hombres: true, antes: { lash: "natural", brow: "normal" }, despues: { lash: "natural", brow: "normal" }, desc: "Remojo con sales, trabajo de callosidad, limado y masaje de pantorrilla.", promesa: "Sales caminando distinto. No es exageración.", dura: "3 a 4 semanas", top: false },
  { id: 32, n: "Esmaltado semipermanente", cat: "Uñas", d: 60, p: 85000, foto: null, look: "unas", antes: { lash: "natural", brow: "normal" }, despues: { lash: "natural", brow: "normal" }, desc: "Preparación sin lima agresiva, base, color y top de cierre en cabina LED.", promesa: "Tres semanas sin una sola descascarada.", dura: "3 semanas", top: true },
  { id: 33, n: "Uñas acrílicas o en gel", cat: "Uñas", d: 150, p: 180000, foto: null, look: "unas", antes: { lash: "natural", brow: "normal" }, despues: { lash: "natural", brow: "normal" }, desc: "Esculpido sobre molde, con largo y forma escogidos contigo.", promesa: "La forma se diseña para tu mano, no se copia de un catálogo.", dura: "4 semanas", top: false },
  { id: 34, n: "Retoque de acrílicas", cat: "Uñas", d: 90, p: 120000, foto: null, look: "unas", antes: { lash: "natural", brow: "normal" }, despues: { lash: "natural", brow: "normal" }, desc: "Relleno de crecimiento, rebalance de estructura y cambio de color.", promesa: "Más barato y más sano que retirar y empezar de nuevo.", dura: "4 semanas", top: false },
  { id: 35, n: "Nail art por uña", cat: "Uñas", d: 15, p: 12000, foto: null, look: "unas", antes: { lash: "natural", brow: "normal" }, despues: { lash: "natural", brow: "normal" }, desc: "Diseño a mano alzada, pedrería o cromado, cobrado por uña.", promesa: "Dos uñas con arte y ocho lisas se ve mejor que diez cargadas.", dura: "lo que dure el esmaltado", top: false },
  { id: 36, n: "Manicure de caballero", cat: "Uñas", d: 40, p: 55000, foto: null, look: "unas", hombres: true, antes: { lash: "natural", brow: "normal" }, despues: { lash: "natural", brow: "normal" }, desc: "Corte, limado recto, cutícula y brillo mate sin color.", promesa: "Nadie nota que te arreglaste las manos. Notan que das buena mano.", dura: "3 semanas", top: false },
];
const CATS = ["Todo", "Hombres", "Pestañas", "Cejas", "Semipermanente", "Uñas", "Maquillaje", "Peluquería", "Spa", "Barbería", "Capacitaciones", "Cuerpo"];
const CATS_MIRADA = ["Pestañas", "Cejas", "Semipermanente", "Cuerpo"];
const CATS_ATELIER = ["Uñas", "Maquillaje", "Peluquería", "Spa", "Barbería"];

const SEDES = [{ id: "sp", nombre: "San Patricio", dir: "Calle 109, Bogotá", camillas: 3, apertura: "2023" }];

const ESTILISTAS_BASE = [
  {
    id: "ind", n: "Indiana Sánchez Méndez", rol: "Arquitecta de miradas", sede: "sp", com: 100, foto: null,
    agendaPublica: true, esAdmin: true, tono: "#C4B8A8", anios: 9, atendidas: 1840, rating: 5.0, ventaMes: 12400000,
    cel: "3204414995", especialidad: "Sombreado, volumen ruso y diseño de cejas",
    retrato: { id: "e1", piel: "media", pelo: "chocolate", masa: "suelto", flequillo: "lado", fondo: "#E6DED1" },
    bio: "Fundadora del atelier. Diseña la mirada desde la proporción del rostro, no desde la moda. Venezolana radicada en Bogotá.",
    cert: ["Maquillaje semipermanente avanzado", "Volumen ruso certificado", "Brow mapping con proporción áurea", "Bioseguridad INVIMA vigente"],
    dominio: [1, 2, 3, 8, 26, 27, 28],
    resenas: [
      { n: "Mariana R.", e: 5, t: "Llevaba años odiando mis cejas. Salí llorando de la emoción.", f: "hace 4 días" },
      { n: "Paula G.", e: 5, t: "El sombreado se ve tan natural que mi mamá no lo notó.", f: "hace 2 semanas" },
      { n: "Sofía B.", e: 5, t: "Puntual, impecable y explica cada paso.", f: "hace 3 semanas" },
    ],
  },
  {
    id: "dan", n: "Daniela Ferrer Alzate", rol: "Lash artist senior", sede: "sp", com: 40, foto: null,
    agendaPublica: true, esAdmin: false, tono: "#D6CBB8", anios: 5, atendidas: 720, rating: 4.9, ventaMes: 7850000,
    cel: "3142228844", especialidad: "Volumen ruso, híbridas y lifting",
    retrato: { id: "e2", piel: "clara", pelo: "miel", masa: "ondas", flequillo: "ninguno", fondo: "#EAE3D6" },
    bio: "Especialista en volumen. Trabaja con abanicos hechos a mano y cuida mucho el aislamiento de la pestaña natural.",
    cert: ["Volumen ruso y mega volumen", "Lash lifting con keratina", "Bioseguridad vigente"],
    dominio: [4, 5, 6, 7, 8, 9],
    resenas: [
      { n: "Andrea M.", e: 5, t: "Tres semanas y no se me ha caído ni una.", f: "hace 1 semana" },
      { n: "Natalia R.", e: 5, t: "Es delicadísima, me quedé dormida.", f: "hace 2 semanas" },
      { n: "Juliana C.", e: 4, t: "Quedaron hermosas, aunque se demoró un poco más de lo previsto.", f: "hace 1 mes" },
    ],
  },
  {
    id: "mar", n: "Mariana Ospina Ruiz", rol: "Brow artist", sede: "sp", com: 35, foto: null,
    agendaPublica: true, esAdmin: false, tono: "#C9B49A", anios: 3, atendidas: 410, rating: 4.8, ventaMes: 5240000,
    cel: "3163337766", especialidad: "Lamination y epilación en hilo",
    retrato: { id: "e3", piel: "canela", pelo: "negro", masa: "recogido", flequillo: "abierto", fondo: "#E7DFD2" },
    bio: "Viene de la escuela de depilación en hilo. Rápida, precisa y con muy buena mano para pieles sensibles.",
    cert: ["Epilación en hilo avanzada", "Brow lamination", "Bioseguridad vigente"],
    dominio: [1, 2, 10],
    resenas: [
      { n: "Valentina S.", e: 5, t: "El hilo con ella no duele. No sé cómo lo hace.", f: "hace 5 días" },
      { n: "Camila T.", e: 5, t: "Mi lamination duró siete semanas completas.", f: "hace 3 semanas" },
    ],
  },
  {
    id: "isa", n: "Isabela Quintero Navas", rol: "Especialista en semipermanente", sede: "sp", com: 42, foto: null,
    agendaPublica: true, esAdmin: false, tono: "#BFAE96", anios: 7, atendidas: 980, rating: 4.9, ventaMes: 6980000,
    cel: "3125554411", especialidad: "Sombreado, nanoblading y corrección de color",
    retrato: { id: "e4", piel: "morena", pelo: "negro", masa: "bob", flequillo: "recto", fondo: "#E8E0D3" },
    bio: "Hace ocho años solo trabaja piel. Es la que corrige los sombreados mal hechos que llegan de otros sitios.",
    cert: ["Micropigmentación certificada", "Corrección y remoción de pigmento", "Manejo de piel grasa y mixta", "Bioseguridad vigente"],
    dominio: [1, 3],
    resenas: [
      { n: "Ximena A.", e: 5, t: "Me arregló un sombreado gris de otro sitio. Es una maga.", f: "hace 1 semana" },
      { n: "Lorena P.", e: 5, t: "Explica la cicatrización día por día. Cero sorpresas.", f: "hace 2 semanas" },
      { n: "Diana M.", e: 4, t: "Excelente trabajo, la cita es larga pero lo vale.", f: "hace 1 mes" },
    ],
  },
  {
    id: "sar", n: "Sara Moreno Cifuentes", rol: "Lash y brow junior", sede: "sp", com: 28, foto: null,
    agendaPublica: true, esAdmin: false, tono: "#D9CEBC", anios: 2, atendidas: 180, rating: 4.7, ventaMes: 2960000,
    cel: "3197778822", especialidad: "Clásicas, lifting y diseño de cejas",
    retrato: { id: "e5", piel: "clara", pelo: "rubio", masa: "coleta", flequillo: "lado", fondo: "#EDE6D9" },
    bio: "Formada en el atelier. Atiende las franjas de la mañana con tarifa de aprendiz supervisada por Indiana.",
    cert: ["Extensiones clásicas", "Lash lifting", "Bioseguridad vigente"],
    dominio: [1, 4, 5, 9, 10, 21, 22, 23, 24, 25],
    resenas: [
      { n: "Laura V.", e: 5, t: "Muy juiciosa y con una paciencia enorme.", f: "hace 6 días" },
      { n: "Tatiana G.", e: 4, t: "Buen resultado por el precio. Se nota que está aprendiendo, pero lo hace bien.", f: "hace 3 semanas" },
    ],
  },
  {
    id: "nat", n: "Natalia Bermúdez Rojas", rol: "Manicurista y nail artist", sede: "sp", com: 34, foto: null,
    agendaPublica: true, esAdmin: false, tono: "#D2C3AB", anios: 4, atendidas: 830, rating: 4.9, ventaMes: 4310000,
    cel: "3133332211", especialidad: "Semipermanente, esculpidas y nail art",
    retrato: { id: "e8", piel: "media", pelo: "cobre", masa: "bob", flequillo: "lado", fondo: "#ECE4D7" },
    bio: "Trabaja la cutícula en seco y sin lastimar. Su fuerte es la forma: mira la mano antes de escoger el largo.",
    cert: ["Uñas esculpidas en acrílico y gel", "Semipermanente sin daño", "Nail art a mano alzada", "Bioseguridad vigente"],
    dominio: [30, 31, 32, 33, 34, 35, 36],
    resenas: [
      { n: "Paola R.", e: 5, t: "Tres semanas y ni una levantada. Y no me dejó la uña adelgazada.", f: "hace 1 semana" },
      { n: "Sofía L.", e: 5, t: "Me dijo que el largo que yo quería no me servía, y tenía razón.", f: "hace 3 semanas" },
    ],
  },
  {
    id: "vic", n: "Victoria Lemus Garzón", rol: "Maquilladora y estilista", sede: "sp", com: 38, foto: null,
    agendaPublica: true, esAdmin: false, tono: "#CDBDA6", anios: 6, atendidas: 640, rating: 4.9, ventaMes: 6120000,
    cel: "3114447733", especialidad: "Novias, color y peinado de evento",
    retrato: { id: "e6", piel: "clara", pelo: "cobre", masa: "ondas", flequillo: "lado", fondo: "#EDE5D8" },
    bio: "Viene del maquillaje editorial. Entiende la luz de cámara y el color del cabello como una sola cosa.",
    cert: ["Maquillaje profesional para cámara", "Colorimetría y balayage", "Peinado de novias", "Bioseguridad vigente"],
    dominio: [11, 12, 13, 14, 15, 16, 17, 24],
    resenas: [
      { n: "Daniela O.", e: 5, t: "Me maquilló para mi matrimonio y a las 3 a. m. seguía intacto.", f: "hace 2 semanas" },
      { n: "Carolina F.", e: 5, t: "El balayage me creció sin raíz marcada. Cuatro meses y sigue lindo.", f: "hace 1 mes" },
    ],
  },
  {
    id: "ale", n: "Alejandro Peña Mora", rol: "Barbero", sede: "sp", com: 36, foto: null,
    agendaPublica: true, esAdmin: false, tono: "#B9A88F", anios: 8, atendidas: 1120, rating: 4.9, ventaMes: 4880000,
    cel: "3186669911", especialidad: "Corte clásico, barba a navaja y afeitado",
    retrato: { id: "e7", piel: "canela", pelo: "negro", masa: "recogido", flequillo: "ninguno", fondo: "#E7E0D2" },
    bio: "Ocho años de silla. Trabaja a tijera y navaja, sin prisa, con toalla caliente de verdad.",
    cert: ["Barbería clásica certificada", "Afeitado a navaja", "Diseño de barba", "Bioseguridad vigente"],
    dominio: [18, 19, 20, 21, 29],
    resenas: [
      { n: "Julián M.", e: 5, t: "El mejor afeitado que me han hecho en Bogotá. Sin exagerar.", f: "hace 1 semana" },
      { n: "Sam B.", e: 5, t: "Es puntual y no habla si uno no quiere hablar. Eso vale oro.", f: "hace 3 semanas" },
    ],
  },
];

const PRODUCTOS_BASE = [
  { id: 1, n: "Sérum de crecimiento", p: 140000, stock: 18, cat: "Pestañas", frasco: "gotero", formato: "5 ml · 60 días", foto: null,
    desc: "Péptidos y biotina en base acuosa. Se aplica en la línea de la raíz.",
    promesa: "En seis semanas tus pestañas aguantan solas lo que hoy aguantan con extensiones.",
    uso: "Una pasada por párpado, de noche, sobre piel limpia y seca." },
  { id: 2, n: "Espuma limpiadora de pestañas", p: 48000, stock: 32, cat: "Pestañas", frasco: "bomba", formato: "50 ml · 90 días", foto: null,
    desc: "pH neutro, sin aceites. Obligatoria si usas extensiones.",
    promesa: "Es la diferencia entre unas extensiones que duran tres semanas y unas que duran una.",
    uso: "Dos bombeos sobre el cepillo, masajea la línea y enjuaga con agua tibia." },
  { id: 3, n: "Gel fijador de cejas", p: 52000, stock: 9, cat: "Cejas", frasco: "tubo", formato: "9 ml · con cepillo", foto: null,
    desc: "Transparente, sin residuo blanco. Sostiene el lamination hasta 16 horas.",
    promesa: "Peinas hacia arriba una vez en la mañana y no vuelves a pensar en tus cejas.",
    uso: "Sobre ceja seca, cepilla en diagonal hacia la sien." },
  { id: 4, n: "Aceite nocturno de ricino", p: 62000, stock: 24, cat: "Cejas", frasco: "gotero", formato: "15 ml · prensado en frío", foto: null,
    desc: "Puro, sin aditivos, con aplicador doble para ceja y pestaña.",
    promesa: "El clásico que funciona. Nutre el vello para que crezca más grueso.",
    uso: "Dos gotas por ceja antes de dormir. No mezclar con el sérum la misma noche." },
  { id: 5, n: "Bruma selladora", p: 78000, stock: 15, cat: "Pestañas", frasco: "spray", formato: "30 ml · 45 días", foto: null,
    desc: "Fija el adhesivo de las extensiones y reduce la caída por humedad.",
    promesa: "Protege tu inversión los primeros dos días, que son los que deciden.",
    uso: "Un disparo a 20 cm, con los ojos cerrados, después del baño." },
  { id: 6, n: "Cepillo dúo de precisión", p: 34000, stock: 40, cat: "Herramientas", frasco: "cepillo", formato: "espiral y peine", foto: null,
    desc: "Espiral para pestañas y peine metálico para separar ceja.",
    promesa: "La herramienta que usamos en camilla, para que repliques el peinado en casa.",
    uso: "Limpiar con espuma después de cada uso." },
  { id: 7, n: "Kit de cuidado en casa", p: 180000, stock: 12, cat: "Kits", frasco: "caja", formato: "4 piezas · estuche", foto: null,
    desc: "Sérum, espuma, cepillo dúo y estuche de lino con el monograma.",
    promesa: "Todo lo que necesitas después de tu cita, en una sola caja. Ahorras $42.000.",
    uso: "Es también el regalo que más nos piden." },
];
const CATS_TIENDA = ["Todo", "Pestañas", "Cejas", "Herramientas", "Kits"];
const ENVIO = 12000, ENVIO_GRATIS = 200000;

const POSTULACIONES_BASE = [
  {
    id: "p1", profesion: "Lash artist", n: "Laura Katherine Pineda", cel: "3145558899", ciudad: "Bogotá", anios: 6, estado: "en revision",
    cert: "Certificada en volumen ruso por Lash Academy. Diplomado en lamination y bioseguridad vigente.",
    servicios: "Volumen ruso, híbridas, lash lifting", portafolio: "@lauralashes.bog",
    retrato: { id: "q1", piel: "media", pelo: "chocolate", masa: "ondas", flequillo: "abierto", fondo: "#EAE3D6" },
  },
  {
    id: "p2", profesion: "Especialista en depilación", n: "Sara Villalba Peña", cel: "3216667788", ciudad: "Chía", anios: 2, estado: "en revision",
    cert: "Técnica en cosmetología del SENA. Curso de depilación en hilo.",
    servicios: "Diseño de cejas, depilación en hilo, depilación corporal", portafolio: "@saravillalba.beauty",
    retrato: { id: "q2", piel: "clara", pelo: "castano", masa: "recogido", flequillo: "lado", fondo: "#EDE6DA" },
  },
  {
    id: "p3", profesion: "Micropigmentadora", n: "Natalia Guerrero Solano", cel: "3103334455", ciudad: "Bogotá", anios: 8, estado: "en revision",
    cert: "Micropigmentadora certificada en Medellín. Ocho años en cabina propia. Manejo de pigmentos veganos.",
    servicios: "Sombreado de cejas, nanoblading, corrección de color", portafolio: "@nataliabrows.co",
    retrato: { id: "q3", piel: "canela", pelo: "negro", masa: "suelto", flequillo: "ninguno", fondo: "#E8E0D3" },
  },
  {
    id: "p4", profesion: "Lash artist", n: "Melissa Cárdenas Ruiz", cel: "3188889900", ciudad: "Bogotá", anios: 4, estado: "en revision",
    cert: "Lash artist certificada. Trabajó tres años en un salón de la zona G. Bioseguridad vigente.",
    servicios: "Clásicas, híbridas, volumen tecnológico, retoques", portafolio: "@meli.lashstudio",
    retrato: { id: "q4", piel: "morena", pelo: "negro", masa: "bob", flequillo: "recto", fondo: "#E7DFD2" },
  },
  {
    id: "p5", profesion: "Brow artist", n: "Angie Paola Zapata", cel: "3172221133", ciudad: "Soacha", anios: 1, estado: "en revision",
    cert: "Recién egresada de cosmetología. Busca primera experiencia formal en atelier.",
    servicios: "Diseño de cejas, henna, depilación corporal", portafolio: "@angiepaola.beauty",
    retrato: { id: "q5", piel: "oscura", pelo: "negro", masa: "coleta", flequillo: "abierto", fondo: "#EBE3D6" },
  },
];

const DIAS_N = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const FECHAS = [14, 15, 16, 17, 18, 19];
const H0 = 9, H1 = 19, PXM = 1.1;
const ABONO_PCT = 0.3, ABONO_MIN = 30000, DESC_TOTAL = 0.05;

/* ─────────────────  UTILIDADES  ───────────────── */
function rng(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h ^= h >>> 13; return (h >>> 0) / 4294967296; };
}
function genAgenda(key) {
  const r = rng(key), durs = [45, 60, 70, 120, 135, 150, 165, 30, 75], out = [];
  let t = H0 * 60 + Math.floor(r() * 3) * 15;
  while (t < H1 * 60 - 30) {
    if (r() < 0.62) {
      const d = durs[Math.floor(r() * durs.length)];
      if (t + d <= H1 * 60) { out.push({ i: t, d }); t += d + 15 + Math.floor(r() * 3) * 15; } else break;
    } else t += 30 + Math.floor(r() * 3) * 15;
  }
  return out;
}
function huecos(blocks, dur) {
  const B = 10, out = [];
  for (let t = H0 * 60; t + dur <= H1 * 60; t += 15)
    if (blocks.every((b) => t + dur + B <= b.i || t >= b.i + b.d + B)) out.push(t);
  return out;
}
/* La agenda base más lo que administración haya agregado o cancelado */
function agendaDe(estId, dia, citas = [], cancel = []) {
  const base = genAgenda(estId + "-" + dia)
    .filter((b) => !cancel.includes(`${estId}|${dia}|${b.i}`))
    .map((b) => ({ ...b, origen: "base" }));
  const extra = citas.filter((c) => c.est === estId && c.dia === dia)
    .map((c) => ({ i: c.i, d: c.d, cliente: c.cliente, srvN: c.srvN, origen: "nueva", id: c.id }));
  return [...base, ...extra].sort((a, b) => a.i - b.i);
}

const fmt = (m) => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
const cop = (n) => "$" + new Intl.NumberFormat("es-CO").format(Math.round(n));
const copK = (n) => "$" + new Intl.NumberFormat("es-CO").format(Math.round(n / 1000)) + "k";
const hm = (m) => (m >= 60 ? Math.floor(m / 60) + " h" + (m % 60 ? " " + (m % 60) + " min" : "") : m + " min");
let SEQ = 0;
const nuevoId = () => "x" + Date.now() + "-" + (++SEQ);

const codigo = () => "AOL-" + Math.random().toString(36).slice(2, 6).toUpperCase() + Math.floor(Math.random() * 90 + 10);

/* ─────────────────  PRIMITIVAS  ───────────────── */
const Card = ({ children, style, onClick }) => (
  <div onClick={onClick} className="p-4" style={{ background: "#FFF", border: `1px solid ${T.linea}`, borderRadius: 2, ...style }}>{children}</div>
);
const Titulo = ({ children, sub }) => (
  <div className="mb-3">
    <h2 style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 28, fontWeight: 400, lineHeight: 1.1, color: T.tinta, margin: 0 }}>{children}</h2>
    {sub && <p style={{ color: T.mute, fontSize: 12.5, margin: "6px 0 0", fontFamily: SANS, lineHeight: 1.55 }}>{sub}</p>}
  </div>
);
const Dato = ({ label, valor, delta, color = T.tinta }) => (
  <Card style={{ padding: 12 }}>
    <div style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.1em", fontFamily: SANS }}>{label}</div>
    <div style={{ fontFamily: SERIF, fontSize: 23, color, marginTop: 3, lineHeight: 1.05 }}>{valor}</div>
    {delta != null && (
      <div className="flex items-center gap-1" style={{ marginTop: 4, fontSize: 10.5, color: delta >= 0 ? T.ok : T.alerta, fontFamily: SANS }}>
        <ArrowUpRight size={11} style={{ transform: delta >= 0 ? "none" : "rotate(90deg)" }} />{Math.abs(delta)}%
      </div>
    )}
  </Card>
);
const Chip = ({ activo, children, onClick }) => (
  <button onClick={onClick} className="px-3 py-2" style={{
    background: activo ? T.tinta : "transparent", color: activo ? T.papel : T.mute,
    border: `1px solid ${activo ? T.tinta : T.linea}`, borderRadius: 2,
    fontSize: 11.5, letterSpacing: "0.06em", whiteSpace: "nowrap", cursor: "pointer", fontFamily: SANS,
  }}>{children}</button>
);
const Boton = ({ children, onClick, disabled, tono = "tinta" }) => (
  <button onClick={onClick} disabled={disabled} className="w-full py-3 px-4" style={{
    background: disabled ? T.crema : tono === "verde" ? T.verde : tono === "bronce" ? T.bronce : T.tinta,
    color: disabled ? T.mute : "#FFF", border: "none", borderRadius: 2,
    fontSize: 12.5, letterSpacing: "0.1em", cursor: disabled ? "not-allowed" : "pointer", fontFamily: SANS,
  }}>{children}</button>
);
const Input = ({ label, area, ...p }) => (
  <label className="block" style={{ marginBottom: 10 }}>
    <span style={{ color: T.mute, fontSize: 10, letterSpacing: "0.1em", fontFamily: SANS }}>{label}</span>
    {area
      ? <textarea {...p} rows={3} className="w-full mt-1 px-3 py-2" style={{ background: T.papel, border: `1px solid ${T.linea}`, borderRadius: 2, color: T.tinta, fontSize: 13, outline: "none", fontFamily: SANS, resize: "vertical" }} />
      : <input {...p} className="w-full mt-1 px-3 py-2" style={{ background: T.papel, border: `1px solid ${T.linea}`, borderRadius: 2, color: T.tinta, fontSize: 13, outline: "none", fontFamily: SANS }} />}
  </label>
);
const Estrellas = ({ v, s = 12 }) => (
  <span className="flex items-center" style={{ gap: 1 }}>
    {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={s} fill={i <= Math.round(v) ? T.bronce : "none"} color={T.bronce} strokeWidth={1.4} />)}
  </span>
);
const tip = { background: "#FFF", border: `1px solid ${T.linea}`, borderRadius: 2, fontSize: 12, color: T.tinta, fontFamily: SANS };

/* ═════════  INGRESO Y SALUDO  ═════════ */
function Ingreso({ clientas, onEntrar, onRegistrar, onEquipo }) {
  const [cel, setCel] = useState("");
  const [nombre, setNombre] = useState("");
  const [cc, setCc] = useState("");
  const [error, setError] = useState("");
  const [tocado, setTocado] = useState(false);

  const limpio = cel.replace(/\D/g, "");
  const equipo = limpio.length === 10 ? EQUIPO_ACCESO[limpio] : null;
  const registrada = limpio.length === 10 && !equipo ? clientas[limpio] : null;
  const nombreFinal = registrada ? registrada.nombre : nombre.trim();
  const listo = equipo ? cc.replace(/\D/g, "").length >= 6 : limpio.length === 10 && !!nombreFinal;

  const cambiarCel = (v) => {
    setCel(v); setError("");
    const l = v.replace(/\D/g, "");
    if (l.length === 10 && clientas[l] && !EQUIPO_ACCESO[l]) { setNombre(clientas[l].nombre); setTocado(true); }
    else if (tocado) { setNombre(""); setTocado(false); }
  };

  const entrar = () => {
    if (!listo) return;
    if (equipo) {
      if (cc.replace(/\D/g, "") !== equipo.cc) { setError("La cédula no corresponde a este celular."); return; }
      onEquipo(limpio, equipo);
      return;
    }
    if (registrada) onEntrar(limpio, registrada.nombre);
    else onRegistrar(limpio, nombreFinal);
  };

  return (
    <div style={{ background: T.papel, minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 360, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center" }}><Monograma s={74} /></div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 32, color: T.tinta, marginTop: 12, lineHeight: 1.05 }}>{APP_NOMBRE}</div>
        <div style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.3em", color: T.bronceOsc, marginTop: 8 }}>{APP_SUB}</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: T.mute, marginTop: 10 }}>{APP_LEMA}</div>
        <div style={{ fontSize: 10.5, color: T.mute, marginTop: 10, fontFamily: SANS }}>Salud, Belleza y Gracia</div>
        <a href={waLink("Quiero información.")} target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-1"
          style={{ color: T.bronceOsc, fontSize: 11, marginTop: 8, fontFamily: SANS, textDecoration: "none" }}>
          <MessageCircle size={12} /> {CEL_VISIBLE}
        </a>

        <div style={{ marginTop: 26, textAlign: "left", background: "#FFF", border: `1px solid ${equipo ? T.bronce : T.linea}`, padding: 16 }}>
          <div style={{ color: equipo ? T.bronceOsc : T.mute, fontSize: 9.5, letterSpacing: "0.14em", fontFamily: SANS, marginBottom: 12 }}>
            {equipo ? "ACCESO DEL EQUIPO" : "TUS DATOS"}
          </div>

          <Input label="CELULAR" type="tel" inputMode="numeric" maxLength={12} value={cel}
            onChange={(e) => cambiarCel(e.target.value)} placeholder="300 000 0000"
            onKeyDown={(e) => e.key === "Enter" && entrar()} />

          {equipo ? (
            <>
              <div className="flex items-center gap-2" style={{ marginBottom: 12, fontFamily: SANS }}>
                <Shield size={13} color={T.bronceOsc} />
                <span style={{ color: T.tinta, fontSize: 12 }}>{equipo.completo}</span>
              </div>
              <Input label="CÉDULA" type="tel" inputMode="numeric" maxLength={12} value={cc}
                onChange={(e) => { setCc(e.target.value); setError(""); }} placeholder="Número de documento"
                onKeyDown={(e) => e.key === "Enter" && entrar()} />
              {error && <div style={{ color: T.alerta, fontSize: 11.5, marginBottom: 10, fontFamily: SANS }}>{error}</div>}
            </>
          ) : (
            <>
              <Input label="NOMBRE" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Camila"
                readOnly={!!registrada} onKeyDown={(e) => e.key === "Enter" && entrar()} />
              {registrada && (
                <div className="flex items-center gap-2" style={{ color: T.ok, fontSize: 11.5, fontFamily: SANS, marginBottom: 12 }}>
                  <Check size={13} /> Te reconocimos. {registrada.visitas} visita{registrada.visitas === 1 ? "" : "s"} con nosotras.
                </div>
              )}
            </>
          )}

          <Boton disabled={!listo} onClick={entrar} tono={equipo ? "bronce" : "tinta"}>
            {equipo ? "Verificar y entrar" : registrada ? "Entrar" : "Crear mi perfil y entrar"}
          </Boton>
        </div>

        <div style={{ color: T.greige, fontSize: 10.5, marginTop: 12, fontFamily: SANS, lineHeight: 1.6 }}>
          Clienta: 3103020415 · Equipo: 3204414995 con su cédula
        </div>
      </div>
    </div>
  );
}

const Saludo = ({ nombre, nueva, equipo, titulo }) => (
  <div style={{ background: T.papel, minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
    <div style={{ animation: "aparecer 600ms ease" }}>
      <div style={{ display: "flex", justifyContent: "center" }}><Monograma s={66} /></div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 40, color: T.tinta, marginTop: 16, lineHeight: 1.05 }}>
        {nueva ? "Bienvenida," : "Hola,"} {nombre}
      </div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 21, color: T.bronceOsc, marginTop: 14, lineHeight: 1.35 }}>
        {equipo ? "Identidad verificada." : nueva ? "Qué alegría tenerte aquí." : "Te amamos y te estábamos esperando."}
      </div>
      <div style={{ color: T.mute, fontSize: 11, letterSpacing: "0.22em", marginTop: 18, fontFamily: SANS }}>
        {equipo ? (titulo || "").toUpperCase() : nueva ? "TU MIRADA EMPIEZA HOY" : "ARCHITECT OF LOOKS"}
      </div>
    </div>
    <style>{`@keyframes aparecer { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }`}</style>
  </div>
);

/* ═════════  AGENDA PÚBLICA  ═════════ */
const BUFFER = 10;

/* Huecos reales del día, ya descontado el tiempo de aseo entre citas */
function ventanas(bloques) {
  const orden = [...bloques].sort((x, y) => x.i - y.i);
  const out = [];
  let t = H0 * 60;
  for (const b of orden) {
    if (b.i > t) out.push({ i: t, f: b.i });
    t = Math.max(t, b.i + b.d);
  }
  if (t < H1 * 60) out.push({ i: t, f: H1 * 60 });
  return out.map((v) => ({
    i: v.i, f: v.f,
    util: Math.max(0, (v.f < H1 * 60 ? v.f - BUFFER : v.f) - (v.i > H0 * 60 ? v.i + BUFFER : v.i)),
    inicio: v.i > H0 * 60 ? Math.ceil((v.i + BUFFER) / 15) * 15 : v.i,
  }));
}

function AgendaPublica({ bloques, dur, elegido, onElegir, editable = true, alternativas }) {
  const alto = (H1 - H0) * 60 * PXM;
  const [aviso, setAviso] = useState(null);
  const libres = useMemo(() => (dur ? huecos(bloques, dur) : []), [bloques, dur]);
  const vents = useMemo(() => ventanas(bloques), [bloques]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 4200);
    return () => clearTimeout(t);
  }, [aviso]);

  const tocar = (v) => {
    if (!editable || !dur) return;
    if (v.util >= dur && v.inicio + dur <= H1 * 60) { setAviso(null); onElegir(v.inicio); }
    else setAviso(`Ese hueco son ${hm(v.util)} y tu cita necesita ${hm(dur)}. Mira las otras opciones de abajo.`);
  };

  return (
    <div>
      <div className="flex" style={{ gap: 8 }}>
        <div style={{ width: 34, flexShrink: 0 }}>
          {Array.from({ length: H1 - H0 + 1 }).map((_, i) => (
            <div key={i} style={{ height: 60 * PXM, fontSize: 10, color: T.mute, fontFamily: SANS, transform: "translateY(-5px)" }}>{H0 + i}:00</div>
          ))}
        </div>
        <div className="flex-1" style={{ position: "relative", height: alto, background: T.papel, border: `1px solid ${T.linea}` }}>
          {Array.from({ length: H1 - H0 }).map((_, i) => (
            <div key={i} style={{ position: "absolute", top: (i + 1) * 60 * PXM, left: 0, right: 0, borderTop: `1px solid ${T.linea}` }} />
          ))}

          {/* Huecos libres, tocables */}
          {editable && dur != null && vents.map((v, i) => {
            const cabe = v.util >= dur && v.inicio + dur <= H1 * 60;
            const h = (v.f - v.i) * PXM - 2;
            return (
              <div key={"v" + i} onClick={() => tocar(v)} style={{
                position: "absolute", top: (v.i - H0 * 60) * PXM, height: h, left: 4, right: 4,
                background: cabe ? `${T.bronce}12` : "transparent",
                border: `1px dashed ${cabe ? T.bronce : T.linea}`,
                cursor: "pointer", padding: "3px 8px", overflow: "hidden",
              }}>
                {h > 26 && (
                  <>
                    <div style={{ fontSize: 9.5, letterSpacing: "0.14em", color: cabe ? T.bronceOsc : T.greige, fontFamily: SANS }}>
                      {cabe ? "LIBRE · TOCA PARA RESERVAR" : "NO ALCANZA"}
                    </div>
                    <div style={{ fontSize: 9.5, color: T.greige, fontFamily: SANS }}>{fmt(v.i)} – {fmt(v.f)} · {hm(v.util)}</div>
                  </>
                )}
              </div>
            );
          })}

          {bloques.map((b, i) => (
            <div key={i} style={{
              position: "absolute", top: (b.i - H0 * 60) * PXM, height: b.d * PXM - 2, left: 4, right: 4,
              background: T.crema, borderLeft: `2px solid ${T.greige}`, padding: "4px 8px", overflow: "hidden",
            }}>
              <div style={{ fontSize: 10, color: T.mute, fontFamily: SANS, letterSpacing: "0.06em" }}>Reservado</div>
              <div style={{ fontSize: 10, color: T.greige, fontFamily: SANS }}>{fmt(b.i)} – {fmt(b.i + b.d)}</div>
            </div>
          ))}

          {elegido != null && dur && (
            <div style={{
              position: "absolute", top: (elegido - H0 * 60) * PXM, height: dur * PXM - 2, left: 4, right: 4,
              background: `${T.bronce}30`, border: `1.5px solid ${T.bronce}`, padding: "4px 8px", zIndex: 2,
            }}>
              <div style={{ fontSize: 10, color: T.bronceOsc, fontFamily: SANS, letterSpacing: "0.06em" }}>Tu cita</div>
              <div style={{ fontSize: 10, color: T.bronceOsc, fontFamily: SANS }}>{fmt(elegido)} – {fmt(elegido + dur)}</div>
            </div>
          )}
        </div>
      </div>

      {aviso && (
        <div style={{ marginTop: 12, background: T.crema, borderLeft: `2px solid ${T.alerta}`, padding: "10px 12px", fontFamily: SANS, fontSize: 11.5, color: T.tinta, lineHeight: 1.5 }}>
          {aviso}
        </div>
      )}

      {editable && dur != null && (
        <div style={{ marginTop: 14 }}>
          {libres.length > 0 ? (
            <>
              <div style={{ color: T.mute, fontSize: 11, marginBottom: 8, fontFamily: SANS }}>
                {libres.length} horarios donde caben {hm(dur)}
              </div>
              <div className="flex" style={{ flexWrap: "wrap", gap: 6 }}>
                {libres.map((t) => (
                  <button key={t} onClick={() => { setAviso(null); onElegir(t); }} className="px-3 py-2" style={{
                    background: elegido === t ? T.bronce : "#FFF", color: elegido === t ? "#FFF" : T.tinta,
                    border: `1px solid ${elegido === t ? T.bronce : T.linea}`, borderRadius: 2, fontSize: 12, fontFamily: SANS, cursor: "pointer",
                  }}>{fmt(t)}</button>
                ))}
              </div>
            </>
          ) : (
            <div style={{ background: T.crema, padding: "16px 14px" }}>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 19, color: T.tinta, lineHeight: 1.15 }}>
                No tiene espacio ese día
              </div>
              <div style={{ color: T.mute, fontSize: 11.5, marginTop: 6, fontFamily: SANS, lineHeight: 1.55 }}>
                Tu ritual necesita {hm(dur)} seguidos y ese día no quedan. Estas son tus otras opciones.
              </div>
              {alternativas}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════  USUARIA  ═══════════ */
/* ═══════════  MÓDULO 1 · USUARIA — EL PORTAL  ═══════════ */
const PRIMARIAS = [["portal", "Inicio"], ["carta", "Carta"], ["tienda", "Tienda"], ["probador", "Pruébate"], ["agendar", "Reservar"]];
const SECUNDARIAS = { club: "Le Cercle", mirada: "Mi mirada", postular: "Trabaja con nosotras" };

function Usuaria({ servicios, productos, estilistas, sesion, ritual, setRitual, addReserva, citas, cancel, postulaciones = [], addPostulacion }) {
  const [tab, setTab] = useState("portal");
  const [cat, setCat] = useState("Todo");
  const [bolsa, setBolsa] = useState({});
  const sumarBolsa = (id, d = 1) => setBolsa((c) => {
    const q = (c[id] || 0) + d;
    const n = { ...c };
    if (q <= 0) delete n[id]; else n[id] = q;
    return n;
  });
  const ir = (t, c) => { if (c) setCat(c); setTab(t); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div>
      {SECUNDARIAS[tab] ? (
        <div className="flex items-center gap-2" style={{ paddingBottom: 12, marginBottom: 18, borderBottom: `1px solid ${T.linea}` }}>
          <button onClick={() => ir("portal")} style={{ background: "none", border: "none", color: T.mute, padding: 0, display: "flex", cursor: "pointer" }}>
            <ChevronLeft size={17} />
          </button>
          <span style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.22em", color: T.mute }}>{SECUNDARIAS[tab].toUpperCase()}</span>
        </div>
      ) : (
        <div className="flex" style={{ gap: 22, paddingBottom: 12, marginBottom: 20, borderBottom: `1px solid ${T.linea}` }}>
          {PRIMARIAS.map(([k, l]) => (
            <button key={k} onClick={() => ir(k)} style={{
              background: "none", border: "none", padding: "0 0 9px", cursor: "pointer",
              color: tab === k ? T.tinta : T.mute, fontSize: 10, letterSpacing: "0.2em", fontFamily: SANS,
              borderBottom: `1px solid ${tab === k ? T.bronce : "transparent"}`, marginBottom: -13,
            }}>{l.toUpperCase()}</button>
          ))}
        </div>
      )}

      {tab === "portal" && <Portal servicios={servicios} estilistas={estilistas} productos={productos} ritual={ritual} setRitual={setRitual} sesion={sesion} ir={ir} bolsa={bolsa} sumarBolsa={sumarBolsa} />}
      {tab === "carta" && <Carta servicios={servicios} ritual={ritual} setRitual={setRitual} cat={cat} setCat={setCat} estilistas={estilistas} irAgendar={() => ir("agendar")} />}
      {tab === "probador" && <Probador servicios={servicios} ritual={ritual} setRitual={setRitual} nombre={sesion.nombre} irAgendar={() => ir("agendar")} />}
      {tab === "agendar" && <Embudo servicios={servicios} productos={productos} estilistas={estilistas} ritual={ritual} setRitual={setRitual} sesion={sesion} addReserva={addReserva} citas={citas} cancel={cancel} irServicios={() => ir("carta")} />}
      {tab === "tienda" && <Tienda productos={productos} servicios={servicios} ritual={ritual} bolsa={bolsa} setBolsa={setBolsa} sumarBolsa={sumarBolsa} />}
      {tab === "club" && <Club />}
      {tab === "mirada" && <MiMirada nombre={sesion.nombre} />}
      {tab === "postular" && <Profesional addPostulacion={addPostulacion} postulaciones={postulaciones} estilistas={estilistas} />}

      {ritual.length > 0 && tab !== "agendar" && tab !== "tienda" && (
        <BarraRitual servicios={servicios} ritual={ritual} irAgendar={() => ir("agendar")} />
      )}
    </div>
  );
}

function BarraRitual({ servicios, ritual, irAgendar }) {
  const sel = servicios.filter((s) => ritual.includes(s.id));
  const min = sel.reduce((a, s) => a + s.d, 0) + Math.max(0, sel.length - 1) * 5;
  const val = sel.reduce((a, s) => a + s.p, 0);
  return (
    <div style={{
      position: "fixed", bottom: 74, left: "50%", transform: "translateX(-50%)",
      width: "calc(100% - 32px)", maxWidth: 448, background: T.tinta, color: T.papel,
      padding: "13px 16px", zIndex: 40, boxShadow: "0 8px 26px rgba(0,0,0,0.2)",
    }}>
      <div className="flex items-center justify-between gap-3">
        <div style={{ fontFamily: SANS, minWidth: 0 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.18em", color: T.greige }}>
            {sel.length} SERVICIO{sel.length > 1 ? "S" : ""} · {hm(min).toUpperCase()}
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 22, marginTop: 2 }}>{cop(val)}</div>
        </div>
        <button onClick={irAgendar} style={{
          background: "transparent", color: "#FFF", border: `1px solid ${T.greige}`, padding: "9px 16px",
          fontSize: 10, letterSpacing: "0.18em", fontFamily: SANS, cursor: "pointer", flexShrink: 0,
        }}>RESERVAR</button>
      </div>
    </div>
  );
}

/* Etiqueta fina de sección */
const Rotulo = ({ children, accion, onAccion }) => (
  <div className="flex items-baseline justify-between" style={{ marginBottom: 14 }}>
    <span style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.26em", color: T.bronceOsc }}>{children}</span>
    {accion && (
      <button onClick={onAccion} style={{
        background: "none", border: "none", padding: 0, cursor: "pointer", color: T.mute,
        fontSize: 9.5, letterSpacing: "0.16em", fontFamily: SANS, borderBottom: `1px solid ${T.linea}`,
      }}>{accion.toUpperCase()}</button>
    )}
  </div>
);

/* ═════════  PORTADA EDITORIAL  ═════════ */
function Portal({ servicios, estilistas, productos, ritual, setRitual, sesion, ir, bolsa = {}, sumarBolsa }) {
  const destacado = servicios.find((s) => s.id === 8) || servicios[0];
  const colecciones = [
    { cat: "Pestañas", t: "Pestañas", s: servicios.find((x) => x.id === 8), d: "Lifting, clásicas, híbridas y volumen" },
    { cat: "Cejas", t: "Cejas", s: servicios.find((x) => x.id === 2), d: "Diseño, epilación y lamination" },
    { cat: "Semipermanente", t: "Semipermanente", s: servicios.find((x) => x.id === 3), d: "Sombreado que dura años" },
  ];

  return (
    <div className="flex flex-col" style={{ gap: 52, paddingBottom: ritual.length ? 90 : 20 }}>
      {/* Portada */}
      <div>
        <div style={{ position: "relative" }}>
          <RostroCompleto lash="ruso" brow="lamin" alto={420} sinMarco />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(59,53,46,0) 42%, rgba(59,53,46,0.78) 100%)" }} />
          <div style={{ position: "absolute", left: 20, right: 20, bottom: 22, color: "#FFF" }}>
            <div style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.3em", opacity: 0.85 }}>BOGOTÁ · SAN PATRICIO</div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 40, lineHeight: 1.02, marginTop: 10 }}>
              Tu mirada,<br />diseñada
            </div>
          </div>
        </div>
        <div style={{ background: T.tinta, color: T.papel, padding: "16px 20px" }}>
          <p style={{ fontFamily: SANS, fontSize: 12.5, lineHeight: 1.7, color: T.greige, margin: 0, maxWidth: "44ch" }}>
            {sesion.nombre}, aquí no se copia una tendencia. Se mide tu rostro y se construye la mirada que ya era tuya.
          </p>
          <button onClick={() => ir("carta")} style={{
            marginTop: 16, background: "transparent", color: "#FFF", border: `1px solid ${T.greige}`,
            padding: "11px 22px", fontSize: 10, letterSpacing: "0.22em", fontFamily: SANS, cursor: "pointer",
          }}>VER LA CARTA</button>
        </div>
      </div>

      {/* Credenciales */}
      <div className="flex" style={{ borderTop: `1px solid ${T.linea}`, borderBottom: `1px solid ${T.linea}` }}>
        {[["9", "AÑOS"], ["1.840", "MIRADAS"], ["5,0", "CALIFICACIÓN"]].map(([v, l], i) => (
          <div key={l} style={{ flex: 1, textAlign: "center", padding: "18px 4px", borderLeft: i ? `1px solid ${T.linea}` : "none" }}>
            <div style={{ fontFamily: SERIF, fontSize: 26, color: T.tinta, lineHeight: 1 }}>{v}</div>
            <div style={{ fontFamily: SANS, fontSize: 8.5, letterSpacing: "0.2em", color: T.mute, marginTop: 6 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Colecciones */}
      <div>
        <Rotulo accion="Ver todo" onAccion={() => ir("carta", "Todo")}>LAS COLECCIONES</Rotulo>
        <div className="flex gap-3" style={{ overflowX: "auto", paddingBottom: 4 }}>
          {colecciones.map((c) => (
            <div key={c.cat} onClick={() => ir("carta", c.cat)} style={{ flexShrink: 0, width: 208, cursor: "pointer" }}>
              <RostroCompleto lash={c.s.despues.lash} brow={c.s.despues.brow} look={c.s.look} src={c.s.foto} alto={268} sinMarco />
              <div style={{ paddingTop: 12 }}>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 21, color: T.tinta, lineHeight: 1.1 }}>{c.t}</div>
                <div style={{ fontFamily: SANS, fontSize: 11, color: T.mute, marginTop: 5, lineHeight: 1.45 }}>{c.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diagnóstico */}
      <Diagnostico servicios={servicios} ritual={ritual} setRitual={setRitual} irAgendar={() => ir("agendar")} />

      {/* El detalle */}
      <div>
        <Rotulo>EL DETALLE</Rotulo>
        <div style={{ border: `1px solid ${T.linea}` }}>
          <Progresion tipo="pestanas" alto={240} />
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 24, color: T.tinta, lineHeight: 1.1 }}>De tu pestaña al abanico de cuatro</div>
          <p style={{ fontFamily: SANS, fontSize: 12.5, color: T.mute, marginTop: 8, lineHeight: 1.65, maxWidth: "42ch" }}>
            Corre la barra y mira el camino completo. Cada paso suma un hilo sobre la misma pestaña tuya.
          </p>
        </div>
      </div>

      {/* La magia del abanico */}
      <MagiaAbanico servicios={servicios} ritual={ritual} setRitual={setRitual} />

      {/* El equipo, sin nombres: los perfiles se ven al agendar */}
      <div>
        <Rotulo accion="Conocerlas al reservar" onAccion={() => ir("agendar")}>EL EQUIPO</Rotulo>
        <div className="flex" style={{ gap: 4 }}>
          {estilistas.filter((e) => e.agendaPublica).slice(0, 6).map((e) => (
            <div key={e.id} style={{ flex: 1, minWidth: 0, opacity: 0.9 }}>
              <RetratoPersona p={e.retrato} src={e.foto} alto={92} />
            </div>
          ))}
        </div>
        <p style={{ fontFamily: SANS, fontSize: 12.5, color: T.mute, marginTop: 14, lineHeight: 1.7, maxWidth: "42ch" }}>
          Nueve manos formadas en el atelier. Sus hojas de vida, sus certificaciones y sus reseñas
          las ves al reservar, junto a la agenda de cada una.
        </p>
        <button onClick={() => ir("agendar")} style={{
          width: "100%", marginTop: 14, background: "transparent", border: `1px solid ${T.linea}`,
          color: T.tinta, padding: "13px", fontSize: 10, letterSpacing: "0.2em", fontFamily: SANS, cursor: "pointer",
        }}>ELEGIR CON QUIÉN</button>
      </div>

      {/* Tienda */}
      <div>
        <Rotulo accion="Ver todo" onAccion={() => ir("tienda")}>CUIDADO EN CASA</Rotulo>
        <p style={{ fontFamily: SANS, fontSize: 12.5, color: T.mute, marginBottom: 14, lineHeight: 1.65, maxWidth: "42ch" }}>
          Lo que usamos en camilla. Se agrega desde aquí mismo y se paga junto con tu cita o aparte.
        </p>
        <div className="flex gap-3" style={{ overflowX: "auto", paddingBottom: 4 }}>
          {productos.slice(0, 5).map((p) => (
            <div key={p.id} style={{ flexShrink: 0, width: 148, position: "relative" }}>
              <div onClick={() => ir("tienda")} style={{ border: `1px solid ${T.linea}`, cursor: "pointer" }}>
                <Frasco tipo={p.frasco} src={p.foto} alto={176} />
              </div>
              <button onClick={() => sumarBolsa(p.id, 1)} style={{
                position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: 999,
                background: bolsa[p.id] ? T.bronce : "rgba(255,255,255,0.94)",
                border: `1px solid ${bolsa[p.id] ? T.bronce : T.linea}`,
                color: bolsa[p.id] ? "#FFF" : T.tinta, display: "grid", placeItems: "center",
                cursor: "pointer", fontFamily: SANS, fontSize: 12,
              }}>{bolsa[p.id] ? bolsa[p.id] : <Plus size={15} />}</button>
              <div style={{ fontFamily: SANS, marginTop: 9 }}>
                <div style={{ color: T.tinta, fontSize: 11.5, lineHeight: 1.3 }}>{p.n}</div>
                <div style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.1em", marginTop: 3 }}>{p.formato.toUpperCase()}</div>
                <div style={{ color: T.bronceOsc, fontFamily: SERIF, fontSize: 15, marginTop: 4 }}>{cop(p.p)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Club */}
      <div onClick={() => ir("club")} style={{ background: T.tinta, color: T.papel, padding: "34px 22px", textAlign: "center", cursor: "pointer" }}>
        <div style={{ display: "flex", justifyContent: "center", opacity: 0.9 }}><Monograma s={44} /></div>
        <div style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.28em", color: T.greige, marginTop: 14 }}>MEMBRESÍA POR INVITACIÓN</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 38, marginTop: 10, lineHeight: 1 }}>{CLUB_NOMBRE}</div>
        <div style={{ fontFamily: SANS, fontSize: 8.5, letterSpacing: "0.26em", color: T.bronce, marginTop: 10 }}>{CLUB_LEMA.toUpperCase()}</div>
        <p style={{ fontFamily: SANS, fontSize: 12, color: T.greige, marginTop: 14, lineHeight: 1.7, maxWidth: "32ch", marginLeft: "auto", marginRight: "auto" }}>
          Doscientas socias. Ni una más. Nácar, Ámbar y Obsidiana.
        </p>
        <div style={{ display: "inline-block", marginTop: 18, border: `1px solid ${T.greige}`, padding: "10px 22px", fontSize: 10, letterSpacing: "0.22em", fontFamily: SANS }}>
          CONOCER LOS NIVELES
        </div>
      </div>

      {/* Visítanos */}
      <div style={{ borderTop: `1px solid ${T.linea}`, paddingTop: 24 }}>
        <Rotulo>EL ESTUDIO</Rotulo>
        {[["Dirección", "San Patricio · Calle 109, Bogotá"], ["Horario", "Martes a sábado, 9 a. m. a 7 p. m."], ["Cita", "Solo con reserva previa"]].map(([k, v]) => (
          <div key={k} className="flex justify-between" style={{ padding: "9px 0", borderBottom: `1px solid ${T.linea}`, fontFamily: SANS }}>
            <span style={{ color: T.mute, fontSize: 11.5 }}>{k}</span>
            <span style={{ color: T.tinta, fontSize: 11.5, textAlign: "right" }}>{v}</span>
          </div>
        ))}
        <button onClick={() => ir("mirada")} style={{
          width: "100%", marginTop: 18, background: "transparent", border: `1px solid ${T.linea}`,
          color: T.mute, padding: "12px", fontSize: 10, letterSpacing: "0.2em", fontFamily: SANS, cursor: "pointer",
        }}>VER MI DISEÑO GUARDADO</button>
        <button onClick={() => ir("postular")} style={{
          width: "100%", marginTop: 8, background: "transparent", border: "none",
          color: T.greige, padding: "10px", fontSize: 10, letterSpacing: "0.18em", fontFamily: SANS, cursor: "pointer",
        }}>¿ERES PROFESIONAL? POSTULA TU HOJA DE VIDA</button>
      </div>

    </div>
  );
}

/* ═════════  LA MAGIA DEL ABANICO: 1, 2, 3 Y 4 PELOS  ═════════ */
const ABANICOS = {
  1: { srv: 5, t: "1 pelo", n: "Pelo a pelo · clásicas", e: "Una extensión sobre cada pestaña tuya. Alarga sin sumar peso.", r: "Nadie nota que las tienes. Solo notan que te ves descansada.", grosor: 0.2 },
  2: { srv: 6, t: "2 pelos", n: "Abanico 2D · híbridas", e: "Dos hilos abiertos en abanico sobre una sola pestaña natural.", r: "Aparece la densidad sin que se pierda lo natural.", grosor: 0.12 },
  3: { srv: 7, t: "3 pelos", n: "Abanico 3D · volumen tecnológico", e: "Tres hilos ultrafinos por pestaña, abiertos con precisión.", r: "La línea se ve llena y pareja, de la raíz a la punta.", grosor: 0.07 },
  4: { srv: 8, t: "4 pelos", n: "Abanico 4D · volumen ruso", e: "Cuatro hilos hechos a mano, uno por uno, en cada abanico.", r: "El máximo que aguanta tu pestaña sin sufrir. Mirada de alfombra roja.", grosor: 0.05 },
};
const D_POR_SERVICIO = { 5: 1, 6: 2, 7: 3, 8: 4 };

function Abanico({ n = 1, alto = 240, fondo }) {
  const B = [100, 150], largo = 100, base = -84, sep = 10;
  const hilos = Array.from({ length: n }, (_, i) => {
    const a = ((base + (i - (n - 1) / 2) * sep) * Math.PI) / 180;
    const px = Math.cos(a + Math.PI / 2), py = Math.sin(a + Math.PI / 2);
    const x2 = B[0] + Math.cos(a) * largo, y2 = B[1] + Math.sin(a) * largo;
    const cx = B[0] + Math.cos(a) * largo * 0.58 + px * 7, cy = B[1] + Math.sin(a) * largo * 0.58 + py * 7;
    return `M${B[0]} ${B[1]} Q ${cx} ${cy} ${x2} ${y2}`;
  });
  const an = (-82 * Math.PI) / 180;
  const natural = `M100 174 Q ${100 + Math.cos(an) * 34} ${174 + Math.sin(an) * 34} ${100 + Math.cos(an) * 72} ${174 + Math.sin(an) * 72}`;
  return (
    <div style={{ height: alto, overflow: "hidden", background: fondo || `radial-gradient(120% 90% at 50% 30%, #FFFFFF 0%, ${T.crema} 66%, ${T.greige}55 100%)` }}>
      <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%", display: "block" }} preserveAspectRatio="xMidYMid meet">
        <path d="M14 188 Q 100 168 186 188" stroke={T.tinta} strokeWidth="3.4" fill="none" strokeLinecap="round" />
        <path d="M14 194 Q 100 176 186 194" stroke={T.greige} strokeWidth="1.2" fill="none" opacity="0.7" />
        <path d={natural} stroke={T.greige} strokeWidth="3.4" fill="none" strokeLinecap="round" />
        <g key={n}>
          {hilos.map((d, i) => (
            <path key={i} d={d} stroke="#241F1A" strokeWidth={n === 1 ? 2.6 : n === 2 ? 2.2 : n === 3 ? 1.8 : 1.5}
              fill="none" strokeLinecap="round"
              style={{ transformOrigin: `${B[0]}px ${B[1]}px`, animation: `brotar 520ms cubic-bezier(.2,.8,.3,1) both`, animationDelay: `${i * 150}ms` }} />
          ))}
        </g>
        <circle cx={B[0]} cy={B[1]} r="4.6" fill={T.bronce} opacity="0.35" />
        <circle cx={B[0]} cy={B[1]} r="2.2" fill={T.bronce} />
        <line x1="128" y1="150" x2="164" y2="150" stroke={T.bronce} strokeWidth="0.8" strokeDasharray="3 3" />
        <line x1="128" y1="174" x2="164" y2="174" stroke={T.bronce} strokeWidth="0.8" strokeDasharray="3 3" />
        <line x1="162" y1="150" x2="162" y2="174" stroke={T.bronce} strokeWidth="0.8" />
        <text x="168" y="165" fill={T.bronceOsc} style={{ fontFamily: "Jost, sans-serif", fontSize: 8, letterSpacing: "0.1em" }}>1 mm</text>
      </svg>
    </div>
  );
}

function MagiaAbanico({ servicios, ritual, setRitual }) {
  const [d, setD] = useState(1);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setD((x) => (x % 4) + 1), 2100);
    return () => clearInterval(t);
  }, [auto]);
  const elegir = (k) => { setAuto(false); setD(k); };
  const a = ABANICOS[d];
  const srv = servicios.find((x) => x.id === a.srv);
  const dentro = srv && ritual.includes(srv.id);
  const set = { 1: "clasica", 2: "hibrida", 3: "tecno", 4: "ruso" }[d];

  return (
    <div>
      <Rotulo>LA MAGIA DEL ABANICO</Rotulo>
      <p style={{ fontFamily: SANS, fontSize: 12.5, color: T.mute, lineHeight: 1.7, marginBottom: 16, maxWidth: "42ch" }}>
        Sobre cada pestaña tuya se posa un abanico. De uno, de dos, de tres o de cuatro hilos. Mientras más hilos, más finos: el abanico de cuatro pesa lo mismo que una sola extensión clásica.
      </p>

      <div className="flex gap-2" style={{ marginBottom: 14, overflowX: "auto" }}>
        {[1, 2, 3, 4].map((k) => (
          <button key={k} onClick={() => elegir(k)} style={{
            flexShrink: 0, padding: "9px 14px", cursor: "pointer", fontFamily: SANS, fontSize: 10, letterSpacing: "0.14em",
            background: d === k ? T.tinta : "transparent", color: d === k ? T.papel : T.mute,
            border: `1px solid ${d === k ? T.tinta : T.linea}`, borderRadius: 999,
            transition: "background 260ms ease, color 260ms ease",
          }}>{ABANICOS[k].t.toUpperCase()}</button>
        ))}
      </div>

      <div className="grid grid-cols-2" style={{ border: `1px solid ${T.linea}`, position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: T.linea, zIndex: 3 }}>
          <div style={{ width: `${(d / 4) * 100}%`, height: "100%", background: T.bronce, transition: "width 420ms ease" }} />
        </div>
        <div style={{ borderRight: `1px solid ${T.linea}`, position: "relative" }}>
          <div key={d} style={{
            position: "absolute", top: 10, left: 12, zIndex: 2, fontFamily: SERIF, fontSize: 40,
            color: T.bronce, opacity: 0.35, lineHeight: 1, animation: "aparecer 420ms ease",
          }}>{d}</div>
          <Abanico n={d} alto={210} />
          <div style={{ padding: "9px 10px", borderTop: `1px solid ${T.linea}`, fontFamily: SANS, fontSize: 8.5, letterSpacing: "0.16em", color: T.mute, textAlign: "center" }}>
            UNA PESTAÑA
          </div>
        </div>
        <div>
          <div key={set} style={{ animation: "aparecer 380ms ease" }}>
            <Retrato lash={set} brow="normal" alto={210} sinMarco />
          </div>
          <div style={{ padding: "9px 10px", borderTop: `1px solid ${T.linea}`, fontFamily: SANS, fontSize: 8.5, letterSpacing: "0.16em", color: T.mute, textAlign: "center" }}>
            EL OJO COMPLETO
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 23, color: T.tinta, lineHeight: 1.1 }}>{a.n}</div>
        <p style={{ fontFamily: SANS, fontSize: 12.5, color: T.tinta, marginTop: 9, lineHeight: 1.65 }}>{a.e}</p>
        <p style={{ fontFamily: SANS, fontSize: 12.5, color: T.mute, marginTop: 6, lineHeight: 1.65 }}>{a.r}</p>
        <div className="flex items-center justify-between" style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.linea}` }}>
          <div style={{ fontFamily: SANS }}>
            <div style={{ fontSize: 9, letterSpacing: "0.16em", color: T.greige }}>
              {hm(srv.d).toUpperCase()} · GROSOR {a.grosor} MM
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 22, color: T.bronceOsc, marginTop: 3 }}>{cop(srv.p)}</div>
          </div>
          <button onClick={() => setRitual(dentro ? ritual.filter((x) => x !== srv.id) : [...ritual, srv.id])} style={{
            background: dentro ? T.bronce : T.tinta, color: "#FFF", border: "none", padding: "12px 18px",
            fontSize: 10, letterSpacing: "0.18em", fontFamily: SANS, cursor: "pointer",
          }}>{dentro ? "EN TU RITUAL" : "LO QUIERO"}</button>
        </div>
      </div>
    </div>
  );
}

/* ═════════  DIAGNÓSTICO DE MIRADA  ═════════ */
const PREGUNTAS = [
  {
    q: "¿Qué te pasa hoy con tu mirada?",
    o: [["cansada", "Se me ve cansada"], ["cejas", "Mis cejas no tienen forma"], ["dura", "Quiero algo que dure"], ["evento", "Tengo un evento pronto"]],
  },
  {
    q: "¿Cuánto tiempo tienes?",
    o: [["poco", "Menos de una hora"], ["medio", "Hasta dos horas"], ["todo", "El que sea necesario"]],
  },
  {
    q: "¿Qué tanto se debe notar?",
    o: [["nada", "Que no se note"], ["medio", "Natural, con densidad"], ["todo", "Que se note"]],
  },
];

function Diagnostico({ servicios, ritual, setRitual, irAgendar }) {
  const [paso, setPaso] = useState(0);
  const [r, setR] = useState({});
  const listo = paso >= PREGUNTAS.length;

  const recomendar = () => {
    const ids = [];
    if (r[0] === "cejas") ids.push(r[2] === "todo" ? 3 : 2);
    else if (r[0] === "dura") ids.push(3);
    else if (r[0] === "cansada") ids.push(r[1] === "poco" ? 4 : r[2] === "nada" ? 5 : r[2] === "todo" ? 8 : 6);
    else ids.push(r[2] === "todo" ? 8 : 6);
    if (r[0] !== "cejas" && r[1] === "todo") ids.push(1);
    if (r[0] === "cejas" && r[1] !== "poco") ids.push(1);
    return Array.from(new Set(ids)).map((id) => servicios.find((x) => x.id === id)).filter(Boolean);
  };
  const rec = listo ? recomendar() : [];
  const ya = rec.length > 0 && rec.every((x) => ritual.includes(x.id));

  return (
    <div style={{ background: T.crema, padding: "28px 20px" }}>
      <div style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.26em", color: T.bronceOsc }}>DIAGNÓSTICO</div>
      {!listo ? (
        <>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 25, color: T.tinta, marginTop: 10, lineHeight: 1.15 }}>
            {PREGUNTAS[paso].q}
          </div>
          <div className="flex flex-col gap-2" style={{ marginTop: 16 }}>
            {PREGUNTAS[paso].o.map(([k, l]) => (
              <button key={k} onClick={() => { setR({ ...r, [paso]: k }); setPaso(paso + 1); }} style={{
                background: "#FFF", border: `1px solid ${T.linea}`, padding: "13px 15px", textAlign: "left",
                fontFamily: SANS, fontSize: 13, color: T.tinta, cursor: "pointer",
              }}>{l}</button>
            ))}
          </div>
          <div className="flex gap-1" style={{ marginTop: 16 }}>
            {PREGUNTAS.map((_, i) => <div key={i} style={{ flex: 1, height: 2, background: i <= paso ? T.bronce : T.linea }} />)}
          </div>
        </>
      ) : (
        <>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 25, color: T.tinta, marginTop: 10, lineHeight: 1.15 }}>
            Esto es lo tuyo
          </div>
          <div className="flex gap-3" style={{ marginTop: 16, overflowX: "auto" }}>
            {rec.map((x) => (
              <div key={x.id} style={{ flexShrink: 0, width: 132 }}>
                <RostroCompleto lash={x.despues.lash} brow={x.despues.brow} look={x.look} src={x.foto} alto={152} />
                <div style={{ fontFamily: SANS, marginTop: 8 }}>
                  <div style={{ color: T.tinta, fontSize: 11.5, lineHeight: 1.3 }}>{x.n}</div>
                  <div style={{ color: T.bronceOsc, fontSize: 12, fontFamily: SERIF, marginTop: 3 }}>{cop(x.p)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2" style={{ marginTop: 18 }}>
            {ya ? (
              <button onClick={irAgendar} style={{ flex: 1, background: T.bronce, color: "#FFF", border: "none", padding: "13px", fontSize: 10, letterSpacing: "0.2em", fontFamily: SANS, cursor: "pointer" }}>
                RESERVAR
              </button>
            ) : (
              <button onClick={() => setRitual(Array.from(new Set([...ritual, ...rec.map((x) => x.id)])))} style={{ flex: 1, background: T.tinta, color: "#FFF", border: "none", padding: "13px", fontSize: 10, letterSpacing: "0.2em", fontFamily: SANS, cursor: "pointer" }}>
                AGREGAR A MI RITUAL
              </button>
            )}
            <button onClick={() => { setPaso(0); setR({}); }} style={{ background: "transparent", border: `1px solid ${T.linea}`, color: T.mute, padding: "13px 15px", fontSize: 10, letterSpacing: "0.14em", fontFamily: SANS, cursor: "pointer" }}>
              REPETIR
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ═════════  LA CARTA  ═════════ */
function Carta({ servicios, ritual, setRitual, cat, setCat, estilistas, irAgendar }) {
  const [abierto, setAbierto] = useState(null);
  const lista = cat === "Todo" ? servicios : cat === "Hombres" ? servicios.filter((s) => s.hombres) : servicios.filter((s) => s.cat === cat);
  const principal = lista.filter((x) => CATS_MIRADA.includes(x.cat));
  const otros = lista.filter((x) => CATS_ATELIER.includes(x.cat));
  const aula = lista.filter((x) => x.cat === "Capacitaciones");
  const dentro = (id) => ritual.includes(id);
  const toggle = (id) => setRitual(dentro(id) ? ritual.filter((x) => x !== id) : [...ritual, id]);
  const quienes = abierto ? estilistas.filter((e) => e.agendaPublica && (e.dominio || []).includes(abierto.id)) : [];

  return (
    <div style={{ paddingBottom: ritual.length ? 90 : 20 }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 30, color: T.tinta, lineHeight: 1.05 }}>La carta</div>
        <p style={{ fontFamily: SANS, fontSize: 12.5, color: T.mute, marginTop: 8, lineHeight: 1.6, maxWidth: "42ch" }}>
          La mirada es lo nuestro. También hay maquillaje, peluquería, spa y barbería, y el aula donde enseñamos lo que hacemos.
          Toca el más para sumarlo a tu ritual: se agendan juntos, en una sola visita.
        </p>
      </div>

      <div className="flex gap-2" style={{
        overflowX: "auto", position: "sticky", top: 0, zIndex: 20,
        background: T.papel, paddingTop: 6, paddingBottom: 12, marginBottom: 6,
      }}>
        {CATS.map((c) => (
          <button key={c} onClick={() => setCat(c)} style={{
            flexShrink: 0, padding: "8px 14px", cursor: "pointer", fontFamily: SANS, fontSize: 10, letterSpacing: "0.14em",
            background: cat === c ? T.tinta : "transparent", color: cat === c ? T.papel : T.mute,
            border: `1px solid ${cat === c ? T.tinta : T.linea}`, borderRadius: 999,
          }}>{c.toUpperCase()}</button>
        ))}
      </div>

      {[["LA MIRADA", principal], ["TAMBIÉN EN EL ATELIER", otros], ["EL AULA · CAPACITACIONES", aula]].map(([titulo, grupo]) => (
        grupo.length === 0 ? null : (
          <div key={titulo} style={{ marginBottom: 30 }}>
            {cat === "Todo" && (
              <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
                <span style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.26em", color: T.bronceOsc, whiteSpace: "nowrap" }}>{titulo}</span>
                <span style={{ flex: 1, height: 1, background: T.linea }} />
              </div>
            )}
            <div className="flex flex-col" style={{ gap: 30 }}>
              {grupo.map((s) => (
                <div key={s.id}>
                  <div onClick={() => setAbierto(s)} style={{ position: "relative", cursor: "pointer" }}>
                    <RostroCompleto lash={s.despues.lash} brow={s.despues.brow} look={s.look} src={s.foto} alto={230} sinMarco />
                    {s.top && (
                      <span style={{ position: "absolute", top: 12, left: 12, background: "rgba(59,53,46,0.8)", color: "#FFF", fontSize: 8, letterSpacing: "0.18em", padding: "4px 9px", fontFamily: SANS }}>
                        FAVORITO
                      </span>
                    )}
                  </div>
                  <div className="flex items-start justify-between gap-3" style={{ paddingTop: 13 }}>
                    <div style={{ minWidth: 0, fontFamily: SANS }}>
                      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 21, color: T.tinta, lineHeight: 1.1 }}>{s.n}</div>
                      <p style={{ fontSize: 12, color: T.mute, marginTop: 6, lineHeight: 1.55, maxWidth: "40ch" }}>{s.promesa}</p>
                      <div style={{ fontSize: 9.5, letterSpacing: "0.14em", color: T.greige, marginTop: 8 }}>
                        {hm(s.d).toUpperCase()} · TE DURA {s.dura.toUpperCase()}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: SERIF, fontSize: 20, color: T.bronceOsc }}>{cop(s.p)}</div>
                      <button onClick={() => toggle(s.id)} style={{
                        marginTop: 8, width: 36, height: 36, borderRadius: 999, cursor: "pointer",
                        background: dentro(s.id) ? T.bronce : "transparent",
                        border: `1px solid ${dentro(s.id) ? T.bronce : T.linea}`,
                        color: dentro(s.id) ? "#FFF" : T.tinta, display: "grid", placeItems: "center",
                      }}>{dentro(s.id) ? <Check size={16} /> : <Plus size={16} />}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ))}

      {abierto && (
        <div onClick={() => setAbierto(null)} style={{ position: "fixed", inset: 0, background: "rgba(59,53,46,0.55)", zIndex: 60, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#FFF", width: "100%", maxWidth: 480, maxHeight: "92vh", overflowY: "auto" }}>
            <div style={{ position: "relative" }}>
              <RostroCompleto lash={abierto.despues.lash} brow={abierto.despues.brow} look={abierto.look} src={abierto.foto} alto={320} sinMarco />
              <button onClick={() => setAbierto(null)} style={{
                position: "absolute", top: 14, right: 14, width: 32, height: 32, borderRadius: 999,
                background: "rgba(255,255,255,0.94)", border: "none", display: "grid", placeItems: "center", cursor: "pointer", zIndex: 2,
              }}><X size={15} color={T.tinta} /></button>
            </div>
            <div style={{ padding: 22 }}>
              <div style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.26em", color: T.bronceOsc }}>{abierto.cat.toUpperCase()}</div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 28, color: T.tinta, marginTop: 8, lineHeight: 1.08 }}>{abierto.n}</div>
              <p style={{ color: T.tinta, fontSize: 13.5, marginTop: 14, fontFamily: SANS, lineHeight: 1.7 }}>{abierto.promesa}</p>
              <p style={{ color: T.mute, fontSize: 12.5, marginTop: 8, fontFamily: SANS, lineHeight: 1.65 }}>{abierto.desc}</p>

              {D_POR_SERVICIO[abierto.id] && (
                <div style={{ marginTop: 22 }}>
                  <Rotulo>EL ABANICO</Rotulo>
                  <div className="flex gap-3" style={{ border: `1px solid ${T.linea}`, alignItems: "center" }}>
                    <div style={{ width: 128, flexShrink: 0, borderRight: `1px solid ${T.linea}` }}>
                      <Abanico n={D_POR_SERVICIO[abierto.id]} alto={150} />
                    </div>
                    <div style={{ padding: "0 12px", fontFamily: SANS }}>
                      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 19, color: T.tinta, lineHeight: 1.1 }}>
                        {ABANICOS[D_POR_SERVICIO[abierto.id]].t}
                      </div>
                      <div style={{ fontSize: 11.5, color: T.mute, marginTop: 6, lineHeight: 1.5 }}>
                        {ABANICOS[D_POR_SERVICIO[abierto.id]].e}
                      </div>
                      <div style={{ fontSize: 9, letterSpacing: "0.14em", color: T.bronceOsc, marginTop: 8 }}>
                        GROSOR {ABANICOS[D_POR_SERVICIO[abierto.id]].grosor} MM
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 22 }}>
                <Rotulo>EL CAMINO · ARRASTRA LA BARRA</Rotulo>
                <div style={{ border: `1px solid ${T.linea}` }}>
                  <Progresion tipo={abierto.cat === "Pestañas" ? "pestanas" : "cejas"} alto={210}
                    inicial={D_POR_SERVICIO[abierto.id] || (abierto.id === 1 ? 1 : abierto.id === 2 ? 2 : abierto.id === 3 ? 3 : 0)} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3" style={{ margin: "22px 0", fontFamily: SANS }}>
                {[["DURACIÓN", hm(abierto.d), T.tinta], ["TE DURA", abierto.dura, T.tinta], ["VALOR", cop(abierto.p), T.bronceOsc]].map(([k, v, c]) => (
                  <div key={k}>
                    <div style={{ color: T.mute, fontSize: 8.5, letterSpacing: "0.16em" }}>{k}</div>
                    <div style={{ fontFamily: SERIF, fontSize: 17, color: c, marginTop: 4 }}>{v}</div>
                  </div>
                ))}
              </div>

              {quienes.length > 0 && (
                <div style={{ background: T.crema, padding: 14, marginBottom: 22, fontFamily: SANS }}>
                  <div style={{ color: T.mute, fontSize: 9, letterSpacing: "0.16em" }}>QUIÉN LO HACE</div>
                  <div style={{ color: T.tinta, fontSize: 12.5, marginTop: 6, lineHeight: 1.6 }}>
                    {quienes.length} {quienes.length === 1 ? "especialista del atelier está certificada" : "especialistas del atelier están certificadas"} para este servicio.
                    Ves su hoja de vida, sus certificaciones y sus reseñas al reservar.
                  </div>
                </div>
              )}

              <Boton tono={dentro(abierto.id) ? "bronce" : "tinta"} onClick={() => { toggle(abierto.id); setAbierto(null); }}>
                {dentro(abierto.id) ? "QUITAR DE MI RITUAL" : "AGREGAR A MI RITUAL"}
              </Boton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═════════  EMBUDO DE COMPRA CON PAGO  ═════════ */
function Embudo({ servicios, productos, estilistas, ritual, setRitual, sesion, addReserva, citas = [], cancel = [], irServicios }) {
  const [paso, setPaso] = useState(1);
  const [est, setEst] = useState(null);
  const [verCV, setVerCV] = useState(null);
  const [dia, setDia] = useState(1);
  const [slot, setSlot] = useState(null);
  const [modo, setModo] = useState("abono");
  const [metodo, setMetodo] = useState("nequi");
  const [acepta, setAcepta] = useState(false);
  const [estado, setEstado] = useState("form"); // form | procesando | listo
  const [ref, setRef] = useState(null);

  const [extras, setExtras] = useState([]);
  const sel = servicios.filter((s) => ritual.includes(s.id));
  const llevar = productos.filter((p) => extras.includes(p.id));
  const totalMin = sel.reduce((a, s) => a + s.d, 0) + Math.max(0, sel.length - 1) * 5;
  const subtotal = sel.reduce((a, s) => a + s.p, 0) + llevar.reduce((a, p) => a + p.p, 0);
  const descuento = modo === "total" ? Math.round(subtotal * DESC_TOTAL) : 0;
  const total = subtotal - descuento;
  const abono = Math.max(ABONO_MIN, Math.round(subtotal * ABONO_PCT));
  const aPagar = modo === "total" ? total : abono;
  const saldo = modo === "total" ? 0 : subtotal - abono;
  const bloques = useMemo(() => (est ? agendaDe(est.id, dia, citas, cancel) : []), [est, dia, citas, cancel]);

  const otrosDias = useMemo(() => {
    if (!est) return [];
    return DIAS_N.map((d, i) => ({ i, d, libres: huecos(agendaDe(est.id, i, citas, cancel), totalMin) }))
      .filter((x) => x.i !== dia && x.libres.length > 0);
  }, [est, dia, totalMin]);

  const otrasProfes = useMemo(() => {
    if (!est) return [];
    return estilistas.filter((e) => e.agendaPublica && e.id !== est.id)
      .map((e) => ({ e, libres: huecos(agendaDe(e.id, dia, citas, cancel), totalMin) }))
      .filter((x) => x.libres.length > 0);
  }, [est, dia, totalMin, estilistas]);

  const Alternativas = () => (
    <div style={{ marginTop: 14 }}>
      {otrosDias.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ color: T.mute, fontSize: 9, letterSpacing: "0.16em", fontFamily: SANS, marginBottom: 8 }}>
            {est.n.split(" ")[0].toUpperCase()} SÍ TIENE ESTOS DÍAS
          </div>
          <div className="flex" style={{ flexWrap: "wrap", gap: 6 }}>
            {otrosDias.map((x) => (
              <button key={x.i} onClick={() => { setDia(x.i); setSlot(null); }} style={{
                background: "#FFF", border: `1px solid ${T.linea}`, padding: "9px 12px", cursor: "pointer", fontFamily: SANS, textAlign: "left",
              }}>
                <div style={{ fontSize: 11.5, color: T.tinta }}>{x.d} {FECHAS[x.i]}</div>
                <div style={{ fontSize: 10, color: T.bronceOsc, marginTop: 2 }}>desde {fmt(x.libres[0])}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      {otrasProfes.length > 0 && (
        <div>
          <div style={{ color: T.mute, fontSize: 9, letterSpacing: "0.16em", fontFamily: SANS, marginBottom: 8 }}>
            EL MISMO DÍA, CON OTRA
          </div>
          <div className="flex flex-col gap-2">
            {otrasProfes.map(({ e, libres }) => (
              <button key={e.id} onClick={() => { setEst(e); setSlot(null); }} className="flex items-center gap-3" style={{
                background: "#FFF", border: `1px solid ${T.linea}`, padding: 10, cursor: "pointer", textAlign: "left",
              }}>
                <div style={{ width: 34, flexShrink: 0, border: `1px solid ${T.linea}` }}>
                  <RetratoPersona p={e.retrato} src={e.foto} alto={40} />
                </div>
                <div className="flex-1" style={{ minWidth: 0, fontFamily: SANS }}>
                  <div style={{ fontSize: 12.5, color: T.tinta }}>{e.n}</div>
                  <div style={{ fontSize: 10.5, color: T.mute, marginTop: 2 }}>
                    {libres.length} horario{libres.length === 1 ? "" : "s"} · desde {fmt(libres[0])}
                  </div>
                </div>
                <span className="flex items-center gap-1" style={{ color: T.bronce, fontSize: 10.5, fontFamily: SANS, flexShrink: 0 }}>
                  <Star size={9} fill={T.bronce} /> {e.rating.toFixed(1)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      {otrosDias.length === 0 && otrasProfes.length === 0 && (
        <a href={waLink(`Hola Indiana, no encuentro cupo para ${hm(totalMin)} esta semana. ¿Me puedes abrir un espacio?`)}
          target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "block", marginTop: 4 }}>
          <Boton tono="verde">Pedirle un cupo a Indiana</Boton>
        </a>
      )}
    </div>
  );

  const confirmar = () => {
    const c = codigo();
    setRef(c); setEstado("listo");
    addReserva({
      codigo: c, cliente: sesion.nombre, cel: sesion.cel, est: est.n, estId: est.id, dia, slot, totalMin,
      srvN: sel.map((x) => x.n).join(" + "), subtotal, pagado: metodo === "efectivo" ? 0 : aPagar, metodo,
    });
  };

  useEffect(() => {
    if (estado !== "procesando") return;
    const t = setTimeout(confirmar, 1700);
    return () => clearTimeout(t);
  }, [estado]);

  if (sel.length === 0) {
    return (
      <div style={{ textAlign: "center", paddingTop: 44 }}>
        <Monograma s={48} />
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 22, color: T.tinta, marginTop: 12 }}>Tu ritual está vacío</div>
        <p style={{ color: T.mute, fontSize: 12.5, marginTop: 8, fontFamily: SANS }}>Escoge en Servicios lo que quieras hacerte.</p>
        <div style={{ marginTop: 18 }}><Boton onClick={irServicios}>Ver los servicios</Boton></div>
      </div>
    );
  }

  if (estado === "listo") {
    const linePago = metodo === "efectivo"
      ? `• Pago en el atelier: ${cop(subtotal)} (cupo sin abono)`
      : `• Pagué ${cop(aPagar)} por ${PASARELA[metodo].n}\n${saldo > 0 ? `• Saldo en el atelier: ${cop(saldo)}` : "• Pago completo"}`;
    const texto = `Hola Indiana. Acabo de reservar por la app.\n\nCódigo: ${ref}\n${[...sel, ...llevar].map((x) => `• ${x.n}`).join("\n")}\n• Con: ${est.n}\n• ${DIAS_N[dia]} ${FECHAS[dia]} de septiembre, ${fmt(slot)} a ${fmt(slot + totalMin)}\n${linePago}\n\nSoy ${sesion.nombre}, cel ${sesion.cel}.`;
    return (
      <div className="flex flex-col gap-4" style={{ textAlign: "center", paddingTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "center" }}><Monograma s={58} /></div>
        <div>
          <h2 style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 27, color: T.tinta, margin: "0 0 6px" }}>Cita confirmada</h2>
          <p style={{ color: T.mute, fontSize: 12.5, fontFamily: SANS, lineHeight: 1.6 }}>
            Te llegará un recordatorio 24 horas antes y otro 2 horas antes.
          </p>
        </div>
        <Card style={{ textAlign: "left", borderColor: T.bronce }}>
          <div className="flex items-center justify-between" style={{ paddingBottom: 10, borderBottom: `1px solid ${T.linea}` }}>
            <span style={{ color: T.mute, fontSize: 10, letterSpacing: "0.1em", fontFamily: SANS }}>CÓDIGO DE RESERVA</span>
            <span style={{ fontFamily: SERIF, fontSize: 21, color: T.bronceOsc }}>{ref}</span>
          </div>
          {[...sel, ...llevar].map((x) => (
            <div key={x.id + "-" + x.n} className="flex justify-between" style={{ padding: "6px 0", fontFamily: SANS }}>
              <span style={{ color: T.tinta, fontSize: 12.5 }}>{x.n}</span>
              <span style={{ color: T.mute, fontSize: 12 }}>{cop(x.p)}</span>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${T.linea}`, marginTop: 6, paddingTop: 10, fontFamily: SANS }}>
            {[["Con", est.n], ["Cuándo", `${DIAS_N[dia]} ${FECHAS[dia]} · ${fmt(slot)} a ${fmt(slot + totalMin)}`],
            ["Dónde", "San Patricio, Calle 109"],
            ...(metodo === "efectivo"
              ? [["Pagas en el atelier", cop(subtotal)]]
              : [["Pagaste", `${cop(aPagar)} · ${PASARELA[metodo].n}`],
              ...(saldo > 0 ? [["Saldo en el atelier", cop(saldo)]] : [])])].map(([k, v]) => (
              <div key={k} className="flex justify-between" style={{ padding: "5px 0" }}>
                <span style={{ color: T.mute, fontSize: 12 }}>{k}</span>
                <span style={{ color: T.tinta, fontSize: 12, textAlign: "right" }}>{v}</span>
              </div>
            ))}
          </div>
        </Card>
        <a href={waLink(texto)} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
          <Boton tono="verde">Enviarle el comprobante a Indiana</Boton>
        </a>
        <Boton onClick={() => { setRitual([]); setEstado("form"); setPaso(1); setEst(null); setSlot(null); irServicios(); }}>Volver a los servicios</Boton>
      </div>
    );
  }

  if (estado === "procesando") {
    return (
      <div style={{ textAlign: "center", paddingTop: 70 }}>
        <div style={{ display: "inline-block", animation: "giro 1.1s linear infinite" }}><Loader size={30} color={T.bronce} /></div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 24, color: T.tinta, marginTop: 18 }}>Procesando tu pago</div>
        <div style={{ color: T.mute, fontSize: 12, marginTop: 8, fontFamily: SANS }}>{PASARELA[metodo].n} · {cop(aPagar)}</div>
        <style>{`@keyframes giro{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const pasos = ["Servicios", "Profesionales", "Agenda", "Pago"];
  const puedeSeguir = paso === 1 ? sel.length > 0 : paso === 2 ? !!est : paso === 3 ? slot != null : acepta;

  return (
    <div className="flex flex-col gap-4">
      {/* Progreso */}
      <div>
        <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
          {paso > 1 && (
            <button onClick={() => setPaso(paso - 1)} style={{ background: "none", border: "none", color: T.mute, padding: 0, display: "flex", cursor: "pointer" }}>
              <ChevronLeft size={18} />
            </button>
          )}
          <div className="flex-1 flex gap-1">
            {pasos.map((p, i) => <div key={p} style={{ flex: 1, height: 2, background: i < paso ? T.bronce : T.linea }} />)}
          </div>
          <span style={{ color: T.mute, fontSize: 10.5, fontFamily: SANS }}>{paso} de 4</span>
        </div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 26, color: T.tinta }}>{pasos[paso - 1]}</div>
      </div>

      {/* Paso 1 */}
      {paso === 1 && (
        <>
          <Card style={{ background: T.crema }}>
            {sel.map((s) => (
              <div key={s.id} className="flex items-center gap-3" style={{ padding: "8px 0", borderBottom: `1px solid ${T.linea}` }}>
                <div style={{ width: 46, flexShrink: 0, border: `1px solid ${T.linea}` }}>
                  <Retrato {...s.despues} src={s.foto} alto={46} sinMarco />
                </div>
                <div className="flex-1" style={{ minWidth: 0, fontFamily: SANS }}>
                  <div style={{ color: T.tinta, fontSize: 12.5 }}>{s.n}</div>
                  <div style={{ color: T.mute, fontSize: 11 }}>{hm(s.d)} · {cop(s.p)}</div>
                </div>
                <button onClick={() => setRitual(ritual.filter((x) => x !== s.id))} style={{ background: "none", border: "none", color: T.mute, cursor: "pointer", display: "flex" }}><X size={14} /></button>
              </div>
            ))}
            <div className="flex justify-between items-baseline" style={{ paddingTop: 12, fontFamily: SANS }}>
              <span style={{ color: T.mute, fontSize: 12 }}>{hm(totalMin)} en camilla</span>
              <span style={{ fontFamily: SERIF, fontSize: 25, color: T.bronceOsc }}>{cop(subtotal)}</span>
            </div>
          </Card>
          <button onClick={irServicios} className="w-full py-3" style={{ background: "transparent", border: `1px solid ${T.linea}`, color: T.mute, fontSize: 12, fontFamily: SANS, cursor: "pointer" }}>
            Agregar otro servicio
          </button>
        </>
      )}

      {/* Paso 2 */}
      {paso === 2 && (
        <div className="flex flex-col gap-3">
          {estilistas.filter((e) => e.agendaPublica).map((e) => {
            const hace = sel.filter((s) => (e.dominio || []).includes(s.id)).length;
            return (
              <Card key={e.id} style={{ borderColor: est?.id === e.id ? T.bronce : T.linea, padding: 0 }}>
                <div className="flex" style={{ padding: 14, gap: 12, cursor: "pointer" }} onClick={() => setEst(e)}>
                  <div style={{ width: 62, flexShrink: 0, border: `1px solid ${T.linea}` }}>
                    <RetratoPersona p={e.retrato} src={e.foto} alto={74} />
                  </div>
                  <div className="flex-1" style={{ minWidth: 0, fontFamily: SANS }}>
                    <div style={{ fontFamily: SERIF, fontSize: 18, color: T.tinta, lineHeight: 1.15 }}>{e.n}</div>
                    <div style={{ color: T.bronceOsc, fontSize: 9, letterSpacing: "0.14em", marginTop: 3 }}>{e.rol.toUpperCase()}</div>
                    <div className="flex items-center gap-2" style={{ marginTop: 6 }}>
                      <Estrellas v={e.rating} s={11} />
                      <span style={{ color: T.mute, fontSize: 10.5 }}>{e.rating.toFixed(1)} · {e.atendidas} clientas</span>
                    </div>
                    <div style={{ color: T.mute, fontSize: 11, marginTop: 6 }}>
                      {hace === sel.length ? "Hace todo tu ritual" : `Hace ${hace} de ${sel.length} servicios de tu ritual`}
                    </div>
                  </div>
                  {est?.id === e.id && <Check size={17} color={T.bronce} style={{ flexShrink: 0 }} />}
                </div>
                <button onClick={() => setVerCV(e)} className="w-full py-2" style={{ background: T.papel, border: "none", borderTop: `1px solid ${T.linea}`, color: T.bronceOsc, fontSize: 11, letterSpacing: "0.08em", fontFamily: SANS, cursor: "pointer" }}>
                  Ver hoja de vida y reseñas
                </button>
              </Card>
            );
          })}
        </div>
      )}

      {/* Paso 3 */}
      {paso === 3 && est && (
        <>
          <div className="flex items-center gap-1" style={{ color: T.mute, fontSize: 11, fontFamily: SANS }}>
            <MapPin size={12} /> Con {est.n.split(" ")[0]} · San Patricio, Calle 109 · martes a sábado de 9 a. m. a 7 p. m.
          </div>
          <div className="flex gap-2" style={{ overflowX: "auto" }}>
            {DIAS_N.map((d, i) => (
              <button key={d} onClick={() => { setDia(i); setSlot(null); }} style={{
                flexShrink: 0, width: 52, padding: "9px 0", textAlign: "center", cursor: "pointer",
                background: dia === i ? T.tinta : "#FFF", color: dia === i ? T.papel : T.tinta,
                border: `1px solid ${dia === i ? T.tinta : T.linea}`, borderRadius: 2, fontFamily: SANS,
              }}>
                <div style={{ fontSize: 10, opacity: 0.7 }}>{d}</div>
                <div style={{ fontSize: 16, fontFamily: SERIF }}>{FECHAS[i]}</div>
              </button>
            ))}
          </div>
          <Card><AgendaPublica bloques={bloques} dur={totalMin} elegido={slot} onElegir={setSlot} alternativas={<Alternativas />} /></Card>
        </>
      )}

      {/* Paso 4 — pago */}
      {paso === 4 && (
        <>
          <Card>
            {sel.map((s) => (
              <div key={s.id} className="flex justify-between" style={{ padding: "4px 0", fontFamily: SANS }}>
                <span style={{ color: T.mute, fontSize: 12 }}>{s.n}</span>
                <span style={{ color: T.tinta, fontSize: 12 }}>{cop(s.p)}</span>
              </div>
            ))}
            {llevar.map((p) => (
              <div key={p.id} className="flex justify-between" style={{ padding: "4px 0", fontFamily: SANS }}>
                <span style={{ color: T.mute, fontSize: 12 }}>{p.n}</span>
                <span style={{ color: T.tinta, fontSize: 12 }}>{cop(p.p)}</span>
              </div>
            ))}
            <div className="flex justify-between" style={{ padding: "6px 0 4px", borderTop: `1px solid ${T.linea}`, marginTop: 4, fontFamily: SANS }}>
              <span style={{ color: T.mute, fontSize: 12 }}>Subtotal</span>
              <span style={{ color: T.tinta, fontSize: 12 }}>{cop(subtotal)}</span>
            </div>
            {descuento > 0 && (
              <div className="flex justify-between" style={{ padding: "4px 0", fontFamily: SANS }}>
                <span style={{ color: T.ok, fontSize: 12 }}>Descuento por pago total</span>
                <span style={{ color: T.ok, fontSize: 12 }}>−{cop(descuento)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline" style={{ paddingTop: 10, borderTop: `1px solid ${T.linea}`, marginTop: 6, fontFamily: SANS }}>
              <span style={{ color: T.tinta, fontSize: 13 }}>Pagas hoy</span>
              <span style={{ fontFamily: SERIF, fontSize: 27, color: T.bronceOsc }}>{cop(aPagar)}</span>
            </div>
            {saldo > 0 && <div style={{ color: T.mute, fontSize: 11, marginTop: 4, fontFamily: SANS }}>Saldo de {cop(saldo)} el día de la cita.</div>}
          </Card>

          <div className="flex flex-col gap-2">
            {[["abono", `Abono de ${cop(abono)}`, "Aparta el cupo. El resto lo pagas en el atelier."],
            ["total", `Pago total ${cop(total)}`, `Te descontamos el 5%. Ahorras ${cop(Math.round(subtotal * DESC_TOTAL))}.`]].map(([k, t, s]) => (
              <Card key={k} onClick={() => setModo(k)} style={{ cursor: "pointer", borderColor: modo === k ? T.bronce : T.linea, padding: 13 }}>
                <div className="flex items-start gap-3">
                  <div style={{ width: 16, height: 16, borderRadius: 999, border: `1.5px solid ${modo === k ? T.bronce : T.linea}`, flexShrink: 0, marginTop: 2, display: "grid", placeItems: "center" }}>
                    {modo === k && <div style={{ width: 8, height: 8, borderRadius: 999, background: T.bronce }} />}
                  </div>
                  <div style={{ fontFamily: SANS }}>
                    <div style={{ color: T.tinta, fontSize: 13 }}>{t}</div>
                    <div style={{ color: T.mute, fontSize: 11.5, marginTop: 3 }}>{s}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div>
            <div style={{ color: T.mute, fontSize: 10, letterSpacing: "0.12em", marginBottom: 4, fontFamily: SANS }}>LLÉVATELO A CASA</div>
            <div style={{ color: T.mute, fontSize: 11.5, marginBottom: 10, fontFamily: SANS, lineHeight: 1.5 }}>
              Lo que usamos en camilla, en el mismo pago. Sin otra transacción.
            </div>
            <div className="flex gap-3" style={{ overflowX: "auto", paddingBottom: 4 }}>
              {productos.slice(0, 4).map((p) => {
                const on = extras.includes(p.id);
                return (
                  <div key={p.id} onClick={() => setExtras(on ? extras.filter((x) => x !== p.id) : [...extras, p.id])}
                    style={{ flexShrink: 0, width: 116, cursor: "pointer" }}>
                    <div style={{ border: `1px solid ${on ? T.bronce : T.linea}`, position: "relative" }}>
                      <Frasco tipo={p.frasco} src={p.foto} alto={116} />
                      <span style={{
                        position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: 999,
                        background: on ? T.bronce : "rgba(255,255,255,0.92)", border: `1px solid ${on ? T.bronce : T.linea}`,
                        color: on ? "#FFF" : T.tinta, display: "grid", placeItems: "center",
                      }}>{on ? <Check size={12} /> : <Plus size={12} />}</span>
                    </div>
                    <div style={{ fontFamily: SANS, marginTop: 7 }}>
                      <div style={{ fontSize: 10.5, color: T.tinta, lineHeight: 1.3 }}>{p.n}</div>
                      <div style={{ fontSize: 12, color: T.bronceOsc, fontFamily: SERIF, marginTop: 3 }}>{cop(p.p)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div style={{ color: T.mute, fontSize: 10, letterSpacing: "0.12em", marginBottom: 8, fontFamily: SANS }}>CÓMO PAGAS</div>
            <div className="flex flex-col gap-2">
              {Object.entries(PASARELA).map(([k, m]) => (
                <button key={k} onClick={() => setMetodo(k)} className="flex items-center gap-3 p-3" style={{
                  background: "#FFF", border: `1px solid ${metodo === k ? T.bronce : T.linea}`, cursor: "pointer", textAlign: "left",
                }}>
                  <span style={{ width: 30, height: 30, background: metodo === k ? T.bronce : T.crema, color: metodo === k ? "#FFF" : T.bronceOsc, display: "grid", placeItems: "center", fontFamily: SERIF, fontSize: 15, flexShrink: 0 }}>{m.icono}</span>
                  <span className="flex-1" style={{ color: T.tinta, fontSize: 12.5, fontFamily: SANS }}>{m.n}</span>
                  {k === "efectivo" && <span style={{ color: T.alerta, fontSize: 10, fontFamily: SANS }}>no aparta el cupo</span>}
                  {metodo === k && k !== "efectivo" && <Check size={15} color={T.bronce} />}
                </button>
              ))}
            </div>
          </div>

          <Card style={{ background: T.crema }}>
            <div className="flex gap-2" style={{ alignItems: "flex-start" }}>
              <Shield size={15} color={T.bronceOsc} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontFamily: SANS }}>
                <div style={{ color: T.tinta, fontSize: 12 }}>Política de cancelación</div>
                <div style={{ color: T.mute, fontSize: 11.5, marginTop: 4, lineHeight: 1.55 }}>
                  Puedes mover tu cita hasta 24 horas antes sin costo. Después de esa hora, el abono no se devuelve porque el cupo ya no se puede vender.
                </div>
              </div>
            </div>
            <label className="flex items-center gap-2" style={{ marginTop: 12, cursor: "pointer" }}>
              <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} style={{ width: 15, height: 15, accentColor: T.bronce }} />
              <span style={{ color: T.tinta, fontSize: 11.5, fontFamily: SANS }}>Entiendo y acepto la política</span>
            </label>
          </Card>
        </>
      )}

      {/* Barra inferior del embudo */}
      <div style={{ position: "sticky", bottom: 66, background: T.papel, paddingTop: 6 }}>
        {paso < 4
          ? <Boton disabled={!puedeSeguir} onClick={() => setPaso(paso + 1)}>
            {paso === 1 ? "Ver las profesionales" : paso === 2 ? "Ver su agenda" : `Continuar al pago · ${cop(subtotal)}`}
          </Boton>
          : <Boton disabled={!acepta} tono="bronce" onClick={() => (metodo === "efectivo" ? confirmar() : setEstado("procesando"))}>
            {metodo === "efectivo" ? "Reservar sin pagar" : `Pagar ${cop(aPagar)}`}
          </Boton>}
      </div>

      {verCV && <FichaEspecialista e={verCV} servicios={servicios} onCerrar={() => setVerCV(null)} onElegir={() => { setEst(verCV); setVerCV(null); setPaso(3); }} />}
    </div>
  );
}

/* Hoja de vida, calificaciones y portafolio */
function FichaEspecialista({ e, servicios, onCerrar, onElegir, cta }) {
  const total = e.resenas.length || 1;
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: e.resenas.filter((r) => r.e === n).length }));
  const mios = servicios.filter((s) => (e.dominio || []).includes(s.id));
  return (
    <div onClick={onCerrar} style={{ position: "fixed", inset: 0, background: "rgba(59,53,46,0.5)", zIndex: 70, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(ev) => ev.stopPropagation()} style={{ background: "#FFF", width: "100%", maxWidth: 480, maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ position: "relative", height: 210 }}>
          <RetratoPersona p={e.retrato} src={e.foto} alto={210} />
          <button onClick={onCerrar} style={{ position: "absolute", top: 12, right: 12, width: 30, height: 30, borderRadius: 999, background: "rgba(255,255,255,0.94)", border: "none", display: "grid", placeItems: "center", cursor: "pointer" }}>
            <X size={15} color={T.tinta} />
          </button>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 26, color: T.tinta, lineHeight: 1.1 }}>{e.n}</div>
          <div style={{ color: T.bronceOsc, fontSize: 9.5, letterSpacing: "0.16em", marginTop: 5, fontFamily: SANS }}>{e.rol.toUpperCase()}</div>
          <p style={{ color: T.mute, fontSize: 12.5, marginTop: 12, fontFamily: SANS, lineHeight: 1.65 }}>{e.bio}</p>

          <div className="grid grid-cols-3 gap-3" style={{ margin: "18px 0", fontFamily: SANS }}>
            {[["EXPERIENCIA", e.anios + " años"], ["CLIENTAS", e.atendidas.toLocaleString("es-CO")], ["CALIFICACIÓN", e.rating.toFixed(1)]].map(([k, v]) => (
              <div key={k}>
                <div style={{ color: T.mute, fontSize: 9, letterSpacing: "0.1em" }}>{k}</div>
                <div style={{ fontFamily: SERIF, fontSize: 19, color: T.tinta, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.1em", fontFamily: SANS, marginBottom: 8 }}>FORMACIÓN Y CERTIFICACIONES</div>
            {e.cert.map((c) => (
              <div key={c} className="flex gap-2" style={{ padding: "3px 0", alignItems: "flex-start" }}>
                <Award size={12} color={T.bronce} style={{ marginTop: 3, flexShrink: 0 }} />
                <span style={{ color: T.tinta, fontSize: 12, fontFamily: SANS }}>{c}</span>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.1em", fontFamily: SANS, marginBottom: 8 }}>PORTAFOLIO</div>
            <div className="flex gap-2" style={{ overflowX: "auto" }}>
              {mios.map((s) => (
                <div key={s.id} style={{ width: 96, flexShrink: 0 }}>
                  <div style={{ border: `1px solid ${T.linea}` }}><Retrato {...s.despues} src={s.foto} alto={110} sinMarco /></div>
                  <div style={{ color: T.mute, fontSize: 10, marginTop: 5, fontFamily: SANS, lineHeight: 1.3 }}>{s.n}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.1em", fontFamily: SANS, marginBottom: 10 }}>CALIFICACIONES</div>
            <div className="flex items-center gap-4" style={{ marginBottom: 12 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: SERIF, fontSize: 38, color: T.tinta, lineHeight: 1 }}>{e.rating.toFixed(1)}</div>
                <Estrellas v={e.rating} s={11} />
                <div style={{ color: T.mute, fontSize: 10, marginTop: 3, fontFamily: SANS }}>{e.resenas.length} reseñas</div>
              </div>
              <div className="flex-1">
                {dist.map((d) => (
                  <div key={d.n} className="flex items-center gap-2" style={{ marginBottom: 3 }}>
                    <span style={{ color: T.mute, fontSize: 10, width: 8, fontFamily: SANS }}>{d.n}</span>
                    <div style={{ flex: 1, height: 4, background: T.crema }}>
                      <div style={{ width: (d.c / total) * 100 + "%", height: "100%", background: T.bronce }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {e.resenas.length === 0 && (
              <div style={{ color: T.mute, fontSize: 12, fontFamily: SANS, paddingTop: 8, borderTop: `1px solid ${T.linea}` }}>
                Todavía no tiene reseñas. Es nueva en el atelier y Indiana respalda su trabajo.
              </div>
            )}
            {e.resenas.map((r, i) => (
              <div key={i} style={{ padding: "10px 0", borderTop: `1px solid ${T.linea}`, fontFamily: SANS }}>
                <div className="flex items-center justify-between">
                  <span style={{ color: T.tinta, fontSize: 12.5 }}>{r.n}</span>
                  <span style={{ color: T.mute, fontSize: 10 }}>{r.f}</span>
                </div>
                <div style={{ margin: "5px 0" }}><Estrellas v={r.e} s={10} /></div>
                <div style={{ color: T.mute, fontSize: 12, lineHeight: 1.55 }}>{r.t}</div>
              </div>
            ))}
          </div>

          <Boton onClick={onElegir}>{cta || `Agendar con ${e.n.split(" ")[0]}`}</Boton>
        </div>
      </div>
    </div>
  );
}

/* ═════════  PRUÉBATE LA MIRADA  ═════════ */
const OPC_PESTANAS = [
  { k: "corta", n: "Como están", id: null },
  { k: "lift", n: "Lash Lifting", id: 4 },
  { k: "clasica", n: "Clásicas", id: 5 },
  { k: "hibrida", n: "Híbridas", id: 6 },
  { k: "tecno", n: "Volumen tecnológico", id: 7 },
  { k: "ruso", n: "Volumen ruso", id: 8 },
];
const OPC_CEJAS = [
  { k: "rala", n: "Sin tocar", id: null },
  { k: "diseno", n: "Diseño y epilación", id: 1 },
  { k: "lamin", n: "Brow Lamination", id: 2 },
  { k: "sombreado", n: "Sombreado", id: 3 },
];
const TONOS = [["clara", "Clara"], ["media", "Media"], ["canela", "Canela"], ["morena", "Morena"], ["oscura", "Oscura"]];

function Probador({ servicios, ritual, setRitual, nombre, irAgendar }) {
  const [lash, setLash] = useState("ruso");
  const [brow, setBrow] = useState("lamin");
  const [tono, setTono] = useState("media");
  const [pelo, setPelo] = useState("chocolate");

  const elegidos = [OPC_PESTANAS.find((o) => o.k === lash)?.id, OPC_CEJAS.find((o) => o.k === brow)?.id]
    .filter(Boolean).map((id) => servicios.find((s) => s.id === id)).filter(Boolean);
  const totalCop = elegidos.reduce((a, s) => a + s.p, 0);
  const totalMin = elegidos.reduce((a, s) => a + s.d, 0) + Math.max(0, elegidos.length - 1) * 5;
  const yaEsta = elegidos.length > 0 && elegidos.every((s) => ritual.includes(s.id));

  const sorpresa = () => {
    setLash(OPC_PESTANAS[1 + Math.floor(Math.random() * 5)].k);
    setBrow(OPC_CEJAS[1 + Math.floor(Math.random() * 3)].k);
  };

  return (
    <div className="flex flex-col gap-4" style={{ paddingBottom: 12 }}>
      <div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 29, color: T.tinta, lineHeight: 1.1 }}>
          Pruébate la mirada
        </div>
        <p style={{ color: T.mute, fontSize: 12.5, marginTop: 8, fontFamily: SANS, lineHeight: 1.6, maxWidth: "42ch" }}>
          {nombre}, combina pestañas y cejas y mira cómo te queda antes de agendar. Cuando te guste, lo pasas a tu ritual.
        </p>
      </div>

      <div style={{ position: "relative", border: `1px solid ${T.linea}` }}>
        <div key={`${lash}${brow}${tono}${pelo}`} style={{ animation: "aparecer 420ms ease" }}>
          <RostroCompleto lash={lash} brow={brow} modelo={{ piel: tono, pelo }} alto={330} sinMarco />
        </div>
        <button onClick={sorpresa} className="flex items-center gap-1" style={{
          position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.94)",
          border: `1px solid ${T.linea}`, padding: "7px 11px", fontSize: 11, fontFamily: SANS,
          color: T.bronceOsc, cursor: "pointer", letterSpacing: "0.06em",
        }}>
          <Sparkles size={12} /> Sorpréndeme
        </button>
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(59,53,46,0.82)",
          color: "#FFF", padding: "9px 14px", fontFamily: SANS, fontSize: 11.5, letterSpacing: "0.04em",
        }}>
          {elegidos.length === 0 ? "Tu mirada tal como está hoy" : elegidos.map((s) => s.n).join(" + ")}
        </div>
      </div>

      {[["PESTAÑAS", OPC_PESTANAS, lash, setLash], ["CEJAS", OPC_CEJAS, brow, setBrow]].map(([titulo, opciones, valor, set]) => (
        <div key={titulo}>
          <div style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.12em", marginBottom: 8, fontFamily: SANS }}>{titulo}</div>
          <div className="flex gap-2" style={{ overflowX: "auto", paddingBottom: 2 }}>
            {opciones.map((o) => {
              const srv = o.id ? servicios.find((x) => x.id === o.id) : null;
              return (
                <button key={o.k} onClick={() => set(o.k)} style={{
                  flexShrink: 0, minWidth: 108, padding: "9px 11px", textAlign: "left", cursor: "pointer",
                  background: valor === o.k ? T.tinta : "#FFF", color: valor === o.k ? T.papel : T.tinta,
                  border: `1px solid ${valor === o.k ? T.tinta : T.linea}`, borderRadius: 2, fontFamily: SANS,
                }}>
                  <div style={{ fontSize: 11.5, lineHeight: 1.25 }}>{o.n}</div>
                  <div style={{ fontSize: 10, marginTop: 4, color: valor === o.k ? T.greige : T.mute }}>
                    {srv ? `${cop(srv.p)} · ${hm(srv.d)}` : "sin costo"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div>
        <div style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.12em", marginBottom: 8, fontFamily: SANS }}>TU TONO DE PIEL</div>
        <div className="flex gap-2">
          {TONOS.map(([k, n]) => (
            <button key={k} onClick={() => setTono(k)} title={n} style={{
              width: 34, height: 34, borderRadius: 999, cursor: "pointer",
              background: `linear-gradient(140deg, ${PIELES[k][0]}, ${PIELES[k][1]})`,
              border: `2px solid ${tono === k ? T.bronce : T.linea}`,
            }} />
          ))}
          <button onClick={() => setPelo(pelo === "chocolate" ? "rubio" : pelo === "rubio" ? "cobre" : pelo === "cobre" ? "negro" : "chocolate")}
            className="flex items-center gap-1 px-3" style={{
              border: `1px solid ${T.linea}`, background: "#FFF", color: T.mute, fontSize: 10.5, fontFamily: SANS, cursor: "pointer", borderRadius: 2,
            }}>
            cabello
          </button>
        </div>
      </div>

      {elegidos.length > 0 && (
        <Card style={{ borderColor: T.bronce }}>
          {elegidos.map((s) => (
            <div key={s.id} className="flex justify-between" style={{ padding: "5px 0", fontFamily: SANS }}>
              <span style={{ color: T.tinta, fontSize: 12.5 }}>{s.n}</span>
              <span style={{ color: T.mute, fontSize: 12 }}>{cop(s.p)}</span>
            </div>
          ))}
          <div className="flex justify-between items-baseline" style={{ paddingTop: 10, borderTop: `1px solid ${T.linea}`, marginTop: 6, fontFamily: SANS }}>
            <span style={{ color: T.mute, fontSize: 12 }}>{hm(totalMin)} en camilla</span>
            <span style={{ fontFamily: SERIF, fontSize: 25, color: T.bronceOsc }}>{cop(totalCop)}</span>
          </div>
          <div style={{ marginTop: 12 }}>
            {yaEsta
              ? <Boton tono="bronce" onClick={irAgendar}>Ya está en tu ritual · agendar</Boton>
              : <Boton onClick={() => setRitual(Array.from(new Set([...ritual, ...elegidos.map((s) => s.id)])))}>
                Pasar este look a mi ritual
              </Boton>}
          </div>
        </Card>
      )}
    </div>
  );
}

function MiMirada({ nombre }) {
  const [calif, setCalif] = useState(0);
  const medidas = [["Inicio de ceja", "1,2 cm del eje central"], ["Punto más alto", "sobre el limbo externo"], ["Cola", "línea nariz – canto externo"], ["Grosor de cuerpo", "7 mm"], ["Corrección", "asimetría de 2 mm en la izquierda"]];
  return (
    <div className="flex flex-col gap-4">
      <Card style={{ borderColor: T.bronce }}>
        <div style={{ color: T.tinta, fontSize: 13, fontFamily: SANS }}>¿Cómo te fue con tu última cita?</div>
        <div style={{ color: T.mute, fontSize: 11.5, marginTop: 3, fontFamily: SANS }}>Brow Lamination con Mariana, 25 de agosto</div>
        <div className="flex gap-1" style={{ marginTop: 10 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} onClick={() => setCalif(i)} style={{ background: "none", border: "none", padding: 2, cursor: "pointer" }}>
              <Star size={26} fill={i <= calif ? T.bronce : "none"} color={T.bronce} strokeWidth={1.3} />
            </button>
          ))}
        </div>
        {calif > 0 && <div style={{ color: T.ok, fontSize: 11.5, marginTop: 8, fontFamily: SANS }}>Gracias. Tu calificación entra al perfil de Mariana.</div>}
      </Card>

      <Titulo sub={`El mapa de ${nombre}. Cualquier especialista puede replicarlo.`}>Tu diseño</Titulo>
      <Card style={{ padding: 0 }}>
        <div style={{ background: T.crema, padding: "10px 0" }}>
          <svg viewBox="0 0 320 120" style={{ width: "100%", height: 130 }}>
            <path d="M42 84 Q 88 48 150 62" stroke={T.tinta} strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M278 84 Q 232 48 170 62" stroke={T.tinta} strokeWidth="6" fill="none" strokeLinecap="round" />
            <line x1="160" y1="14" x2="160" y2="110" stroke={T.bronce} strokeWidth="1" strokeDasharray="4 4" />
            <line x1="42" y1="84" x2="42" y2="110" stroke={T.bronce} strokeWidth="1" strokeDasharray="4 4" />
            <line x1="96" y1="53" x2="96" y2="110" stroke={T.bronce} strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="96" cy="53" r="3.5" fill={T.bronce} /><circle cx="224" cy="53" r="3.5" fill={T.bronce} />
          </svg>
        </div>
        <div style={{ padding: 14 }}>
          {medidas.map(([k, v]) => (
            <div key={k} className="flex justify-between" style={{ padding: "6px 0", fontFamily: SANS }}>
              <span style={{ color: T.mute, fontSize: 12 }}>{k}</span><span style={{ color: T.tinta, fontSize: 12 }}>{v}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div className="flex justify-between" style={{ fontSize: 11.5, color: T.mute, marginBottom: 8, fontFamily: SANS }}>
          <span>Brow Lamination · día 21 de 45</span><span style={{ color: T.bronceOsc }}>Retoque del 4 al 9 de octubre</span>
        </div>
        <div style={{ height: 5, background: T.crema }}><div style={{ width: "47%", height: "100%", background: T.bronce }} /></div>
        <div style={{ color: T.mute, fontSize: 11.5, marginTop: 12, fontFamily: SANS, lineHeight: 1.5 }}>
          Hoy toca aceite nocturno y cepillado hacia arriba. Llevas 18 de 21 días cumplidos.
        </div>
      </Card>
    </div>
  );
}

/* ═════════  LA TIENDA  ═════════ */
/* Qué producto acompaña a cada familia de servicio */
const ACOMPANA = { "Pestañas": [2, 1, 5], "Cejas": [3, 4], "Semipermanente": [4, 3], "Uñas": [], "Spa": [], "Peluquería": [], "Maquillaje": [], "Barbería": [], "Cuerpo": [], "Capacitaciones": [] };
const JUNTOS = { 1: [2], 2: [5], 3: [4], 4: [3], 5: [2], 6: [3], 7: [1] };

function Tienda({ productos, servicios = [], ritual = [], bolsa = {}, setBolsa, sumarBolsa }) {
  const [cat, setCat] = useState("Todo");
  const [abierto, setAbierto] = useState(null);
  const [vista, setVista] = useState("catalogo");
  const [metodo, setMetodo] = useState("nequi");
  const [ref, setRef] = useState(null);

  const lista = cat === "Todo" ? productos : productos.filter((p) => p.cat === cat);
  const items = Object.entries(bolsa).map(([id, q]) => ({ ...productos.find((p) => p.id === +id), q })).filter((x) => x.id);
  const unidades = items.reduce((a, x) => a + x.q, 0);
  const sub = items.reduce((a, x) => a + x.p * x.q, 0);
  const envio = sub === 0 || sub >= ENVIO_GRATIS ? 0 : ENVIO;
  const total = sub + envio;
  const falta = Math.max(0, ENVIO_GRATIS - sub);

  // Lo que le corresponde por lo que ya tiene agendado
  const sugeridos = useMemo(() => {
    const cats = servicios.filter((x) => ritual.includes(x.id)).map((x) => x.cat);
    const ids = cats.flatMap((c) => ACOMPANA[c] || []);
    return Array.from(new Set(ids)).map((id) => productos.find((p) => p.id === id)).filter(Boolean).slice(0, 3);
  }, [ritual, servicios, productos]);

  useEffect(() => {
    if (vista !== "procesando") return;
    const t = setTimeout(() => { setRef("AOL-T" + Math.random().toString(36).slice(2, 5).toUpperCase()); setVista("listo"); }, 1600);
    return () => clearTimeout(t);
  }, [vista]);

  if (vista === "procesando") {
    return (
      <div style={{ textAlign: "center", paddingTop: 70 }}>
        <div style={{ display: "inline-block", animation: "giro 1.1s linear infinite" }}><Loader size={30} color={T.bronce} /></div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 24, color: T.tinta, marginTop: 18 }}>Procesando tu pago</div>
        <div style={{ color: T.mute, fontSize: 12, marginTop: 8, fontFamily: SANS }}>{PASARELA[metodo].n} · {cop(total)}</div>
        <style>{`@keyframes giro{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (vista === "listo") {
    const texto = `Hola Indiana. Compré en la tienda de la app.\n\nPedido: ${ref}\n${items.map((x) => `• ${x.q} × ${x.n}`).join("\n")}\n\nTotal: ${cop(total)} por ${PASARELA[metodo].n}`;
    return (
      <div className="flex flex-col gap-4" style={{ textAlign: "center", paddingTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "center" }}><Monograma s={56} /></div>
        <div>
          <h2 style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 27, color: T.tinta, margin: "0 0 6px" }}>Pedido confirmado</h2>
          <p style={{ color: T.mute, fontSize: 12.5, fontFamily: SANS, lineHeight: 1.6 }}>
            Llega en 24 a 48 horas hábiles en Bogotá, o lo recoges en el atelier cuando vengas.
          </p>
        </div>
        <Card style={{ textAlign: "left", borderColor: T.bronce }}>
          <div className="flex items-center justify-between" style={{ paddingBottom: 10, borderBottom: `1px solid ${T.linea}` }}>
            <span style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.14em", fontFamily: SANS }}>PEDIDO</span>
            <span style={{ fontFamily: SERIF, fontSize: 21, color: T.bronceOsc }}>{ref}</span>
          </div>
          {items.map((x) => (
            <div key={x.id} className="flex justify-between" style={{ padding: "6px 0", fontFamily: SANS }}>
              <span style={{ color: T.tinta, fontSize: 12.5 }}>{x.q} × {x.n}</span>
              <span style={{ color: T.mute, fontSize: 12 }}>{cop(x.p * x.q)}</span>
            </div>
          ))}
          <div className="flex justify-between" style={{ paddingTop: 10, borderTop: `1px solid ${T.linea}`, marginTop: 6, fontFamily: SANS }}>
            <span style={{ color: T.tinta, fontSize: 13 }}>Pagado</span>
            <span style={{ fontFamily: SERIF, fontSize: 22, color: T.bronceOsc }}>{cop(total)}</span>
          </div>
        </Card>
        <a href={waLink(texto)} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
          <Boton tono="verde">Enviarle el pedido a Indiana</Boton>
        </a>
        <Boton onClick={() => { setBolsa({}); setVista("catalogo"); }}>Seguir mirando</Boton>
      </div>
    );
  }

  if (vista === "carrito" || vista === "pago") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setVista(vista === "pago" ? "carrito" : "catalogo")} style={{ background: "none", border: "none", color: T.mute, padding: 0, display: "flex", cursor: "pointer" }}>
            <ChevronLeft size={17} />
          </button>
          <span style={{ fontFamily: SANS, fontSize: 9.5, letterSpacing: "0.22em", color: T.mute }}>
            {vista === "pago" ? "PAGO" : "TU BOLSA"}
          </span>
        </div>

        {items.map((x) => (
          <div key={x.id} className="flex gap-3" style={{ borderBottom: `1px solid ${T.linea}`, paddingBottom: 14 }}>
            <div style={{ width: 74, flexShrink: 0, border: `1px solid ${T.linea}` }}>
              <Frasco tipo={x.frasco} src={x.foto} alto={88} />
            </div>
            <div className="flex-1" style={{ minWidth: 0, fontFamily: SANS }}>
              <div style={{ fontFamily: SERIF, fontSize: 17, color: T.tinta, lineHeight: 1.15 }}>{x.n}</div>
              <div style={{ color: T.mute, fontSize: 10.5, marginTop: 3 }}>{x.formato}</div>
              <div className="flex items-center justify-between" style={{ marginTop: 10 }}>
                {vista === "carrito" ? (
                  <div className="flex items-center" style={{ border: `1px solid ${T.linea}` }}>
                    <button onClick={() => sumarBolsa(x.id, -1)} style={{ width: 28, height: 28, background: "none", border: "none", color: T.tinta, cursor: "pointer", fontSize: 15 }}>−</button>
                    <span style={{ width: 24, textAlign: "center", fontSize: 12.5, color: T.tinta }}>{x.q}</span>
                    <button onClick={() => sumarBolsa(x.id, 1)} style={{ width: 28, height: 28, background: "none", border: "none", color: T.tinta, cursor: "pointer", fontSize: 15 }}>+</button>
                  </div>
                ) : <span style={{ color: T.mute, fontSize: 12 }}>{x.q} unidad{x.q > 1 ? "es" : ""}</span>}
                <span style={{ fontFamily: SERIF, fontSize: 17, color: T.bronceOsc }}>{cop(x.p * x.q)}</span>
              </div>
            </div>
          </div>
        ))}

        {vista === "carrito" && falta > 0 && (
          <Card style={{ background: T.crema }}>
            <div style={{ fontFamily: SANS, fontSize: 11.5, color: T.tinta, marginBottom: 8 }}>
              Te faltan {cop(falta)} para el envío gratis.
            </div>
            <div style={{ height: 4, background: "#FFF" }}>
              <div style={{ width: Math.round((sub / ENVIO_GRATIS) * 100) + "%", height: "100%", background: T.bronce, transition: "width 400ms ease" }} />
            </div>
          </Card>
        )}

        <Card>
          {[["Productos", cop(sub)], ["Envío", envio === 0 ? "Gratis" : cop(envio)]].map(([k, v]) => (
            <div key={k} className="flex justify-between" style={{ padding: "4px 0", fontFamily: SANS }}>
              <span style={{ color: T.mute, fontSize: 12 }}>{k}</span>
              <span style={{ color: envio === 0 && k === "Envío" ? T.ok : T.tinta, fontSize: 12 }}>{v}</span>
            </div>
          ))}
          <div className="flex justify-between items-baseline" style={{ paddingTop: 10, borderTop: `1px solid ${T.linea}`, marginTop: 8, fontFamily: SANS }}>
            <span style={{ color: T.tinta, fontSize: 13 }}>Total</span>
            <span style={{ fontFamily: SERIF, fontSize: 26, color: T.bronceOsc }}>{cop(total)}</span>
          </div>
        </Card>

        {vista === "pago" && (
          <div>
            <div style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.14em", marginBottom: 8, fontFamily: SANS }}>CÓMO PAGAS</div>
            <div className="flex flex-col gap-2">
              {Object.entries(PASARELA).map(([k, m]) => (
                <button key={k} onClick={() => setMetodo(k)} className="flex items-center gap-3 p-3" style={{
                  background: "#FFF", border: `1px solid ${metodo === k ? T.bronce : T.linea}`, cursor: "pointer", textAlign: "left",
                }}>
                  <span style={{ width: 30, height: 30, background: metodo === k ? T.bronce : T.crema, color: metodo === k ? "#FFF" : T.bronceOsc, display: "grid", placeItems: "center", fontFamily: SERIF, fontSize: 15, flexShrink: 0 }}>{m.icono}</span>
                  <span className="flex-1" style={{ color: T.tinta, fontSize: 12.5, fontFamily: SANS }}>
                    {k === "efectivo" ? "Pago al recoger en el atelier" : m.n}
                  </span>
                  {metodo === k && <Check size={15} color={T.bronce} />}
                </button>
              ))}
            </div>
          </div>
        )}

        <Boton tono={vista === "pago" ? "bronce" : "tinta"}
          onClick={() => (vista === "carrito" ? setVista("pago") : setVista(metodo === "efectivo" ? "listo" : "procesando"))}>
          {vista === "carrito" ? `CONTINUAR · ${cop(total)}` : metodo === "efectivo" ? "CONFIRMAR PEDIDO" : `PAGAR ${cop(total)}`}
        </Boton>
      </div>
    );
  }

  const Tarjeta = ({ p, ancho }) => (
    <div style={{ position: "relative", width: ancho, flexShrink: ancho ? 0 : 1 }}>
      <div onClick={() => setAbierto(p)} style={{ cursor: "pointer", border: `1px solid ${T.linea}` }}>
        <Frasco tipo={p.frasco} src={p.foto} alto={ancho ? 176 : 230} />
      </div>
      {p.stock <= 10 && (
        <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(181,113,79,0.9)", color: "#FFF", fontSize: 8, letterSpacing: "0.14em", padding: "4px 8px", fontFamily: SANS }}>
          QUEDAN {p.stock}
        </span>
      )}
      <button onClick={() => sumarBolsa(p.id, 1)} style={{
        position: "absolute", top: 8, right: 8, width: 32, height: 32, borderRadius: 999,
        background: bolsa[p.id] ? T.bronce : "rgba(255,255,255,0.94)",
        border: `1px solid ${bolsa[p.id] ? T.bronce : T.linea}`,
        color: bolsa[p.id] ? "#FFF" : T.tinta, display: "grid", placeItems: "center",
        cursor: "pointer", fontFamily: SANS, fontSize: 12.5,
      }}>{bolsa[p.id] ? bolsa[p.id] : <Plus size={16} />}</button>
      <div style={{ fontFamily: SANS, marginTop: 10 }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: ancho ? 16 : 20, color: T.tinta, lineHeight: 1.1 }}>{p.n}</div>
        {!ancho && <p style={{ fontSize: 12, color: T.mute, marginTop: 6, lineHeight: 1.55, maxWidth: "40ch" }}>{p.promesa}</p>}
        <div className="flex items-baseline justify-between" style={{ marginTop: 7 }}>
          <span style={{ fontFamily: SERIF, fontSize: ancho ? 15 : 19, color: T.bronceOsc }}>{cop(p.p)}</span>
          <span style={{ fontSize: 9, letterSpacing: "0.12em", color: T.greige }}>{p.formato.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ paddingBottom: unidades ? 96 : 20 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ height: 230, background: `radial-gradient(130% 100% at 50% 18%, #FFFFFF 0%, ${T.crema} 58%, ${T.greige}66 100%)`, display: "flex", alignItems: "center" }}>
          {["gotero", "tubo", "bomba"].map((t, i) => (
            <div key={t} style={{ width: "34%", transform: i === 1 ? "translateY(10px)" : "none" }}>
              <Frasco tipo={t} alto={195} fondo="transparent" />
            </div>
          ))}
        </div>
        <div style={{ paddingTop: 16 }}>
          <div style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.28em", color: T.bronceOsc }}>LA TIENDA</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 32, color: T.tinta, marginTop: 8, lineHeight: 1.05 }}>
            El cuidado<br />en casa
          </div>
          <p style={{ fontFamily: SANS, fontSize: 12.5, color: T.mute, marginTop: 10, lineHeight: 1.7, maxWidth: "42ch" }}>
            Siete piezas. Las mismas que usamos en camilla. Nada más, porque nada más hace falta.
          </p>
          <div className="flex gap-4" style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.linea}` }}>
            {[["ENVÍO GRATIS", "desde " + copK(ENVIO_GRATIS)], ["ENTREGA", "24 a 48 horas"], ["O RECÓGELO", "en el atelier"]].map(([k, v]) => (
              <div key={k} style={{ flex: 1, fontFamily: SANS }}>
                <div style={{ fontSize: 8, letterSpacing: "0.14em", color: T.bronceOsc }}>{k}</div>
                <div style={{ fontSize: 11, color: T.mute, marginTop: 4, lineHeight: 1.35 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {sugeridos.length > 0 && (
        <div style={{ background: T.crema, padding: "18px 16px", marginBottom: 22 }}>
          <div style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.2em", color: T.bronceOsc }}>PARA LO QUE VAS A AGENDAR</div>
          <p style={{ fontFamily: SANS, fontSize: 12, color: T.tinta, marginTop: 6, marginBottom: 14, lineHeight: 1.6 }}>
            Sin esto el resultado te dura la mitad. Lo decimos en cabina y lo repetimos aquí.
          </p>
          <div className="flex gap-3" style={{ overflowX: "auto", paddingBottom: 4 }}>
            {sugeridos.map((p) => <Tarjeta key={p.id} p={p} ancho={132} />)}
          </div>
        </div>
      )}

      <div className="flex gap-2" style={{
        overflowX: "auto", position: "sticky", top: 0, zIndex: 20,
        background: T.papel, paddingTop: 6, paddingBottom: 12, marginBottom: 10,
      }}>
        {CATS_TIENDA.map((c) => (
          <button key={c} onClick={() => setCat(c)} style={{
            flexShrink: 0, padding: "8px 14px", cursor: "pointer", fontFamily: SANS, fontSize: 10, letterSpacing: "0.14em",
            background: cat === c ? T.tinta : "transparent", color: cat === c ? T.papel : T.mute,
            border: `1px solid ${cat === c ? T.tinta : T.linea}`, borderRadius: 999,
          }}>{c.toUpperCase()}</button>
        ))}
      </div>

      <div className="flex flex-col" style={{ gap: 28 }}>
        {lista.map((p) => <Tarjeta key={p.id} p={p} />)}
      </div>

      {abierto && (
        <div onClick={() => setAbierto(null)} style={{ position: "fixed", inset: 0, background: "rgba(59,53,46,0.55)", zIndex: 60, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#FFF", width: "100%", maxWidth: 480, maxHeight: "92vh", overflowY: "auto" }}>
            <div style={{ position: "relative" }}>
              <Frasco tipo={abierto.frasco} src={abierto.foto} alto={320} />
              <button onClick={() => setAbierto(null)} style={{
                position: "absolute", top: 14, right: 14, width: 32, height: 32, borderRadius: 999,
                background: "rgba(255,255,255,0.94)", border: "none", display: "grid", placeItems: "center", cursor: "pointer",
              }}><X size={15} color={T.tinta} /></button>
            </div>
            <div style={{ padding: 22 }}>
              <div style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.26em", color: T.bronceOsc }}>{abierto.cat.toUpperCase()}</div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 28, color: T.tinta, marginTop: 8, lineHeight: 1.08 }}>{abierto.n}</div>
              <p style={{ color: T.tinta, fontSize: 13.5, marginTop: 14, fontFamily: SANS, lineHeight: 1.7 }}>{abierto.promesa}</p>
              <p style={{ color: T.mute, fontSize: 12.5, marginTop: 8, fontFamily: SANS, lineHeight: 1.65 }}>{abierto.desc}</p>

              <div style={{ background: T.crema, padding: 14, marginTop: 16 }}>
                <div style={{ color: T.mute, fontSize: 9, letterSpacing: "0.16em", fontFamily: SANS }}>CÓMO SE USA</div>
                <div style={{ color: T.tinta, fontSize: 12.5, marginTop: 6, fontFamily: SANS, lineHeight: 1.6 }}>{abierto.uso}</div>
              </div>

              <div className="flex items-baseline justify-between" style={{ margin: "20px 0 12px" }}>
                <span style={{ fontFamily: SANS, fontSize: 10.5, color: T.mute, letterSpacing: "0.1em" }}>{abierto.formato.toUpperCase()}</span>
                <span style={{ fontFamily: SERIF, fontSize: 26, color: T.bronceOsc }}>{cop(abierto.p)}</span>
              </div>

              {bolsa[abierto.id] ? (
                <div className="flex items-center justify-between" style={{ border: `1px solid ${T.bronce}`, padding: "10px 14px" }}>
                  <span style={{ fontFamily: SANS, fontSize: 12, color: T.tinta }}>En tu bolsa</span>
                  <div className="flex items-center" style={{ border: `1px solid ${T.linea}` }}>
                    <button onClick={() => sumarBolsa(abierto.id, -1)} style={{ width: 32, height: 32, background: "none", border: "none", color: T.tinta, cursor: "pointer", fontSize: 16 }}>−</button>
                    <span style={{ width: 28, textAlign: "center", fontSize: 13, color: T.tinta, fontFamily: SANS }}>{bolsa[abierto.id]}</span>
                    <button onClick={() => sumarBolsa(abierto.id, 1)} style={{ width: 32, height: 32, background: "none", border: "none", color: T.tinta, cursor: "pointer", fontSize: 16 }}>+</button>
                  </div>
                </div>
              ) : (
                <Boton onClick={() => sumarBolsa(abierto.id, 1)}>AGREGAR A LA BOLSA</Boton>
              )}

              {(JUNTOS[abierto.id] || []).length > 0 && (
                <div style={{ marginTop: 22 }}>
                  <Rotulo>SE USA CON</Rotulo>
                  <div className="flex gap-3" style={{ overflowX: "auto" }}>
                    {(JUNTOS[abierto.id] || []).map((id) => {
                      const q = productos.find((x) => x.id === id);
                      if (!q) return null;
                      return (
                        <div key={id} style={{ flexShrink: 0, width: 116 }}>
                          <div onClick={() => setAbierto(q)} style={{ border: `1px solid ${T.linea}`, cursor: "pointer" }}>
                            <Frasco tipo={q.frasco} src={q.foto} alto={130} />
                          </div>
                          <div style={{ fontFamily: SANS, fontSize: 11, color: T.tinta, marginTop: 6, lineHeight: 1.3 }}>{q.n}</div>
                          <div className="flex items-center justify-between" style={{ marginTop: 4 }}>
                            <span style={{ fontFamily: SERIF, fontSize: 13, color: T.bronceOsc }}>{cop(q.p)}</span>
                            <button onClick={() => sumarBolsa(q.id, 1)} style={{
                              width: 24, height: 24, borderRadius: 999, background: "#FFF",
                              border: `1px solid ${T.linea}`, color: T.tinta, display: "grid", placeItems: "center", cursor: "pointer",
                            }}><Plus size={12} /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {unidades > 0 && !abierto && (
        <div style={{
          position: "fixed", bottom: 74, left: "50%", transform: "translateX(-50%)",
          width: "calc(100% - 32px)", maxWidth: 448, background: T.tinta, color: T.papel,
          zIndex: 40, boxShadow: "0 8px 26px rgba(0,0,0,0.2)",
        }}>
          <div style={{ height: 3, background: "rgba(255,255,255,0.16)" }}>
            <div style={{ width: Math.min(100, Math.round((sub / ENVIO_GRATIS) * 100)) + "%", height: "100%", background: envio === 0 ? T.ok : T.bronce, transition: "width 400ms ease" }} />
          </div>
          <div className="flex items-center justify-between gap-3" style={{ padding: "12px 16px" }}>
            <div style={{ fontFamily: SANS, minWidth: 0 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.16em", color: envio === 0 ? T.ok : T.greige }}>
                {envio === 0 ? "ENVÍO GRATIS CONSEGUIDO" : `TE FALTAN ${copK(falta).toUpperCase()}`}
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 22, marginTop: 2 }}>{cop(total)}</div>
            </div>
            <button onClick={() => setVista("carrito")} style={{
              background: "transparent", color: "#FFF", border: `1px solid ${T.greige}`, padding: "9px 16px",
              fontSize: 10, letterSpacing: "0.18em", fontFamily: SANS, cursor: "pointer", flexShrink: 0,
            }}>VER LA BOLSA · {unidades}</button>
          </div>
        </div>
      )}
    </div>
  );
}

const CLUB_NOMBRE = "Le Cercle";
const CLUB_LEMA = "Club de las Más Bellas";
const CLUB = [
  { id: "nacar", n: "Nácar", p: 99000, b: ["1 diseño y epilación de cejas al mes", "10% en la tienda", "Reservas 48 horas antes que el público"] },
  { id: "ambar", n: "Ámbar", p: 189000, b: ["1 diseño + 1 lamination al mes", "18% en la tienda", "Retoque de emergencia sin costo", "2 talleres del atelier al año"] },
  { id: "obsidiana", n: "Obsidiana", p: 389000, b: ["Servicios de cejas ilimitados", "1 servicio de pestañas al mes", "25% en la tienda", "Agenda privada con Indiana", "Invitación a todos los talleres", "Tu frasco de sérum repuesto cada dos meses"] },
];
function Club() {
  const [sel, setSel] = useState("lienzo");
  return (
    <div className="flex flex-col gap-4">
      <div style={{ background: T.crema, border: `1px solid ${T.linea}`, padding: "28px 20px", textAlign: "center" }}>
        <Monograma s={52} />
        <h1 style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 40, color: T.tinta, margin: "10px 0 0", fontWeight: 400 }}>{CLUB_NOMBRE}</h1>
        <div style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.28em", color: T.bronceOsc, marginTop: 10 }}>{CLUB_LEMA.toUpperCase()}</div>
        <p style={{ color: T.mute, fontSize: 12.5, margin: "14px auto 0", maxWidth: "34ch", fontFamily: SANS, lineHeight: 1.7 }}>
          Doscientas socias. Ni una más. Tu mirada atendida todo el año y un asiento en los talleres del atelier.
        </p>
      </div>
      {CLUB.map((c) => (
        <Card key={c.id} onClick={() => setSel(c.id)} style={{ cursor: "pointer", borderColor: sel === c.id ? T.bronce : T.linea }}>
          <div className="flex items-baseline justify-between">
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 23, color: T.tinta }}>{c.n}</span>
            <span style={{ color: T.tinta, fontSize: 13, fontFamily: SANS }}>{cop(c.p)} <span style={{ color: T.mute, fontSize: 11 }}>/ mes</span></span>
          </div>
          <div style={{ marginTop: 10 }}>
            {c.b.map((b) => (
              <div key={b} className="flex gap-2" style={{ padding: "3px 0", alignItems: "flex-start" }}>
                <Check size={12} color={T.bronce} style={{ marginTop: 3, flexShrink: 0 }} />
                <span style={{ color: T.mute, fontSize: 12, fontFamily: SANS }}>{b}</span>
              </div>
            ))}
          </div>
          {sel === c.id && (
            <div style={{ marginTop: 12 }}>
              <a href={waLink(`Hola Indiana, quiero unirme a ${CLUB_NOMBRE}, nivel ${c.n} (${cop(c.p)} al mes).`)} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <Boton tono="bronce">Unirme a {c.n}</Boton>
              </a>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

/* ═══════════  PROFESIONAL  ═══════════ */
const PROFESIONES = [
  { k: "lash", n: "Lash artist", d: "Extensiones y lifting de pestañas" },
  { k: "brow", n: "Brow artist", d: "Diseño, epilación y lamination" },
  { k: "micro", n: "Micropigmentadora", d: "Sombreado, nanoblading, corrección" },
  { k: "cosme", n: "Cosmetóloga", d: "Facial, limpieza y cuidado de piel" },
  { k: "depil", n: "Especialista en depilación", d: "Cera e hilo, corporal y facial" },
  { k: "maquilla", n: "Maquilladora", d: "Social, novias y producción" },
  { k: "unas", n: "Manicurista y nail artist", d: "Semipermanente, esculpidas y arte" },
  { k: "spa", n: "Masajista", d: "Relajante, descontracturante y capilar" },
  { k: "cabina", n: "Auxiliar de cabina", d: "Apoyo, bioseguridad y agenda" },
];

function Profesional({ addPostulacion, postulaciones, estilistas }) {
  const vacio = { n: "", cel: "", ciudad: "", anios: "", cert: "", servicios: "", portafolio: "" };
  const [f, setF] = useState(vacio);
  const [prof, setProf] = useState(null);
  const [verPerfil, setVerPerfil] = useState(null);
  const [enviada, setEnviada] = useState(null);
  const listo = prof && f.n && f.cel.replace(/\D/g, "").length === 10 && f.servicios;

  if (enviada) {
    const p = postulaciones.find((x) => x.id === enviada);
    return (
      <div style={{ textAlign: "center", paddingTop: 24 }}>
        <Monograma s={58} />
        <h2 style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 26, color: T.tinta, margin: "14px 0 6px" }}>Quedaste postulada</h2>
        <p style={{ color: T.mute, fontSize: 13, fontFamily: SANS, maxWidth: "38ch", margin: "0 auto", lineHeight: 1.6 }}>
          {p?.n.split(" ")[0]}, Indiana revisa cada hoja de vida personalmente. Si tu perfil encaja, te escribe y te abrimos agenda pública con tu propio perfil y reseñas.
        </p>
        <Card style={{ marginTop: 20, textAlign: "left" }}>
          <div className="flex items-center gap-2" style={{ fontFamily: SANS }}>
            <Clock size={14} color={T.bronce} />
            <span style={{ color: T.tinta, fontSize: 12.5 }}>{p?.profesion} · en revisión</span>
          </div>
        </Card>
        <div style={{ marginTop: 14 }}>
          <a href={waLink(`Hola Indiana, acabo de postularme por la plataforma como ${p?.profesion}. Soy ${p?.n}.`)} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <Boton tono="verde">Avisarle a Indiana</Boton>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div style={{ background: T.tinta, color: T.papel, padding: "24px 20px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.24em", color: T.greige, fontFamily: SANS }}>TRABAJA CON NOSOTRAS</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 28, marginTop: 8, lineHeight: 1.1 }}>Trae tu talento<br />y tu agenda</div>
        <p style={{ color: T.greige, fontSize: 12.5, marginTop: 10, fontFamily: SANS, lineHeight: 1.6, maxWidth: "40ch" }}>
          Escoge tu profesión, mira con quiénes vas a trabajar y postúlate de una. Al aprobarte abrimos tu agenda pública, camilla y perfil con reseñas.
        </p>
      </div>

      {/* 1 · Lista de profesiones */}
      <div>
        <div style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.12em", fontFamily: SANS, marginBottom: 8 }}>1 · TU PROFESIÓN</div>
        <div className="grid grid-cols-2 gap-2">
          {PROFESIONES.map((x) => (
            <button key={x.k} onClick={() => setProf(x)} style={{
              textAlign: "left", padding: "11px 12px", cursor: "pointer", borderRadius: 2, fontFamily: SANS,
              background: prof?.k === x.k ? T.tinta : "#FFF", color: prof?.k === x.k ? T.papel : T.tinta,
              border: `1px solid ${prof?.k === x.k ? T.tinta : T.linea}`,
            }}>
              <div style={{ fontSize: 12.5, lineHeight: 1.25 }}>{x.n}</div>
              <div style={{ fontSize: 10, marginTop: 4, color: prof?.k === x.k ? T.greige : T.mute, lineHeight: 1.35 }}>{x.d}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 2 · Lista de especialistas */}
      <div>
        <div style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.12em", fontFamily: SANS, marginBottom: 8 }}>2 · EL EQUIPO HOY</div>
        <div className="flex flex-col gap-2">
          {estilistas.map((e) => (
            <Card key={e.id} style={{ padding: 11, cursor: "pointer" }} onClick={() => setVerPerfil(e)}>
              <div className="flex items-center gap-3">
                <div style={{ width: 40, flexShrink: 0, border: `1px solid ${T.linea}` }}>
                  <RetratoPersona p={e.retrato} src={e.foto} alto={48} />
                </div>
                <div className="flex-1" style={{ minWidth: 0, fontFamily: SANS }}>
                  <div style={{ color: T.tinta, fontSize: 12.5 }}>{e.n}</div>
                  <div style={{ color: T.mute, fontSize: 10.5, marginTop: 2 }}>{e.rol} · {e.anios} años</div>
                  <div className="flex items-center gap-1" style={{ marginTop: 4 }}>
                    <Estrellas v={e.rating} s={9} />
                    <span style={{ color: T.mute, fontSize: 10 }}>{e.rating.toFixed(1)} · {e.resenas.length} reseñas</span>
                  </div>
                </div>
                <ChevronRight size={15} color={T.greige} style={{ flexShrink: 0 }} />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 3 · Hoja de vida */}
      <div>
        <div style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.12em", fontFamily: SANS, marginBottom: 8 }}>3 · TU HOJA DE VIDA</div>
        <Card>
          <Input label="NOMBRE COMPLETO" value={f.n} onChange={(e) => setF({ ...f, n: e.target.value })} placeholder="Laura Katherine Pineda" />
          <div className="grid grid-cols-2 gap-2">
            <Input label="CELULAR" type="tel" inputMode="numeric" maxLength={12} value={f.cel} onChange={(e) => setF({ ...f, cel: e.target.value })} placeholder="300 000 0000" />
            <Input label="CIUDAD" value={f.ciudad} onChange={(e) => setF({ ...f, ciudad: e.target.value })} placeholder="Bogotá" />
          </div>
          <Input label="AÑOS DE EXPERIENCIA" type="number" value={f.anios} onChange={(e) => setF({ ...f, anios: e.target.value })} placeholder="5" />
          <Input label="FORMACIÓN Y CERTIFICACIONES" area value={f.cert} onChange={(e) => setF({ ...f, cert: e.target.value })} placeholder="Técnica en cosmetología SENA. Certificada en volumen ruso por…" />
          <Input label="SERVICIOS QUE DOMINAS" area value={f.servicios} onChange={(e) => setF({ ...f, servicios: e.target.value })} placeholder="Volumen ruso, híbridas, lash lifting, cejas en hilo" />
          <Input label="PORTAFOLIO (INSTAGRAM O ENLACE)" value={f.portafolio} onChange={(e) => setF({ ...f, portafolio: e.target.value })} placeholder="@tucuenta" />
        </Card>
      </div>

      {/* Reseña de la hoja de vida antes de enviar */}
      {(prof || f.n) && (
        <div>
          <div style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.12em", fontFamily: SANS, marginBottom: 8 }}>ASÍ LA VA A VER INDIANA</div>
          <Card style={{ borderColor: T.bronce }}>
            <div className="flex items-start gap-3">
              <div style={{ width: 48, flexShrink: 0, border: `1px solid ${T.linea}` }}>
                <RetratoPersona p={{ id: "prev", piel: "media", pelo: "chocolate", masa: "suelto", flequillo: "lado" }} alto={58} />
              </div>
              <div style={{ fontFamily: SANS, minWidth: 0 }}>
                <div style={{ fontFamily: SERIF, fontSize: 19, color: T.tinta, lineHeight: 1.15 }}>{f.n || "Tu nombre"}</div>
                <div style={{ color: T.bronceOsc, fontSize: 9.5, letterSpacing: "0.14em", marginTop: 4 }}>
                  {(prof?.n || "SIN PROFESIÓN").toUpperCase()}
                </div>
                <div style={{ color: T.mute, fontSize: 11, marginTop: 4 }}>
                  {f.ciudad || "ciudad"} · {f.anios || 0} años · {fmtCel(f.cel.replace(/\D/g, "")) || "celular"}
                </div>
              </div>
            </div>
            {f.servicios && (
              <div style={{ marginTop: 12, fontFamily: SANS }}>
                <div style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.1em" }}>SERVICIOS QUE DOMINA</div>
                <div style={{ color: T.tinta, fontSize: 12.5, marginTop: 3, lineHeight: 1.5 }}>{f.servicios}</div>
              </div>
            )}
            {f.cert && (
              <div style={{ marginTop: 10, fontFamily: SANS }}>
                <div style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.1em" }}>FORMACIÓN</div>
                <div style={{ color: T.tinta, fontSize: 12.5, marginTop: 3, lineHeight: 1.5 }}>{f.cert}</div>
              </div>
            )}
            {f.portafolio && (
              <div className="flex items-center gap-2" style={{ marginTop: 10, color: T.bronceOsc, fontSize: 12, fontFamily: SANS }}>
                <FileText size={13} /> {f.portafolio}
              </div>
            )}
            {!listo && (
              <div style={{ color: T.alerta, fontSize: 11, marginTop: 12, fontFamily: SANS }}>
                Faltan: {[!prof && "profesión", !f.n && "nombre", f.cel.replace(/\D/g, "").length !== 10 && "celular", !f.servicios && "servicios"].filter(Boolean).join(", ")}.
              </div>
            )}
          </Card>
        </div>
      )}

      <Boton disabled={!listo} onClick={() => {
        const id = "p" + Date.now();
        addPostulacion({
          id, ...f, cel: f.cel.replace(/\D/g, ""), anios: +f.anios || 0, profesion: prof.n, estado: "en revision",
          retrato: { id: "q" + Date.now(), piel: "media", pelo: "chocolate", masa: "suelto", flequillo: "lado" },
        });
        setEnviada(id); setF(vacio); setProf(null);
      }}>Postularme ahora</Boton>

      {verPerfil && <FichaEspecialista e={verPerfil} servicios={SERVICIOS_BASE} cta="Cerrar" onCerrar={() => setVerPerfil(null)} onElegir={() => setVerPerfil(null)} />}
    </div>
  );
}

/* ═══════════  ESPECIALISTA  ═══════════ */
function Especialista({ fijo, servicios, productos = [], estilistas, citas = [], cancel = [], adiciones = [], setAdiciones, solicitudes = [], setSolicitudes, registrar }) {
  const [quien, setQuien] = useState(fijo || estilistas[0].id);
  const [tab, setTab] = useState("agenda");
  const e = estilistas.find((x) => x.id === quien) || estilistas[0];
  return (
    <div>
      <div className="flex items-center gap-3" style={{ background: "#FFF", border: `1px solid ${T.linea}`, padding: 10, marginBottom: 14 }}>
        <div style={{ width: 40, flexShrink: 0, border: `1px solid ${T.linea}` }}>
          <RetratoPersona p={e.retrato} src={e.foto} alto={48} />
        </div>
        <div className="flex-1" style={{ minWidth: 0, fontFamily: SANS }}>
          <div style={{ color: T.tinta, fontSize: 13 }}>{e.n}</div>
          <div style={{ color: T.mute, fontSize: 10.5, marginTop: 2 }}>{e.rol} · comisión {e.com}%</div>
        </div>
        {fijo ? (
          <span className="flex items-center gap-1" style={{ color: T.bronceOsc, fontSize: 9.5, letterSpacing: "0.12em", fontFamily: SANS, flexShrink: 0 }}>
            <Shield size={12} /> TU PERFIL
          </span>
        ) : (
          <select value={quien} onChange={(ev) => setQuien(ev.target.value)}
            style={{ background: T.papel, border: `1px solid ${T.linea}`, color: T.tinta, fontSize: 11, fontFamily: SANS, padding: "7px 8px", flexShrink: 0 }}>
            {estilistas.map((x) => <option key={x.id} value={x.id}>{x.n.split(" ")[0]}</option>)}
          </select>
        )}
      </div>
      <SubNav tabs={[["agenda", "Mi agenda", Calendar], ["ingresos", "Ingresos", Wallet], ["metas", "Metas", Award]]} tab={tab} setTab={setTab} />
      {tab === "agenda"
        ? <EspAgenda servicios={servicios} productos={productos} e={e} citas={citas} cancel={cancel}
            adiciones={adiciones} setAdiciones={setAdiciones}
            solicitudes={solicitudes} setSolicitudes={setSolicitudes} registrar={registrar} />
        : tab === "metas" ? <Metas e={e} adiciones={adiciones} />
        : <EspIngresos e={e} />}
    </div>
  );
}

function EspAgenda({ servicios, productos = [], e, citas = [], cancel = [], adiciones = [], setAdiciones, solicitudes = [], setSolicitudes, registrar }) {
  const [dia, setDia] = useState(1);
  const [cabina, setCabina] = useState(null);
  const bloques = useMemo(() => agendaDe(e.id, dia, citas, cancel), [e.id, dia, citas, cancel]);
  const nombres = ["Camila Restrepo", "Juliana Castro", "Andrea Mejía", "Valentina Sáenz", "Paola Rincón", "Ximena Aguirre", "Lorena Prieto", "Natalia Ríos"];
  const minutos = bloques.reduce((a, b) => a + b.d, 0);
  const propios = servicios.filter((x) => (e.dominio || []).includes(x.id));
  return (
    <div className="flex flex-col gap-4">
      <Titulo sub="La clienta solo ve 'reservado'. Aquí ves el detalle.">Tu día</Titulo>
      <div className="flex gap-2" style={{ overflowX: "auto" }}>
        {DIAS_N.map((d, i) => (
          <button key={d} onClick={() => setDia(i)} style={{
            flexShrink: 0, width: 52, padding: "9px 0", textAlign: "center", cursor: "pointer",
            background: dia === i ? T.tinta : "#FFF", color: dia === i ? T.papel : T.tinta,
            border: `1px solid ${dia === i ? T.tinta : T.linea}`, borderRadius: 2, fontFamily: SANS,
          }}>
            <div style={{ fontSize: 10, opacity: 0.7 }}>{d}</div>
            <div style={{ fontSize: 16, fontFamily: SERIF }}>{FECHAS[i]}</div>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Dato label="CITAS" valor={bloques.length} />
        <Dato label="EN CAMILLA" valor={hm(minutos)} />
        <Dato label="OCUPACIÓN" valor={Math.round((minutos / 600) * 100) + "%"} color={T.ok} />
      </div>
      <Card><AgendaPublica bloques={bloques} dur={null} elegido={null} onElegir={() => { }} editable={false} /></Card>
      <Card>
        <div style={{ color: T.mute, fontSize: 9.5, marginBottom: 8, fontFamily: SANS, letterSpacing: "0.1em" }}>DETALLE</div>
        {bloques.map((b, i) => {
          const srv = propios.find((x) => x.d === b.d) || propios[i % Math.max(1, propios.length)] || servicios[0];
          const nombreCli = b.cliente || nombres[i % nombres.length];
          return (
            <div key={i} onClick={() => setCabina({ b, srv, cli: nombreCli })}
              className="flex items-center gap-3" style={{ padding: "9px 0", borderTop: i ? `1px solid ${T.linea}` : "none", fontFamily: SANS, cursor: "pointer" }}>
              <span style={{ color: T.tinta, fontSize: 12.5, width: 42, flexShrink: 0 }}>{fmt(b.i)}</span>
              <div className="flex-1" style={{ minWidth: 0 }}>
                <div style={{ color: T.tinta, fontSize: 12.5 }}>{nombreCli}{b.origen === "nueva" && <span style={{ color: T.ok, fontSize: 10 }}> · nueva</span>}</div>
                <div style={{ color: T.mute, fontSize: 11 }}>{b.srvN || srv.n} · {b.d} min</div>
                {adiciones.filter((x) => x.key === `${e.id}|${dia}|${b.i}`).length > 0 && (
                  <div style={{ color: T.ok, fontSize: 10, marginTop: 3 }}>
                    +{adiciones.filter((x) => x.key === `${e.id}|${dia}|${b.i}`).length} adicionado en cabina
                  </div>
                )}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ color: T.bronceOsc, fontSize: 12 }}>
                  {copK(srv.p + adiciones.filter((x) => x.key === `${e.id}|${dia}|${b.i}`).reduce((a, x) => a + x.p, 0))}
                </div>
                <div style={{ color: T.greige, fontSize: 9, letterSpacing: "0.1em" }}>CABINA</div>
              </div>
            </div>
          );
        })}
      </Card>

      {cabina && (
        <Cabina e={e} dia={dia} cabina={cabina} servicios={servicios} productos={productos} onCerrar={() => setCabina(null)}
          adiciones={adiciones} setAdiciones={setAdiciones}
          solicitudes={solicitudes} setSolicitudes={setSolicitudes} registrar={registrar} />
      )}
    </div>
  );
}

/* La clienta ya está en la camilla: aquí se adiciona, y se pide autorización para quitar */
function Cabina({ e, dia, cabina, servicios, productos = [], onCerrar, adiciones, setAdiciones, solicitudes, setSolicitudes, registrar }) {
  const { b, srv, cli } = cabina;
  const key = `${e.id}|${dia}|${b.i}`;
  const mias = adiciones.filter((x) => x.key === key);
  const [modo, setModo] = useState("srv");
  const [sel, setSel] = useState(servicios[0].id);
  const [selP, setSelP] = useState(productos[0] ? productos[0].id : null);
  const [quitando, setQuitando] = useState(null);
  const [motivo, setMotivo] = useState("");
  const base = b.srvN || srv.n;
  const baseP = srv.p;
  const total = baseP + mias.reduce((a, x) => a + x.p, 0);
  const minutos = b.d + mias.reduce((a, x) => a + x.d, 0);
  const pendiente = (id) => solicitudes.find((x) => x.adicionId === id && x.estado === "pendiente");

  const adicionar = () => {
    const esSrv = modo === "srv";
    const x = esSrv ? servicios.find((y) => y.id === sel) : productos.find((y) => y.id === selP);
    if (!x) return;
    const nuevo = { id: nuevoId(), key, tipo: esSrv ? "servicio" : "producto", srvId: x.id, srvN: x.n,
      p: x.p, d: esSrv ? x.d : 0, quien: e.n, cliente: cli, dia, hora: b.i };
    setAdiciones([...adiciones, nuevo]);
    registrar(e.n, esSrv ? "Adicionó un servicio en cabina" : "Vendió un producto en cabina",
      `${x.n} · ${cop(x.p)} a ${cli}, ${DIAS_N[dia]} ${FECHAS[dia]} ${fmt(b.i)}`);
  };
  const pedirQuitar = (ad) => {
    setSolicitudes([{ id: nuevoId(), adicionId: ad.id, key, srvN: ad.srvN, p: ad.p, cliente: cli,
      profesional: e.n, motivo: motivo.trim() || "Sin motivo escrito", estado: "pendiente",
      t: new Date().toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) }, ...solicitudes]);
    registrar(e.n, "Pidió autorización para quitar", `${ad.srvN} de ${cli} · motivo: ${motivo.trim() || "sin motivo"}`);
    setQuitando(null); setMotivo("");
  };

  return (
    <div onClick={onCerrar} style={{ position: "fixed", inset: 0, background: "rgba(59,53,46,0.55)", zIndex: 70, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(ev) => ev.stopPropagation()} style={{ background: "#FFF", width: "100%", maxWidth: 480, maxHeight: "92vh", overflowY: "auto", padding: 20 }}>
        <div className="flex items-start justify-between" style={{ marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.24em", color: T.bronceOsc }}>EN CABINA</div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 26, color: T.tinta, marginTop: 6, lineHeight: 1.1 }}>{cli}</div>
            <div style={{ fontFamily: SANS, fontSize: 11.5, color: T.mute, marginTop: 5 }}>
              {DIAS_N[dia]} {FECHAS[dia]} · {fmt(b.i)} a {fmt(b.i + minutos)} · {hm(minutos)}
            </div>
          </div>
          <button onClick={onCerrar} style={{ background: "none", border: "none", cursor: "pointer", color: T.mute, display: "flex" }}><X size={18} /></button>
        </div>

        <Card style={{ background: T.crema }}>
          <div className="flex justify-between" style={{ padding: "5px 0", fontFamily: SANS }}>
            <span style={{ color: T.tinta, fontSize: 12.5 }}>{base}</span>
            <span style={{ color: T.mute, fontSize: 12 }}>{cop(baseP)}</span>
          </div>
          {mias.map((ad) => {
            const p = pendiente(ad.id);
            return (
              <div key={ad.id} style={{ padding: "7px 0", borderTop: `1px solid ${T.linea}`, fontFamily: SANS }}>
                <div className="flex justify-between items-start gap-2">
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: T.tinta, fontSize: 12.5 }}>{ad.srvN}</div>
                    <div style={{ color: T.ok, fontSize: 10, marginTop: 2 }}>
                      {ad.tipo === "producto" ? "producto vendido en cabina" : `adicionado en cabina · ${hm(ad.d)}`}
                    </div>
                  </div>
                  <span style={{ color: T.mute, fontSize: 12, flexShrink: 0 }}>{cop(ad.p)}</span>
                </div>
                {p ? (
                  <div style={{ color: T.bronceOsc, fontSize: 10.5, marginTop: 6 }}>
                    Esperando autorización de la administradora.
                  </div>
                ) : quitando === ad.id ? (
                  <div style={{ marginTop: 8 }}>
                    <Input label="MOTIVO PARA QUITARLO" value={motivo} onChange={(ev) => setMotivo(ev.target.value)} placeholder="La clienta se arrepintió" />
                    <div className="flex gap-2">
                      <button onClick={() => pedirQuitar(ad)} className="flex-1 py-2" style={{ background: T.tinta, color: "#FFF", border: "none", fontSize: 10.5, letterSpacing: "0.14em", fontFamily: SANS, cursor: "pointer" }}>ENVIAR SOLICITUD</button>
                      <button onClick={() => { setQuitando(null); setMotivo(""); }} className="py-2 px-3" style={{ background: "#FFF", border: `1px solid ${T.linea}`, color: T.mute, fontSize: 10.5, fontFamily: SANS, cursor: "pointer" }}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setQuitando(ad.id)} style={{
                    marginTop: 6, background: "transparent", border: `1px solid ${T.linea}`, color: T.mute,
                    fontSize: 10, padding: "5px 9px", cursor: "pointer", fontFamily: SANS,
                  }}>Solicitar quitar</button>
                )}
              </div>
            );
          })}
          <div className="flex justify-between items-baseline" style={{ paddingTop: 10, borderTop: `1px solid ${T.linea}`, marginTop: 6, fontFamily: SANS }}>
            <span style={{ color: T.tinta, fontSize: 13 }}>Total de la cita</span>
            <span style={{ fontFamily: SERIF, fontSize: 25, color: T.bronceOsc }}>{cop(total)}</span>
          </div>
        </Card>

        <div style={{ marginTop: 16 }}>
          <div style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.12em", fontFamily: SANS, marginBottom: 8 }}>ADICIONAR AHORA</div>
          <div className="flex gap-2" style={{ marginBottom: 10 }}>
            <Chip activo={modo === "srv"} onClick={() => setModo("srv")}>Servicios</Chip>
            <Chip activo={modo === "prod"} onClick={() => setModo("prod")}>Productos</Chip>
          </div>
          {modo === "srv" ? (
            <label className="block" style={{ marginBottom: 10 }}>
              <select value={sel} onChange={(ev) => setSel(+ev.target.value)}
                className="w-full px-3 py-2" style={{ background: T.papel, border: `1px solid ${T.linea}`, borderRadius: 2, color: T.tinta, fontSize: 13, fontFamily: SANS }}>
                {servicios.map((x) => <option key={x.id} value={x.id}>{x.n} · {cop(x.p)} · {hm(x.d)}</option>)}
              </select>
            </label>
          ) : (
            <div className="flex gap-2" style={{ overflowX: "auto", paddingBottom: 4, marginBottom: 10 }}>
              {productos.map((x) => (
                <div key={x.id} onClick={() => setSelP(x.id)} style={{ flexShrink: 0, width: 92, cursor: "pointer" }}>
                  <div style={{ border: `1px solid ${selP === x.id ? T.bronce : T.linea}` }}>
                    <Frasco tipo={x.frasco} src={x.foto} alto={92} />
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 10, color: T.tinta, marginTop: 5, lineHeight: 1.3 }}>{x.n}</div>
                  <div style={{ fontFamily: SERIF, fontSize: 12.5, color: T.bronceOsc }}>{cop(x.p)}</div>
                </div>
              ))}
            </div>
          )}
          <Boton tono="bronce" onClick={adicionar}>
            {modo === "srv" ? "ADICIONAR A LA CITA" : "VENDER ESTE PRODUCTO"}
          </Boton>
          {modo === "prod" && (
            <div style={{ color: T.ok, fontSize: 11, marginTop: 8, fontFamily: SANS }}>
              Te ganas el 12% de cada producto que salga de tu cabina.
            </div>
          )}
          <div style={{ color: T.mute, fontSize: 11, marginTop: 10, fontFamily: SANS, lineHeight: 1.55 }}>
            Puedes adicionar lo que quieras mientras la clienta está contigo. Para quitar algo, la administradora tiene que autorizarlo, y queda registrado.
          </div>
        </div>
      </div>
    </div>
  );
}

const NIVELES = [
  { n: "Bronce", min: 0, perks: ["Comisión base", "Agenda pública"] },
  { n: "Ámbar", min: 60, perks: ["+3 puntos de comisión", "Escoges franja antes que el resto", "Cupo en un curso al año"] },
  { n: "Obsidiana", min: 85, perks: ["+6 puntos de comisión", "Camilla fija", "Cupo en todos los cursos", "Tu nombre en la portada del portal"] },
];

function Metas({ e, adiciones = [] }) {
  const mias = adiciones.filter((x) => x.quien === e.n);
  const enCabina = mias.reduce((a, x) => a + x.p, 0);
  const unidades = mias.filter((x) => x.tipo === "producto").length;
  const semilla = rng(e.id + "metas");
  const rebooking = Math.round(42 + semilla() * 38);
  const retencion = Math.round(55 + semilla() * 35);
  const cinco = Math.round(4 + semilla() * 11);

  const metas = [
    { t: "Próxima cita agendada antes de que se vaya", v: rebooking, meta: 60, u: "%", bono: 200000,
      d: "De cada 10 clientas que atiendes, cuántas salen con su siguiente cita puesta en la app." },
    { t: "Adicionado en cabina", v: enCabina, meta: 800000, u: "$", bono: Math.round(enCabina * 0.08),
      d: "Servicios y productos que sumaste mientras la clienta estaba contigo. Te llevas el 8%." },
    { t: "Productos vendidos", v: unidades, meta: 15, u: "u", bono: 0,
      d: "Comisión directa del 12% sobre cada uno, sin techo." },
    { t: "Reseñas de cinco estrellas", v: cinco, meta: 12, u: "", bono: 150000,
      d: "Solo cuentan las que la clienta deja dentro de la app." },
    { t: "Clientas que vuelven antes de 90 días", v: retencion, meta: 70, u: "%", bono: 300000,
      d: "La que más pesa. Mide si te pidieron a ti otra vez." },
  ];
  const logradas = metas.filter((m) => m.v >= m.meta).length;
  const puntaje = Math.round(metas.reduce((a, m) => a + Math.min(1, m.v / m.meta), 0) / metas.length * 100);
  const nivel = [...NIVELES].reverse().find((n) => puntaje >= n.min) || NIVELES[0];
  const siguiente = NIVELES[NIVELES.indexOf(nivel) + 1];
  const bonoTotal = metas.filter((m) => m.v >= m.meta).reduce((a, m) => a + m.bono, 0) + Math.round(enCabina * 0.08);

  return (
    <div className="flex flex-col gap-4">
      <div style={{ background: T.tinta, color: T.papel, padding: "24px 20px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.24em", color: T.greige, fontFamily: SANS }}>TU NIVEL ESTE MES</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 36, marginTop: 8, lineHeight: 1 }}>{nivel.n}</div>
        <div style={{ height: 3, background: "rgba(255,255,255,0.18)", marginTop: 16 }}>
          <div style={{ width: puntaje + "%", height: "100%", background: T.bronce }} />
        </div>
        <div className="flex justify-between" style={{ marginTop: 8, fontFamily: SANS, fontSize: 10.5, color: T.greige }}>
          <span>{puntaje} de 100 puntos</span>
          <span>{logradas} de {metas.length} metas cumplidas</span>
        </div>
        {siguiente && (
          <div style={{ color: T.greige, fontSize: 11.5, marginTop: 12, fontFamily: SANS, lineHeight: 1.6 }}>
            Te faltan {siguiente.min - puntaje} puntos para {siguiente.n}: {siguiente.perks[0].toLowerCase()}.
          </div>
        )}
      </div>

      <Card style={{ borderColor: T.bronce }}>
        <div style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.12em", fontFamily: SANS }}>BONO ACUMULADO</div>
        <div style={{ fontFamily: SERIF, fontSize: 34, color: T.bronceOsc, marginTop: 4, lineHeight: 1 }}>{cop(bonoTotal)}</div>
        <div style={{ color: T.mute, fontSize: 11.5, marginTop: 8, fontFamily: SANS, lineHeight: 1.55 }}>
          Se paga con la comisión del mes. Cada meta que cierres suma de una vez.
        </div>
      </Card>

      {metas.map((m) => {
        const pct = Math.min(100, Math.round((m.v / m.meta) * 100));
        const ok = m.v >= m.meta;
        const fmtv = (x) => (m.u === "$" ? copK(x) : m.u === "%" ? x + "%" : x + (m.u ? " " + m.u : ""));
        return (
          <Card key={m.t}>
            <div className="flex items-start justify-between gap-3" style={{ fontFamily: SANS }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: T.tinta, fontSize: 13 }}>{m.t}</div>
                <div style={{ color: T.mute, fontSize: 11, marginTop: 4, lineHeight: 1.5 }}>{m.d}</div>
              </div>
              {ok && <Check size={16} color={T.ok} style={{ flexShrink: 0, marginTop: 2 }} />}
            </div>
            <div className="flex justify-between" style={{ margin: "12px 0 5px", fontFamily: SANS, fontSize: 11.5 }}>
              <span style={{ color: ok ? T.ok : T.tinta }}>{fmtv(m.v)}</span>
              <span style={{ color: T.mute }}>meta {fmtv(m.meta)}</span>
            </div>
            <div style={{ height: 5, background: T.crema }}>
              <div style={{ width: pct + "%", height: "100%", background: ok ? T.ok : T.bronce, transition: "width 400ms ease" }} />
            </div>
            {m.bono > 0 && (
              <div style={{ color: ok ? T.ok : T.bronceOsc, fontSize: 11, marginTop: 8, fontFamily: SANS }}>
                {ok ? "Ganado: " : "Bono al cumplirla: "}{cop(m.bono)}
              </div>
            )}
          </Card>
        );
      })}

      <Card style={{ background: T.crema }}>
        <div style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.12em", fontFamily: SANS, marginBottom: 10 }}>LO QUE DA CADA NIVEL</div>
        {NIVELES.map((n) => (
          <div key={n.n} style={{ padding: "9px 0", borderTop: n.n === "Bronce" ? "none" : `1px solid ${T.linea}`, fontFamily: SANS }}>
            <div className="flex items-baseline justify-between">
              <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: n.n === nivel.n ? T.bronceOsc : T.tinta }}>{n.n}</span>
              <span style={{ fontSize: 10, color: T.mute }}>desde {n.min} puntos</span>
            </div>
            {n.perks.map((p) => (
              <div key={p} className="flex gap-2" style={{ marginTop: 5, alignItems: "flex-start" }}>
                <Check size={11} color={T.bronce} style={{ marginTop: 3, flexShrink: 0 }} />
                <span style={{ color: T.mute, fontSize: 11.5 }}>{p}</span>
              </div>
            ))}
          </div>
        ))}
      </Card>
    </div>
  );
}

function EspIngresos({ e }) {
  const mes = e.ventaMes || 0;
  const semana = Math.round(mes * 0.31), hoy = Math.round(mes * 0.05);
  const pct = e.com / 100;
  const dias = [["Mar", 0.13], ["Mié", 0.17], ["Jue", 0.15], ["Vie", 0.22], ["Sáb", 0.28]].map(([d, k]) => ({ d, v: Math.round(semana * k) }));
  const proy = [
    { m: "S1", real: Math.round(mes * 0.24), p: null },
    { m: "S2", real: Math.round(mes * 0.27), p: null },
    { m: "S3", real: Math.round(mes * 0.31), p: Math.round(mes * 0.31) },
    { m: "S4", real: null, p: Math.round(mes * 0.34) },
  ];
  const cierre = Math.round(mes * 1.16);
  return (
    <div className="flex flex-col gap-4">
      <Titulo sub={`Comisión del ${e.com}% sobre servicio y 12% sobre producto.`}>Lo que llevas ganado</Titulo>
      <div className="grid grid-cols-3 gap-2">
        <Dato label="HOY" valor={copK(hoy * pct)} color={T.bronceOsc} />
        <Dato label="SEMANA" valor={copK(semana * pct)} delta={14} color={T.bronceOsc} />
        <Dato label="MES" valor={copK(mes * pct)} delta={9} color={T.bronceOsc} />
      </div>
      <Card>
        <div style={{ color: T.mute, fontSize: 9.5, marginBottom: 10, fontFamily: SANS, letterSpacing: "0.1em" }}>PRODUCCIÓN DE LA SEMANA</div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={dias}>
            <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={T.bronce} stopOpacity={0.35} /><stop offset="100%" stopColor={T.bronce} stopOpacity={0} />
            </linearGradient></defs>
            <CartesianGrid vertical={false} stroke={T.linea} />
            <XAxis dataKey="d" stroke={T.mute} fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke={T.mute} fontSize={10} tickLine={false} axisLine={false} width={34} tickFormatter={(v) => Math.round(v / 1000) + "k"} />
            <Tooltip contentStyle={tip} formatter={(v) => cop(v)} />
            <Area type="monotone" dataKey="v" stroke={T.bronce} strokeWidth={1.8} fill="url(#g1)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
      <Card>
        <div className="flex items-center justify-between" style={{ marginBottom: 10, fontFamily: SANS }}>
          <span style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.1em" }}>PROYECCIÓN DE CIERRE</span>
          <span style={{ color: T.ok, fontSize: 12 }}>{cop(cierre)}</span>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={proy}>
            <CartesianGrid vertical={false} stroke={T.linea} />
            <XAxis dataKey="m" stroke={T.mute} fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke={T.mute} fontSize={10} tickLine={false} axisLine={false} width={32} tickFormatter={(v) => (v / 1000000).toFixed(1) + "M"} />
            <Tooltip contentStyle={tip} formatter={(v) => cop(v)} />
            <Line type="monotone" dataKey="real" stroke={T.tinta} strokeWidth={1.8} dot={{ r: 3 }} connectNulls />
            <Line type="monotone" dataKey="p" stroke={T.bronce} strokeWidth={1.8} strokeDasharray="5 4" dot={{ r: 3 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ color: T.mute, fontSize: 11, marginTop: 8, fontFamily: SANS }}>
          Si sostienes el ritmo, cierras {cop(cierre - mes)} por encima del mes pasado.
        </div>
      </Card>
    </div>
  );
}

/* ═══════════  ADMINISTRADORA  ═══════════ */
const VENTAS_SEMANA = [
  { d: "Mar", srv: 1180000, prod: 210000 }, { d: "Mié", srv: 1460000, prod: 168000 },
  { d: "Jue", srv: 1720000, prod: 296000 }, { d: "Vie", srv: 2340000, prod: 388000 }, { d: "Sáb", srv: 3120000, prod: 512000 },
];
const VENTAS_HORA = [
  { h: "9", v: 150000 }, { h: "10", v: 250000 }, { h: "11", v: 160000 }, { h: "12", v: 0 }, { h: "13", v: 250000 },
  { h: "14", v: 190000 }, { h: "15", v: 110000 }, { h: "16", v: 550000 }, { h: "17", v: 150000 }, { h: "18", v: 220000 },
];
const EMBUDO = [
  { e: "Abrieron la app", v: 1000 }, { e: "Vieron una ficha", v: 640 }, { e: "Armaron ritual", v: 310 },
  { e: "Eligieron especialista", v: 232 }, { e: "Eligieron hora", v: 198 }, { e: "Pagaron", v: 151 },
];

function Admin({ servicios, setServicios, productos, setProductos, estilistas, setEstilistas,
  addServicio, addProducto, clientas, reservas, citas, setCitas, cancel, setCancel, registrar, todo,
  adiciones = [], setAdiciones, solicitudes = [], setSolicitudes, historial = [], miEstId }) {
  const [tab, setTab] = useState("hoy");
  const quien = todo ? "Súper admin" : "Administradora";
  const pend = solicitudes.filter((x) => x.estado === "pendiente").length;
  const mio = historial.filter((h) => h.quien === quien);
  const tabs = [
    ...(miEstId ? [["cabina", "Mi cabina", Heart]] : []),
    ["hoy", "Hoy", TrendingUp], ["autorizar", `Autorizar${pend ? " · " + pend : ""}`, Shield],
    ["agenda", "Agenda", Calendar], ["editor", "Servicios", Package],
    ["profes", "Profesionales", Users], ["ventas", "Ventas", Percent],
    ["retencion", "Retención", Heart], ["embudo", "Embudo", Filter],
    ["clientas", "Clientas", Phone], ["fotos", "Fotos", ImageIcon], ["historial", "Mi historial", FileText],
  ];
  return (
    <div>
      <SubNav tabs={tabs} tab={tab} setTab={setTab} />
      {tab === "cabina" && miEstId && (
        <Especialista fijo={miEstId} servicios={servicios} productos={productos} estilistas={estilistas}
          citas={citas} cancel={cancel} adiciones={adiciones} setAdiciones={setAdiciones}
          solicitudes={solicitudes} setSolicitudes={setSolicitudes} registrar={registrar} />
      )}
      {tab === "hoy" && <AdminHoy reservas={reservas} adiciones={adiciones} />}
      {tab === "autorizar" && (
        <AdminAutorizar solicitudes={solicitudes} setSolicitudes={setSolicitudes}
          adiciones={adiciones} setAdiciones={setAdiciones} registrar={registrar} quien={quien} />
      )}
      {tab === "historial" && <Historial historial={mio} filtro={quien} />}
      {tab === "agenda" && (
        <AdminAgenda estilistas={estilistas} servicios={servicios} citas={citas} setCitas={setCitas}
          cancel={cancel} setCancel={setCancel} registrar={registrar} quien={quien} clientas={clientas} />
      )}
      {tab === "editor" && (
        <AdminEditor servicios={servicios} setServicios={setServicios} productos={productos} setProductos={setProductos}
          addServicio={addServicio} addProducto={addProducto} registrar={registrar} quien={quien} />
      )}
      {tab === "profes" && <AdminProfes estilistas={estilistas} setEstilistas={setEstilistas} registrar={registrar} quien={quien} />}
      {tab === "ventas" && <AdminEquipo estilistas={estilistas} />}
      {tab === "retencion" && <AdminRetencion estilistas={estilistas} clientas={clientas} adiciones={adiciones} />}
      {tab === "embudo" && <AdminEmbudo reservas={reservas} />}
      {tab === "clientas" && <AdminClientas clientas={clientas} registrar={registrar} quien={quien} />}
      {tab === "fotos" && <AdminFotos servicios={servicios} setServicios={setServicios} estilistas={estilistas} setEstilistas={setEstilistas} />}
    </div>
  );
}

function AdminHoy({ reservas, adiciones = [] }) {
  const extra = adiciones.reduce((a, x) => a + x.p, 0);
  const srv = 1720000 + extra, prod = 296000;
  const abonos = reservas.reduce((a, r) => a + r.pagado, 0);
  return (
    <div className="flex flex-col gap-4">
      <Titulo sub="San Patricio · martes 15 de septiembre">Cierre del día</Titulo>
      <Card style={{ background: T.crema }}>
        <div style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.1em", fontFamily: SANS }}>VENTA TOTAL DEL DÍA</div>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: T.tinta, lineHeight: 1.05, marginTop: 4 }}>{cop(srv + prod)}</div>
        <div className="flex gap-4" style={{ marginTop: 10, fontSize: 12, fontFamily: SANS, color: T.mute }}>
          <span>Servicios <span style={{ color: T.tinta }}>{copK(srv)}</span></span>
          <span>Tienda <span style={{ color: T.bronceOsc }}>{copK(prod)}</span></span>
        </div>
        {extra > 0 && (
          <div style={{ color: T.ok, fontSize: 11.5, marginTop: 8, fontFamily: SANS }}>
            {copK(extra)} vinieron de {adiciones.length} adición{adiciones.length === 1 ? "" : "es"} hechas en cabina.
          </div>
        )}
      </Card>
      <div className="grid grid-cols-3 gap-2">
        <Dato label="CITAS" valor="7 de 8" />
        <Dato label="TICKET PROM." valor={copK((srv + prod) / 7)} delta={6} />
        <Dato label="CAMILLAS" valor="3 de 3" color={T.ok} />
      </div>
      {reservas.length > 0 && (
        <Card style={{ borderColor: T.ok }}>
          <div style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.1em", fontFamily: SANS }}>RESERVAS PAGADAS DESDE LA APP</div>
          <div style={{ fontFamily: SERIF, fontSize: 26, color: T.ok, marginTop: 4 }}>{cop(abonos)}</div>
          {reservas.map((r) => (
            <div key={r.codigo} className="flex items-center justify-between" style={{ padding: "7px 0", borderTop: `1px solid ${T.linea}`, marginTop: 6, fontFamily: SANS }}>
              <div>
                <div style={{ color: T.tinta, fontSize: 12.5 }}>{r.cliente} · {r.codigo}</div>
                <div style={{ color: T.mute, fontSize: 11 }}>{DIAS_N[r.dia]} {FECHAS[r.dia]} · {fmt(r.slot)} · {r.est.split(" ")[0]}</div>
              </div>
              <span style={{ color: T.bronceOsc, fontSize: 12 }}>{cop(r.pagado)}</span>
            </div>
          ))}
        </Card>
      )}
      <Card>
        <div style={{ color: T.mute, fontSize: 9.5, marginBottom: 10, fontFamily: SANS, letterSpacing: "0.1em" }}>VENTA POR HORA</div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={VENTAS_HORA}>
            <CartesianGrid vertical={false} stroke={T.linea} />
            <XAxis dataKey="h" stroke={T.mute} fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke={T.mute} fontSize={10} tickLine={false} axisLine={false} width={34} tickFormatter={(v) => v / 1000 + "k"} />
            <Tooltip contentStyle={tip} formatter={(v) => cop(v)} cursor={{ fill: T.crema }} />
            <Bar dataKey="v" fill={T.greige} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ color: T.mute, fontSize: 11, marginTop: 6, fontFamily: SANS }}>
          Las 12 quedó vacía cuatro martes seguidos. Es la franja para abrir cupo de socias.
        </div>
      </Card>
      <Card style={{ borderColor: T.alerta }}>
        <div className="flex gap-2" style={{ alignItems: "flex-start" }}>
          <Bell size={15} color={T.alerta} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontFamily: SANS }}>
            <div style={{ color: T.tinta, fontSize: 12.5 }}>Quedan 9 geles fijadores</div>
            <div style={{ color: T.mute, fontSize: 11.5, marginTop: 3 }}>Al ritmo actual se agotan en 6 días. Pide antes del jueves.</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AdminEmbudo({ reservas }) {
  const max = EMBUDO[0].v;
  const conv = ((EMBUDO[5].v / EMBUDO[0].v) * 100).toFixed(1);
  const abonos = reservas.reduce((a, r) => a + r.pagado, 0);
  return (
    <div className="flex flex-col gap-4">
      <Titulo sub="Dónde se cae la gente antes de pagar. Últimos 30 días.">Embudo de compra</Titulo>
      <div className="grid grid-cols-3 gap-2">
        <Dato label="CONVERSIÓN" valor={conv + "%"} delta={12} color={T.ok} />
        <Dato label="NO-SHOW" valor="4,2%" delta={-9} color={T.ok} />
        <Dato label="ABONOS MES" valor={copK(8940000 + abonos)} />
      </div>
      <Card>
        {EMBUDO.map((x, i) => (
          <div key={x.e} style={{ marginBottom: 12, fontFamily: SANS }}>
            <div className="flex justify-between" style={{ fontSize: 11.5, marginBottom: 5 }}>
              <span style={{ color: T.tinta }}>{x.e}</span>
              <span style={{ color: T.mute }}>
                {x.v}
                {i > 0 && <span style={{ color: T.alerta, marginLeft: 6 }}>−{Math.round((1 - x.v / EMBUDO[i - 1].v) * 100)}%</span>}
              </span>
            </div>
            <div style={{ height: 22, background: T.crema }}>
              <div style={{ width: (x.v / max) * 100 + "%", height: "100%", background: i === 5 ? T.ok : T.greige }} />
            </div>
          </div>
        ))}
        <div style={{ color: T.mute, fontSize: 11.5, marginTop: 4, fontFamily: SANS, lineHeight: 1.55 }}>
          La caída más grande está entre ver una ficha y armar el ritual. Ahí es donde el antes/después y la promesa del servicio tienen que hacer el trabajo.
        </div>
      </Card>
      <Card style={{ background: T.crema }}>
        <div style={{ color: T.tinta, fontSize: 12.5, fontFamily: SANS, lineHeight: 1.6 }}>
          Los recordatorios automáticos sumados al abono bajan el no-show del 18–22% a menos del 5%. Ese solo cambio paga la plataforma.
        </div>
      </Card>
      <Card>
        <div style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.1em", marginBottom: 10, fontFamily: SANS }}>COSTO DE LA PASARELA</div>
        {Object.entries(PASARELA).map(([k, m]) => (
          <div key={k} className="flex justify-between" style={{ padding: "6px 0", borderBottom: `1px solid ${T.linea}`, fontFamily: SANS }}>
            <span style={{ color: T.tinta, fontSize: 12 }}>{m.n}</span>
            <span style={{ color: T.mute, fontSize: 12 }}>{m.tarifa}</span>
          </div>
        ))}
        <div style={{ color: T.mute, fontSize: 11, marginTop: 10, fontFamily: SANS, lineHeight: 1.5 }}>
          Tarifas de referencia 2026. Conviene abrir Wompi si la cuenta es Bancolombia, o Bold si la mayoría paga por Nequi.
        </div>
      </Card>
    </div>
  );
}

function AdminAgenda({ estilistas, servicios, citas, setCitas, cancel, setCancel, registrar, quien, clientas }) {
  const [est, setEst] = useState(estilistas[0].id);
  const [dia, setDia] = useState(1);
  const [nueva, setNueva] = useState(null);
  const [cli, setCli] = useState("");
  const [srvId, setSrvId] = useState(servicios[0].id);
  const e = estilistas.find((x) => x.id === est) || estilistas[0];
  const srv = servicios.find((x) => x.id === srvId) || servicios[0];
  const bloques = useMemo(() => agendaDe(est, dia, citas, cancel), [est, dia, citas, cancel]);
  const libres = useMemo(() => huecos(bloques, srv.d), [bloques, srv.d]);
  const total = VENTAS_SEMANA.reduce((a, d) => a + d.srv + d.prod, 0);

  const crear = (i) => {
    const c = { id: nuevoId(), est, dia, i, d: srv.d, cliente: cli.trim() || "Sin nombre", srvN: srv.n };
    setCitas([...citas, c]);
    registrar(quien, "Agendó una cita", `${c.cliente} · ${srv.n} con ${e.n.split(" ")[0]}, ${DIAS_N[dia]} ${FECHAS[dia]} ${fmt(i)}`);
    setNueva(null); setCli("");
  };
  const quitar = (b) => {
    if (b.origen === "nueva") setCitas(citas.filter((c) => c.id !== b.id));
    else setCancel([...cancel, `${est}|${dia}|${b.i}`]);
    registrar(quien, "Canceló una cita", `${b.cliente || "Reservado"} · ${e.n.split(" ")[0]}, ${DIAS_N[dia]} ${FECHAS[dia]} ${fmt(b.i)}`);
  };
  const mover = (b, delta) => {
    const destino = b.i + delta;
    if (destino < H0 * 60 || destino + b.d > H1 * 60) return;
    const otros = bloques.filter((x) => x !== b);
    if (!otros.every((x) => destino + b.d + 10 <= x.i || destino >= x.i + x.d + 10)) return;
    if (b.origen === "nueva") setCitas(citas.map((c) => (c.id === b.id ? { ...c, i: destino } : c)));
    else {
      setCancel([...cancel, `${est}|${dia}|${b.i}`]);
      setCitas([...citas, { id: nuevoId(), est, dia, i: destino, d: b.d, cliente: b.cliente || "Reservado", srvN: b.srvN || "Servicio" }]);
    }
    registrar(quien, "Movió una cita", `${b.cliente || "Reservado"} de ${fmt(b.i)} a ${fmt(destino)}, ${DIAS_N[dia]} ${FECHAS[dia]}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <Titulo sub="Agenda, mueve o cancela. Todo queda en el historial.">La agenda</Titulo>
      <div className="grid grid-cols-2 gap-2">
        <Dato label="VENTA SEMANA" valor={cop(total)} delta={11} />
        <Dato label="CITAS AGREGADAS" valor={citas.length} color={T.ok} />
      </div>

      <div className="flex gap-2" style={{ overflowX: "auto" }}>
        {estilistas.map((x) => <Chip key={x.id} activo={est === x.id} onClick={() => { setEst(x.id); setNueva(null); }}>{x.n.split(" ")[0]}</Chip>)}
      </div>
      <div className="flex gap-2" style={{ overflowX: "auto" }}>
        {DIAS_N.map((d, i) => <Chip key={d} activo={dia === i} onClick={() => { setDia(i); setNueva(null); }}>{d} {FECHAS[i]}</Chip>)}
      </div>

      <Card>
        <AgendaPublica bloques={bloques} dur={null} elegido={null} onElegir={() => { }} editable={false} />
      </Card>

      <Card>
        <div style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.12em", fontFamily: SANS, marginBottom: 10 }}>CITAS DEL DÍA</div>
        {bloques.length === 0 && <div style={{ color: T.mute, fontSize: 12, fontFamily: SANS }}>Día libre completo.</div>}
        {bloques.map((b, i) => (
          <div key={i} style={{ padding: "10px 0", borderTop: i ? `1px solid ${T.linea}` : "none", fontFamily: SANS }}>
            <div className="flex items-center gap-3">
              <span style={{ color: T.tinta, fontSize: 12.5, width: 44, flexShrink: 0 }}>{fmt(b.i)}</span>
              <div className="flex-1" style={{ minWidth: 0 }}>
                <div style={{ color: T.tinta, fontSize: 12.5 }}>{b.cliente || "Reservado"}</div>
                <div style={{ color: T.mute, fontSize: 10.5 }}>{b.srvN || "Servicio"} · {hm(b.d)}</div>
              </div>
              <div className="flex gap-1" style={{ flexShrink: 0 }}>
                {[["−15", -15], ["+15", 15]].map(([l, dv]) => (
                  <button key={l} onClick={() => mover(b, dv)} style={{ background: "#FFF", border: `1px solid ${T.linea}`, color: T.mute, fontSize: 10, padding: "5px 7px", cursor: "pointer", fontFamily: SANS }}>{l}</button>
                ))}
                <button onClick={() => quitar(b)} style={{ background: "#FFF", border: `1px solid ${T.alerta}`, color: T.alerta, fontSize: 10, padding: "5px 8px", cursor: "pointer", fontFamily: SANS }}>Cancelar</button>
              </div>
            </div>
          </div>
        ))}
      </Card>

      <Card style={{ borderColor: T.bronce }}>
        <div style={{ color: T.tinta, fontSize: 13.5, marginBottom: 12, fontFamily: SANS }}>Agendar una cita</div>
        <Input label="NOMBRE DE LA CLIENTA" value={cli} onChange={(ev) => setCli(ev.target.value)} placeholder="Camila Restrepo" list="clientas" />
        <datalist id="clientas">
          {Object.values(clientas || {}).map((c, i) => <option key={i} value={`${c.nombre} ${c.apellido}`.trim()} />)}
        </datalist>
        <label className="block" style={{ marginBottom: 10 }}>
          <span style={{ color: T.mute, fontSize: 10, letterSpacing: "0.1em", fontFamily: SANS }}>SERVICIO</span>
          <select value={srvId} onChange={(ev) => { setSrvId(+ev.target.value); setNueva(null); }}
            className="w-full mt-1 px-3 py-2" style={{ background: T.papel, border: `1px solid ${T.linea}`, borderRadius: 2, color: T.tinta, fontSize: 13, fontFamily: SANS }}>
            {servicios.map((x) => <option key={x.id} value={x.id}>{x.n} · {hm(x.d)}</option>)}
          </select>
        </label>
        <div style={{ color: T.mute, fontSize: 11, marginBottom: 8, fontFamily: SANS }}>
          {libres.length > 0 ? `${libres.length} horarios libres para ${hm(srv.d)}` : "No hay espacio ese día para ese servicio."}
        </div>
        <div className="flex" style={{ flexWrap: "wrap", gap: 6 }}>
          {libres.map((t) => (
            <button key={t} onClick={() => setNueva(t)} className="px-3 py-2" style={{
              background: nueva === t ? T.bronce : "#FFF", color: nueva === t ? "#FFF" : T.tinta,
              border: `1px solid ${nueva === t ? T.bronce : T.linea}`, fontSize: 12, fontFamily: SANS, cursor: "pointer",
            }}>{fmt(t)}</button>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <Boton disabled={nueva == null} onClick={() => crear(nueva)}>
            {nueva == null ? "Elige una hora" : `Agendar a las ${fmt(nueva)}`}
          </Boton>
        </div>
      </Card>
    </div>
  );
}

function AdminEquipo({ estilistas }) {
  const data = estilistas.filter((e) => e.ventaMes > 0).map((e) => ({ id: e.id, n: e.n.split(" ")[0], v: e.ventaMes }));
  const total = data.reduce((a, d) => a + d.v, 0) || 1;
  const comisiones = estilistas.reduce((a, e) => a + (e.esAdmin ? 0 : (e.ventaMes || 0) * e.com / 100), 0);
  return (
    <div className="flex flex-col gap-4">
      <Titulo sub="Mes corrido, las cinco especialistas del atelier.">Venta por especialista</Titulo>
      <div className="grid grid-cols-2 gap-2">
        <Dato label="VENTA DEL EQUIPO" valor={copK(total)} delta={9} />
        <Dato label="A PAGAR EN COMISIONES" valor={copK(comisiones)} color={T.bronceOsc} />
      </div>
      <Card>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={data} dataKey="v" nameKey="n" innerRadius={50} outerRadius={78} paddingAngle={2} stroke="none">
              {data.map((d) => <Cell key={d.id} fill={(estilistas.find((e) => e.id === d.id) || {}).tono || T.greige} />)}
            </Pie>
            <Tooltip contentStyle={tip} formatter={(v) => cop(v)} />
          </PieChart>
        </ResponsiveContainer>
        {data.map((d) => {
          const e = estilistas.find((x) => x.id === d.id);
          if (!e) return null;
          return (
            <div key={d.id} className="flex items-center gap-3" style={{ padding: "9px 0", borderTop: `1px solid ${T.linea}`, fontFamily: SANS }}>
              <div style={{ width: 30, flexShrink: 0, border: `1px solid ${T.linea}` }}>
                <RetratoPersona p={e.retrato} src={e.foto} alto={36} />
              </div>
              <div className="flex-1" style={{ minWidth: 0 }}>
                <div style={{ color: T.tinta, fontSize: 12.5 }}>{e.n}</div>
                <div className="flex items-center gap-2" style={{ marginTop: 2 }}>
                  <Estrellas v={e.rating} s={9} />
                  <span style={{ color: T.mute, fontSize: 10.5 }}>comisión {e.com}%</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: T.tinta, fontSize: 12 }}>{((d.v / total) * 100).toFixed(1)}%</div>
                <div style={{ color: T.bronceOsc, fontSize: 11 }}>{copK(d.v)}</div>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function AdminClientas({ clientas, registrar, quien }) {
  const [abierta, setAbierta] = useState(null);
  const [visto, setVisto] = useState([]);
  const enmascarar = (c) => `${c.slice(0, 3)} ••• ${c.slice(-4)}`;
  const revelar = (cel, c) => {
    setVisto([...visto, cel]);
    if (registrar) registrar(quien || "Administradora", "Consultó un teléfono", `${c.nombre} ${c.apellido}`.trim());
  };
  const lista = Object.entries(clientas);
  const totalVisitas = lista.reduce((a, [, c]) => a + (c.visitas || 0), 0);
  return (
    <div className="flex flex-col gap-4">
      <Titulo sub="Quien entra con su celular queda aquí. Sin formularios largos.">Base de clientas</Titulo>
      <Card style={{ background: T.crema }}>
        <div className="flex gap-2" style={{ alignItems: "flex-start" }}>
          <Shield size={14} color={T.bronceOsc} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ color: T.tinta, fontSize: 11.5, fontFamily: SANS, lineHeight: 1.6 }}>
            Los teléfonos van enmascarados. Cada vez que revelas uno queda registrado con tu nombre.
            Las profesionales nunca ven el contacto de la clienta.
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-3 gap-2">
        <Dato label="REGISTRADAS" valor={lista.length} />
        <Dato label="VISITAS ACUMULADAS" valor={totalVisitas} />
        <Dato label="NUEVAS ESTE MES" valor={lista.filter(([, c]) => c.visitas <= 2).length} color={T.ok} />
      </div>
      {lista.map(([cel, c]) => (
        <Card key={cel} style={{ padding: 12 }}>
          <div className="flex items-center gap-3" onClick={() => setAbierta(abierta === cel ? null : cel)} style={{ cursor: "pointer" }}>
            <div style={{ width: 42, flexShrink: 0, border: `1px solid ${T.linea}` }}>
              <RetratoPersona p={c.retrato} alto={50} />
            </div>
            <div className="flex-1" style={{ minWidth: 0, fontFamily: SANS }}>
              <div style={{ color: T.tinta, fontSize: 13 }}>{c.nombre} {c.apellido}</div>
              <div className="flex items-center gap-2" style={{ marginTop: 2 }}>
                <span style={{ color: T.mute, fontSize: 11 }}>
                  {visto.includes(cel) ? fmtCel(cel) : enmascarar(cel)} · {c.visitas} visita{c.visitas === 1 ? "" : "s"}
                </span>
                {!visto.includes(cel) && (
                  <button onClick={(ev) => { ev.stopPropagation(); revelar(cel, c); }} style={{
                    background: "none", border: "none", padding: 0, cursor: "pointer",
                    color: T.bronceOsc, fontSize: 9, letterSpacing: "0.1em", fontFamily: SANS,
                  }}>VER</button>
                )}
              </div>
            </div>
            <a href={`https://wa.me/57${cel}`} target="_blank" rel="noreferrer" onClick={(ev) => ev.stopPropagation()} style={{ color: T.verde, display: "flex", flexShrink: 0 }}>
              <MessageCircle size={17} />
            </a>
          </div>
          {abierta === cel && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.linea}`, fontFamily: SANS }}>
              {[["Clienta desde", c.desde], ["Última visita", c.ultima], ["Servicio favorito", c.fav]].map(([k, v]) => (
                <div key={k} className="flex justify-between" style={{ padding: "5px 0" }}>
                  <span style={{ color: T.mute, fontSize: 12 }}>{k}</span>
                  <span style={{ color: T.tinta, fontSize: 12, textAlign: "right" }}>{v}</span>
                </div>
              ))}
              {c.nota && (
                <div style={{ background: T.crema, padding: 10, marginTop: 8 }}>
                  <div style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.1em" }}>NOTA DE CABINA</div>
                  <div style={{ color: T.tinta, fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>{c.nota}</div>
                </div>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

/* Gestor de fotos: aquí se cargan las imágenes reales */
function CargaMasiva({ onAplicar, n, que }) {
  const [txt, setTxt] = useState("");
  const urls = txt.split(/\s*\n\s*/).map((x) => x.trim()).filter(Boolean);
  return (
    <Card style={{ borderColor: T.bronce }}>
      <div style={{ color: T.tinta, fontSize: 13, fontFamily: SANS }}>Cargar varias de una vez</div>
      <div style={{ color: T.mute, fontSize: 11.5, marginTop: 4, marginBottom: 10, fontFamily: SANS, lineHeight: 1.5 }}>
        Pega una URL por línea, en el mismo orden de la lista de abajo. Hay {n} {que}.
      </div>
      <textarea value={txt} onChange={(e) => setTxt(e.target.value)} rows={4}
        placeholder={"https://…\nhttps://…"}
        className="w-full px-3 py-2" style={{ background: T.papel, border: `1px solid ${T.linea}`, color: T.tinta, fontSize: 12, fontFamily: SANS, outline: "none", resize: "vertical" }} />
      <div style={{ color: T.mute, fontSize: 11, margin: "8px 0 10px", fontFamily: SANS }}>
        {urls.length} URL{urls.length === 1 ? "" : "s"} detectada{urls.length === 1 ? "" : "s"}.
      </div>
      <Boton disabled={urls.length === 0} onClick={() => { onAplicar(urls); setTxt(""); }}>Aplicar</Boton>
    </Card>
  );
}

function AdminFotos({ servicios, setServicios, estilistas, setEstilistas }) {
  const [modo, setModo] = useState("srv");
  const setFotoSrv = (id, url) => setServicios(servicios.map((s) => (s.id === id ? { ...s, foto: url || null } : s)));
  const setFotoEst = (id, url) => setEstilistas(estilistas.map((e) => (e.id === id ? { ...e, foto: url || null } : e)));
  return (
    <div className="flex flex-col gap-4">
      <Titulo sub="Pega la URL de cada imagen y se aplica al instante en toda la app. Mientras no haya foto, se muestra la ilustración de marca.">Fotos</Titulo>
      <div className="flex gap-2">
        <Chip activo={modo === "srv"} onClick={() => setModo("srv")}>Servicios</Chip>
        <Chip activo={modo === "est"} onClick={() => setModo("est")}>Especialistas</Chip>
      </div>
      {modo === "srv" && <CargaMasiva onAplicar={(urls) => setServicios(servicios.map((x, i) => (urls[i] ? { ...x, foto: urls[i] } : x)))} n={servicios.length} que="servicios" />}
      {modo === "est" && <CargaMasiva onAplicar={(urls) => setEstilistas(estilistas.map((x, i) => (urls[i] ? { ...x, foto: urls[i] } : x)))} n={estilistas.length} que="especialistas" />}
      {modo === "srv" && servicios.map((s) => (
        <Card key={s.id} style={{ padding: 12 }}>
          <div className="flex gap-3">
            <div style={{ width: 64, flexShrink: 0, border: `1px solid ${T.linea}` }}>
              <Retrato {...s.despues} src={s.foto} alto={64} sinMarco />
            </div>
            <div className="flex-1" style={{ minWidth: 0 }}>
              <div style={{ color: T.tinta, fontSize: 12.5, fontFamily: SANS, marginBottom: 6 }}>{s.n}</div>
              <input value={s.foto || ""} onChange={(e) => setFotoSrv(s.id, e.target.value)} placeholder="https://…"
                className="w-full px-2 py-2" style={{ background: T.papel, border: `1px solid ${T.linea}`, color: T.tinta, fontSize: 12, fontFamily: SANS, outline: "none" }} />
            </div>
          </div>
        </Card>
      ))}
      {modo === "est" && estilistas.map((e) => (
        <Card key={e.id} style={{ padding: 12 }}>
          <div className="flex gap-3">
            <div style={{ width: 54, flexShrink: 0, border: `1px solid ${T.linea}` }}>
              <RetratoPersona p={e.retrato} src={e.foto} alto={64} />
            </div>
            <div className="flex-1" style={{ minWidth: 0 }}>
              <div style={{ color: T.tinta, fontSize: 12.5, fontFamily: SANS, marginBottom: 6 }}>{e.n}</div>
              <input value={e.foto || ""} onChange={(ev) => setFotoEst(e.id, ev.target.value)} placeholder="https://…"
                className="w-full px-2 py-2" style={{ background: T.papel, border: `1px solid ${T.linea}`, color: T.tinta, fontSize: 12, fontFamily: SANS, outline: "none" }} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function AdminEditor({ servicios, setServicios, productos, setProductos, addServicio, addProducto, registrar, quien }) {
  const [modo, setModo] = useState("srv");
  const [edit, setEdit] = useState(null);
  const [nuevo, setNuevo] = useState(false);
  const lista = modo === "srv" ? servicios : productos;

  const guardar = (x) => {
    if (modo === "srv") {
      const existe = servicios.some((y) => y.id === x.id);
      setServicios(existe ? servicios.map((y) => (y.id === x.id ? x : y)) : [...servicios, x]);
      registrar(quien, existe ? "Modificó un servicio" : "Creó un servicio", `${x.n} · ${cop(x.p)} · ${hm(x.d)}`);
    } else {
      const existe = productos.some((y) => y.id === x.id);
      setProductos(existe ? productos.map((y) => (y.id === x.id ? x : y)) : [...productos, x]);
      registrar(quien, existe ? "Modificó un producto" : "Creó un producto", `${x.n} · ${cop(x.p)}`);
    }
    setEdit(null); setNuevo(false);
  };
  const borrar = (x) => {
    if (modo === "srv") setServicios(servicios.filter((y) => y.id !== x.id));
    else setProductos(productos.filter((y) => y.id !== x.id));
    registrar(quien, modo === "srv" ? "Eliminó un servicio" : "Eliminó un producto", x.n);
    setEdit(null);
  };

  const base = modo === "srv"
    ? { id: Date.now(), n: "", cat: "Pestañas", d: 60, p: 0, foto: null, desc: "", promesa: "", dura: "3 a 4 semanas", top: false, antes: { lash: "corta", brow: "normal" }, despues: { lash: "clasica", brow: "normal" } }
    : { id: Date.now(), n: "", cat: "Pestañas", p: 0, stock: 0, frasco: "gotero", formato: "", foto: null, desc: "", promesa: "", uso: "" };

  return (
    <div className="flex flex-col gap-4">
      <Titulo sub="Precio, foto, especificación y tiempo. Cada cambio queda en el historial.">Servicios y productos</Titulo>
      <div className="flex gap-2">
        <Chip activo={modo === "srv"} onClick={() => { setModo("srv"); setEdit(null); }}>Servicios</Chip>
        <Chip activo={modo === "prod"} onClick={() => { setModo("prod"); setEdit(null); }}>Productos</Chip>
      </div>
      <Boton tono="bronce" onClick={() => { setEdit(base); setNuevo(true); }}>
        {modo === "srv" ? "CREAR SERVICIO" : "CREAR PRODUCTO"}
      </Boton>

      <div className="flex flex-col gap-2">
        {lista.map((x) => (
          <Card key={x.id} style={{ padding: 11, cursor: "pointer" }} onClick={() => { setEdit({ ...x }); setNuevo(false); }}>
            <div className="flex items-center gap-3">
              <div style={{ width: 54, flexShrink: 0, border: `1px solid ${T.linea}` }}>
                {modo === "srv"
                  ? <RostroCompleto lash={x.despues?.lash} brow={x.despues?.brow} look={x.look} src={x.foto} alto={54} sinMarco />
                  : <Frasco tipo={x.frasco} src={x.foto} alto={54} />}
              </div>
              <div className="flex-1" style={{ minWidth: 0, fontFamily: SANS }}>
                <div style={{ color: T.tinta, fontSize: 12.5 }}>{x.n}</div>
                <div style={{ color: T.mute, fontSize: 10.5, marginTop: 2 }}>
                  {x.cat}{modo === "srv" ? ` · ${hm(x.d)}` : ` · ${x.stock} en inventario`}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ color: T.bronceOsc, fontSize: 13.5, fontFamily: SERIF }}>{cop(x.p)}</div>
                <div style={{ color: T.greige, fontSize: 9.5, letterSpacing: "0.1em", fontFamily: SANS }}>EDITAR</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {edit && (
        <div onClick={() => setEdit(null)} style={{ position: "fixed", inset: 0, background: "rgba(59,53,46,0.55)", zIndex: 70, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={(ev) => ev.stopPropagation()} style={{ background: "#FFF", width: "100%", maxWidth: 480, maxHeight: "92vh", overflowY: "auto", padding: 20 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
              <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 23, color: T.tinta }}>
                {nuevo ? "Nuevo" : "Editar"}
              </span>
              <button onClick={() => setEdit(null)} style={{ background: "none", border: "none", cursor: "pointer", color: T.mute, display: "flex" }}><X size={18} /></button>
            </div>

            <div style={{ border: `1px solid ${T.linea}`, marginBottom: 14 }}>
              {modo === "srv"
                ? <RostroCompleto lash={edit.despues?.lash} brow={edit.despues?.brow} look={edit.look} src={edit.foto} alto={150} sinMarco />
                : <Frasco tipo={edit.frasco} src={edit.foto} alto={150} />}
            </div>

            <Input label="NOMBRE" value={edit.n} onChange={(ev) => setEdit({ ...edit, n: ev.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Input label="PRECIO" type="number" value={edit.p} onChange={(ev) => setEdit({ ...edit, p: +ev.target.value })} />
              {modo === "srv"
                ? <Input label="TIEMPO (MIN)" type="number" value={edit.d} onChange={(ev) => setEdit({ ...edit, d: +ev.target.value })} />
                : <Input label="INVENTARIO" type="number" value={edit.stock} onChange={(ev) => setEdit({ ...edit, stock: +ev.target.value })} />}
            </div>
            <label className="block" style={{ marginBottom: 10 }}>
              <span style={{ color: T.mute, fontSize: 10, letterSpacing: "0.1em", fontFamily: SANS }}>CATEGORÍA</span>
              <select value={edit.cat} onChange={(ev) => setEdit({ ...edit, cat: ev.target.value })}
                className="w-full mt-1 px-3 py-2" style={{ background: T.papel, border: `1px solid ${T.linea}`, borderRadius: 2, color: T.tinta, fontSize: 13, fontFamily: SANS }}>
                {(modo === "srv" ? CATS.filter((c) => c !== "Todo" && c !== "Hombres") : CATS_TIENDA.filter((c) => c !== "Todo")).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <Input label="FOTO (URL)" value={edit.foto || ""} onChange={(ev) => setEdit({ ...edit, foto: ev.target.value || null })} placeholder="https://…" />
            <Input label="LA PROMESA (LO QUE SE LLEVA)" value={edit.promesa || ""} onChange={(ev) => setEdit({ ...edit, promesa: ev.target.value })} />
            <Input label="ESPECIFICACIÓN TÉCNICA" area value={edit.desc || ""} onChange={(ev) => setEdit({ ...edit, desc: ev.target.value })} />
            {modo === "srv"
              ? <Input label="CUÁNTO LE DURA" value={edit.dura || ""} onChange={(ev) => setEdit({ ...edit, dura: ev.target.value })} placeholder="3 a 4 semanas" />
              : <Input label="FORMATO" value={edit.formato || ""} onChange={(ev) => setEdit({ ...edit, formato: ev.target.value })} placeholder="50 ml · 90 días" />}
            {modo === "srv" ? (
              <label className="flex items-center gap-2" style={{ margin: "4px 0 14px", cursor: "pointer" }}>
                <input type="checkbox" checked={!!edit.hombres} onChange={(ev) => setEdit({ ...edit, hombres: ev.target.checked })} style={{ width: 15, height: 15, accentColor: T.bronce }} />
                <span style={{ color: T.tinta, fontSize: 11.5, fontFamily: SANS }}>Mostrar en la sección de hombres</span>
              </label>
            ) : (
              <Input label="CÓMO SE USA" area value={edit.uso || ""} onChange={(ev) => setEdit({ ...edit, uso: ev.target.value })} />
            )}

            <Boton disabled={!edit.n || !edit.p} onClick={() => guardar(edit)}>GUARDAR</Boton>
            {!nuevo && (
              <button onClick={() => borrar(edit)} className="w-full py-3" style={{ marginTop: 8, background: "transparent", border: `1px solid ${T.alerta}`, color: T.alerta, fontSize: 11, letterSpacing: "0.14em", fontFamily: SANS, cursor: "pointer" }}>
                ELIMINAR
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminRetencion({ estilistas, clientas, adiciones = [] }) {
  const filas = estilistas.filter((e) => e.agendaPublica).map((e) => {
    const r = rng(e.id + "fuga");
    const retorno = Math.round(48 + r() * 45);
    const primeraYnunca = Math.round(r() * 7);
    const fueraApp = Math.round(8 + r() * 42);
    const cancel24 = Math.round(r() * 6);
    const riesgo = Math.max(0, Math.min(100, Math.round((100 - retorno) * 0.5 + fueraApp * 0.4 + primeraYnunca * 3)));
    return { e, retorno, primeraYnunca, fueraApp, cancel24, riesgo };
  }).sort((a, b) => b.riesgo - a.riesgo);

  const color = (x) => (x >= 55 ? T.alerta : x >= 35 ? T.bronce : T.ok);

  return (
    <div className="flex flex-col gap-4">
      <Titulo sub="Señales de que una clienta se está saliendo de la plataforma. No es vigilancia del equipo: es salud del negocio.">Retención</Titulo>
      <Card style={{ background: T.crema }}>
        <div style={{ color: T.tinta, fontSize: 12.5, fontFamily: SANS, lineHeight: 1.65 }}>
          La clienta es del atelier, no de la silla. Estas cinco señales, leídas juntas, dicen si alguien está migrando por fuera:
          retorno bajo, primeras citas que no repiten, reservas que dejan de pasar por la app, cancelaciones de último minuto y adiciones en cero.
        </div>
      </Card>
      {filas.map((x) => (
        <Card key={x.e.id} style={{ borderColor: x.riesgo >= 55 ? T.alerta : T.linea }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 40, flexShrink: 0, border: `1px solid ${T.linea}` }}>
              <RetratoPersona p={x.e.retrato} src={x.e.foto} alto={48} />
            </div>
            <div className="flex-1" style={{ minWidth: 0, fontFamily: SANS }}>
              <div style={{ color: T.tinta, fontSize: 12.5 }}>{x.e.n}</div>
              <div style={{ color: T.mute, fontSize: 10.5, marginTop: 2 }}>{x.e.rol}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontFamily: SERIF, fontSize: 22, color: color(x.riesgo), lineHeight: 1 }}>{x.riesgo}</div>
              <div style={{ color: T.mute, fontSize: 8.5, letterSpacing: "0.12em", fontFamily: SANS, marginTop: 3 }}>RIESGO</div>
            </div>
          </div>
          <div style={{ height: 4, background: T.crema, marginTop: 12 }}>
            <div style={{ width: x.riesgo + "%", height: "100%", background: color(x.riesgo) }} />
          </div>
          <div className="grid grid-cols-2 gap-x-4" style={{ marginTop: 12, fontFamily: SANS }}>
            {[["Vuelven antes de 90 días", x.retorno + "%"],
              ["Primera cita sin regreso", x.primeraYnunca],
              ["Reservas fuera de la app", x.fueraApp + "%"],
              ["Canceladas a última hora", x.cancel24]].map(([k, v]) => (
              <div key={k} className="flex justify-between" style={{ padding: "4px 0" }}>
                <span style={{ color: T.mute, fontSize: 10.5 }}>{k}</span>
                <span style={{ color: T.tinta, fontSize: 10.5 }}>{v}</span>
              </div>
            ))}
          </div>
          {x.riesgo >= 55 && (
            <div style={{ background: T.crema, padding: 10, marginTop: 10, fontFamily: SANS }}>
              <div style={{ color: T.alerta, fontSize: 9, letterSpacing: "0.14em" }}>QUÉ HACER</div>
              <div style={{ color: T.tinta, fontSize: 11.5, marginTop: 5, lineHeight: 1.55 }}>
                Llama tú a las {x.primeraYnunca} clientas que no volvieron, ofréceles retoque de cortesía y vuelve a agendarlas
                desde la app con otra profesional. Si regresan, el problema era la silla; si no, era el servicio.
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function AdminAutorizar({ solicitudes, setSolicitudes, adiciones, setAdiciones, registrar, quien }) {
  const pend = solicitudes.filter((x) => x.estado === "pendiente");
  const resueltas = solicitudes.filter((x) => x.estado !== "pendiente");
  const decidir = (x, estado) => {
    setSolicitudes(solicitudes.map((y) => (y.id === x.id ? { ...y, estado } : y)));
    if (estado === "aprobada") setAdiciones(adiciones.filter((a) => a.id !== x.adicionId));
    registrar(quien, estado === "aprobada" ? "Autorizó quitar un servicio" : "Negó quitar un servicio",
      `${x.srvN} de ${x.cliente}, pedido por ${x.profesional.split(" ")[0]} · motivo: ${x.motivo}`);
  };
  return (
    <div className="flex flex-col gap-4">
      <Titulo sub="Las profesionales adicionan solas. Para quitar, tú autorizas. Todo queda registrado.">Autorizaciones</Titulo>
      <div className="grid grid-cols-2 gap-2">
        <Dato label="PENDIENTES" valor={pend.length} color={pend.length ? T.alerta : T.tinta} />
        <Dato label="RESUELTAS" valor={resueltas.length} color={T.ok} />
      </div>
      {pend.length === 0 && (
        <Card><div style={{ color: T.mute, fontSize: 12.5, fontFamily: SANS }}>No hay solicitudes pendientes.</div></Card>
      )}
      {pend.map((x) => (
        <Card key={x.id} style={{ borderColor: T.alerta }}>
          <div className="flex items-start justify-between gap-3" style={{ fontFamily: SANS }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: SERIF, fontSize: 18, color: T.tinta, lineHeight: 1.15 }}>Quitar {x.srvN}</div>
              <div style={{ color: T.mute, fontSize: 11.5, marginTop: 5 }}>
                A {x.cliente} · lo pide {x.profesional.split(" ")[0]}
              </div>
            </div>
            <span style={{ fontFamily: SERIF, fontSize: 17, color: T.bronceOsc, flexShrink: 0 }}>−{cop(x.p)}</span>
          </div>
          <div style={{ background: T.crema, padding: 10, marginTop: 10 }}>
            <div style={{ color: T.mute, fontSize: 9, letterSpacing: "0.14em", fontFamily: SANS }}>MOTIVO</div>
            <div style={{ color: T.tinta, fontSize: 12, marginTop: 4, fontFamily: SANS, lineHeight: 1.5 }}>{x.motivo}</div>
          </div>
          <div className="flex gap-2" style={{ marginTop: 12 }}>
            <button onClick={() => decidir(x, "aprobada")} className="flex-1 py-3" style={{ background: T.tinta, color: "#FFF", border: "none", fontSize: 10.5, letterSpacing: "0.16em", fontFamily: SANS, cursor: "pointer" }}>
              AUTORIZAR
            </button>
            <button onClick={() => decidir(x, "negada")} className="py-3 px-4" style={{ background: "#FFF", border: `1px solid ${T.linea}`, color: T.mute, fontSize: 10.5, fontFamily: SANS, cursor: "pointer" }}>
              Negar
            </button>
          </div>
          <div style={{ color: T.greige, fontSize: 10, marginTop: 8, fontFamily: SANS }}>{x.t}</div>
        </Card>
      ))}
      {resueltas.length > 0 && (
        <div>
          <div style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.12em", fontFamily: SANS, margin: "6px 0 10px" }}>YA RESUELTAS</div>
          {resueltas.map((x) => (
            <Card key={x.id} style={{ padding: 11, marginBottom: 8 }}>
              <div className="flex items-center justify-between gap-3" style={{ fontFamily: SANS }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: T.tinta, fontSize: 12.5 }}>{x.srvN} · {x.cliente}</div>
                  <div style={{ color: T.mute, fontSize: 10.5, marginTop: 2 }}>{x.profesional.split(" ")[0]} · {x.t}</div>
                </div>
                <span style={{ color: x.estado === "aprobada" ? T.ok : T.alerta, fontSize: 9.5, letterSpacing: "0.12em", flexShrink: 0 }}>
                  {x.estado.toUpperCase()}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminProfes({ estilistas, setEstilistas, registrar, quien }) {
  const [edit, setEdit] = useState(null);
  const guardar = (x) => {
    setEstilistas(estilistas.map((y) => (y.id === x.id ? x : y)));
    registrar(quien, "Modificó una profesional", `${x.n} · comisión ${x.com}% · ${x.agendaPublica ? "agenda pública" : "agenda oculta"}`);
    setEdit(null);
  };
  return (
    <div className="flex flex-col gap-4">
      <Titulo sub="Datos, comisión, especialidad y visibilidad. Queda en el historial.">Profesionales</Titulo>
      {estilistas.map((e) => (
        <Card key={e.id} style={{ padding: 11, cursor: "pointer" }} onClick={() => setEdit({ ...e })}>
          <div className="flex items-center gap-3">
            <div style={{ width: 44, flexShrink: 0, border: `1px solid ${T.linea}` }}>
              <RetratoPersona p={e.retrato} src={e.foto} alto={52} />
            </div>
            <div className="flex-1" style={{ minWidth: 0, fontFamily: SANS }}>
              <div style={{ color: T.tinta, fontSize: 12.5 }}>{e.n}</div>
              <div style={{ color: T.mute, fontSize: 10.5, marginTop: 2 }}>{e.rol} · {e.com}% · {fmtCel(e.cel)}</div>
              <div className="flex items-center gap-1" style={{ marginTop: 4 }}>
                <Estrellas v={e.rating} s={9} />
                <span style={{ fontSize: 10, color: e.agendaPublica ? T.ok : T.alerta }}>
                  {e.agendaPublica ? "visible" : "oculta"}
                </span>
              </div>
            </div>
            <span style={{ color: T.greige, fontSize: 9.5, letterSpacing: "0.1em", fontFamily: SANS, flexShrink: 0 }}>EDITAR</span>
          </div>
        </Card>
      ))}

      {edit && (
        <div onClick={() => setEdit(null)} style={{ position: "fixed", inset: 0, background: "rgba(59,53,46,0.55)", zIndex: 70, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={(ev) => ev.stopPropagation()} style={{ background: "#FFF", width: "100%", maxWidth: 480, maxHeight: "92vh", overflowY: "auto", padding: 20 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
              <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 23, color: T.tinta }}>{edit.n.split(" ")[0]}</span>
              <button onClick={() => setEdit(null)} style={{ background: "none", border: "none", cursor: "pointer", color: T.mute, display: "flex" }}><X size={18} /></button>
            </div>
            <Input label="NOMBRE COMPLETO" value={edit.n} onChange={(ev) => setEdit({ ...edit, n: ev.target.value })} />
            <Input label="ROL" value={edit.rol} onChange={(ev) => setEdit({ ...edit, rol: ev.target.value })} />
            <Input label="ESPECIALIDAD QUE VE LA CLIENTA" value={edit.especialidad} onChange={(ev) => setEdit({ ...edit, especialidad: ev.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Input label="CELULAR" value={edit.cel || ""} onChange={(ev) => setEdit({ ...edit, cel: ev.target.value.replace(/\D/g, "") })} />
              <Input label="COMISIÓN (%)" type="number" value={edit.com} onChange={(ev) => setEdit({ ...edit, com: +ev.target.value })} />
            </div>
            <Input label="AÑOS DE EXPERIENCIA" type="number" value={edit.anios} onChange={(ev) => setEdit({ ...edit, anios: +ev.target.value })} />
            <Input label="BIOGRAFÍA" area value={edit.bio} onChange={(ev) => setEdit({ ...edit, bio: ev.target.value })} />
            <Input label="FOTO (URL)" value={edit.foto || ""} onChange={(ev) => setEdit({ ...edit, foto: ev.target.value || null })} placeholder="https://…" />
            <label className="flex items-center gap-2" style={{ margin: "4px 0 14px", cursor: "pointer" }}>
              <input type="checkbox" checked={edit.agendaPublica} onChange={(ev) => setEdit({ ...edit, agendaPublica: ev.target.checked })} style={{ width: 15, height: 15, accentColor: T.bronce }} />
              <span style={{ color: T.tinta, fontSize: 11.5, fontFamily: SANS }}>Agenda pública: las clientas la ven y la eligen</span>
            </label>
            <Boton onClick={() => guardar(edit)}>GUARDAR</Boton>
          </div>
        </div>
      )}
    </div>
  );
}

function Historial({ historial, filtro }) {
  return (
    <div className="flex flex-col gap-4">
      <Titulo sub={filtro ? `Todo lo que has hecho como ${filtro.toLowerCase()}. El súper administrador también lo ve.` : "Todo lo que pasa en la plataforma queda registrado aquí: administración, profesionales y clientas."}>
        {filtro ? "Mi historial" : "Historial"}
      </Titulo>
      <div className="grid grid-cols-2 gap-2">
        <Dato label="MOVIMIENTOS" valor={historial.length} />
        <Dato label="HOY" valor={historial.length} color={T.ok} />
      </div>
      {historial.length === 0 && (
        <Card><div style={{ color: T.mute, fontSize: 12.5, fontFamily: SANS }}>Todavía no hay movimientos registrados en esta sesión.</div></Card>
      )}
      {historial.map((h) => (
        <Card key={h.id} style={{ padding: 12 }}>
          <div className="flex items-start justify-between gap-3" style={{ fontFamily: SANS }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: T.tinta, fontSize: 12.5 }}>{h.accion}</div>
              <div style={{ color: T.mute, fontSize: 11, marginTop: 3, lineHeight: 1.5 }}>{h.detalle}</div>
              <div style={{ color: T.bronceOsc, fontSize: 9, letterSpacing: "0.14em", marginTop: 6 }}>{h.quien.toUpperCase()}</div>
            </div>
            <span style={{ color: T.greige, fontSize: 10, flexShrink: 0, fontFamily: SANS }}>{h.t}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

const IDEAS = [
  { t: "Le Cercle · Club de las Más Bellas", s: "Membresía mensual", d: "Tres niveles con cupo cerrado. Los salones con membresía crecieron 8% contra 2% de los que no la tienen.", m: "Ingreso recurrente" },
  { t: "Abono obligatorio", s: "Protección de cupo", d: "Recordatorios más abono bajan el no-show del 18–22% a menos del 5%. Ya está montado en el embudo.", m: "Margen inmediato" },
  { t: "Suscripción de cuidado en casa", s: "Producto recurrente", d: "Sérum y espuma cada 60 días con envío automático y recordatorio en la app.", m: "Margen de producto" },
  { t: "Atelier de formación", s: "Academia", d: "Curso certificado de lamination y volumen ruso, con kit incluido. Vende la marca, no la camilla.", m: "Ingreso por lote" },
  { t: "Camilla en arriendo", s: "Espacio como servicio", d: "Alquilar camillas por turno a las profesionales aprobadas en la plataforma.", m: "Uso del activo" },
  { t: "Red de artistas", s: "Marketplace", d: "Las aprobadas trabajan bajo la marca en sus propias sedes, con comisión por agenda. Escala sin abrir local.", m: "Escala sin CAPEX" },
];

function SuperAdmin({ sedes, addSede, estilistas, setEstilistas, postulaciones, setPostulaciones,
  servicios, setServicios, productos, setProductos, clientas, historial, registrar, citas, setCitas, cancel, setCancel }) {
  const [tab, setTab] = useState("postulaciones");
  const pend = postulaciones.filter((p) => p.estado === "en revision").length;
  return (
    <div>
      <SubNav tabs={[
        ["postulaciones", `Postulaciones${pend ? " · " + pend : ""}`, Briefcase],
        ["operacion", "Operación", TrendingUp],
        ["historial", `Historial${historial.length ? " · " + historial.length : ""}`, FileText],
        ["red", "Locales", Building2], ["camillas", "Camillas", BedDouble], ["equipo", "Equipo", Users], ["modelos", "Modelos", Layers],
      ]} tab={tab} setTab={setTab} />
      {tab === "postulaciones" && <SaPostulaciones postulaciones={postulaciones} setPostulaciones={setPostulaciones} estilistas={estilistas} setEstilistas={setEstilistas} registrar={registrar} />}
      {tab === "operacion" && (
        <Admin todo servicios={servicios} setServicios={setServicios} productos={productos} setProductos={setProductos}
          estilistas={estilistas} setEstilistas={setEstilistas} clientas={clientas} reservas={[]}
          citas={citas} setCitas={setCitas} cancel={cancel} setCancel={setCancel} registrar={registrar}
          adiciones={adiciones} setAdiciones={setAdiciones} solicitudes={solicitudes} setSolicitudes={setSolicitudes}
          historial={historial}
          addServicio={(x) => setServicios([...servicios, x])} addProducto={(p) => setProductos([...productos, p])} />
      )}
      {tab === "historial" && <Historial historial={historial} />}
      {tab === "red" && <SaRed sedes={sedes} addSede={addSede} />}
      {tab === "camillas" && <SaCamillas sedes={sedes} />}
      {tab === "equipo" && <SaEquipo estilistas={estilistas} setEstilistas={setEstilistas} />}
      {tab === "modelos" && <SaModelos />}
    </div>
  );
}

function SaPostulaciones({ postulaciones, setPostulaciones, estilistas, setEstilistas, registrar }) {
  const set = (id, estado) => setPostulaciones(postulaciones.map((p) => (p.id === id ? { ...p, estado } : p)));
  const aprobar = (p) => {
    setEstilistas([...estilistas, {
      id: "e" + p.id, n: p.n, rol: "Especialista", sede: "sp", com: 35, foto: null, tono: "#D6CBB8",
      retrato: p.retrato, cel: p.cel, ventaMes: 0,
      agendaPublica: true, esAdmin: false, anios: p.anios, atendidas: 0, rating: 5.0,
      especialidad: p.servicios, bio: p.cert || "Recién integrada al atelier.",
      cert: (p.cert || "").split(".").filter(Boolean).map((s) => s.trim()).slice(0, 4),
      dominio: [1, 2, 4], resenas: [],
    }]);
    set(p.id, "aprobada");
    if (registrar) registrar("Súper admin", "Aprobó una postulación", `${p.n} · ${p.profesion || "especialista"}`);
  };
  const color = { "en revision": T.bronce, aprobada: T.ok, rechazada: T.alerta };
  return (
    <div className="flex flex-col gap-4">
      <Titulo sub="Al aprobar, la especialista queda visible con agenda pública, perfil y reseñas.">Postulaciones</Titulo>
      {postulaciones.length === 0 && <Card><div style={{ color: T.mute, fontSize: 12.5, fontFamily: SANS }}>Todavía no hay postulaciones.</div></Card>}
      {postulaciones.map((p) => (
        <Card key={p.id}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3" style={{ minWidth: 0 }}>
              <div style={{ width: 52, flexShrink: 0, border: `1px solid ${T.linea}` }}>
                <RetratoPersona p={p.retrato} alto={62} />
              </div>
              <div style={{ fontFamily: SANS, minWidth: 0 }}>
                <div style={{ fontFamily: SERIF, fontSize: 19, color: T.tinta, lineHeight: 1.15 }}>{p.n}</div>
                <div style={{ color: T.bronceOsc, fontSize: 9.5, letterSpacing: "0.12em", marginTop: 4 }}>{(p.profesion || "").toUpperCase()}</div>
                <div style={{ color: T.mute, fontSize: 11, marginTop: 3 }}>{p.ciudad || "sin ciudad"}</div>
                <div style={{ color: T.mute, fontSize: 11, marginTop: 2 }}>{p.anios} año{p.anios === 1 ? "" : "s"} · {p.cel}</div>
              </div>
            </div>
            <span style={{ color: color[p.estado], fontSize: 9.5, letterSpacing: "0.1em", fontFamily: SANS, flexShrink: 0, textTransform: "uppercase" }}>
              {p.estado === "en revision" ? "en revisión" : p.estado}
            </span>
          </div>
          <div style={{ marginTop: 12, fontFamily: SANS }}>
            <div style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.1em" }}>SERVICIOS QUE DOMINA</div>
            <div style={{ color: T.tinta, fontSize: 12.5, marginTop: 3, lineHeight: 1.5 }}>{p.servicios}</div>
          </div>
          {p.cert && (
            <div style={{ marginTop: 10, fontFamily: SANS }}>
              <div style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.1em" }}>FORMACIÓN</div>
              <div style={{ color: T.tinta, fontSize: 12.5, marginTop: 3, lineHeight: 1.5 }}>{p.cert}</div>
            </div>
          )}
          {p.portafolio && (
            <div className="flex items-center gap-2" style={{ marginTop: 10, color: T.bronceOsc, fontSize: 12, fontFamily: SANS }}>
              <FileText size={13} /> {p.portafolio}
            </div>
          )}
          {p.estado === "en revision" && (
            <div className="flex gap-2" style={{ marginTop: 14 }}>
              <button onClick={() => aprobar(p)} className="flex-1 py-2" style={{ background: T.tinta, color: "#FFF", border: "none", fontSize: 12, letterSpacing: "0.08em", fontFamily: SANS, cursor: "pointer" }}>
                Aprobar y crear agenda
              </button>
              <button onClick={() => set(p.id, "rechazada")} className="py-2 px-3" style={{ background: "#FFF", color: T.mute, border: `1px solid ${T.linea}`, fontSize: 12, fontFamily: SANS, cursor: "pointer" }}>
                Descartar
              </button>
            </div>
          )}
          {p.estado === "aprobada" && (
            <div style={{ marginTop: 14 }}>
              <a href={waLink(`Hola ${p.n.split(" ")[0]}, soy Indiana. Aprobamos tu perfil en la plataforma. Coordinemos tu primer turno.`)} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <Boton tono="verde">Escribirle por WhatsApp</Boton>
              </a>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function SaRed({ sedes, addSede }) {
  const [f, setF] = useState({ nombre: "", dir: "", camillas: "" });
  const hist = ["Abr", "May", "Jun", "Jul", "Ago", "Sep"].map((m, i) => ({ m, v: [19800000, 21400000, 23900000, 24600000, 25850000, 17200000][i] }));
  return (
    <div className="flex flex-col gap-4">
      <Titulo sub={`${sedes.length} local · ${sedes.reduce((a, s) => a + s.camillas, 0)} camillas`}>La red</Titulo>
      <Card>
        <div style={{ color: T.mute, fontSize: 9.5, letterSpacing: "0.1em", fontFamily: SANS }}>VENTA CONSOLIDADA DEL MES</div>
        <div style={{ fontFamily: SERIF, fontSize: 34, color: T.tinta, lineHeight: 1.05, marginTop: 4 }}>{cop(25490000)}</div>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={hist}>
            <defs><linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={T.bronce} stopOpacity={0.3} /><stop offset="100%" stopColor={T.bronce} stopOpacity={0} />
            </linearGradient></defs>
            <XAxis dataKey="m" stroke={T.mute} fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tip} formatter={(v) => cop(v)} />
            <Area type="monotone" dataKey="v" stroke={T.bronce} strokeWidth={1.8} fill="url(#g2)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
      {sedes.map((s) => (
        <Card key={s.id}>
          <div style={{ color: T.tinta, fontSize: 17, fontFamily: SERIF }}>{s.nombre}</div>
          <div style={{ color: T.mute, fontSize: 11, marginTop: 3, fontFamily: SANS }}>{s.dir} · {s.camillas} camillas · desde {s.apertura}</div>
        </Card>
      ))}
      <Card>
        <div style={{ color: T.tinta, fontSize: 13.5, marginBottom: 12, fontFamily: SANS }}>Abrir un local</div>
        <Input label="NOMBRE" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} placeholder="Usaquén" />
        <Input label="DIRECCIÓN" value={f.dir} onChange={(e) => setF({ ...f, dir: e.target.value })} placeholder="Cll 119 # 6-20" />
        <Input label="CAMILLAS" type="number" value={f.camillas} onChange={(e) => setF({ ...f, camillas: e.target.value })} placeholder="3" />
        <Boton disabled={!f.nombre} onClick={() => { addSede({ id: "s" + Date.now(), nombre: f.nombre, dir: f.dir, camillas: +f.camillas || 1, apertura: "2026" }); setF({ nombre: "", dir: "", camillas: "" }); }}>Crear local</Boton>
      </Card>
    </div>
  );
}
function SaCamillas({ sedes }) {
  const [sel, setSel] = useState(sedes[0].id);
  const sede = sedes.find((s) => s.id === sel) || sedes[0];
  const ocup = [86, 68, 41, 30, 25];
  return (
    <div className="flex flex-col gap-4">
      <Titulo sub="Cada camilla es un activo. Estas son sus horas vendidas.">Camillas</Titulo>
      <div className="flex gap-2" style={{ overflowX: "auto" }}>
        {sedes.map((s) => <Chip key={s.id} activo={sel === s.id} onClick={() => setSel(s.id)}>{s.nombre}</Chip>)}
      </div>
      {Array.from({ length: sede.camillas }).map((_, i) => {
        const o = ocup[i] ?? 25, c = o > 70 ? T.ok : o > 45 ? T.bronce : T.alerta;
        return (
          <Card key={i} style={{ padding: 13 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 8, fontFamily: SANS }}>
              <span style={{ color: T.tinta, fontSize: 13 }}>Camilla {i + 1}</span>
              <span style={{ color: c, fontSize: 12 }}>{o}% ocupada</span>
            </div>
            <div style={{ height: 5, background: T.crema }}><div style={{ width: o + "%", height: "100%", background: c }} /></div>
            {o < 45 && <div style={{ color: T.mute, fontSize: 11, marginTop: 8, fontFamily: SANS }}>Candidata a arriendo por turno a las profesionales aprobadas.</div>}
          </Card>
        );
      })}
    </div>
  );
}
function SaEquipo({ estilistas, setEstilistas }) {
  const toggle = (id) => setEstilistas(estilistas.map((e) => (e.id === id ? { ...e, agendaPublica: !e.agendaPublica } : e)));
  return (
    <div className="flex flex-col gap-4">
      <Titulo sub="Quién aparece en la app para que la clienta la elija.">Equipo</Titulo>
      {estilistas.map((e) => (
        <Card key={e.id} style={{ padding: 13 }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 38, flexShrink: 0, border: `1px solid ${T.linea}` }}>
              <RetratoPersona p={e.retrato} src={e.foto} alto={46} />
            </div>
            <div className="flex-1" style={{ fontFamily: SANS }}>
              <div style={{ color: T.tinta, fontSize: 13 }}>{e.n}</div>
              <div style={{ color: T.mute, fontSize: 11, marginTop: 2 }}>{e.rol} · comisión {e.com}% · ★ {e.rating.toFixed(1)}</div>
            </div>
          </div>
          <button onClick={() => toggle(e.id)} className="flex items-center gap-2 w-full" style={{
            marginTop: 10, padding: "8px 10px", background: e.agendaPublica ? T.crema : "transparent",
            border: `1px solid ${T.linea}`, cursor: "pointer", fontFamily: SANS, fontSize: 11.5,
            color: e.agendaPublica ? T.tinta : T.mute,
          }}>
            {e.agendaPublica ? <Eye size={13} /> : <EyeOff size={13} />}
            {e.agendaPublica ? "Agenda pública: las clientas la eligen" : "Agenda oculta: no aparece en la app"}
          </button>
        </Card>
      ))}
    </div>
  );
}
function SaModelos() {
  return (
    <div className="flex flex-col gap-4">
      <Titulo sub="Seis formas de vender que no dependen de abrir otro local.">Modelos de negocio</Titulo>
      {IDEAS.map((x) => (
        <Card key={x.t}>
          <div className="flex items-baseline justify-between gap-2">
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, color: T.tinta, lineHeight: 1.15 }}>{x.t}</span>
            <span style={{ color: T.mute, fontSize: 10.5, flexShrink: 0, fontFamily: SANS }}>{x.s}</span>
          </div>
          <p style={{ color: T.mute, fontSize: 12, margin: "8px 0 10px", lineHeight: 1.55, fontFamily: SANS }}>{x.d}</p>
          <span className="px-2 py-1" style={{ background: T.crema, color: T.bronceOsc, fontSize: 10, letterSpacing: "0.08em", fontFamily: SANS }}>{x.m}</span>
        </Card>
      ))}
    </div>
  );
}

/* ─────────────────  NAV  ───────────────── */
function SubNav({ tabs, tab, setTab }) {
  return (
    <div className="flex gap-4" style={{ overflowX: "auto", paddingBottom: 10, marginBottom: 14, borderBottom: `1px solid ${T.linea}` }}>
      {tabs.map(([k, l, Icon]) => (
        <button key={k} onClick={() => setTab(k)} className="flex items-center gap-1" style={{
          background: "none", border: "none", padding: "0 0 8px", cursor: "pointer", flexShrink: 0,
          color: tab === k ? T.tinta : T.mute, fontSize: 12, fontFamily: SANS,
          borderBottom: `1.5px solid ${tab === k ? T.bronce : "transparent"}`, marginBottom: -11,
        }}>
          <Icon size={13} /> {l}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────  APP  ───────────────── */
export default function App() {
  const [clientas, setClientas] = useState(CLIENTAS_BASE);
  const [sesion, setSesion] = useState(null);
  const [saludo, setSaludo] = useState(null);
  const [servicios, setServicios] = useState(SERVICIOS_BASE);
  const [productos, setProductos] = useState(PRODUCTOS_BASE);
  const [estilistas, setEstilistas] = useState(ESTILISTAS_BASE);
  const [sedes, setSedes] = useState(SEDES);
  const [postulaciones, setPostulaciones] = useState(POSTULACIONES_BASE);
  const [ritual, setRitual] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [cancel, setCancel] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [adiciones, setAdiciones] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const registrar = (quien, accion, detalle) =>
    setHistorial((h) => [{ id: nuevoId(), t: new Date().toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }), quien, accion, detalle }, ...h]);

  useEffect(() => {
    if (!saludo) return;
    const t = setTimeout(() => { setSesion(saludo); setSaludo(null); }, 2000);
    return () => clearTimeout(t);
  }, [saludo]);

  if (saludo) return <Saludo nombre={saludo.nombre} nueva={saludo.nueva} equipo={saludo.equipo} titulo={saludo.titulo} />;
  if (!sesion) return (
    <Ingreso clientas={clientas}
      onEquipo={(cel, e) => setSaludo({ cel, nombre: e.nombre, rol: e.rol, estId: e.estId, titulo: e.titulo, completo: e.completo, equipo: true })}
      onEntrar={(cel, nombre) => setSaludo({ cel, nombre, rol: "usuaria", nueva: false })}
      onRegistrar={(cel, nombre) => {
        setClientas({
          ...clientas,
          [cel]: { nombre, apellido: "", desde: "hoy", visitas: 0, ultima: "—", fav: "—", nota: "", retrato: { id: "c" + cel.slice(-3), piel: "media", pelo: "chocolate", masa: "suelto", flequillo: "lado" } },
        });
        setSaludo({ cel, nombre, rol: "usuaria", nueva: true });
      }} />
  );

  const rol = sesion.rol || "usuaria";

  return (
    <div style={{ background: T.papel, minHeight: "100vh", fontFamily: SANS, color: T.tinta }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap');
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar { display: none; }
        @keyframes aparecer { from { opacity: 0; transform: scale(1.012); } to { opacity: 1; transform: none; } }
        @keyframes brotar { from { opacity: 0; transform: scale(0.12); } to { opacity: 1; transform: none; } }
        button:active { transform: scale(0.985); }
        input::placeholder, textarea::placeholder { color: ${T.greige}; }
        button:focus-visible, input:focus-visible, textarea:focus-visible { outline: 1.5px solid ${T.bronce}; outline-offset: 2px; }
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 100px" }}>
        <header className="flex items-center justify-between" style={{ marginBottom: 18 }}>
          <div className="flex items-center gap-3">
            <Monograma s={42} />
            <div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, lineHeight: 1, color: T.tinta }}>{APP_NOMBRE}</div>
              <div style={{ fontFamily: SANS, fontSize: 8, letterSpacing: "0.26em", color: T.bronceOsc, marginTop: 5 }}>{APP_SUB}</div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: T.mute, marginTop: 3 }}>{APP_LEMA}</div>
            </div>
          </div>
        </header>

        <div className="flex items-center gap-3" style={{ background: "#FFF", border: `1px solid ${T.linea}`, padding: "10px 12px", marginBottom: 16 }}>
          <div style={{ width: 34, height: 34, borderRadius: 999, background: T.crema, color: T.bronceOsc, display: "grid", placeItems: "center", fontFamily: SERIF, fontSize: 17, flexShrink: 0 }}>
            {sesion.nombre[0]}
          </div>
          <div className="flex-1" style={{ minWidth: 0, fontFamily: SANS }}>
            <div style={{ color: T.tinta, fontSize: 13 }}>{sesion.equipo ? sesion.completo : sesion.nombre}</div>
            <div style={{ color: sesion.equipo ? T.bronceOsc : T.mute, fontSize: 10.5, marginTop: 2, letterSpacing: sesion.equipo ? "0.1em" : 0 }}>
              {sesion.equipo ? sesion.titulo.toUpperCase() : fmtCel(sesion.cel)}
            </div>
          </div>
          <button onClick={() => { setSesion(null); setRitual([]); }} style={{ background: "none", border: `1px solid ${T.linea}`, color: T.mute, fontSize: 10.5, fontFamily: SANS, cursor: "pointer", padding: "6px 10px", flexShrink: 0 }}>
            Salir
          </button>
        </div>

        {rol === "usuaria" && (
          <Usuaria servicios={servicios} productos={productos} estilistas={estilistas} sesion={sesion}
            ritual={ritual} setRitual={setRitual} citas={citas} cancel={cancel}
            postulaciones={postulaciones} addPostulacion={(p) => setPostulaciones([p, ...postulaciones])}
            addReserva={(r) => {
              setReservas([r, ...reservas]);
              setCitas((c) => [...c, { id: nuevoId(), est: r.estId, dia: r.dia, i: r.slot, d: r.totalMin, cliente: r.cliente, srvN: r.srvN }]);
              registrar(r.cliente, "Reservó por la app", `${r.srvN} con ${r.est}, ${DIAS_N[r.dia]} ${FECHAS[r.dia]} ${fmt(r.slot)}`);
            }} />
        )}
                {rol === "especialista" && (
          <Especialista fijo={sesion.estId} servicios={servicios} productos={productos} estilistas={estilistas} citas={citas} cancel={cancel}
            adiciones={adiciones} setAdiciones={setAdiciones}
            solicitudes={solicitudes} setSolicitudes={setSolicitudes} registrar={registrar} />
        )}
        {rol === "admin" && (
          <Admin servicios={servicios} setServicios={setServicios} productos={productos} setProductos={setProductos}
            estilistas={estilistas} setEstilistas={setEstilistas} clientas={clientas} reservas={reservas}
            citas={citas} setCitas={setCitas} cancel={cancel} setCancel={setCancel} registrar={registrar}
            adiciones={adiciones} setAdiciones={setAdiciones} solicitudes={solicitudes} setSolicitudes={setSolicitudes}
            historial={historial} miEstId={sesion.estId}
            addServicio={(x) => setServicios([...servicios, x])} addProducto={(p) => setProductos([...productos, p])} />
        )}
        {rol === "super" && (
          <SuperAdmin sedes={sedes} addSede={(x) => { setSedes([...sedes, x]); registrar("Súper admin", "Creó un local", x.nombre); }}
            estilistas={estilistas} setEstilistas={setEstilistas}
            servicios={servicios} setServicios={setServicios} productos={productos} setProductos={setProductos}
            clientas={clientas} historial={historial} registrar={registrar}
            adiciones={adiciones} setAdiciones={setAdiciones} solicitudes={solicitudes} setSolicitudes={setSolicitudes}
            citas={citas} setCitas={setCitas} cancel={cancel} setCancel={setCancel}
            postulaciones={postulaciones} setPostulaciones={setPostulaciones} />
        )}
      </div>

      {rol !== "admin" && rol !== "super" && <a href={waLink(`Soy ${sesion.nombre}. Escribo desde la app de Arquitecta de Miradas.`)} target="_blank" rel="noreferrer"
        style={{
          position: "fixed", bottom: 18, left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 8, padding: "11px 18px",
          background: T.verde, color: "#FFF", textDecoration: "none", borderRadius: 999,
          boxShadow: "0 4px 18px rgba(0,0,0,0.16)", fontFamily: SANS, fontSize: 12.5, zIndex: 50, whiteSpace: "nowrap",
        }}>
        <MessageCircle size={16} /> Escribir a Indiana
      </a>}
    </div>
  );
}
