// ============================================================================
// EPIPP — Escala de Estilos Parentales e Inconsistencia Parental Percibida
// (De la Iglesia, Ongarato y Fernández, 2011)
//
// ⚠️ NOTA IMPORTANTE PARA QUIEN EDITE ESTE ARCHIVO:
// El enunciado real de los 24 ítems NO estaba disponible en la ficha técnica
// suministrada. Se usan marcadores genéricos ("Ítem 1", "Ítem 2"...) que
// DEBEN reemplazarse por la redacción original de la escala antes de aplicar
// el instrumento a participantes reales. Edita el campo `text` de cada ítem
// más abajo.
//
// La asignación de ítems a subescalas también tenía una inconsistencia en la
// ficha técnica original (Afecto y Coerción verbal aparecían con los mismos
// números de ítem, lo cual es imposible). Para Coerción verbal se usó una
// asignación provisional (ítems 1, 7, 13, 19) que NO se repite con otras
// subescalas. Verifica esta asignación contra el artículo original
// (De la Iglesia, Ongarato y Fernández, 2011, Evaluar, 10, 32-52) antes de
// usar los resultados con fines distintos a los académicos/formativos.
// ============================================================================

export type SubscaleKey =
  | "afecto"
  | "dialogo"
  | "indiferencia"
  | "coercionVerbal"
  | "coercionFisica"
  | "prohibiciones";

export type DimensionKey = "respuesta" | "demanda";

export interface Subscale {
  key: SubscaleKey;
  label: string;
  dimension: DimensionKey;
  items: number[];
  /** Si es true, el puntaje del ítem se invierte (5 - valor) antes de promediar */
  inverted: boolean;
}

export const SUBSCALES: Subscale[] = [
  { key: "afecto", label: "Afecto", dimension: "respuesta", items: [4, 10, 16, 22], inverted: false },
  { key: "dialogo", label: "Diálogo", dimension: "respuesta", items: [2, 8, 14, 20], inverted: false },
  { key: "indiferencia", label: "Indiferencia", dimension: "respuesta", items: [3, 9, 15, 21], inverted: true },
  { key: "coercionVerbal", label: "Coerción verbal", dimension: "demanda", items: [1, 7, 13, 19], inverted: false },
  { key: "coercionFisica", label: "Coerción física", dimension: "demanda", items: [5, 11, 17], inverted: false },
  { key: "prohibiciones", label: "Prohibiciones", dimension: "demanda", items: [6, 12, 18, 23], inverted: false },
];

export const LIKERT_OPTIONS = [
  { value: 1, label: "Nunca" },
  { value: 2, label: "Algunas veces" },
  { value: 3, label: "Muchas veces" },
  { value: 4, label: "Siempre" },
] as const;

export interface ScaleItem {
  number: number;
  text: string;
  /** A qué subescala pertenece. El ítem 24 queda sin clasificar — ver nota arriba. */
  subscale: SubscaleKey | null;
}

export const ITEMS: ScaleItem[] = Array.from({ length: 24 }, (_, i) => {
  const number = i + 1;
  const subscale = SUBSCALES.find((s) => s.items.includes(number))?.key ?? null;
  return {
    number,
    text: `Ítem ${number} — (sustituir por el enunciado original de la escala)`,
    subscale,
  };
});

// Ítems sin asignar a ninguna subescala (visibles en la app como aviso)
export const UNASSIGNED_ITEMS = ITEMS.filter((it) => it.subscale === null).map((it) => it.number);
