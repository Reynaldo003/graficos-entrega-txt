import "./entregas-tuxtepec-theme.css";
// src/App.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  CarFront,
  CalendarDays,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Loader2,
  Phone,
  UserStar,
  Hash,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
  TableProperties,
  BarChart3,
  Palette,
  Trophy,
  Gauge,
  Activity,
  Timer,
  CalendarCheck2,
  UserRound,
  ClipboardList,
  PlusCircle,
  Building2,
  Calendar,
  Car,
  ClipboardCheck,
  MessageSquare,
  RotateCcw,
  User,
  UserCheck,
  Layers3,
  SlidersHorizontal,
  CircleHelp,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

import { apiEntregas } from "./lib/apiEntregas";
import { apiEntrega } from "./lib/apiEntrega";

const DEFAULT_DEALER = "VW Tuxtepec";
const BRAND_BLUE = "#131E5C";
const SKY = "#0EA5E9";
const EMERALD = "#059669";
const AMBER = "#D97706";
const SLATE = "#64748B";

const HOURS = Array.from(
  { length: 9 },
  (_, index) => `${String(index + 10).padStart(2, "0")}:00`
);

const PIE_COLORS = [EMERALD, AMBER];

const DEALERS = [
  "VW Tuxtepec",
];
const TIPO_VENTA = ["Nuevos", "Usados", "Comerciales"];

const MODELOS = [
  "Virtus",
  "Polo",
  "Jetta",
  "Jetta GLI",
  "Golf GTI",
  "Taos",
  "Nivus",
  "Taigun",
  "Tiguan",
  "Teramont",
  "Crossport",
  "Saveiro",
  "Amarok",
  "Seminuevos",
  "Tera",
  "Avaluo",
  "Transporter",
  "Caddy",
  "Crafter",
];

const VERSIONES = [
  "Track",
  "Trendline",
  "Comfortline",
  "Highline",
  "Life",
  "Style",
  "Sportline",
  "R-Line",
  "GLI",
  "GTI",
  "GT",
  "Track",
  "R",
  "Peak Edition",
  "Dark Label",
  "Panamericana",
  "Aventura",
  "Robust",
  "Extreme",
  "Goal",
  "Maxi Cargo",
  "Cargo Van",
];

const COLORES = [
  "Blanco Candy",
  "Blanco Puro",
  "Plata Reflex",
  "Plata Pirita",
  "Plata Sirius",
  "Gris Platino",
  "Gris Carbon Steel",
  "Gris Franela",
  "Gris Olivo",
  "Gris Ascot",
  "Gris Moonstone",
  "Negro Ninja",
  "Negro Profundo",
  "Azul Rising",
  "Azul Monterrey",
  "Rojo Wild Cherry",
  "Rojo Kings",
  "Amarillo Kurkuma",
  "Verde Vibrante",
  "Verde Avocado",
];

const ASESORES = [
  "AURA MARLIZETH FERNANDEZ LOPEZ",
  "Bianca Isabel Chavez Alarcon",
  "ERENDIRA SANTOS COYOTZI",
  "IRENE DEL CARMEN GUIZA LOPEZ",
  "MARCOS RAUL DIAZ RAMOS",
  "MARIO ALBERTO LOPEZ RAMOS",
  "MARISOL LAGUNES GONZALEZ",
  "NALLELY HERNANDEZ GARCIA",
  "OCTAVIO BRUNO GONZALEZ",
  "ROGELIO VAZQUEZ SANCHEZ",
  "RUBEN ALBERTO TOSQUY ADRIANO",
  "Saja Azzam Mohammad Jamous",
  "SANDRA LUZ PRIETO PEREZ",
  "YAMIL MISAEL RODRIGUEZ AGUILAR",
  "LUIS ALFONSO CORIA MARROQUIN",
  "CANDY DENISSE MARQUEZ CORTES",
  "DELMAR JAVIER ILLESCAS DOMINGUEZ",
  "EDGAR JESUS GOMEZ PEREZ",
  "VALERIA ZILLI DURANTE",
  "Idalmy Jiménez",
  "Carlos Arturo Garces Vengas",
  "Edgar Omar Noguera Solis",
  "Javier Perez Meraz",
  "Luis Armando Almora Perez",
  "Mara Erubey Soto Villegas",
  "Sergio Ivan Quintana Martinez",
  "Sergio Rene Delgado Sarmiento",
  "Yoseth Ruiz Castellanos",
  "Blanca Patricia Hernández Hernández", 
  "Luis Manuel Hernández Espejo",
  "Luz Eugenia Hernandez Bustos",
];

function normalizeStr(value) {
  return String(value ?? "").trim();
}

function normalizeKey(value) {
  return normalizeStr(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function sameDealer(value) {
  return normalizeKey(value) === normalizeKey(DEFAULT_DEALER);
}

function existeConflictoHorario(entregas, dealer, fechaHoraISO, idExcluir = null) {
  if (!dealer || !fechaHoraISO) return false;

  const objetivo = new Date(fechaHoraISO).getTime();
  if (Number.isNaN(objetivo)) return false;

  return entregas.some((row) => {
    if (idExcluir && row.id === idExcluir) return false;
    if (normalizeKey(row.agencia) !== normalizeKey(dealer)) return false;
    if (!row.fecha_hora_entrega) return false;

    return new Date(row.fecha_hora_entrega).getTime() === objetivo;
  });
}

function entregaFisicaActiva(value) {
  if (value === true || value === 1) return true;

  const v = normalizeKey(value);

  return ["si", "sí", "true", "1", "yes", "entregada", "reportada"].includes(v);
}

function Skeleton({ className = "" }) {
  return (
    <div
      className={["animate-pulse rounded-md bg-black/10", className].join(" ")}
    />
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 12 }).map((_, index) => (
        <td key={index} className="px-4 py-3">
          <div className="h-4 w-28 rounded bg-slate-200/70" />
        </td>
      ))}
    </tr>
  );
}

function toYMDLocal(dateLike) {
  const date = new Date(dateLike);

  if (Number.isNaN(date.getTime())) return "";

  const pad = (n) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

function parseYMDLocal(ymd) {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return new Date();

  const [year, month, day] = ymd.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function ymdToInt(ymd) {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;

  return Number(ymd.replaceAll("-", ""));
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);

  return d;
}

function startOfWeekMonday(date) {
  const d = new Date(date);
  const jsDay = d.getDay();
  const deltaToMonday = (jsDay + 6) % 7;

  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - deltaToMonday);

  return d;
}

function formatWeekTitle(startDate, endDate) {
  const start = startDate.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
  });

  const end = endDate.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `${start} — ${end}`;
}

function weekdayShortEs(dateObj) {
  const map = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return map[dateObj.getDay()] || "";
}

function formatCardTime(dateLike) {
  if (!dateLike) return "—";

  const date = new Date(dateLike);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(dateLike) {
  if (!dateLike) return "—";

  const date = new Date(dateLike);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getHourKey(dateLike) {
  if (!dateLike) return "";

  const date = new Date(dateLike);

  if (Number.isNaN(date.getTime())) return "";

  return `${String(date.getHours()).padStart(2, "0")}:00`;
}

function getMonthKey(dateLike) {
  if (!dateLike) return "";

  const date = new Date(dateLike);

  if (Number.isNaN(date.getTime())) return "";

  const pad = (n) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function formatShortDate(ymd) {
  if (!ymd) return "Sin fecha";

  const date = parseYMDLocal(ymd);

  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
  });
}

function getWeekdayName(dateLike) {
  if (!dateLike) return "Sin fecha";

  const date = new Date(dateLike);

  if (Number.isNaN(date.getTime())) return "Sin fecha";

  return date.toLocaleDateString("es-MX", {
    weekday: "long",
  });
}


function crearFechaHoraLocal(dayKey, hour) {
  if (!dayKey || !hour) return "";

  return `${dayKey}T${hour}`;
}

function combinarFechaHora(fechaYMD, hora) {
  if (!fechaYMD || !hora) return "";
  return `${fechaYMD}T${hora}`;
}

function partirFechaHora(fechaHoraLocal) {
  if (!fechaHoraLocal || !fechaHoraLocal.includes("T")) {
    return { fecha: "", hora: "" };
  }
  const [fecha, horaCompleta] = fechaHoraLocal.split("T");
  return { fecha, hora: horaCompleta ? horaCompleta.slice(0, 5) : "" };
}

function formatEncabezadoFecha(fechaHoraLocal) {
  const { fecha, hora } = partirFechaHora(fechaHoraLocal);
  if (!fecha) return "Selecciona fecha y hora";

  const dateObj = parseYMDLocal(fecha);
  const texto = dateObj.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const capitalizado = texto.charAt(0).toUpperCase() + texto.slice(1);

  return hora ? `${capitalizado} · ${hora}` : capitalizado;
}

function crearEstadoInicialEntrega(fechaEntrega = "") {
  return {
    dealer: DEFAULT_DEALER,
    nombre: "",
    telefono: "",
    vin: "",
    tipoVenta: "",
    modelo: "",
    version: "",
    color: "",
    fechaEntrega,
    asesorVentas: "",
    comentarios: "",
  };
}

function nombrePdfSeguro(form, id) {
  const cliente = form?.nombre || "cliente";

  const limpio = cliente
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, "_")
    .toLowerCase();

  return `programacion_entrega_${id}_${limpio}.pdf`;
}

function crearPayloadEntrega(form) {
  return {
    agencia: form.dealer,
    nombre: form.nombre.trim(),
    telefono: form.telefono.trim(),
    correo: "",
    vin: form.vin.trim().toUpperCase(),
    tipo_venta: form.tipoVenta,
    modelo_version: form.modelo,
    version: form.version,
    color: form.color,
    fecha_hora_entrega: form.fechaEntrega || null,
    entrega_reportada: false,
    asesor_ventas: form.asesorVentas,
    preparada_por: "",
    id_cliente_sf_nadin: "",
    id_cliente_sf_dms: "",
    comentarios: form.comentarios.trim(),
  };
}

function countBy(rows, getKey, labelKey = "name") {
  const map = {};

  for (const row of rows) {
    const key = normalizeStr(getKey(row)) || "Sin capturar";

    if (!map[key]) {
      map[key] = {
        [labelKey]: key,
        total: 0,
      };
    }

    map[key].total += 1;
  }

  return Object.values(map).sort((a, b) => b.total - a.total);
}

function FilterBlock({ label, children }) {
  return (
    <div className="rounded-lg">
      <div className="mb-2 text-xs font-extrabold uppercase tracking-wide text-[#131E5C]">
        {label}
      </div>

      {children}
    </div>
  );
}

function ViewButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-black transition sm:px-5",
        active
          ? "rounded-xl bg-white text-[#0b2257] shadow-lg"
          : "text-white hover:bg-white/10",
      ].join(" ")}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function StatusBadge({ row, compact = false }) {
  const entregada = entregaFisicaActiva(row?.entrega_reportada);

  return (
    <span
      className={[
        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border font-extrabold",
        compact ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs",
        entregada
          ? "border-emerald-300 bg-emerald-100 text-emerald-800"
          : "border-amber-300 bg-amber-100 text-amber-800",
      ].join(" ")}
      title={entregada ? "Entrega física realizada" : "Entrega física pendiente"}
    >
      {entregada ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <Clock3 className="h-3.5 w-3.5" />
      )}

      {compact ? (entregada ? "Sí" : "No") : entregada ? "Entregada" : "Pendiente"}
    </span>
  );
}

