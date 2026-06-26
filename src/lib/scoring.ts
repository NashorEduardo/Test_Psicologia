import { SUBSCALES, type SubscaleKey } from "./items";
import { clasificarNivel, clasificarEstilo, type NivelKey, type EstiloParental } from "./baremos";

export type Respuestas = Record<number, number>; // número de ítem -> valor 1-4

export interface SubscaleResult {
  key: SubscaleKey;
  label: string;
  /** Promedio de los ítems de la subescala, en escala 1-4 (ya invertido si aplica) */
  promedio: number;
  /** Suma cruda de los ítems de la subescala, en escala 1-4 (ya invertido si aplica) */
  suma: number;
  itemsRespondidos: number;
  itemsEsperados: number;
}

export interface ResultadoEPIPP {
  subescalas: SubscaleResult[];
  respuesta: {
    promedio: number; // promedio de las 3 subescalas de la dimensión, escala 1-4
    porcentaje: number; // posición relativa dentro del rango Likert posible, 0-100%
    nivel: NivelKey;
  };
  demanda: {
    promedio: number;
    porcentaje: number;
    nivel: NivelKey;
  };
  estilo: EstiloParental;
  puntajeTotal: number; // suma simple de los 24 ítems, escala 24-96, para referencia general
  itemsSinClasificar: number[];
}

function promedio(valores: number[]): number {
  if (valores.length === 0) return 0;
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

/**
 * Calcula el puntaje de una subescala. Si `inverted` es true, cada valor de
 * ítem se invierte como (5 - valor) antes de promediar/sumar, ya que la
 * ficha técnica indica que la subescala Indiferencia está inversamente
 * relacionada con la dimensión Respuesta.
 */
function calcularSubescala(
  respuestas: Respuestas,
  items: number[],
  inverted: boolean
): { promedio: number; suma: number; respondidos: number } {
  const valores = items
    .filter((n) => respuestas[n] !== undefined)
    .map((n) => (inverted ? 5 - respuestas[n] : respuestas[n]));

  return {
    promedio: promedio(valores),
    suma: valores.reduce((a, b) => a + b, 0),
    respondidos: valores.length,
  };
}

/**
 * Los puntos de corte de la ficha técnica (percentiles 25 y 75) están dados
 * en la métrica original del instrumento (suma de ítems en escala 0-1, ver
 * descripción del EPIPP). Como esta versión registra las respuestas en
 * escala Likert 1-4, se traduce el promedio de cada dimensión (rango 1-4) a
 * una posición relativa de 0 a 1 dentro de su propio rango posible, y esa
 * posición relativa se usa directamente para clasificar el nivel
 * (bajo/medio/alto). Esto es una EQUIVALENCIA PROPORCIONAL declarada, no una
 * conversión validada estadísticamente — debe recalibrarse si se dispone
 * del baremo original completo (tabla de percentiles 1-99).
 */
function posicionRelativa(promedioDimension: number): number {
  // promedioDimension está en escala 1-4 -> posición relativa en [0,1]
  return (promedioDimension - 1) / 3;
}

export function calcularResultado(respuestas: Respuestas): ResultadoEPIPP {
  const subescalas: SubscaleResult[] = SUBSCALES.map((s) => {
    const { promedio: p, suma, respondidos } = calcularSubescala(respuestas, s.items, s.inverted);
    return {
      key: s.key,
      label: s.label,
      promedio: p,
      suma,
      itemsRespondidos: respondidos,
      itemsEsperados: s.items.length,
    };
  });

  const subRespuesta = subescalas.filter((s) =>
    SUBSCALES.find((sub) => sub.key === s.key)?.dimension === "respuesta"
  );
  const subDemanda = subescalas.filter((s) =>
    SUBSCALES.find((sub) => sub.key === s.key)?.dimension === "demanda"
  );

  const promedioRespuesta = promedio(subRespuesta.map((s) => s.promedio));
  const promedioDemanda = promedio(subDemanda.map((s) => s.promedio));

  // Posición relativa del puntaje del participante (0 a 1) dentro de su
  // propio rango Likert posible, usada solo para fines de visualización.
  const posRespuesta = posicionRelativa(promedioRespuesta);
  const posDemanda = posicionRelativa(promedioDemanda);

  const nivelRespuesta = clasificarNivel(posRespuesta, "respuesta");
  const nivelDemanda = clasificarNivel(posDemanda, "demanda");
  const estilo = clasificarEstilo(nivelRespuesta, nivelDemanda);

  const puntajeTotal = Object.values(respuestas).reduce((a, b) => a + b, 0);

  const itemsSinClasificar = Array.from({ length: 24 }, (_, i) => i + 1).filter(
    (n) => !SUBSCALES.some((s) => s.items.includes(n))
  );

  return {
    subescalas,
    respuesta: { promedio: promedioRespuesta, porcentaje: posRespuesta * 100, nivel: nivelRespuesta },
    demanda: { promedio: promedioDemanda, porcentaje: posDemanda * 100, nivel: nivelDemanda },
    estilo,
    puntajeTotal,
    itemsSinClasificar,
  };
}
