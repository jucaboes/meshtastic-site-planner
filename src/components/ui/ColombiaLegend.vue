<!-- Colombia fork: leyenda simplificada en espanol.
     Reemplaza MapLegend con descripcion textual de colores accesible para novatos.
     Muestra la barra de color tecnica + descripcion en lenguaje simple. -->
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

    <!-- Barra de color tecnica (escala dBm) -->
    <img :src="colorbarSrc" alt="" class="mt-colorbar !h-3 w-40" />
    <div class="mt-1 flex justify-between text-[0.6875rem] font-semibold text-ink-muted tabular-nums">
      <span>{{ active.min_dbm }} dBm</span>
      <span>{{ active.max_dbm }} dBm</span>
    </div>

    <!-- Colombia fork: descripcion en lenguaje simple -->
    <div class="mt-2 space-y-0.5 border-t border-line pt-2">
      <div class="flex items-center gap-2 text-[0.6875rem] text-ink-muted">
        <span class="inline-block h-2.5 w-5 rounded-sm" style="background: #00cc66;"></span>
        <span>Senal excelente — conexion estable</span>
      </div>
      <div class="flex items-center gap-2 text-[0.6875rem] text-ink-muted">
        <span class="inline-block h-2.5 w-5 rounded-sm" style="background: #66aaff;"></span>
        <span>Senal buena — funciona bien</span>
      </div>
      <div class="flex items-center gap-2 text-[0.6875rem] text-ink-muted">
        <span class="inline-block h-2.5 w-5 rounded-sm" style="background: #ffcc00;"></span>
        <span>Senal marginal — puede fallar</span>
      </div>
      <div class="flex items-center gap-2 text-[0.6875rem] text-ink-muted">
        <span class="inline-block h-2.5 w-5 rounded-sm bg-surface-3"></span>
        <span>Sin cobertura — no llega la senal</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Colombia fork: leyenda en espanol con descripcion textual de colores.
import { computed } from 'vue';
import { useStore } from '../../store.ts';

const store = useStore();

const active = computed(() => {
  const visible = store.localSites.filter((s) => s.visible !== false && s.result);
  return visible.length ? visible[visible.length - 1].params.display : null;
});

const colorbarSrc = computed(() => `${import.meta.env.BASE_URL}colormaps/${active.value?.color_scale}.png`);
const styleLabel = computed(() => (store.overlayStyle === 'contours' ? 'Curvas de nivel' : 'Mapa de calor'));
</script>