function EntregaAgendaCard({ row, compact = false, onClick }) {
  const entregada = entregaFisicaActiva(row?.entrega_reportada);
  const nombreCliente = row?.cliente?.nombre || "Sin nombre";
  const modelo = row?.modelo_version || "Modelo sin capturar";
  const tipoVenta = row?.tipo_venta || "";
  const futura = row?.fecha_hora_entrega && new Date(row.fecha_hora_entrega).getTime() > Date.now();
  const estado = entregada ? "Confirmada" : futura ? "Programada" : "Por confirmar";

  return (
    <div
      onClick={() => onClick?.(row)}
      role="button"
      tabIndex={0}
      className={[
        "relative w-full cursor-pointer overflow-hidden rounded-lg border text-left shadow-sm transition hover:-translate-y-[1px] hover:shadow-md",
        compact ? "p-1.5" : "p-3",
        entregada ? "border-emerald-300 bg-emerald-50/95" : futura ? "border-sky-300 bg-sky-50/95" : "border-amber-300 bg-amber-50/95",
      ].join(" ")}
    >
      <span
        className={[
          "absolute bottom-0 left-0 top-0 flex w-2 items-center justify-center",
          entregada ? "bg-emerald-500" : futura ? "bg-sky-500" : "bg-amber-500",
        ].join(" ")}
      />

      <div className="pl-2">
        <div className={compact ? "grid gap-1.5" : "flex items-start justify-between gap-2"}>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1.5 text-[10px] font-black text-[#131E5C]">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />

              <span className="shrink-0">
                {formatCardTime(row.fecha_hora_entrega)}
              </span>
            </div>

            <div className={`mt-1 text-[11px] font-black uppercase leading-tight tracking-wide text-[#131E5C] ${compact ? "break-words [overflow-wrap:anywhere]" : "line-clamp-2"}`}>
              {nombreCliente}
            </div>
          </div>

          <span className={[
            "w-fit shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-black",
            entregada ? "bg-emerald-100 text-emerald-700" : futura ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700",
          ].join(" ")}>{estado}</span>
        </div>

        <div className="mt-1.5 grid gap-1 text-[9px] font-semibold leading-tight text-slate-600">
          <div className="flex min-w-0 items-center gap-1.5">
            <CarFront className="h-3.5 w-3.5 shrink-0 text-[#131E5C]" />
            <span className={compact ? "break-words [overflow-wrap:anywhere]" : "truncate"}>
              {modelo}
            </span>
          </div>

          {tipoVenta ? (
            <div className="flex min-w-0 items-center gap-1.5">
              <CarFront className="h-3.5 w-3.5 shrink-0 text-[#131E5C]" />
              <span className={compact ? "break-words [overflow-wrap:anywhere]" : "truncate"}>Tipo de venta: {tipoVenta}</span>
            </div>
          ) : null}

        </div>
      </div>
    </div>
  );
}

function AgendaMobileList({
  rows,
  availabilityRows = rows,
  loading,
  currentWeekDate,
  onDisponibleClick,
  onCardClick,
}) {
  const weekStart = useMemo(
    () => startOfWeekMonday(currentWeekDate),
    [currentWeekDate]
  );

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart]
  );

  const todayIso = toYMDLocal(new Date());

  const crearMapaPorSlot = (items) => {
    const map = new Map();

    for (const row of items) {
      if (!row.fecha_hora_entrega) continue;

      const dayKey = toYMDLocal(row.fecha_hora_entrega);
      const hourKey = getHourKey(row.fecha_hora_entrega);
      const key = `${dayKey}|${hourKey}`;

      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    }

    for (const list of map.values()) {
      list.sort(
        (a, b) =>
          new Date(a.fecha_hora_entrega).getTime() -
          new Date(b.fecha_hora_entrega).getTime()
      );
    }

    return map;
  };

  const rowsBySlot = useMemo(() => crearMapaPorSlot(rows), [rows]);

  const availabilityRowsBySlot = useMemo(
    () => crearMapaPorSlot(availabilityRows),
    [availabilityRows]
  );

  if (loading) {
    return (
      <div className="grid gap-3 lg:hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-black/10 bg-white p-4 shadow-sm"
          >
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-3 h-4 w-28" />
            <Skeleton className="mt-3 h-4 w-56" />
            <Skeleton className="mt-4 h-8 w-24 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:hidden">
      {weekDays.map((day) => {
        const dayKey = toYMDLocal(day);
        const isToday = dayKey === todayIso;

        return (
          <section
            key={dayKey}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
              <div className="min-w-0">
                <h3
                  className={[
                    "text-xs font-black uppercase tracking-wide",
                    isToday ? "text-blue-600" : "text-[#131E5C]",
                  ].join(" ")}
                >
                  {day.toLocaleDateString("es-MX", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                  })}
                </h3>
              </div>

              {isToday ? (
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-black text-blue-700">
                  Hoy
                </span>
              ) : null}
            </div>

            <div className="divide-y divide-slate-100">
              {HOURS.map((hour) => {
                const slotKey = `${dayKey}|${hour}`;
                const items = rowsBySlot.get(slotKey) || [];
                const availabilityItems = availabilityRowsBySlot.get(slotKey) || [];
                const disponible = availabilityItems.length === 0;
                const ocupadoOculto = !disponible && items.length === 0;

                return (
                  <div key={slotKey} className="p-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="inline-flex rounded-lg bg-[#131E5C]/10 px-2.5 py-1 text-[11px] font-black text-[#131E5C]">
                        {hour}
                      </span>

                    </div>

                    {disponible ? (
                      <button
                        type="button"
                        onClick={() => onDisponibleClick?.({ dayKey, hour })}
                        className="flex w-full items-center justify-center rounded-lg border border-dashed border-sky-200 bg-sky-50/50 px-3 py-4 text-xs font-black text-sky-700 transition hover:border-sky-500 hover:bg-sky-100"
                      >
                        Horario disponible
                      </button>
                    ) : ocupadoOculto ? (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-4 text-center text-xs font-black text-amber-700">
                        Horario ocupado por un registro oculto por filtros
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        {items.map((row) => (
                          <EntregaAgendaCard key={row.id} row={row} compact onClick={onCardClick} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function AgendaWeekView({
  rows,
  availabilityRows = rows,
  loading,
  currentWeekDate,
  setCurrentWeekDate,
  selectedDay,
  setSelectedDay,
  agendaMode,
  setAgendaMode,
  onDisponibleClick,
  onCardClick,
}) {
  const weekStart = useMemo(
    () => startOfWeekMonday(currentWeekDate),
    [currentWeekDate]
  );

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);

  const weekEnd = weekDays[weekDays.length - 1];
  const todayIso = toYMDLocal(new Date());

  const crearMapaPorSlot = (items) => {
    const map = new Map();

    for (const row of items) {
      if (!row.fecha_hora_entrega) continue;

      const dayKey = toYMDLocal(row.fecha_hora_entrega);
      const hourKey = getHourKey(row.fecha_hora_entrega);
      const key = `${dayKey}|${hourKey}`;

      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    }

    for (const list of map.values()) {
      list.sort(
        (a, b) =>
          new Date(a.fecha_hora_entrega).getTime() -
          new Date(b.fecha_hora_entrega).getTime()
      );
    }

    return map;
  };

  const rowsBySlot = useMemo(() => crearMapaPorSlot(rows), [rows]);

  const availabilityRowsBySlot = useMemo(
    () => crearMapaPorSlot(availabilityRows),
    [availabilityRows]
  );

  const outOfScheduleRows = useMemo(() => {
    return rows.filter((row) => {
      if (!row.fecha_hora_entrega) return true;

      const hour = getHourKey(row.fecha_hora_entrega);

      return !HOURS.includes(hour);
    });
  }, [rows]);

  const goPrevWeek = () => {
    setCurrentWeekDate((prev) => addDays(prev, -7));
    setSelectedDay((prev) => toYMDLocal(addDays(parseYMDLocal(prev), -7)));
  };
  const goNextWeek = () => {
    setCurrentWeekDate((prev) => addDays(prev, 7));
    setSelectedDay((prev) => toYMDLocal(addDays(parseYMDLocal(prev), 7)));
  };
  const displayedDays = agendaMode === "day"
    ? weekDays.filter((day) => toYMDLocal(day) === selectedDay)
    : weekDays;
  const safeDays = displayedDays.length ? displayedDays : weekDays;
  const gridStyle = { gridTemplateColumns: `76px repeat(${HOURS.length}, minmax(96px, 1fr))` };
  const currentHour = `${String(new Date().getHours()).padStart(2, "0")}:00`;
  const currentHourIndex = HOURS.indexOf(currentHour);
  const currentHourLinePosition = currentHourIndex >= 0
    ? {
        left: `calc(${((currentHourIndex + 0.5) / HOURS.length) * 100}% + ${76 * (1 - ((currentHourIndex + 0.5) / HOURS.length))}px)`,
      }
    : null;

  const handleNuevaEntrega = () => {
    const dayKey = selectedDay || toYMDLocal(weekStart);
    const freeHour = HOURS.find((hour) => !(availabilityRowsBySlot.get(`${dayKey}|${hour}`) || []).length) || HOURS[0];
    onDisponibleClick?.({ dayKey, hour: freeHour });
  };

  return (
    <div className="hidden lg:block">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={goPrevWeek}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#131E5C] hover:bg-slate-100"
            aria-label="Semana anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={goNextWeek}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#131E5C] hover:bg-slate-100"
            aria-label="Semana siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="truncate text-sm font-black text-[#131E5C]">Semana del {formatWeekTitle(weekStart, weekEnd)}</div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
            <button type="button" onClick={() => setAgendaMode("week")} className={`rounded-md px-3 py-1.5 text-[10px] font-black ${agendaMode === "week" ? "bg-[#131E5C] text-white" : "text-slate-600"}`}>Semana</button>
            <button type="button" onClick={() => setAgendaMode("day")} className={`rounded-md px-3 py-1.5 text-[10px] font-black ${agendaMode === "day" ? "bg-white text-[#131E5C] shadow-sm" : "text-slate-600"}`}>Día</button>
          </div>
          <button type="button" onClick={handleNuevaEntrega} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0756a3] px-3 py-2 text-[10px] font-black text-white hover:bg-[#064780]"><PlusCircle className="h-3.5 w-3.5" />Nueva entrega</button>
        </div>
      </div>

      <div className="calendar-scroll overflow-auto bg-white">
        <div className="relative grid min-w-[940px] w-full" style={gridStyle}>
          {currentHourLinePosition ? (
            <div className="pointer-events-none absolute bottom-0 top-[37px] z-10 border-l border-dashed border-sky-500" style={currentHourLinePosition}>
              <span className="absolute -left-1 top-0 h-2 w-2 rounded-full bg-sky-500" />
            </div>
          ) : null}
          <div className="sticky left-0 z-30 border-b border-r border-slate-200 bg-slate-50 px-2 py-3 text-[10px] font-black text-slate-500">
            Día
          </div>

          {HOURS.map((hour) => (
            <div
              key={hour}
              className="border-b border-r border-slate-200 bg-slate-50 px-2 py-3 text-center text-[10px] font-black text-[#131E5C]"
            >
              {hour}
            </div>
          ))}

          {loading ? (
            <>
              {safeDays.map((day) => {
                const dayKey = toYMDLocal(day);
                return (
                  <div key={`loader-${dayKey}`} className="contents">
                    <div className="sticky left-0 z-20 border-b border-r border-slate-200 bg-white p-2"><Skeleton className="h-3 w-12" /></div>
                    {HOURS.map((hour) => <div key={`${dayKey}-${hour}`} className="min-h-[72px] border-b border-r border-slate-200 p-1"><Skeleton className="h-14 w-full" /></div>)}
                  </div>
                );
              })}
            </>
          ) : (
            safeDays.map((day) => {
              const dayKey = toYMDLocal(day);
              const isToday = dayKey === todayIso;
              const count = rows.filter((row) => toYMDLocal(row.fecha_hora_entrega) === dayKey).length;
              return (
                <div key={dayKey} className="contents">
                  <div
                    onClick={() => setSelectedDay(dayKey)}
                    className={`sticky left-0 z-20 cursor-pointer border-b border-r border-slate-200 px-2 py-2 text-center ${isToday ? "bg-sky-50 text-[#0756a3]" : selectedDay === dayKey ? "bg-slate-100" : "bg-white text-[#131E5C]"}`}
                  >
                    <div className="text-[10px] font-black">{weekdayShortEs(day)} {day.getDate()}</div>
                    <span className="mt-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-200 px-1 text-[8px] text-slate-600">{count}</span>
                  </div>
                  {HOURS.map((hour) => {
                    const slotKey = `${dayKey}|${hour}`;
                    const items = rowsBySlot.get(slotKey) || [];
                    const availabilityItems = availabilityRowsBySlot.get(slotKey) || [];
                    const disponible = availabilityItems.length === 0;
                    const ocupadoOculto = !disponible && items.length === 0;
                    const visibleItems = items.slice(0, 1);
                    const hiddenCount = items.length - visibleItems.length;

                    return (
                      <div
                        key={slotKey}
                        onClick={() => setSelectedDay(dayKey)}
                        className={`relative min-h-[68px] border-b border-r border-slate-200 p-1 transition ${dayKey === todayIso ? "bg-sky-50/40" : "bg-white"}`}
                      >
                        {disponible ? (
                          <button
                            type="button"
                            onClick={() => onDisponibleClick?.({ dayKey, hour })}
                            aria-label={`Agregar entrega el ${dayKey} a las ${hour}`}
                            className="h-full min-h-[60px] w-full rounded-md transition hover:bg-sky-50"
                          />
                        ) : ocupadoOculto ? (
                          <div className="flex min-h-[60px] items-center justify-center rounded-md bg-slate-50 px-1 text-center text-[8px] font-bold text-slate-400">Ocupado</div>
                        ) : (
                          <div className="relative z-20 grid gap-1">
                            {visibleItems.map((row) => (
                              <EntregaAgendaCard
                                key={row.id}
                                row={row}
                                compact
                                onClick={onCardClick}
                              />
                            ))}

                            {hiddenCount > 0 ? (
                              <div className="rounded bg-slate-100 px-1 py-0.5 text-center text-[8px] font-black text-[#131E5C]">
                                +{hiddenCount} entrega
                                {hiddenCount === 1 ? "" : "s"}
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>

      {!loading && outOfScheduleRows.length ? (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="mb-2 text-xs font-black uppercase tracking-wide text-amber-800">
            Entregas sin hora o fuera del rango 10:00 - 18:00
          </div>

          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {outOfScheduleRows.map((row) => (
              <EntregaAgendaCard key={row.id} row={row} compact onClick={onCardClick} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}


const inputModalBase =
  "w-full min-h-[42px] rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-[#131E5C] outline-none transition placeholder:text-slate-400 focus:border-[#131E5C] focus:ring-2 focus:ring-[#131E5C]/15 disabled:opacity-60";

function CampoModal({ error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {children}
      {error ? (
        <span className="text-[11px] font-bold text-red-600">⚠ {error}</span>
      ) : null}
    </div>
  );
}

function LabelModal({ icon, text, required = false }) {
  return (
    <label className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-[#131E5C]">
      <span className="flex items-center text-[#131E5C]">{icon}</span>
      {text}
      {required ? <span className="text-red-500">*</span> : null}
    </label>
  );
}

function ModalRegistroEntrega({ abierto, fechaEntregaInicial, entregasExistentes = [], onClose, onGuardado }) {
  const [form, setForm] = useState(() =>
    crearEstadoInicialEntrega(fechaEntregaInicial)
  );
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState("");

  useEffect(() => {
    if (!abierto) return;

    setForm(crearEstadoInicialEntrega(fechaEntregaInicial));
    setErrores({});
    setErrorGeneral("");
  }, [abierto, fechaEntregaInicial]);

  const horasOcupadas = useMemo(() => {
    const { fecha } = partirFechaHora(form.fechaEntrega);
    if (!fecha || !form.dealer) return new Set();

    const set = new Set();
    for (const row of entregasExistentes) {
      if (!row.fecha_hora_entrega) continue;
      if (normalizeKey(row.agencia) !== normalizeKey(form.dealer)) continue;
      if (toYMDLocal(row.fecha_hora_entrega) !== fecha) continue;

      set.add(getHourKey(row.fecha_hora_entrega));
    }
    return set;
  }, [entregasExistentes, form.dealer, form.fechaEntrega]);

  if (!abierto) return null;

  const deshabilitado = guardando;

  const setCampo = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => ({ ...prev, [campo]: "" }));
    setErrorGeneral("");
  };

  const limpiarFormulario = () => {
    setForm(crearEstadoInicialEntrega(fechaEntregaInicial));
    setErrores({});
    setErrorGeneral("");
  };

  const validar = () => {
    const nuevosErrores = {};

    if (!form.dealer) nuevosErrores.dealer = "Selecciona el dealer.";
    if (!form.nombre.trim()) nuevosErrores.nombre = "Ingresa el nombre del cliente.";
    if (!form.telefono || form.telefono.length < 10) {
      nuevosErrores.telefono = "Ingresa un teléfono válido.";
    }
    if (!form.vin.trim()) nuevosErrores.vin = "Ingresa el VIN / Chasis.";
    if (!form.tipoVenta) nuevosErrores.tipoVenta = "Selecciona el tipo de venta.";
    if (!form.modelo) nuevosErrores.modelo = "Selecciona un modelo.";
    if (!form.version) nuevosErrores.version = "Selecciona una versión.";
    if (!form.color) nuevosErrores.color = "Selecciona un color.";
    if (!form.fechaEntrega) {
      nuevosErrores.fechaEntrega = "Selecciona fecha y hora de entrega.";
    }
    if (!form.asesorVentas.trim()) {
      nuevosErrores.asesorVentas = "Selecciona el asesor de ventas.";
    }

    if (
      !nuevosErrores.dealer &&
      !nuevosErrores.fechaEntrega &&
      existeConflictoHorario(entregasExistentes, form.dealer, form.fechaEntrega)
    ) {
      nuevosErrores.fechaEntrega = "Ese horario ya está ocupado para este dealer. Elige otro.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleRegistrarYGenerarPdf = async () => {
    if (!validar()) return;

    const formAntesDeLimpiar = { ...form };

    try {
      setGuardando(true);
      setErrorGeneral("");

      const payload = crearPayloadEntrega(form);
      const guardado = await apiEntrega.create(payload);

      if (!guardado?.id) {
        throw new Error("La entrega fue registrada, pero el backend no regresó el ID.");
      }

      if (typeof onGuardado === "function") {
        await onGuardado(guardado);
      }

      try {
        await apiEntrega.downloadPdf(
          guardado.id,
          nombrePdfSeguro(formAntesDeLimpiar, guardado.id)
        );
      } catch (pdfError) {
        setErrorGeneral(
          `La entrega se registró, pero no se pudo generar el PDF: ${pdfError?.message || "error desconocido"
          }`
        );
        return;
      }

      limpiarFormulario();
      onClose?.();
    } catch (error) {
      setErrorGeneral(
        error?.message || "No se pudo registrar la entrega. Revisa el backend."
      );
    } finally {
      setGuardando(false);
    }
  };

  const primerError =
    errores.dealer ||
    errores.nombre ||
    errores.telefono ||
    errores.vin ||
    errores.tipoVenta ||
    errores.modelo ||
    errores.version ||
    errores.color ||
    errores.fechaEntrega ||
    errores.asesorVentas;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 backdrop-blur-sm sm:p-3">
      <div className="flex h-[calc(100dvh-1rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:h-auto sm:max-h-[92dvh]">
        <div className="flex shrink-0 items-start justify-between gap-4 bg-[#131E5C] px-4 py-4 text-white sm:px-5">
          <div className="min-w-0">
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70">
              Nuevo registro
            </div>
            <h2 className="mt-1 text-xl font-black sm:text-2xl">
              Programar entrega
            </h2>
            <p className="mt-1 text-xs font-semibold text-white/75">
              {formatEncabezadoFecha(form.fechaEntrega)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={deshabilitado}
            className="rounded-xl bg-white/10 p-2 text-white transition hover:bg-white/20 disabled:opacity-60"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(92vh-145px)] overflow-y-auto p-4 sm:p-5">
          {(primerError || errorGeneral) ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              ⚠ {errorGeneral || primerError}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <CampoModal error={errores.dealer}>
              <LabelModal icon={<Building2 size={14} />} text="Dealer" required />
              <select
                value={form.dealer}
                disabled={deshabilitado}
                onChange={(e) => setCampo("dealer", e.target.value)}
                className={`${inputModalBase} ${errores.dealer ? "border-red-500" : "border-slate-300"}`}
              >
                <option value="">Seleccionar...</option>
                {DEALERS.map((dealer) => (
                  <option key={dealer} value={dealer}>
                    {dealer}
                  </option>
                ))}
              </select>
            </CampoModal>

            <CampoModal error={errores.nombre}>
              <LabelModal icon={<User size={14} />} text="Nombre del cliente" required />
              <input
                type="text"
                placeholder="NOMBRE COMPLETO"
                value={form.nombre}
                disabled={deshabilitado}
                onChange={(e) => setCampo("nombre", e.target.value)}
                className={`${inputModalBase} ${errores.nombre ? "border-red-500" : "border-slate-300"}`}
              />
            </CampoModal>

            <CampoModal error={errores.telefono}>
              <LabelModal icon={<Phone size={14} />} text="Teléfono" required />
              <input
                type="text"
                inputMode="numeric"
                placeholder="2711234567"
                maxLength={12}
                value={form.telefono}
                disabled={deshabilitado}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 12);
                  setCampo("telefono", val);
                }}
                className={`${inputModalBase} ${errores.telefono ? "border-red-500" : "border-slate-300"}`}
              />
            </CampoModal>

            <CampoModal error={errores.vin}>
              <LabelModal icon={<Hash size={14} />} text="VIN / Chasis" required />
              <input
                type="text"
                placeholder="WVW3N4D24ST050404"
                value={form.vin}
                disabled={deshabilitado}
                onChange={(e) => setCampo("vin", e.target.value.toUpperCase())}
                className={`${inputModalBase} ${errores.vin ? "border-red-500" : "border-slate-300"}`}
              />
            </CampoModal>

            <CampoModal error={errores.tipoVenta}>
              <LabelModal icon={<CarFront size={14} />} text="Tipo de venta" required />
              <div
                className={[
                  "grid h-[42px] w-full min-w-[220px] grid-cols-3 rounded-xl border bg-slate-50 p-1",
                  errores.tipoVenta ? "border-red-500" : "border-slate-300",
                ].join(" ")}
              >
                {TIPO_VENTA.map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    disabled={deshabilitado}
                    onClick={() => setCampo("tipoVenta", tipo)}
                    className={[
                      "min-w-0 truncate whitespace-nowrap rounded-lg px-2 text-[11px] font-black transition disabled:opacity-60",
                      form.tipoVenta === tipo
                        ? "bg-[#131E5C] text-white shadow-sm"
                        : "text-[#131E5C] hover:bg-[#131E5C]/10",
                    ].join(" ")}
                    title={tipo}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            </CampoModal>

            <CampoModal error={errores.modelo}>
              <LabelModal icon={<Car size={14} />} text="Modelo" required />
              <select
                value={form.modelo}
                disabled={deshabilitado}
                onChange={(e) => setCampo("modelo", e.target.value)}
                className={`${inputModalBase} ${errores.modelo ? "border-red-500" : "border-slate-300"}`}
              >
                <option value="">Seleccionar...</option>
                {MODELOS.map((modelo) => (
                  <option key={modelo} value={modelo}>
                    {modelo}
                  </option>
                ))}
              </select>
            </CampoModal>

            <CampoModal error={errores.version}>
              <LabelModal icon={<Layers3 size={14} />} text="Versión" required />
              <select
                value={form.version}
                disabled={deshabilitado}
                onChange={(e) => setCampo("version", e.target.value)}
                className={`${inputModalBase} ${errores.version ? "border-red-500" : "border-slate-300"}`}
              >
                <option value="">Seleccionar...</option>
                {VERSIONES.map((version) => (
                  <option key={version} value={version}>
                    {version}
                  </option>
                ))}
              </select>
            </CampoModal>

            <CampoModal error={errores.color}>
              <LabelModal icon={<Palette size={14} />} text="Color" required />
              <select
                value={form.color}
                disabled={deshabilitado}
                onChange={(e) => setCampo("color", e.target.value)}
                className={`${inputModalBase} ${errores.color ? "border-red-500" : "border-slate-300"}`}
              >
                <option value="">Seleccionar...</option>
                {COLORES.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </CampoModal>

            <div className="md:col-span-2 xl:col-span-3">
              <CampoModal error={errores.fechaEntrega}>
                <LabelModal icon={<Calendar size={14} />} text="Fecha y hora" required />

                <div className="rounded-xl border border-slate-300 bg-white p-3">
                  <input
                    type="date"
                    value={partirFechaHora(form.fechaEntrega).fecha}
                    disabled={deshabilitado}
                    onChange={(e) => {
                      const hora = partirFechaHora(form.fechaEntrega).hora;
                      setCampo("fechaEntrega", combinarFechaHora(e.target.value, hora));
                    }}
                    className={`${inputModalBase} ${errores.fechaEntrega ? "border-red-500" : "border-slate-300"}`}
                  />

                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {HOURS.map((hour) => {
                      const activa = partirFechaHora(form.fechaEntrega).hora === hour;
                      const ocupada = horasOcupadas.has(hour) && !activa;

                      return (
                        <button
                          key={hour}
                          type="button"
                          disabled={deshabilitado || ocupada}
                          onClick={() => {
                            const fecha = partirFechaHora(form.fechaEntrega).fecha;
                            if (!fecha) return;
                            setCampo("fechaEntrega", combinarFechaHora(fecha, hour));
                          }}
                          className={[
                            "rounded-xl px-3 py-2.5 text-sm font-black transition disabled:cursor-not-allowed",
                            activa
                              ? "bg-[#131E5C] text-white shadow-sm"
                              : ocupada
                                ? "bg-red-50 text-red-300 line-through"
                                : "bg-slate-100 text-[#131E5C] hover:bg-[#131E5C]/10",
                          ].join(" ")}
                          title={ocupada ? "Horario ocupado" : hour}
                        >
                          {hour}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CampoModal>
            </div>

            <CampoModal error={errores.asesorVentas}>
              <LabelModal icon={<UserCheck size={14} />} text="Asesor ventas" required />
              <select
                value={form.asesorVentas}
                disabled={deshabilitado}
                onChange={(e) => setCampo("asesorVentas", e.target.value)}
                className={`${inputModalBase} ${errores.asesorVentas ? "border-red-500" : "border-slate-300"}`}
              >
                <option value="">Seleccionar...</option>
                {ASESORES.map((asesor) => (
                  <option key={asesor} value={asesor}>
                    {asesor}
                  </option>
                ))}
              </select>
            </CampoModal>

            <CampoModal>
              <LabelModal icon={<UserCheck size={14} />} text="Entrega física" />
              <div className="flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-100 px-3 py-2 text-sm font-black text-amber-800">
                <Clock3 className="h-4 w-4" />
                Entrega física pendiente
              </div>
            </CampoModal>

            <div>
              <LabelModal icon={<MessageSquare size={14} />} text="Comentarios" />
              <textarea
                placeholder="Notas internas..."
                rows={4}
                value={form.comentarios}
                disabled={deshabilitado}
                onChange={(e) => setCampo("comentarios", e.target.value)}
                className="mt-1.5 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-[#131E5C] outline-none transition placeholder:text-slate-400 focus:border-[#131E5C] focus:ring-2 focus:ring-[#131E5C]/15 disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={limpiarFormulario}
            disabled={deshabilitado}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-black text-red-600 transition hover:bg-red-600 hover:text-white disabled:opacity-60"
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar
          </button>

          <button
            type="button"
            onClick={handleRegistrarYGenerarPdf}
            disabled={deshabilitado}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#131E5C] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#0f1746] disabled:opacity-60"
          >
            {guardando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ClipboardCheck className="h-4 w-4" />
            )}
            Registrar y generar PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalDetalleEntrega({ entrega, onClose, onActualizado }) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  if (!entrega) return null;

  const entregada = entregaFisicaActiva(entrega.entrega_reportada);

  const toggleEstado = async () => {
    try {
      setGuardando(true);
      setError("");

      const actualizado = await apiEntregas.patch(entrega.id, {
        entrega_reportada: !entregada,
      });

      await onActualizado?.(actualizado);
    } catch (err) {
      setError(err?.message || "No se pudo actualizar el estado de entrega.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 bg-[#131E5C] px-5 py-4 text-white">
          <div className="min-w-0">
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70">
              Detalle de entrega
            </div>
            <h2 className="mt-1 truncate text-lg font-black">
              {entrega?.cliente?.nombre || "Sin nombre"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white/10 p-2 text-white transition hover:bg-white/20"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          {error ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              ⚠ {error}
            </div>
          ) : null}

          <div className="grid gap-2 text-sm font-semibold text-[#131E5C]">
            <div>Fecha y hora: {formatDateTime(entrega.fecha_hora_entrega)}</div>
            <div>Teléfono: {entrega?.cliente?.telefono || "—"}</div>
            <div>VIN: {entrega.vin || "—"}</div>
            <div>Modelo: {entrega.modelo_version || "—"} {entrega.version || ""}</div>
            <div>Asesor: {entrega.asesor_ventas || "—"}</div>
          </div>

          <button
            type="button"
            onClick={toggleEstado}
            disabled={guardando}
            className={[
              "mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition disabled:opacity-60",
              entregada
                ? "border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
            ].join(" ")}
          >
            {guardando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : entregada ? (
              <Clock3 className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {entregada ? "Marcar como pendiente" : "Marcar como entregada"}
          </button>
        </div>
      </div>
    </div>
  );
}

function GraphCard({ title, icon: Icon, children, className = "" }) {
  return (
    <div
      className={[
        "min-w-0 overflow-hidden rounded-xl border border-black/10 bg-white p-3 shadow-sm",
        "transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg",
        "sm:p-4",
        className,
      ].join(" ")}
    >
      <div className="mb-3 flex min-w-0 items-center gap-2 text-xs font-extrabold text-[#131E5C] sm:text-sm">
        {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
        <span className="truncate">{title}</span>
      </div>

      <div className="min-w-0">{children}</div>
    </div>
  );
}

function KpiCard({ label, value, color, bg, detail }) {
  return (
    <div
      className={[
        "cursor-default select-none rounded-xl border border-black/10 p-4",
        "transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg",
        bg,
      ].join(" ")}
    >
      <div className="mb-1 text-xs font-bold text-slate-500">{label}</div>

      <div className={`text-3xl font-extrabold ${color}`}>{value}</div>

      {detail ? (
        <div className="mt-2 text-xs font-bold text-blue-500">{detail}</div>
      ) : null}
    </div>
  );
}

function AgendaKpis({ stats }) {
  const percent = (value) => stats.total ? Math.round((value / stats.total) * 100) : 0;
  const cards = [
    { label: "Programadas", value: stats.total, pct: 100, icon: CalendarDays, tone: "navy" },
    { label: "Realizadas", value: stats.entregadas, pct: percent(stats.entregadas), icon: CheckCircle2, tone: "green" },
    { label: "Pendientes", value: stats.pendientes, pct: percent(stats.pendientes), icon: Clock3, tone: "amber" },
    { label: "Por confirmar", value: stats.proximas, pct: percent(stats.proximas), icon: CircleHelp, tone: "sky" },
  ];
  const tones = {
    navy: { border: "border-blue-300", bg: "from-white to-blue-50", icon: "from-[#173e9a] to-[#071f70]", bar: "bg-blue-700", pill: "bg-blue-100 text-blue-800" },
    green: { border: "border-emerald-300", bg: "from-white to-emerald-50", icon: "from-emerald-400 to-emerald-700", bar: "bg-emerald-600", pill: "bg-emerald-100 text-emerald-700" },
    amber: { border: "border-amber-300", bg: "from-white to-amber-50", icon: "from-amber-300 to-amber-600", bar: "bg-amber-500", pill: "bg-amber-100 text-amber-700" },
    sky: { border: "border-sky-300", bg: "from-white to-sky-50", icon: "from-sky-400 to-sky-600", bar: "bg-sky-500", pill: "bg-sky-100 text-sky-700" },
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const tone = tones[card.tone];
        return (
          <div key={card.label} className={`group relative min-h-[124px] overflow-hidden rounded-[14px] border bg-gradient-to-br p-4 shadow-[0_8px_20px_rgba(15,38,86,0.13)] transition hover:-translate-y-0.5 hover:shadow-lg ${tone.border} ${tone.bg}`}>
            <Icon className={`pointer-events-none absolute -bottom-5 right-2 h-24 w-24 opacity-[0.08] ${card.tone === "green" ? "text-emerald-500" : card.tone === "amber" ? "text-amber-500" : card.tone === "sky" ? "text-sky-500" : "text-blue-700"}`} strokeWidth={2.5} />
            <div className="relative flex items-center gap-2.5">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm ${tone.icon}`}><Icon className="h-5 w-5" strokeWidth={2.5} /></div>
              <span className="min-w-0 flex-1 truncate text-[11px] font-black uppercase tracking-wide text-[#131E5C]">{card.label}</span>
              <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ${tone.pill}`}>{card.pct}%</span>
            </div>
            <div className="relative mt-2.5 flex items-end gap-2">
              <span className="text-[32px] font-black leading-none tracking-tight text-[#10225f]">{card.value}</span>
              <span className="pb-0.5 text-xs font-bold text-slate-500">entregas</span>
            </div>
            <div className="relative mt-3.5 h-1.5 overflow-hidden rounded-full bg-slate-200/80">
              <div className={`h-full rounded-full transition-all duration-500 ${tone.bar}`} style={{ width: `${card.pct}%` }} />
              </div>
          </div>
        );
      })}
    </div>
  );
}

function DayDeliveriesPanel({ date, rows, onCardClick, collapsed = false, onToggle }) {
  const sortedRows = [...rows].sort((a, b) => new Date(a.fecha_hora_entrega) - new Date(b.fecha_hora_entrega));
  const confirmed = rows.filter((row) => entregaFisicaActiva(row.entrega_reportada)).length;
  const pending = rows.length - confirmed;
  const dateObj = parseYMDLocal(date);

  if (collapsed) {
    return (
      <aside className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:flex xl:flex-col xl:items-center">
        <button type="button" onClick={onToggle} className="flex h-full min-h-[520px] w-full flex-col items-center gap-3 py-3 text-[#131E5C] transition hover:bg-slate-50" aria-label="Desplegar entregas del día" title="Desplegar entregas del día">
          <ChevronLeft className="h-4 w-4" />
          <CalendarDays className="h-4 w-4" />
          <span className="text-[9px] font-black [writing-mode:vertical-rl]">Entregas del día</span>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#131E5C] px-1 text-[9px] font-black text-white">{rows.length}</span>
        </button>
      </aside>
    );
  }

  return (
    <aside className="hidden min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:flex xl:flex-col">
      <div className="flex items-start justify-between border-b border-slate-200 px-3 py-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-[#131E5C]"><CalendarDays className="h-4 w-4" />Entregas del día</div>
          <div className="mt-1 text-[10px] font-semibold capitalize text-slate-500">{dateObj.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
        </div>
        <button type="button" onClick={onToggle} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-[#131E5C]" aria-label="Contraer entregas del día" title="Contraer panel">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3">
        <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700"><div className="text-lg font-black">{confirmed}</div><div className="text-[9px] font-bold">Confirmadas</div></div>
        <div className="rounded-lg bg-amber-50 p-2 text-amber-700"><div className="text-lg font-black">{pending}</div><div className="text-[9px] font-bold">Sin confirmar</div></div>
      </div>
      <div className="max-h-[620px] flex-1 space-y-2 overflow-y-auto px-3 pb-3">
        {sortedRows.map((row) => {
          const done = entregaFisicaActiva(row.entrega_reportada);
          return (
            <button key={row.id} type="button" onClick={() => onCardClick(row)} className={`group relative w-full overflow-hidden rounded-lg border bg-white p-2.5 pl-3 text-left shadow-sm transition hover:-translate-y-px hover:border-sky-300 hover:shadow-md ${done ? "border-emerald-200" : "border-amber-200"}`}>
              <span className={`absolute inset-y-0 left-0 w-1 ${done ? "bg-emerald-500" : "bg-amber-400"}`} />
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-[#131E5C]"><CarFront className="h-3 w-3" />{formatCardTime(row.fecha_hora_entrega)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[8px] font-black ${done ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{done ? "Confirmada" : "Por confirmar"}</span>
                  </div>
                  <div className="mt-1 truncate text-[10px] font-black uppercase text-[#131E5C]">{row?.cliente?.nombre || "Sin nombre"}</div>
                  <div className="mt-1.5 grid gap-1 text-[9px] font-semibold text-slate-500">
                    <span className="flex min-w-0 items-center gap-1.5"><Car className="h-3 w-3 shrink-0 text-[#131E5C]" /><span className="truncate">{row.modelo_version || "Sin modelo"}{row.version ? ` · ${row.version}` : ""}</span></span>
                    <span className="flex min-w-0 items-center gap-1.5"><ClipboardList className="h-3 w-3 shrink-0 text-[#131E5C]" /><span className="truncate">{row.tipo_venta || "Sin tipo de venta"}</span></span>
                    <span className="flex min-w-0 items-center gap-1.5"><UserStar className="h-3 w-3 shrink-0 text-[#131E5C]" /><span className="truncate">{row.asesor_ventas || "Sin asesor"}</span></span>
                  </div>
                </div>
                <ChevronRight className="mt-6 h-3.5 w-3.5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#131E5C]" />
              </div>
            </button>
          );
        })}
        {!sortedRows.length ? <div className="py-8 text-center text-xs font-semibold text-slate-400">No hay entregas este día.</div> : null}
      </div>
      <button type="button" className="m-3 mt-0 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-black text-[#0756a3] hover:bg-slate-50">Ver todas las entregas del día →</button>
    </aside>
  );
}

function GraphBar({ label, value, max, color, total }) {
  const [hovered, setHovered] = useState(false);
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const pctTotal = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div
      className="relative flex cursor-default items-center gap-2 rounded-lg px-2 py-1 transition-colors duration-150"
      style={{ background: hovered ? "rgba(19,30,92,0.05)" : "transparent" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered ? (
        <div className="pointer-events-none absolute left-1/2 -top-9 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#131E5C] px-3 py-1.5 text-xs font-bold text-white shadow-xl">
          {label ? <span className="mr-1">{label}:</span> : null}
          {value} entrega{value !== 1 ? "s" : ""}{" "}
          {total > 0 ? `(${pctTotal}%)` : ""}
          <div className="absolute left-1/2 -bottom-1.5 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-[#131E5C]" />
        </div>
      ) : null}

      <div className="h-4 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%`, opacity: hovered ? 1 : 0.85 }}
        />
      </div>

      <span
        className={[
          "w-8 text-right text-xs font-bold transition-colors",
          hovered ? "text-[#131E5C]" : "text-slate-500",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

function GraphColBar({ dia, cnt, pct, hovered, onEnter, onLeave }) {
  return (
    <div
      className="flex flex-1 cursor-default flex-col items-center gap-1"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <span
        className={[
          "text-xs font-bold transition-colors",
          hovered ? "text-[#131E5C]" : "text-transparent",
        ].join(" ")}
      >
        {cnt}
      </span>

      <div
        className="relative flex w-full items-end rounded-t-md bg-[#131E5C]/10"
        style={{ height: "82px" }}
      >
        <div
          className="w-full rounded-t-md transition-all duration-500"
          style={{
            height: `${pct}%`,
            minHeight: cnt > 0 ? "4px" : "0",
            background: hovered ? "#131E5C" : "rgba(19,30,92,0.6)",
          }}
        />

        {hovered && cnt > 0 ? (
          <div className="pointer-events-none absolute -top-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#131E5C] px-2 py-1 text-xs font-bold text-white shadow-xl">
            {cnt} entrega{cnt !== 1 ? "s" : ""}
            <div className="absolute left-1/2 -bottom-1.5 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-[#131E5C]" />
          </div>
        ) : null}
      </div>

      <span
        className={[
          "text-xs font-semibold transition-colors",
          hovered ? "font-extrabold text-[#131E5C]" : "text-slate-500",
        ].join(" ")}
      >
        {dia}
      </span>
    </div>
  );
}

function ReconocimientoGraph({ chartData, highlights }) {
  const topAsesor = chartData?.porAsesor?.[0];
  const asesor = topAsesor?.asesor || "Sin datos";
  const total = topAsesor?.total || 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#131E5C]/10 p-5 text-white shadow-xl md:col-span-2 xl:col-span-3">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 left-10 h-36 w-36 rounded-full bg-emerald-400/20 blur-3xl" />

      <div className="pointer-events-none absolute right-5 top-5">
        <span className="absolute h-3 w-3 animate-ping rounded-full bg-yellow-300" />
        <span className="relative block h-3 w-3 rounded-full bg-yellow-300" />
      </div>

      <div className="pointer-events-none absolute right-20 top-12 h-2 w-2 animate-bounce rounded-full bg-emerald-300" />
      <div className="pointer-events-none absolute right-32 top-7 h-2 w-2 animate-pulse rounded-full bg-sky-300" />
      <div className="pointer-events-none absolute bottom-8 right-16 h-2 w-2 animate-bounce rounded-full bg-pink-300" />

      <div className="relative grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-[#131E5C] shadow-lg">
          <Trophy className="h-9 w-9 animate-bounce text-yellow-300" />
        </div>

        <div className="min-w-0">

          <h2 className="mt-3 text-2xl text-[#131E5C] font-black leading-tight sm:text-3xl">
            {asesor}
          </h2>

          <p className="mt-1 text-base font-bold text-[#131E5C]">
            Lidera con{" "}
            <span className="font-black bg-[#131E5C] rounded-full pl-3 pr-3 text-yellow-300">
              {total} entrega{total !== 1 ? "s" : ""}
            </span>
            . Excelente seguimiento comercial y compromiso operativo.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/10 p-3">
            <div className="text-[11px] font-bold text-[#131E5C]">Top modelo</div>
            <div className="mt-1 line-clamp-1 text-sm text-[#131E5C] font-black">
              {highlights.topModelo}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/10 p-3">
            <div className="text-[11px] font-bold text-[#131E5C]">Hora pico</div>
            <div className="mt-1 text-sm text-[#131E5C] font-black">{highlights.horaPico}</div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/10 p-3">
            <div className="text-[11px] font-bold text-[#131E5C]">Día pico</div>
            <div className="mt-1 text-sm text-[#131E5C] font-black">{highlights.diaPico}</div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/10 p-3">
            <div className="text-[11px] font-bold text-[#131E5C]">Top asesor</div>
            <div className="mt-1 line-clamp-1 text-sm text-[#131E5C] font-black">
              {highlights.topAsesor}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GraphList({
  title,
  icon: Icon,
  items,
  labelKey,
  colors,
  total,
  emptyText = "Sin datos",
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const visibleItems = items || [];
  const max = Math.max(...visibleItems.map((item) => item.total || 0), 1);

  return (
    <GraphCard title={title} icon={Icon}>
      {visibleItems.length ? (
        <div className="w-full max-w-full overflow-x-auto overflow-y-visible overscroll-x-contain pb-2 [scrollbar-width:thin]">
          <div
            className="flex min-h-[175px] items-end gap-2 pr-2 sm:min-h-[195px] sm:gap-3"
            style={{
              minWidth: `max(100%, ${visibleItems.length * 52}px)`,
            }}
          >
            {visibleItems.map((item, index) => {
              const label = item?.[labelKey] || "Sin capturar";
              const value = item.total || 0;
              const pct = max > 0 ? Math.round((value / max) * 100) : 0;
              const pctTotal =
                total > 0 ? Math.round((value / total) * 100) : 0;
              const isHovered = hoveredIndex === index;

              return (
                <div
                  key={`${title}-${label}-${index}`}
                  className="relative flex w-[42px] shrink-0 cursor-default flex-col items-center gap-2 sm:w-[56px]"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {isHovered ? (
                    <div className="pointer-events-none absolute -top-10 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#131E5C] px-3 py-1.5 text-xs font-bold text-white shadow-xl">
                      {label}: {value} entrega{value !== 1 ? "s" : ""}{" "}
                      {total > 0 ? `(${pctTotal}%)` : ""}
                      <div className="absolute left-1/2 -bottom-1.5 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-[#131E5C]" />
                    </div>
                  ) : null}

                  <span
                    className={[
                      "text-[11px] font-black transition-colors sm:text-xs",
                      isHovered ? "text-[#131E5C]" : "text-slate-500",
                    ].join(" ")}
                  >
                    {value}
                  </span>

                  <div className="flex h-[105px] w-full items-end rounded-t-lg bg-slate-100 sm:h-[125px]">
                    <div
                      className={[
                        "w-full rounded-t-lg transition-all duration-500",
                        colors[index % colors.length],
                      ].join(" ")}
                      style={{
                        height: `${pct}%`,
                        minHeight: value > 0 ? "6px" : "0px",
                        opacity: isHovered ? 1 : 0.85,
                      }}
                    />
                  </div>

                  <span
                    className={[
                      "line-clamp-2 min-h-[28px] w-full text-center text-[9px] font-bold leading-tight transition-colors sm:text-[10px]",
                      isHovered ? "text-[#131E5C]" : "text-slate-500",
                    ].join(" ")}
                    title={label}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="px-2 text-xs text-slate-400">{emptyText}</div>
      )}
    </GraphCard>
  );
}
function EstadoGraph({ stats }) {
  const estados = [
    {
      label: "Entregadas",
      value: stats.entregadas,
      dot: "bg-emerald-500",
      bar: "bg-emerald-500",
    },
    {
      label: "Pendientes",
      value: stats.pendientes,
      dot: "bg-red-500",
      bar: "bg-red-500",
    },
  ];

  return (
    <GraphCard title="Entregadas / pendientes" icon={CalendarCheck2}>
      <div className="grid gap-3">
        {estados.map((item) => {
          const pct =
            stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0;

          return (
            <div
              key={item.label}
              className="group rounded-xl bg-slate-50 p-3 transition-colors hover:bg-slate-100"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                  <span className="text-xs font-black text-[#131E5C]">
                    {item.label}
                  </span>
                </div>

                <span className="text-lg font-black text-[#131E5C]">
                  {item.value}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-white">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <span className="w-10 text-right text-xs font-black text-slate-500">
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </GraphCard>
  );
}

function DiaSemanaGraph({ chartData }) {
  const [hoveredDia, setHoveredDia] = useState(null);

  const dias = [
    { short: "Lun", long: "lunes" },
    { short: "Mar", long: "martes" },
    { short: "Mié", long: "miércoles" },
    { short: "Jue", long: "jueves" },
    { short: "Vie", long: "viernes" },
    { short: "Sáb", long: "sábado" },
    { short: "Dom", long: "domingo" },
  ];

  const rows = dias.map((dia) => {
    const match = (chartData.porDiaSemana || []).find((item) =>
      normalizeKey(item.dia).startsWith(normalizeKey(dia.long))
    );

    return {
      dia: dia.short,
      total: match?.total || 0,
    };
  });

  const maxDia = Math.max(...rows.map((item) => item.total), 1);

  return (
    <GraphCard title="Por día de la semana" icon={CalendarDays}>
      <div className="mt-2 flex items-end gap-2" style={{ height: "145px" }}>
        {rows.map((item) => {
          const pct = maxDia > 0 ? (item.total / maxDia) * 100 : 0;

          return (
            <GraphColBar
              key={item.dia}
              dia={item.dia}
              cnt={item.total}
              pct={pct}
              hovered={hoveredDia === item.dia}
              onEnter={() => setHoveredDia(item.dia)}
              onLeave={() => setHoveredDia(null)}
            />
          );
        })}
      </div>
    </GraphCard>
  );
}

function GraficosView({ stats, chartData, highlights }) {
  const MODELO_COLORS = [
    "bg-[#131E5C]",
    "bg-blue-600",
    "bg-blue-400",
    "bg-blue-300",
    "bg-sky-300",
    "bg-cyan-300",
    "bg-teal-300",
  ];

  const ASESOR_COLORS = [
    "bg-emerald-600",
    "bg-emerald-500",
    "bg-emerald-400",
    "bg-emerald-300",
    "bg-teal-400",
    "bg-teal-300",
    "bg-cyan-400",
    "bg-cyan-300",
  ];

  const HORA_COLORS = [
    "bg-violet-600",
    "bg-violet-500",
    "bg-violet-400",
    "bg-violet-300",
    "bg-purple-300",
    "bg-purple-200",
    "bg-indigo-300",
    "bg-indigo-200",
    "bg-blue-300",
    "bg-sky-300",
  ];

  const COLOR_COLORS = [
    "bg-slate-700",
    "bg-slate-600",
    "bg-slate-500",
    "bg-slate-400",
    "bg-blue-400",
    "bg-sky-300",
    "bg-cyan-300",
    "bg-teal-300",
  ];

  return (
    <div className="space-y-4">
      <div className="grid min-w-0 grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard
          label="Total entregas"
          value={stats.total}
          color="text-[#131E5C]"
          bg="bg-[#131E5C]/5"
          detail={`Registros de ${DEFAULT_DEALER}`}
        />

        <KpiCard
          label="Entregadas"
          value={stats.entregadas}
          color="text-emerald-700"
          bg="bg-emerald-50"
          detail={`${stats.porcentaje}% de cumplimiento`}
        />

        <KpiCard
          label="Pendientes"
          value={stats.pendientes}
          color="text-red-600"
          bg="bg-red-50"
          detail={`${stats.proximas} próximas`}
        />

        <KpiCard
          label="% Entrega"
          value={`${stats.porcentaje}%`}
          color="text-blue-700"
          bg="bg-blue-50"
          detail={`${stats.entregadas} de ${stats.total}`}
        />
      </div>
      <ReconocimientoGraph chartData={chartData} highlights={highlights} />

      <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-2">
        <EstadoGraph stats={stats} />

        <GraphList
          title="Por modelo"
          icon={CarFront}
          items={chartData.porModelo}
          labelKey="modelo"
          colors={MODELO_COLORS}
          total={stats.total}
          maxItems={5}
        />

        <GraphList
          title="Por tipo de venta"
          icon={CarFront}
          items={chartData.porTipoVenta}
          labelKey="tipoVenta"
          colors={MODELO_COLORS}
          total={stats.total}
          maxItems={5}
        />

        <DiaSemanaGraph chartData={chartData} />

        <GraphList
          title="Por asesor de ventas"
          icon={UserStar}
          items={chartData.porAsesor}
          labelKey="asesor"
          colors={ASESOR_COLORS}
          total={stats.total}
          maxItems={5}
        />

        <GraphList
          title="Por hora"
          icon={Timer}
          items={chartData.porHora}
          labelKey="hora"
          colors={HORA_COLORS}
          total={stats.total}
          maxItems={5}
        />

        <GraphList
          title="Por color"
          icon={Palette}
          items={chartData.porColor}
          labelKey="color"
          colors={COLOR_COLORS}
          total={stats.total}
          maxItems={5}
        />

        <GraphList
          title="Por versión"
          icon={ClipboardList}
          items={chartData.porVersion}
          labelKey="version"
          colors={MODELO_COLORS}
          total={stats.total}
          maxItems={5}
        />

        <GraphList
          title="Últimos días"
          icon={Activity}
          items={chartData.porDia}
          labelKey="dia"
          colors={HORA_COLORS}
          total={stats.total}
          maxItems={5}
        />
      </div>
    </div>
  );
}
export default function App() {
  const [entregas, setEntregas] = useState([]);
  const [ctxError, setCtxError] = useState("");
  const [viewMode, setViewMode] = useState("agenda");
  const [currentWeekDate, setCurrentWeekDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(toYMDLocal(new Date()));
  const [agendaMode, setAgendaMode] = useState("week");
  const [dayPanelOpen, setDayPanelOpen] = useState(true);
  const [sort, setSort] = useState({
    key: "fecha_hora_entrega",
    dir: "desc",
  });

  const [filters, setFilters] = useState({
    q: "",
    rangoDesde: "",
    rangoHasta: "",
    asesor: "",
    tipoVenta: "",
    modelo: "",
    estado: "",
  });

  const [loadingList, setLoadingList] = useState(false);
  const [modalRegistro, setModalRegistro] = useState({
    abierto: false,
    fechaEntrega: "",
  });

  const [modalDetalle, setModalDetalle] = useState(null);

  const abrirModalDetalle = (row) => setModalDetalle(row);
  const cerrarModalDetalle = () => setModalDetalle(null);

  const handleEntregaActualizada = async () => {
    await refreshList();
    cerrarModalDetalle();
  };

  function toggleSort(key) {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: "asc" };

      return {
        key,
        dir: prev.dir === "asc" ? "desc" : "asc",
      };
    });
  }

  const refreshList = async () => {
    setLoadingList(true);
    setCtxError("");

    try {
      const data = await apiEntregas.list();

      const rows = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : [];

      setEntregas(rows);
    } catch (error) {
      console.error(error);
      setEntregas([]);
      setCtxError(
        error?.message ||
        "No se pudieron cargar las entregas. Revisa permisos del backend."
      );
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    refreshList();
  }, []);


  const abrirModalRegistro = ({ dayKey, hour }) => {
    setModalRegistro({
      abierto: true,
      fechaEntrega: crearFechaHoraLocal(dayKey, hour),
    });
  };

  const cerrarModalRegistro = () => {
    setModalRegistro({
      abierto: false,
      fechaEntrega: "",
    });
  };

  const handleEntregaGuardada = async (guardado) => {
    if (guardado?.fecha_hora_entrega) {
      setCurrentWeekDate(new Date(guardado.fecha_hora_entrega));
      setSelectedDay(toYMDLocal(guardado.fecha_hora_entrega));
    }

    await refreshList();
  };

  const dealerRows = useMemo(() => {
    return (entregas || []).filter((item) => sameDealer(item.agencia));
  }, [entregas]);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    const desdeInt = ymdToInt(filters.rangoDesde);
    const hastaInt = ymdToInt(filters.rangoHasta);

    return dealerRows.filter((item) => {
      const nombreCliente = normalizeStr(item?.cliente?.nombre);
      const telCliente = normalizeStr(item?.cliente?.telefono);

      const matchQ =
        !q ||
        normalizeStr(item.agencia).toLowerCase().includes(q) ||
        nombreCliente.toLowerCase().includes(q) ||
        telCliente.toLowerCase().includes(q) ||
        normalizeStr(item.vin).toLowerCase().includes(q) ||
        normalizeStr(item.modelo_version).toLowerCase().includes(q) ||
        normalizeStr(item.tipo_venta).toLowerCase().includes(q) ||
        normalizeStr(item.version).toLowerCase().includes(q) ||
        normalizeStr(item.color).toLowerCase().includes(q) ||
        normalizeStr(item.asesor_ventas).toLowerCase().includes(q) ||
        normalizeStr(item.preparada_por).toLowerCase().includes(q) ||
        normalizeStr(item.id_cliente_sf_nadin).toLowerCase().includes(q) ||
        normalizeStr(item.id_cliente_sf_dms).toLowerCase().includes(q) ||
        normalizeStr(item.comentarios).toLowerCase().includes(q);

      const matchAsesor = !filters.asesor || item.asesor_ventas === filters.asesor;
      const matchTipo = !filters.tipoVenta || item.tipo_venta === filters.tipoVenta;
      const matchModelo = !filters.modelo || item.modelo_version === filters.modelo;
      const realizada = entregaFisicaActiva(item.entrega_reportada);
      const futura = item.fecha_hora_entrega && new Date(item.fecha_hora_entrega).getTime() > Date.now();
      const estadoActual = realizada ? "confirmada" : futura ? "programada" : "por-confirmar";
      const matchEstado = !filters.estado || filters.estado === estadoActual;

      let matchRango = true;

      if (desdeInt !== null || hastaInt !== null) {
        const ymdEntrega = item.fecha_hora_entrega
          ? toYMDLocal(item.fecha_hora_entrega)
          : "";
        const ymdInt = ymdToInt(ymdEntrega);

        if (!ymdInt) return false;

        if (desdeInt !== null && ymdInt < desdeInt) matchRango = false;
        if (hastaInt !== null && ymdInt > hastaInt) matchRango = false;
      }

      return matchQ && matchRango && matchAsesor && matchTipo && matchModelo && matchEstado;
    });
  }, [dealerRows, filters]);

  const sorted = useMemo(() => {
    const data = [...filtered];
    const { key, dir } = sort || {};

    if (!key) return data;

    const mult = dir === "asc" ? 1 : -1;

    return data.sort((a, b) => {
      if (key === "fecha_hora_entrega") {
        const ta = a.fecha_hora_entrega
          ? new Date(a.fecha_hora_entrega).getTime()
          : 0;
        const tb = b.fecha_hora_entrega
          ? new Date(b.fecha_hora_entrega).getTime()
          : 0;

        return (ta - tb) * mult;
      }

      if (key === "cliente") {
        const va = normalizeStr(a?.cliente?.nombre).toLowerCase();
        const vb = normalizeStr(b?.cliente?.nombre).toLowerCase();

        if (va < vb) return -1 * mult;
        if (va > vb) return 1 * mult;

        return 0;
      }

      const va = normalizeStr(a?.[key]).toLowerCase();
      const vb = normalizeStr(b?.[key]).toLowerCase();

      if (va < vb) return -1 * mult;
      if (va > vb) return 1 * mult;

      return 0;
    });
  }, [filtered, sort]);

  const agendaRows = useMemo(() => {
    const weekStart = startOfWeekMonday(currentWeekDate);
    const weekEnd = addDays(weekStart, 6);
    const minInt = ymdToInt(toYMDLocal(weekStart));
    const maxInt = ymdToInt(toYMDLocal(weekEnd));

    return [...filtered]
      .filter((row) => {
        if (!row.fecha_hora_entrega) return true;

        const ymd = toYMDLocal(row.fecha_hora_entrega);
        const ymdInt = ymdToInt(ymd);

        if (!ymdInt) return false;

        return ymdInt >= minInt && ymdInt <= maxInt;
      })
      .sort((a, b) => {
        const ta = a.fecha_hora_entrega
          ? new Date(a.fecha_hora_entrega).getTime()
          : 0;
        const tb = b.fecha_hora_entrega
          ? new Date(b.fecha_hora_entrega).getTime()
          : 0;

        return ta - tb;
      });
  }, [filtered, currentWeekDate]);

  const agendaAvailabilityRows = useMemo(() => {
    const weekStart = startOfWeekMonday(currentWeekDate);
    const weekEnd = addDays(weekStart, 6);
    const minInt = ymdToInt(toYMDLocal(weekStart));
    const maxInt = ymdToInt(toYMDLocal(weekEnd));

    return [...dealerRows]
      .filter((row) => {
        if (!row.fecha_hora_entrega) return false;

        const ymd = toYMDLocal(row.fecha_hora_entrega);
        const ymdInt = ymdToInt(ymd);

        if (!ymdInt) return false;

        return ymdInt >= minInt && ymdInt <= maxInt;
      })
      .sort((a, b) => {
        const ta = a.fecha_hora_entrega
          ? new Date(a.fecha_hora_entrega).getTime()
          : 0;
        const tb = b.fecha_hora_entrega
          ? new Date(b.fecha_hora_entrega).getTime()
          : 0;

        return ta - tb;
      });
  }, [dealerRows, currentWeekDate]);

  const stats = useMemo(() => {
    const total = sorted.length;
    const entregadas = sorted.filter((row) =>
      entregaFisicaActiva(row.entrega_reportada)
    ).length;
    const pendientes = total - entregadas;
    const porcentaje = total ? Math.round((entregadas / total) * 100) : 0;
    const hoy = toYMDLocal(new Date());
    const mesActual = getMonthKey(new Date());

    const entregasHoy = sorted.filter(
      (row) => toYMDLocal(row.fecha_hora_entrega) === hoy
    ).length;

    const entregasMes = sorted.filter(
      (row) => getMonthKey(row.fecha_hora_entrega) === mesActual
    ).length;

    const sinFecha = sorted.filter((row) => !row.fecha_hora_entrega).length;

    const proximas = sorted.filter((row) => {
      if (!row.fecha_hora_entrega) return false;

      return (
        new Date(row.fecha_hora_entrega).getTime() >= Date.now() &&
        !entregaFisicaActiva(row.entrega_reportada)
      );
    }).length;

    const diasConEntrega = new Set(
      sorted.map((row) => toYMDLocal(row.fecha_hora_entrega)).filter(Boolean)
    );

    const promedioDiario =
      diasConEntrega.size > 0 ? (total / diasConEntrega.size).toFixed(1) : "0";

    return {
      total,
      entregadas,
      pendientes,
      porcentaje,
      entregasHoy,
      entregasMes,
      sinFecha,
      proximas,
      promedioDiario,
    };
  }, [sorted]);

  const chartData = useMemo(() => {
    const entregasEstado = [
      { name: "Entregadas", value: stats.entregadas },
      { name: "Pendientes", value: stats.pendientes },
    ];

    const porDiaMap = {};

    for (const row of sorted) {
      const ymd = toYMDLocal(row.fecha_hora_entrega) || "sin-fecha";
      const label = ymd === "sin-fecha" ? "Sin fecha" : formatShortDate(ymd);

      if (!porDiaMap[ymd]) {
        porDiaMap[ymd] = {
          ymd,
          dia: label,
          total: 0,
          entregadas: 0,
          pendientes: 0,
        };
      }

      porDiaMap[ymd].total += 1;

      if (entregaFisicaActiva(row.entrega_reportada)) {
        porDiaMap[ymd].entregadas += 1;
      } else {
        porDiaMap[ymd].pendientes += 1;
      }
    }

    const porDia = Object.values(porDiaMap)
      .sort((a, b) => {
        if (a.ymd === "sin-fecha") return 1;
        if (b.ymd === "sin-fecha") return -1;

        return a.ymd.localeCompare(b.ymd);
      })
      .slice(-14);

    const porHoraMap = Object.fromEntries(
      HOURS.map((hora) => [hora, { hora, total: 0 }])
    );

    for (const row of sorted) {
      const hora = getHourKey(row.fecha_hora_entrega);

      if (!hora) continue;
      if (!porHoraMap[hora]) porHoraMap[hora] = { hora, total: 0 };

      porHoraMap[hora].total += 1;
    }

    const porHora = Object.values(porHoraMap).sort((a, b) =>
      a.hora.localeCompare(b.hora)
    );

    const porAsesor = countBy(
      sorted,
      (row) => row.asesor_ventas,
      "asesor"
    ).slice(0, 10);

    const porModelo = countBy(
      sorted,
      (row) => row.modelo_version,
      "modelo"
    ).slice(0, 10);

    const porTipoVenta = countBy(
      sorted,
      (row) => row.tipo_venta,
      "tipoVenta"
    ).slice(0, 10);

    const porVersion = countBy(sorted, (row) => row.version, "version").slice(
      0,
      10
    );

    const porColor = countBy(sorted, (row) => row.color, "color").slice(0, 10);

    const porDiaSemana = countBy(
      sorted,
      (row) => getWeekdayName(row.fecha_hora_entrega),
      "dia"
    );

    return {
      entregasEstado,
      porDia,
      porHora,
      porAsesor,
      porModelo,
      porTipoVenta,
      porVersion,
      porColor,
      porDiaSemana,
    };
  }, [sorted, stats]);

  const highlights = useMemo(() => {
    const topAsesor = chartData.porAsesor[0];
    const topModelo = chartData.porModelo[0];

    const horaPico = chartData.porHora[0]
      ? [...chartData.porHora].sort((a, b) => b.total - a.total)[0]
      : null;

    const diaPico = chartData.porDia[0]
      ? [...chartData.porDia].sort((a, b) => b.total - a.total)[0]
      : null;

    return {
      topAsesor: topAsesor
        ? `${topAsesor.asesor} (${topAsesor.total})`
        : "Sin datos",
      topModelo: topModelo
        ? `${topModelo.modelo} (${topModelo.total})`
        : "Sin datos",
      horaPico: horaPico ? `${horaPico.hora} (${horaPico.total})` : "Sin datos",
      diaPico: diaPico ? `${diaPico.dia} (${diaPico.total})` : "Sin datos",
    };
  }, [chartData]);

  const resetFilters = () => {
    setFilters({
      q: "",
      rangoDesde: "",
      rangoHasta: "",
      asesor: "",
      tipoVenta: "",
      modelo: "",
      estado: "",
    });

    setCurrentWeekDate(new Date());
    setSelectedDay(toYMDLocal(new Date()));
  };

  const setHoy = () => {
    const hoy = toYMDLocal(new Date());

    setCurrentWeekDate(new Date());
    setSelectedDay(hoy);
    setFilters((prev) => ({ ...prev, rangoDesde: hoy, rangoHasta: hoy }));
  };

  const onChangeDateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));

    if (value) {
      setCurrentWeekDate(parseYMDLocal(value));
      setSelectedDay(value);
    }
  };

  const selectedDayRows = useMemo(
    () => filtered.filter((row) => toYMDLocal(row.fecha_hora_entrega) === selectedDay),
    [filtered, selectedDay]
  );

  return (
    <div className="dashboard-page min-h-screen w-full overflow-x-hidden py-3 sm:py-5">
      <div className="mx-auto w-[calc(100%-24px)] max-w-[1800px] min-w-0 sm:w-[calc(100%-40px)]">
        <header
          className="relative mb-3 pt-4"
        >
          <div className="relative z-10 flex min-h-[68px] flex-col gap-4 px-4 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-5">
              <div className="hidden shrink-0 items-center gap-4 sm:flex">
                <img className="h-20 w-20 shrink-0 object-contain" src="/vw_white.png" alt="Volkswagen" />
                <span className="h-16 w-px bg-white/60" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-black tracking-tight text-white sm:text-3xl">
                  Entregas {DEFAULT_DEALER}
                </h1>
                <div className="mt-1.5 flex items-center gap-2 text-xs font-medium text-white/80 sm:text-sm">
                  <CarFront className="h-4 w-4" />
                  Gestión y programación de entregas
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end xl:pt-12 xl:pr-[17%] 2xl:pr-[19%]">
              <div className="inline-flex overflow-hidden rounded-xl border border-white/35 bg-[#061a46]/55 shadow-inner divide-x divide-white/20">
                <ViewButton
                  active={viewMode === "agenda"}
                  onClick={() => setViewMode("agenda")}
                  icon={CalendarDays}
                  label="Agenda"
                />

                <ViewButton
                  active={viewMode === "tabla"}
                  onClick={() => setViewMode("tabla")}
                  icon={TableProperties}
                  label="Tabla"
                />

                <ViewButton
                  active={viewMode === "graficas"}
                  onClick={() => setViewMode("graficas")}
                  icon={BarChart3}
                  label="Gráficas"
                />
              </div>

              <button
                type="button"
                onClick={refreshList}
                disabled={loadingList}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-[#0b2257] shadow-lg transition hover:bg-slate-100 disabled:opacity-60"
              >
                {loadingList ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6v5h-5" />
                    <path d="M4 18v-5h5" />
                    <path d="M18.7 9A7 7 0 0 0 6.2 6.2L4 8" />
                    <path d="M5.3 15A7 7 0 0 0 17.8 17.8L20 16" />
                  </svg>
                )}

                Actualizar
              </button>
            </div>
          </div>
          {viewMode === "agenda" ? <div className="relative z-10 mt-3 pb-1"><AgendaKpis stats={stats} /></div> : <div className="h-3" />}
        </header>

        {ctxError ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {ctxError}
          </div>
        ) : null}

        <section className="mb-3 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="flex flex-wrap items-end gap-1.5 xl:flex-nowrap">
            <div className="min-w-[220px] flex-[2_1_260px]">
                <div className="flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 transition focus-within:border-[#131E5C]">
                  <Search className="h-4 w-4 text-[#131E5C]" />

                  <input
                    value={filters.q}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, q: e.target.value }))
                    }
                    placeholder="Buscar por cliente, teléfono, VIN, modelo..."
                    className="w-full bg-transparent text-[11px] font-semibold text-[#131E5C] outline-none placeholder:text-slate-400"
                  />

                  {filters.q ? (
                    <button
                      type="button"
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, q: "" }))
                      }
                      className="rounded-lg p-1 text-[#131E5C] hover:bg-slate-100 hover:text-red-500"
                      aria-label="Limpiar búsqueda"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
            </div>
            {[
              { key: "asesor", label: "Asesor", values: ASESORES },
              { key: "tipoVenta", label: "Tipo de venta", values: TIPO_VENTA },
              { key: "modelo", label: "Modelo", values: MODELOS },
            ].map((filter) => (
              <label key={filter.key} className="min-w-[110px] flex-1 text-[9px] font-black text-slate-500">{filter.label}
                <select value={filters[filter.key]} onChange={(e) => setFilters((prev) => ({ ...prev, [filter.key]: e.target.value }))} className="mt-0.5 h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-bold text-[#131E5C] outline-none">
                  <option value="">Todos</option>{filter.values.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
            ))}
            <label className="min-w-[105px] flex-1 text-[9px] font-black text-slate-500">Estado
              <select value={filters.estado} onChange={(e) => setFilters((prev) => ({ ...prev, estado: e.target.value }))} className="mt-0.5 h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-bold text-[#131E5C] outline-none">
                <option value="">Todos</option><option value="confirmada">Confirmada</option><option value="programada">Programada</option><option value="por-confirmar">Por confirmar</option>
              </select>
            </label>
            <label className="min-w-[125px] flex-1 text-[9px] font-black text-slate-500">Desde
                <input
                  type="date"
                  value={filters.rangoDesde}
                  onChange={(e) =>
                    onChangeDateFilter("rangoDesde", e.target.value)
                  }
                  className="mt-0.5 h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-semibold text-[#131E5C] outline-none"
                />
            </label>
            <label className="min-w-[125px] flex-1 text-[9px] font-black text-slate-500">Hasta
                <input
                  type="date"
                  value={filters.rangoHasta}
                  onChange={(e) =>
                    onChangeDateFilter("rangoHasta", e.target.value)
                  }
                  className="mt-0.5 h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-semibold text-[#131E5C] outline-none"
                />
            </label>
                <button
                  type="button"
                  onClick={setHoy}
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#0756a3] px-3 text-[10px] font-black text-white hover:bg-[#064780]"
                >
                  <CalendarDays className="h-4 w-4" />
                  Hoy
                </button>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-black text-[#131E5C] hover:bg-slate-50"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filtros
                </button>
          </div>
        </section>

        {viewMode === "agenda" ? (
          <>
            <AgendaMobileList
              rows={agendaRows}
              availabilityRows={agendaAvailabilityRows}
              loading={loadingList}
              currentWeekDate={currentWeekDate}
              onDisponibleClick={abrirModalRegistro}
              onCardClick={abrirModalDetalle}
            />

            <div
              className="hidden gap-3 transition-[grid-template-columns] duration-300 xl:grid"
              style={{ gridTemplateColumns: dayPanelOpen ? "minmax(0, 2.7fr) minmax(320px, 1fr)" : "minmax(0, 1fr) 42px" }}
            >
              <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <AgendaWeekView
                  rows={agendaRows}
                  availabilityRows={agendaAvailabilityRows}
                  loading={loadingList}
                  currentWeekDate={currentWeekDate}
                  setCurrentWeekDate={setCurrentWeekDate}
                  selectedDay={selectedDay}
                  setSelectedDay={setSelectedDay}
                  agendaMode={agendaMode}
                  setAgendaMode={setAgendaMode}
                  onDisponibleClick={abrirModalRegistro}
                  onCardClick={abrirModalDetalle}
                />
              </div>
              <DayDeliveriesPanel
                date={selectedDay}
                rows={selectedDayRows}
                onCardClick={abrirModalDetalle}
                collapsed={!dayPanelOpen}
                onToggle={() => setDayPanelOpen((open) => !open)}
              />
            </div>
            <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block xl:hidden">
              <AgendaWeekView
                rows={agendaRows}
                availabilityRows={agendaAvailabilityRows}
                loading={loadingList}
                currentWeekDate={currentWeekDate}
                setCurrentWeekDate={setCurrentWeekDate}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
                agendaMode={agendaMode}
                setAgendaMode={setAgendaMode}
                onDisponibleClick={abrirModalRegistro}
                onCardClick={abrirModalDetalle}
              />
            </div>
          </>
        ) : null}

        {viewMode === "tabla" ? (
          <div className="overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-slate-200">
            <div className="border-b border-slate-200 p-4">
              <h2 className="text-sm font-black uppercase tracking-wide text-[#131E5C]">
                Tabla de entregas
              </h2>

              <p className="mt-1 text-xs font-semibold text-slate-500">
                Mostrando registros de {DEFAULT_DEALER}.
              </p>
            </div>

            <div className="overflow-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#131E5C] text-xs text-white">
                  <tr>
                    <th className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleSort("fecha_hora_entrega")}
                        className="inline-flex items-center gap-1 text-xs font-bold"
                      >
                        Fecha y hora
                        <span className="opacity-60">
                          {sort.key === "fecha_hora_entrega" ? (
                            sort.dir === "asc" ? (
                              <ChevronUp className="h-4" />
                            ) : (
                              <ChevronDown className="h-4" />
                            )
                          ) : (
                            <ArrowUpDown className="h-4" />
                          )}
                        </span>
                      </button>
                    </th>

                    <th className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleSort("cliente")}
                        className="inline-flex items-center gap-1 text-xs font-bold"
                      >
                        Cliente
                        <span className="opacity-60">
                          {sort.key === "cliente" ? (
                            sort.dir === "asc" ? (
                              <ChevronUp className="h-4" />
                            ) : (
                              <ChevronDown className="h-4" />
                            )
                          ) : (
                            <ArrowUpDown className="h-4" />
                          )}
                        </span>
                      </button>
                    </th>

                    <th className="px-4 py-3">Teléfono</th>
                    <th className="px-4 py-3">VIN</th>
                    <th className="px-4 py-3">Modelo</th>
                    <th className="px-4 py-3">Tipo venta</th>
                    <th className="px-4 py-3">Versión</th>
                    <th className="px-4 py-3">Color</th>
                    <th className="px-4 py-3">Asesor ventas</th>
                    <th className="px-4 py-3">Entrega física</th>
                    <th className="px-4 py-3">Preparada por</th>
                    <th className="px-4 py-3">Comentarios</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loadingList ? (
                    <>
                      {Array.from({ length: 8 }).map((_, index) => (
                        <SkeletonRow key={index} />
                      ))}
                    </>
                  ) : (
                    <>
                      {sorted.map((row) => {
                        const nombreCliente = row?.cliente?.nombre || "—";
                        const telefonoCliente = row?.cliente?.telefono || "—";

                        return (
                          <tr key={row.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold text-[#131E5C]">
                              {formatDateTime(row.fecha_hora_entrega)}
                            </td>

                            <td className="px-4 py-3 font-bold text-[#131E5C]">
                              {nombreCliente}
                            </td>

                            <td className="px-4 py-3 text-[#131E5C]">
                              {telefonoCliente}
                            </td>

                            <td className="px-4 py-3 text-[#131E5C]">
                              {row.vin || "—"}
                            </td>

                            <td className="px-4 py-3 text-[#131E5C]">
                              {row.modelo_version || "—"}
                            </td>

                            <td className="px-4 py-3 text-[#131E5C]">
                              {row.tipo_venta || "—"}
                            </td>

                            <td className="px-4 py-3 text-[#131E5C]">
                              {row.version || "—"}
                            </td>

                            <td className="px-4 py-3 text-[#131E5C]">
                              {row.color || "—"}
                            </td>

                            <td className="px-4 py-3 text-[#131E5C]">
                              {row.asesor_ventas || "—"}
                            </td>

                            <td className="px-4 py-3">
                              <StatusBadge row={row} />
                            </td>

                            <td className="px-4 py-3 text-[#131E5C]">
                              {row.preparada_por || "—"}
                            </td>

                            <td className="px-4 py-3 text-[#131E5C]">
                              <span className="line-clamp-2">
                                {row.comentarios || "—"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}

                      {sorted.length === 0 ? (
                        <tr>
                          <td
                            colSpan={12}
                            className="px-4 py-10 text-center text-sm font-semibold text-[#131E5C]"
                          >
                            No hay resultados con esos filtros.
                          </td>
                        </tr>
                      ) : null}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {viewMode === "graficas" ? (
          <GraficosView
            stats={stats}
            chartData={chartData}
            highlights={highlights}
          />
        ) : null}

        <ModalRegistroEntrega
          abierto={modalRegistro.abierto}
          fechaEntregaInicial={modalRegistro.fechaEntrega}
          entregasExistentes={dealerRows}
          onClose={cerrarModalRegistro}
          onGuardado={handleEntregaGuardada}
        />

        {modalDetalle ? (
          <ModalDetalleEntrega
            entrega={modalDetalle}
            onClose={cerrarModalDetalle}
            onActualizado={handleEntregaActualizada}
          />
        ) : null}
      </div>
    </div>
  );
}
