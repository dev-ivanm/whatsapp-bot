<template>
  <div class="bg-gray-100">
    <div class="min-h-screen flex items-center justify-center p-4">
      <section
        class="bg-white border rounded-xl dark:bg-gray-900 w-full max-w-6xl mx-auto"
      >
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 p-6 md:p-8">
          <div
            class="lg:col-span-7 flex flex-col justify-center text-center lg:text-left"
          >
            <h1
              class="max-w-2xl mb-4 text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight leading-none dark:text-white"
            >
              Panel de Control WhatsApp
            </h1>
            <p
              class="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 text-base md:text-lg lg:text-xl dark:text-gray-400"
            >
              Escanea el código QR con tu aplicación WhatsApp para conectar la
              cuenta.
            </p>
          </div>

          <div
            class="lg:col-span-5 flex items-center justify-center lg:justify-end"
          >
            <div class="w-full max-w-xs md:max-w-sm">
              <div v-if="status === 'qr_required'">
                <div class="flex justify-center">
                  <QrCodeRenderer :text="qrCodeText" v-if="qrCodeText" />
                  <p v-else class="text-center py-8 text-gray-500">
                    Generando QR...
                  </p>
                </div>
              </div>

              <div v-else-if="status === 'ready' && sessionInfo">
                <div
                  class="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-3 rounded text-center"
                >
                  <h3>Conectado Exitosamente</h3>
                  <p>
                    Cuenta: <strong>{{ sessionInfo.name }}</strong>
                  </p>
                  <p>
                    Número: <strong>+{{ sessionInfo.number }}</strong>
                  </p>
                </div>
              </div>

              <div v-else-if="status === 'authenticated'">
                <div
                  class="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-3 rounded text-center"
                >
                  <p class="text-sm md:text-base">
                    Autenticación confirmada. El proceso de inicio está en
                    curso. Redirigiendo...
                  </p>
                </div>
              </div>

              <div v-else-if="status === 'disconnected'">
                <div
                  class="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded text-center"
                >
                  <p class="text-sm md:text-base">
                    El cliente de WhatsApp está desconectado. Reintentando la
                    inicialización para obtener el QR...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { navigateTo } from "#app"; // 👈 Añadir navigateTo para la redirección

// Asegúrate de que esta ruta sea correcta para tu componente QR
import QrCodeRenderer from "../components/QrCodeRenderer.vue";

// --- Estado Reactivo ---
const status = ref("disconnected");
const qrCodeText = ref(null);
const sessionInfo = ref(null);
const loading = ref(true);
const error = ref(null);
let pollingIntervalId = null;

// --- Función de Polling (Consulta de Estado) ---
const fetchBotStatus = async () => {
  try {
    const response = await fetch("/api/bot-status");
    const data = await response.json();

    if (loading.value) {
      loading.value = false;
    }

    status.value = data.status;
    qrCodeText.value = data.qrCodeText;
    sessionInfo.value = data.sessionInfo;
    error.value = null;

    console.log(`[Polling] Estado actual: ${data.status}`);

    // NOTA: La lógica de detener el polling aquí se mueve al watcher.
  } catch (err) {
    console.error("Error al consultar /api/bot-status:", err);
    error.value =
      "No se pudo conectar al servidor Nuxt. Verifica que Nitro esté funcionando.";
    loading.value = false;
  }
};

// --- LÓGICA DE REDIRECCIÓN (Añadida) ---
const stopWatching = watch(status, (newStatus) => {
  if (newStatus === "ready") {
    console.log("✅ Estado READY detectado. Redirigiendo a /chats...");

    // Detener el Polling
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
      pollingIntervalId = null;
    }

    // Detener el watcher
    stopWatching();

    // Redirigir
    navigateTo("/chats");
  }
});

// --- Iniciar Polling ---
const startPolling = () => {
  if (pollingIntervalId) return;

  fetchBotStatus();

  pollingIntervalId = setInterval(fetchBotStatus, 3000);
  console.log("Polling iniciado cada 3 segundos.");
};

// --- Ciclo de Vida ---
onMounted(() => {
  startPolling();
});

onUnmounted(() => {
  if (pollingIntervalId) {
    clearInterval(pollingIntervalId);
    pollingIntervalId = null;
  }
  // No necesitamos detener el watcher explícitamente aquí si ya lo detuvimos al redirigir,
  // pero Vue lo limpia de todos modos al desmontar.
});
</script>

<style scoped>

</style>