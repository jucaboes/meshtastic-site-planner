<!-- Colombia fork: UI traducida al espanol. Seccion "Avanzado" oculta los campos
     prefijados para Colombia. Solo 3 campos visibles: ubicacion GMS, altura AGL,
     ganancia de antena. -->
<template>
  <div>
    <!-- App header — Colombia fork: titulo y botones en espanol -->
    <nav class="fixed inset-x-0 top-0 z-[1100] flex h-[57px] items-center justify-between border-b border-line bg-sunken px-4">
      <a href="#" class="flex items-center gap-2.5 font-semibold tracking-[0.01em] text-ink no-underline">
        <img src="/logo.svg" alt="Meshtastic logo" width="34" height="18" class="inline-block" />
        <span>Meshtastic <span class="font-normal text-ink-muted">Cobertura Colombia</span></span>
      </a>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="mt-btn mt-btn-ghost mt-btn-sm gap-2"
          title="Copiar enlace para compartir esta configuracion"
          @click="store.copyShareLink()"
        >
          <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          <span class="hidden sm:inline">{{ store.shareCopied ? 'Copiado!' : 'Compartir' }}</span>
        </button>
        <button
          type="button"
          class="mt-btn mt-btn-ghost mt-btn-sm gap-2"
          :aria-pressed="panelOpen"
          aria-label="Mostrar u ocultar parametros"
          @click="panelOpen = !panelOpen"
        >
          <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" /><circle cx="9" cy="6" r="2" fill="currentColor" stroke="none" />
            <line x1="4" y1="12" x2="20" y2="12" /><circle cx="15" cy="12" r="2" fill="currentColor" stroke="none" />
            <line x1="4" y1="18" x2="20" y2="18" /><circle cx="7" cy="18" r="2" fill="currentColor" stroke="none" />
          </svg>
          <span class="hidden sm:inline">Parametros</span>
        </button>
      </div>
    </nav>

    <!-- Map fills the viewport; the drawer overlays its right edge. -->
    <div id="map" ref="map"></div>

    <!-- Colombia fork: leyenda simplificada en espanol -->
    <ColombiaLegend />

    <!-- First-run onboarding hint — Colombia fork: texto en espanol -->
    <div v-if="showOnboarding" class="pointer-events-none absolute inset-x-0 top-[116px] z-[1000] flex justify-center px-4 lg:top-[72px]">
      <div class="pointer-events-auto flex max-w-md items-start gap-3 rounded-xl border border-line bg-surface-2/95 px-4 py-3 shadow-lg">
        <svg viewBox="0 0 24 24" class="mt-0.5 size-5 shrink-0 text-primary" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        <div class="text-sm">
          <p class="font-semibold text-ink">Planifica tu primer sitio Meshtastic</p>
          <p class="mt-0.5 text-ink-muted">Arrastra el pin verde o usa "Colocar en mapa" para ubicar tu antena. Ingresa la altura y ganancia, luego presiona <span class="text-ink">Calcular cobertura</span>.</p>
          <p class="mt-1 text-ink-muted text-xs">Los parametros tecnicos ya estan configurados para Colombia (ANZ LongFast 919.875 MHz).</p>
        </div>
        <button type="button" class="shrink-0 text-ink-muted hover:text-ink" aria-label="Cerrar ayuda" @click="dismissOnboarding">
          <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg>
        </button>
      </div>
    </div>

    <!-- Dim + dismiss on small screens only (desktop keeps the map usable). -->
    <div v-if="panelOpen" class="fixed inset-0 top-[57px] z-[999] bg-black/40 lg:hidden" @click="panelOpen = false"></div>

    <!-- Colombia fork: panel con seccion principal simplificada + "Avanzado" oculto -->
    <AppDrawer v-model="panelOpen" title="Configuracion del sitio">
      <!-- Seccion principal: solo los 3 campos visibles para el usuario novato -->
      <Section title="Mi antena" :default-open="true"><Transmitter /></Section>

      <!-- Seccion Avanzado: receptor, entorno, simulacion, display, p2p — ocultos por defecto -->
      <!-- Colombia fork: seccion colapsable con parametros prefijados para Colombia ANZ -->
      <Section title="Avanzado (Colombia ANZ prefijado)">
        <p class="mt-hint mb-3 text-xs">
          Estos parametros ya estan optimizados para Colombia (ANZ LongFast 919.875 MHz, clima ecuatorial).
          Solo modificalos si sabes lo que haces.
        </p>
        <Section title="Receptor"><Receiver /></Section>
        <Section title="Entorno"><Environment /></Section>
        <Section title="Opciones de simulacion"><Simulation /></Section>
        <Section title="Visualizacion" :default-open="false"><Display /></Section>
        <Section title="Enlace punto a punto"><PointToPoint /></Section>
      </Section>

      <!-- Lista de sitios simulados -->
      <div v-if="store.localSites.length" class="pt-1">
        <div class="mb-2 text-xs font-bold tracking-[0.08em] text-ink-muted uppercase">Sitios simulados</div>
        <ul class="space-y-1.5">
          <li
            v-for="(site, index) in store.localSites"
            :key="site.id"
            class="flex min-h-[44px] items-center gap-1 rounded-lg border border-line bg-surface px-2"
            :class="{ 'opacity-60': !site.visible }"
          >
            <button
              type="button"
              class="grid size-8 shrink-0 place-items-center rounded text-ink-muted hover:text-ink"
              :title="site.visible ? 'Ocultar cobertura' : 'Mostrar cobertura'"
              :aria-pressed="site.visible"
              @click="store.toggleSiteVisibility(index)"
            >
              <svg v-if="site.visible" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68"/><path d="M6.6 6.6A13.1 13.1 0 0 0 2 12s3.5 7 10 7a9 9 0 0 0 5.4-1.6"/><path d="m2 2 20 20"/></svg>
            </button>
            <button
              type="button"
              class="flex min-w-0 flex-1 items-center gap-2 bg-transparent text-left text-ink hover:text-primary"
              :title="`Ir a ${site.params.transmitter.name}`"
              @click="store.focusSite(index)"
            >
              <span class="size-2.5 shrink-0 rounded-full" :style="{ background: siteColor(site) }" aria-hidden="true"></span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm">{{ site.params.transmitter.name }}</span>
                <span class="block truncate text-xs text-ink-muted">{{ statsLine(site) }}</span>
              </span>
            </button>
            <button
              type="button"
              class="grid size-8 shrink-0 place-items-center rounded text-ink-muted hover:text-danger"
              :aria-label="`Eliminar ${site.params.transmitter.name}`"
              @click="store.removeSite(index)"
            >
              <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg>
            </button>
          </li>
        </ul>
      </div>

      <template #footer>
        <div
          v-if="store.simulationState === 'failed' && store.errorMessage"
          class="mb-2 rounded-lg border border-danger bg-danger-bg p-2 text-sm text-on-danger-bg"
          role="alert"
        >
          {{ store.errorMessage }}
        </div>

        <div v-if="store.progress" class="mb-2" aria-live="polite">
          <div class="h-2 overflow-hidden rounded-full bg-surface-3">
            <div
              class="h-full rounded-full bg-primary transition-[width] duration-200"
              role="progressbar"
              :style="{ width: (store.progress.fraction * 100).toFixed(1) + '%' }"
              :aria-valuenow="Math.round(store.progress.fraction * 100)"
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
          <small class="text-[0.8125rem] text-ink-muted">{{ progressLabel() }}</small>
        </div>

        <!-- Colombia fork: boton principal "Calcular cobertura" -->
        <div class="flex gap-2">
          <button
            id="runSimulation"
            type="button"
            class="mt-btn mt-btn-primary flex-1"
            :disabled="store.simulationState === 'running'"
            @click="store.runSimulation"
          >
            <span v-if="store.simulationState === 'running'" class="mt-spinner" aria-hidden="true"></span>
            <span>{{ buttonText() }}</span>
          </button>
          <button
            v-if="store.simulationState === 'running'"
            type="button"
            class="mt-btn mt-btn-ghost"
            @click="store.cancelSimulation"
          >
            Cancelar
          </button>
        </div>
      </template>
    </AppDrawer>

    <!-- Colombia fork: hints de modo en espanol -->
    <div v-if="store.placingMode" class="mt-place-hint" role="status">
      <span><span class="mt-place-dot"></span>Haz clic en el mapa para colocar la antena</span>
      <button type="button" class="mt-place-cancel" @click="store.cancelPlaceOnMap()">Cancelar (Esc)</button>
    </div>

    <div v-if="store.linkState === 'placing'" class="mt-place-hint" role="status">
      <span><span class="mt-place-dot mt-place-dot-target"></span>Haz clic en el mapa para colocar el destino del enlace</span>
      <button type="button" class="mt-place-cancel" @click="store.cancelPlaceTarget()">Cancelar (Esc)</button>
    </div>

    <div v-if="store.measureMode" class="mt-place-hint" role="status">
      <span v-if="store.measureResult"><span class="mt-place-dot"></span>{{ store.measureResult.distanceKm.toFixed(2) }} km · {{ Math.round(store.measureResult.bearingDeg) }}&deg; — haz clic para medir de nuevo</span>
      <span v-else><span class="mt-place-dot"></span>Haz clic en dos puntos para medir la distancia</span>
      <button type="button" class="mt-place-cancel" @click="store.endMeasure()">Listo (Esc)</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Colombia fork: UI completamente en espanol, leyenda propia en espanol.
