// ============================================================================
// Baremos y clasificación de estilos parentales — EPIPP
// Datos tomados de la ficha técnica (De la Iglesia, Ongarato y Fernández, 2011)
// Baremo para adultos jóvenes, versión PADRE.
//
// ⚠️ La ficha técnica solo trae el baremo de la versión PADRE explícito en el
// texto. Se usa el mismo baremo para esta versión simplificada (un solo
// progenitor evaluado). Si dispones del baremo "madre" o de un baremo local
// (p. ej. Venezuela/Perú), actualiza los valores de PERCENTILE_CUTOFFS.
// ============================================================================

export type NivelKey = "bajo" | "medio" | "alto";

export const PERCENTILE_CUTOFFS = {
  respuesta: {
    p25: 34, // < 34 = bajo (suma bruta original de la ficha técnica)
    p75: 43, // > 43 = alto
    minTeorico: 12, // 12 ítems (afecto + diálogo + indiferencia) x 1 punto mín.
    maxTeorico: 48, // 12 ítems x 4 puntos máx.
  },
  demanda: {
    p25: 17, // < 17 = bajo
    p75: 24, // > 24 = alto
    minTeorico: 11, // 11 ítems (coerción verbal + física + prohibiciones) x 1 punto mín.
    maxTeorico: 44, // 11 ítems x 4 puntos máx.
  },
};

/**
 * Clasifica un puntaje según su POSICIÓN RELATIVA (0 a 1) dentro del rango
 * Likert posible de la dimensión (suma bruta, no promedio), comparándolo
 * contra la posición relativa que ocupan los percentiles 25 y 75 originales
 * dentro de su propio rango teórico de suma bruta. Ver nota en scoring.ts
 * sobre esta equivalencia proporcional.
 */
export function clasificarNivel(posicionRelativa: number, dimension: "respuesta" | "demanda"): NivelKey {
  const cortes = PERCENTILE_CUTOFFS[dimension];
  const rangoTeorico = cortes.maxTeorico - cortes.minTeorico;
  const corteP25Relativo = (cortes.p25 - cortes.minTeorico) / rangoTeorico;
  const corteP75Relativo = (cortes.p75 - cortes.minTeorico) / rangoTeorico;
  if (posicionRelativa < corteP25Relativo) return "bajo";
  if (posicionRelativa > corteP75Relativo) return "alto";
  return "medio";
}

export type EstiloParental =
  | "sobreprotector"
  | "autoritario"
  | "negligente"
  | "permisivo"
  | "autoritativo";

export const ESTILOS_INFO: Record<
  EstiloParental,
  { label: string; descripcion: string }
> = {
  sobreprotector: {
    label: "Sobreprotector",
    descripcion: "Alta respuesta y alta demanda: combina afecto y cercanía con un alto nivel de exigencia y control.",
  },
  autoritario: {
    label: "Autoritario",
    descripcion: "Baja respuesta pero alta demanda: prioriza el control y la exigencia con poca expresión de afecto o diálogo.",
  },
  negligente: {
    label: "Negligente",
    descripcion: "Baja respuesta y baja demanda: bajo nivel de involucramiento afectivo y de exigencia hacia el hijo/a.",
  },
  permisivo: {
    label: "Permisivo",
    descripcion: "Alta respuesta pero baja demanda: alto afecto y cercanía con poca exigencia o establecimiento de límites.",
  },
  autoritativo: {
    label: "Autoritativo",
    descripcion: "Respuesta y demanda en nivel medio: equilibrio entre afecto/cercanía y exigencia/establecimiento de límites.",
  },
};

/**
 * Clasifica el estilo parental según el cruce de niveles de Respuesta y Demanda,
 * siguiendo el modelo de plano cartesiano descrito en la ficha técnica.
 */
export function clasificarEstilo(nivelRespuesta: NivelKey, nivelDemanda: NivelKey): EstiloParental {
  if (nivelRespuesta === "medio" && nivelDemanda === "medio") return "autoritativo";
  if (nivelRespuesta === "alto" && nivelDemanda === "alto") return "sobreprotector";
  if (nivelRespuesta === "bajo" && nivelDemanda === "alto") return "autoritario";
  if (nivelRespuesta === "bajo" && nivelDemanda === "bajo") return "negligente";
  if (nivelRespuesta === "alto" && nivelDemanda === "bajo") return "permisivo";

  // Combinaciones "mixtas" (p.ej. respuesta alta + demanda media) no descritas
  // textualmente en la ficha: se asigna por cercanía a la categoría dominante.
  if (nivelRespuesta === "alto") return "permisivo";
  if (nivelRespuesta === "bajo") return "autoritario";
  if (nivelDemanda === "alto") return "autoritario";
  if (nivelDemanda === "bajo") return "negligente";
  return "autoritativo";
}
