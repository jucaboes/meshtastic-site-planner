<!-- Colombia fork: simplified to 3 visible fields (GMS coords, height, gain).
     All other transmitter parameters are prefixed with Colombia ANZ defaults
     and hidden in the "Avanzado" collapsible section of App.vue. -->
<template>
  <div>
    <p class="mt-hint mb-3">La radio cuya cobertura se simula. Ingresa la ubicacion de tu antena.</p>

    <!-- Campo 1: Nombre del sitio -->
    <div class="mb-2">
      <label for="name" class="mt-label">Nombre del sitio</label>
      <input v-model="transmitter.name" class="mt-input" id="name" title="Nombre del sitio" />
    </div>

    <!-- Campo 2: Ubicacion en grados/minutos/segundos (GMS) -->
    <!-- Colombia fork: GMS input — convierte internamente a decimal en tx_lat/tx_lon -->
    <div class="mb-3">
      <p class="mt-label mb-1">Ubicacion (Grados / Minutos / Segundos)</p>
      <p class="mt-hint mb-2">Ingresa las coordenadas o haz clic en "Colocar en mapa".</p>

      <!-- Latitud GMS -->
      <div class="mb-2">
        <label class="mt-label text-xs">Latitud</label>
        <div class="flex items-center gap-1">
          <input v-model.number="lat_deg" type="number" class="mt-input w-16 text-center" min="0" max="90" step="1" placeholder="°" title="Grados de latitud (0-90)" />
          <span class="text-ink-muted text-sm">°</span>
          <input v-model.number="lat_min" type="number" class="mt-input w-16 text-center" min="0" max="59" step="1" placeholder="'" title="Minutos (0-59)" />
          <span class="text-ink-muted text-sm">'</span>
          <input v-model.number="lat_sec" type="number" class="mt-input w-20 text-center" min="0" max="59.999" step="0.1" placeholder="''" title="Segundos (0-59.9)" />
          <span class="text-ink-muted text-sm">''</span>
          <select v-model="lat_hemi" class="mt-select w-16 text-center" title="Hemisferio Norte o Sur">
            <option value="N">N</option>
            <option value="S">S</option>
          </select>
        </div>
      </div>

      <!-- Longitud GMS -->
      <div class="mb-2">
        <label class="mt-label text-xs">Longitud</label>
        <div class="flex items-center gap-1">
          <input v-model.number="lon_deg" type="number" class="mt-input w-16 text-center" min="0" max="180" step="1" placeholder="°" title="Grados de longitud (0-180)" />
          <span class="text-ink-muted text-sm">°</span>
          <input v-model.number="lon_min" type="number" class="mt-input w-16 text-center" min="0" max="59" step="1" placeholder="'" title="Minutos (0-59)" />
          <span class="text-ink-muted text-sm">'</span>
          <input v-model.number="lon_sec" type="number" class="mt-input w-20 text-center" min="0" max="59.999" step="0.1" placeholder="''" title="Segundos (0-59.9)" />
          <span class="text-ink-muted text-sm">''</span>
          <select v-model="lon_hemi" class="mt-select w-16 text-center" title="Este u Oeste">
            <option value="W">O</option>
            <option value="E">E</option>
          </select>
        </div>
      </div>

      <!-- Decimal de referencia (solo lectura, refleja lo que hay en tx_lat/tx_lon) -->
      <p class="mt-hint text-xs tabular-nums">
        Decimal: {{ transmitter.tx_lat.toFixed(6) }}, {{ transmitter.tx_lon.toFixed(6) }}
      </p>
    </div>

    <!-- Campo 3: Altura sobre el suelo (AGL) -->
    <div class="mb-2">
      <label for="tx_height" class="mt-label">Altura sobre el suelo (m)</label>
      <input v-model="transmitter.tx_height" type="number" class="mt-input" id="tx_height" min="1.0" step="0.1"
        title="Altura de la antena sobre el suelo en metros (minimo 1.0 m)." />
      <p class="mt-hint mt-1">Ejemplo: 6 m para una antena en techo de casa, 30 m para una torre.</p>
    </div>

    <!-- Campo 4: Ganancia de la antena -->
    <div class="mb-3">
      <label for="tx_gain" class="mt-label">Ganancia de la antena (dBi)</label>
      <input v-model="transmitter.tx_gain" type="number" class="mt-input" id="tx_gain" min="0" step="0.1"
        title="Ganancia de la antena en dBi. La antena de fabrica de Meshtastic es ~2 dBi." />
      <p class="mt-hint mt-1">Antena de fabrica ~2 dBi. Antenas externas de buena calidad: 5-8 dBi.</p>
    </div>

    <!-- Botones de accion -->
    <div class="mt-3 flex gap-2">
      <button
        @click="store.beginPlaceOnMap()"
        type="button"
        id="setWithMap"
        class="mt-btn mt-btn-sm flex-1 whitespace-nowrap"
        :class="store.placingMode ? 'mt-btn-secondary' : 'mt-btn-primary'"
        title="Haz clic en el mapa para colocar la antena"
      >
        {{ store.placingMode ? 'Haz clic en el mapa…' : 'Colocar en mapa' }}
      </button>
      <button @click="centerMapOnTransmitter" type="button" class="mt-btn mt-btn-secondary mt-btn-sm flex-1 whitespace-nowrap">
        Centrar en sitio
      </button>
    </div>

    <p v-if="store.highpointMessage" class="mt-hint mt-1">{{ store.highpointMessage }}</p>
    <p class="mt-hint mt-2">Tip: arrastra el pin verde en el mapa para ajustar la posicion.</p>
  </div>
