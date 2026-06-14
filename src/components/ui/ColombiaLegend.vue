<!-- Colombia fork: leyenda simplificada en espanol.
     Reemplaza MapLegend con descripcion textual de colores accesible para novatos.
     Los colores de los swatches se derivan del LUT real del colormap activo (plasma
     por defecto) muestreado en los puntos representativos de cada zona de calidad.
     Coherencia garantizada: mismos colores que pinta el overlay en el mapa. -->
<template>
  <div
    v-if="active"
    class="fixed bottom-3 left-14 z-[500] rounded-xl border border-line bg-canvas/90 px-3 py-2 shadow-2xl backdrop-blur-sm"
  >
    <!-- Titulo de la leyenda -->
    <div class="mb-1 flex items-center justify-between gap-3">
      <span class="text-[0.6875rem] font-bold tracking-wider text-ink-muted uppercase">Cobertura de senal</span>
      <span class="text-[0.6875rem] font-semibold text-ink-muted">{{ styleLabel }}</span>
    </div>

    <!-- Barra de color tecnica (escala dBm): izquierda=min_dbm (debil), derecha=max_dbm (fuerte) -->
    <img :src="colorbarSrc" alt="" class="mt-colorbar !h-3 w-40" />
    <div class="mt-1 flex justify-between text-[0.6875rem] font-semibold text-ink-muted tabular-nums">
      <span>{{ active.min_dbm }} dBm</span>
      <span>{{ active.max_dbm }} dBm</span>
    </div>

    <!-- Colombia fork: swatches derivados del LUT real — coherencia 1:1 con el overlay -->
    <div class="mt-2 space-y-0.5 border-t border-line pt-2">
      <!-- Zona fuerte: t≈0.86 del LUT — color del 86% superior del rango dBm -->
      <div class="flex items-center gap-2 text-[0.6875rem] text-ink-muted">
        <span class="inline-block h-2.5 w-5 rounded-sm" :style="{ background: bands[0].color }"></span>
        <span>Senal fuerte (&ge; {{ bands[0].dbm }} dBm) — conexion estable</span>
      </div>
      <!-- Zona buena: t≈0.56 -->
      <div class="flex items-center gap-2 text-[0.6875rem] text-ink-muted">
        <span class="inline-block h-2.5 w-5 rounded-sm" :style="{ background: bands[1].color }"></span>
        <span>Senal buena ({{ bands[1].dbm }} a {{ bands[0].dbm }} dBm) — funciona bien</span>
      </div>
      <!-- Zona marginal: t≈0.34 -->
      <div class="flex items-center gap-2 text-[0.6875rem] text-ink-muted">
        <span class="inline-block h-2.5 w-5 rounded-sm" :style="{ background: bands[2].color }"></span>
        <span>Senal marginal ({{ bands[2].dbm }} a {{ bands[1].dbm }} dBm) — puede fallar</span>
      </div>
      <!-- Zona debil: t≈0.12 -->
      <div class="flex items-center gap-2 text-[0.6875rem] text-ink-muted">
        <span class="inline-block h-2.5 w-5 rounded-sm" :style="{ background: bands[3].color }"></span>
        <span>Senal debil (&lt; {{ bands[2].dbm }} dBm) — muy limitada</span>
      </div>
      <!-- Sin cobertura: transparente en el overlay -->
      <div class="flex items-center gap-2 text-[0.6875rem] text-ink-muted">
        <span class="inline-block h-2.5 w-5 rounded-sm bg-surface-3 ring-1 ring-line"></span>
        <span>Sin cobertura — no llega la senal</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Colombia fork: leyenda con swatches derivados del LUT real del colormap activo.
// Los colores se calculan igual que en overlay.ts: t = (dbm - min) / span, ci = round(t*255)*3.
import { computed } from 'vue';
import { useStore } from '../../store.ts';
import { colormapLut } from '../../render/colormaps.ts';

const store = useStore();

const active = computed(() => {
  const visible = store.localSites.filter((s) => s.visible !== false && s.result);
  return visible.length ? visible[visible.length - 1].params.display : null;
});

const colorbarSrc = computed(() => `${import.meta.env.BASE_URL}colormaps/${active.value?.color_scale}.png`);
const styleLabel = computed(() => (store.overlayStyle === 'contours' ? 'Curvas de nivel' : 'Mapa de calor'));

/**
 * Sample the active colormap LUT at a normalized position t in [0,1].
 * Mirrors exactly the formula in overlay.ts and contours.ts.
 */
function lutColor(lut: Uint8Array, t: number): string {
  const ci = Math.max(0, Math.min(255, Math.round(t * 255))) * 3;
  const r = lut[ci], g = lut[ci + 1], b = lut[ci + 2];
  return `rgb(${r},${g},${b})`;
}

/**
 * Four signal-quality bands derived from the active colormap and dBm range.
 * Thresholds are chosen to match practical Meshtastic signal categories
 * (strong >= -95 dBm, good -95 to -107, marginal -107 to -119, weak < -119)
 * but the color swatches are always exact LUT samples — never hardcoded.
 *
 * Each band's swatch samples the LUT at the midpoint dBm of that zone so
 * the color is representative of what the overlay actually paints there.
 */
const bands = computed(() => {
  const d = active.value;
  if (!d) return [];
  const lut = colormapLut(d.color_scale);
  const min = d.min_dbm;
  const max = d.max_dbm;
  const span = max > min ? max - min : 1;

  // Zone boundaries (dBm) — chosen for Meshtastic practical quality levels.
  // The fourth boundary is min_dbm (everything below that is transparent).
  const strong = Math.round(min + span * 0.70); // top 30% of range
  const good   = Math.round(min + span * 0.46); // 46–70%
  const marg   = Math.round(min + span * 0.22); // 22–46%
  // below marg to min -> weak zone

  // Sample at the midpoint t of each zone for the representative color.
  const tStrong = ((strong + (max - strong) / 2) - min) / span;
  const tGood   = ((good  + (strong - good)  / 2) - min) / span;
  const tMarg   = ((marg  + (good   - marg)  / 2) - min) / span;
  const tWeak   = ((min   + (marg   - min)   / 2) - min) / span;

  return [
    { dbm: strong, color: lutColor(lut, tStrong) },
    { dbm: good,   color: lutColor(lut, tGood)   },
    { dbm: marg,   color: lutColor(lut, tMarg)   },
    { dbm: null,   color: lutColor(lut, tWeak)   },
  ];
});
</script>
