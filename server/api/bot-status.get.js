// server/api/bot-status.get.js
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    // Definimos las variables locales
    const client = globalThis.whatsappClient;
    let currentStatus = globalThis.clientStatus || 'disconnected'; 

    // === LÓGICA DE RE-INICIALIZACIÓN CLAVE ===
    // Si el cliente es nulo (tras un logout) Y el estado es 'disconnected'
    // Y la función de inicialización existe globalmente.
    if (!client && currentStatus === 'disconnected' && globalThis.initializeWhatsappClient) {
        
        console.log('⚠️ Cliente nulo detectado. Forzando re-inicialización del cliente de WhatsApp...');
        
        // 1. LLAMADA DE INICIALIZACIÓN: Esto inicia el proceso del bot.
        globalThis.initializeWhatsappClient(); 
        
        // 2. ⚡ ACTUALIZACIÓN INMEDIATA DEL ESTADO EN EL SERVIDOR ⚡
        // Cambiamos el estado de 'disconnected' a 'initializing' antes de devolver la respuesta.
        // Esto le dice al frontend que el proceso ya comenzó.
        globalThis.clientStatus = 'initializing';
        currentStatus = 'initializing'; // Actualizamos la variable local también
    }
    // ===================================

    // Devuelve el estado actual al frontend (ahora será 'initializing' si se acaba de llamar a la función)
    return {
        status: currentStatus,
        qrCodeText: globalThis.qrCodeText || null, 
        sessionInfo: globalThis.sessionInfo || null,
    };
});