</template>

<script setup lang="ts">
// Colombia fork: GMS <-> decimal conversion; tx_power/tx_freq hidden (prefijados).
import { useStore } from '../store.ts';
import { onMounted, watch, ref } from 'vue';

const store = useStore();
const transmitter = store.splatParams.transmitter;

// --- GMS state (reactive) ---
// Initialized from the current decimal values (defaults = Bogota).
function decimalToGms(decimal: number): { deg: number; min: number; sec: number } {
  const abs = Math.abs(decimal);
  const deg = Math.floor(abs);
  const minFull = (abs - deg) * 60;
  const min = Math.floor(minFull);
  const sec = parseFloat(((minFull - min) * 60).toFixed(2));
  return { deg, min, sec };
}

function gmsToDecimal(deg: number, min: number, sec: number, hemi: 'N' | 'S' | 'E' | 'W'): number {
  const abs = deg + min / 60 + sec / 3600;
  return (hemi === 'S' || hemi === 'W') ? -abs : abs;
}

const initLat = decimalToGms(transmitter.tx_lat);
const initLon = decimalToGms(transmitter.tx_lon);

const lat_deg = ref(initLat.deg);
const lat_min = ref(initLat.min);
const lat_sec = ref(initLat.sec);
const lat_hemi = ref<'N' | 'S'>(transmitter.tx_lat >= 0 ? 'N' : 'S');

const lon_deg = ref(initLon.deg);
const lon_min = ref(initLon.min);
const lon_sec = ref(initLon.sec);
// Colombia is west of Greenwich; default O (West)
const lon_hemi = ref<'E' | 'W'>(transmitter.tx_lon <= 0 ? 'W' : 'E');

// --- GMS -> decimal write-through ---
// When the user edits any GMS field, recalculate tx_lat / tx_lon immediately.
watch(
  () => [lat_deg.value, lat_min.value, lat_sec.value, lat_hemi.value] as const,
  ([d, m, s, h]) => {
    if (!Number.isFinite(d) || !Number.isFinite(m) || !Number.isFinite(s)) return;
    const dec = gmsToDecimal(d, m, s, h);
    if (dec < -90 || dec > 90) return;
    transmitter.tx_lat = parseFloat(dec.toFixed(6));
  }
);

watch(
  () => [lon_deg.value, lon_min.value, lon_sec.value, lon_hemi.value] as const,
  ([d, m, s, h]) => {
    if (!Number.isFinite(d) || !Number.isFinite(m) || !Number.isFinite(s)) return;
    const dec = gmsToDecimal(d, m, s, h);
    if (dec < -180 || dec > 180) return;
    transmitter.tx_lon = parseFloat(dec.toFixed(6));
  }
);

// --- Decimal -> GMS sync (reverse: when map click updates tx_lat/tx_lon) ---
// So clicking on the map also updates the GMS input fields.
watch(
  () => transmitter.tx_lat,
  (val) => {
    const g = decimalToGms(val);
    lat_deg.value = g.deg;
    lat_min.value = g.min;
    lat_sec.value = g.sec;
    lat_hemi.value = val >= 0 ? 'N' : 'S';
  }
);

watch(
  () => transmitter.tx_lon,
  (val) => {
    const g = decimalToGms(val);
    lon_deg.value = g.deg;
    lon_min.value = g.min;
    lon_sec.value = g.sec;
    lon_hemi.value = val <= 0 ? 'W' : 'E';
  }
);

// --- Map draft pin sync (decimal watcher) ---
// Typing coordinates moves the draggable draft pin. Skipped mid-simulation.
watch(
  () => [Number(transmitter.tx_lat), Number(transmitter.tx_lon)] as const,
  ([lat, lon]) => {
    if (store.simulationState === 'running') return;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return;
    store.setDraftMarker(lat, lon);
  }
);

const centerMapOnTransmitter = () => {
  if (!isNaN(transmitter.tx_lat) && !isNaN(transmitter.tx_lon)) {
    store.getMap()?.flyTo({ center: [transmitter.tx_lon, transmitter.tx_lat] });
  } else {
    alert('Ingresa coordenadas de latitud y longitud validas.');
  }
};

onMounted(() => {
  store.initMap();
});
</script>
