// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },

  ssr: false, 

  modules: ['@nuxtjs/tailwindcss'],
  //css: ['assets/css/tailwind.css'],

// tailwindcss: {
//     configPath: 'tailwind.config',
//     exposeConfig: false,
//     //injectPosition: 0,
//     viewer: true,
//   },
  
  // Configuración para la estabilidad de las librerías de servidor
  build: {
    transpile: ['cron'],
  },

  nitro: {
    externals: {
      // Usar 'external' es más agresivo que 'inline' y a menudo resuelve estos errores
      external: ['cron', 'whatsapp-web.js', 'qrcode-generator'], 
      inline: [], // Aseguramos que no se intente compilar nada aquí
    },
  },  
});