import { ref, computed, onMounted } from 'vue';
import Transmitter from './components/Transmitter.vue';
import Receiver from './components/Receiver.vue';
import Environment from './components/Environment.vue';
import Simulation from './components/Simulation.vue';
import Display from './components/Display.vue';
import PointToPoint from './components/PointToPoint.vue';
import AppDrawer from './components/ui/AppDrawer.vue';
import Section from './components/ui/Section.vue';
import ColombiaLegend from './components/ui/ColombiaLegend.vue'; // Colombia fork: leyenda en espanol

import { useStore } from './store.ts';
import type { Site } from './types.ts';
import { colormapLut } from './render/colormaps.ts';

const store = useStore();

// Map-first on small screens; the panel opens by default on desktop.
const panelOpen = ref(true);
onMounted(() => {
  if (window.matchMedia('(max-width: 1023px)').matches) panelOpen.value = false;
});

// First-run hint: shown until the user has a site (or dismisses it). Dismissal
// persists so it doesn't nag returning users.
const onboardDismissed = ref(localStorage.getItem('mt-onboard-dismissed') === '1');
const showOnboarding = computed(
  () => store.localSites.length === 0 && store.simulationState !== 'running' && !onboardDismissed.value
);
const dismissOnboarding = () => {
  onboardDismissed.value = true;
  try {
    localStorage.setItem('mt-onboard-dismissed', '1');
  } catch {
    /* storage unavailable */
  }
};

// Each site keeps its own color scale; show a swatch matching its overlay.
const siteColor = (site: Site) => {
  const lut = colormapLut(site.params.display.color_scale);
  const i = 192 * 3; // a vivid representative sample of the colormap
  return `rgb(${lut[i]}, ${lut[i + 1]}, ${lut[i + 2]})`;
};

// Compact coverage summary shown under each site name.
const statsLine = (site: Site) => {
  const s = site.stats;
  if (!s) return '';
  const area = s.areaKm2 >= 100 ? Math.round(s.areaKm2) : s.areaKm2.toFixed(1);
  return `${area} km² cubiertos · ${s.maxRangeKm.toFixed(1)} km de alcance`;
};

// Colombia fork: button labels en espanol
const buttonText = () => {
  if (store.simulationState === 'running') return 'Calculando...';
  if (store.simulationState === 'failed') return 'Error — reintentar';
  return 'Calcular cobertura';
};

const progressLabel = () => {
  const p = store.progress;
  if (!p) return '';
  if (p.phase === 'terrain') return `Descargando terreno (${p.completed}/${p.total} tiles)`;
  if (p.phase === 'compute') return `Calculando cobertura (${Math.round(p.fraction * 100)}%)`;
  return 'Generando imagen...';
};
</script>
