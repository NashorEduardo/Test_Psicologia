# EPIPP — Aplicación web de la Escala de Estilos Parentales e Inconsistencia Parental Percibida

Aplicación construida en **Astro** que administra los 24 ítems de la escala EPIPP
(De la Iglesia, Ongarato y Fernández, 2011), calcula el puntaje por subescala y
dimensión, y clasifica el estilo parental percibido según el modelo de plano
cartesiano respuesta–demanda descrito en la ficha técnica.

## ⚠️ Antes de usar esta app con participantes reales

Esta herramienta se construyó a partir de una ficha técnica que **no incluía
el texto literal de los 24 ítems**, y que tenía una inconsistencia en la
asignación de ítems a subescalas (Afecto y Coerción verbal aparecían con los
mismos números). Antes de aplicar el instrumento de verdad:

1. **Reemplaza el texto de los ítems.** Edita `src/lib/items.ts`, campo
   `text` de cada objeto en `ITEMS`, con la redacción original de la escala
   (De la Iglesia, Ongarato y Fernández, 2011, *Evaluar*, 10, 32-52).
2. **Verifica la asignación de ítems a subescalas** en `SUBSCALES` (mismo
   archivo) contra el artículo original. La asignación de "Coerción verbal"
   (ítems 1, 7, 13, 19) es una corrección provisional para evitar la
   duplicación que traía la ficha técnica original — confírmala.
3. **Revisa el ítem 24**, que queda sin subescala asignada en la ficha
   técnica fuente (`UNASSIGNED_ITEMS` en `src/lib/items.ts`).
4. **Revisa los baremos** en `src/lib/baremos.ts`. Solo se encontró en la
   ficha técnica el baremo de la versión "Padre" para adultos jóvenes; se
   usa ese mismo baremo para la versión simplificada de un solo progenitor.
   Si tienes el baremo "Madre" o uno local (Venezuela/Perú/tu población),
   actualiza `PERCENTILE_CUTOFFS`.

## Cómo funciona el cálculo (resumen metodológico)

- Cada uno de los 24 ítems se responde en escala Likert 1–4
  (1 = Nunca, 2 = Algunas veces, 3 = Muchas veces, 4 = Siempre).
- Los ítems se agrupan en 6 subescalas (Afecto, Diálogo, Indiferencia,
  Coerción verbal, Coerción física, Prohibiciones). **Indiferencia se
  invierte** (5 − valor) antes de promediar, porque está inversamente
  relacionada con la dimensión Respuesta.
- **Respuesta** = promedio de Afecto, Diálogo e Indiferencia (invertida).
- **Demanda** = promedio de Coerción verbal, Coerción física y Prohibiciones.
- Cada dimensión se traduce a su **posición relativa** (0–100%) dentro de su
  propio rango Likert posible, y esa posición se compara contra la posición
  relativa que ocupan los percentiles 25 y 75 del baremo original dentro del
  rango teórico de suma bruta de esa dimensión. Esto da el nivel Bajo/Medio/Alto.
  *Es una equivalencia proporcional declarada, no una conversión validada
  estadísticamente* — útil con fines formativos/académicos.
- El **estilo parental** surge del cruce de niveles de Respuesta y Demanda en
  el plano cartesiano: Sobreprotector (alta+alta), Autoritario (baja resp+alta
  dem), Negligente (baja+baja), Permisivo (alta resp+baja dem), Autoritativo
  (medio+medio).

Estos cinco casos prototípicos fueron verificados explícitamente y clasifican
correctamente con la lógica implementada.

## Estructura del proyecto

```
src/
├── lib/
│   ├── items.ts      # Los 24 ítems, opciones Likert, asignación a subescalas
│   ├── baremos.ts     # Puntos de corte por percentil y clasificación de estilo
│   └── scoring.ts      # Motor de cálculo (promedio, posición relativa, nivel)
├── layouts/
│   └── BaseLayout.astro
└── pages/
    └── index.astro    # Intro -> cuestionario -> resultado (toda la UI e interacción)
```

## Desarrollo local

```bash
npm install
npm run dev       # http://localhost:4321
```

## Compilar para producción

```bash
npm run build      # genera ./dist (sitio estático)
npm run preview     # sirve ./dist localmente para probar el build
```

## Publicar en la web

El resultado de `npm run build` es un sitio 100% estático (`./dist`). Puedes
subirlo gratis a cualquiera de estas opciones:

- **Netlify / Vercel / Cloudflare Pages**: conecta el repositorio de GitHub y
  configura *Build command* = `npm run build`, *Publish directory* = `dist`.
- **GitHub Pages**: sube la carpeta `dist` generada, o usa una GitHub Action
  con el mismo build command.

No requiere base de datos ni backend: todo el cálculo ocurre en el navegador
del participante.
