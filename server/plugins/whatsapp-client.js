// server/plugins/whatsapp-client.js

import fs from 'fs';
import { Client } from 'whatsapp-web.js';
import { CronJob } from 'cron'; 

// Función de Pausa Asíncrona para sincronización
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// ⚠️ Variables Globales para el estado del bot (Accesibles desde las API Routes) ⚠️
globalThis.whatsappClient = null;
globalThis.qrCodeText = null; 
globalThis.clientStatus = 'disconnected';
globalThis.sessionInfo = null;


// --- Función de Lógica de Seguimiento CRON ---
function iniciarSeguimientoAutomatico(client) {
    const cronExpression = '0 */2 * * * *';

    const job = new CronJob(
        cronExpression, 
        async () => { 
            console.log('[CRON] Tarea de seguimiento iniciada.');
            const listaContactos = [
                // REEMPLAZAR con números reales
                { numero: '584127316102', mensaje: 'Mensaje de seguimiento automático.' },
            ];
            for (const contacto of listaContactos) {
                const chatId = `${contacto.numero}@c.us`; 
                try {
                    await client.sendMessage(chatId, contacto.mensaje);
                } catch (e) {
                    console.error(`[CRON] Error enviando a ${contacto.numero}:`, e);
                }
            }
        },
        null, 
        true, 
        "America/Caracas" 
    );
    console.log(`[CRON] Tarea de seguimiento programada cada 2 minutos.`);
}

// --- Función principal de inicialización ---
function initializeWhatsAppClient() {
    console.log('--- Inicializando Cliente de WhatsApp en Nuxt Server ---');
    const SESSION_FILE_PATH = './session.json';
    let sessionCfg = null;

    if (fs.existsSync(SESSION_FILE_PATH)) {
        try {
            sessionCfg = JSON.parse(fs.readFileSync(SESSION_FILE_PATH, 'utf8'));
        } catch (e) {
             console.error("Error al parsear session.json. Eliminando archivo.", e);
             fs.unlinkSync(SESSION_FILE_PATH);
        }
    }
    
    // 2. Configurar el Cliente con ARGUMENTOS DE ESTABILIDAD
    const client = new Client({
        session: sessionCfg,
        webVersionCache: {
            type: 'remote',
            remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
        },
        puppeteer: {
            // Configuración estable para servidores.
            headless: true, 
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu', 
                '--disable-web-security',
                '--disable-features=site-per-process',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
            ], 
        }
    });

    // 3. Manejo de Eventos

    client.on('qr', async (qr) => {
        globalThis.qrCodeText = qr; 
        globalThis.clientStatus = 'qr_required';
        globalThis.sessionInfo = null;
        console.log('[QR] Código QR generado. Míralo en el frontend.');
    });

    client.on('authenticated', async (session) => { // ⬅️ IMPORTANTE: ASÍNCRONO
        console.log('Autenticación exitosa. Guardando sesión...');
        
        globalThis.qrCodeText = null; 
        globalThis.clientStatus = 'authenticated'; 
        fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify(session));
        
        // 🔑 WORKAROUND CRÍTICO: Forzar reinicio para saltar de 'authenticated' a 'ready'
        console.log('Forzando reinicio (Destroy + Delay + Initialize) para pasar a READY...');
        
        await client.destroy(); 
        
        await delay(2000); // Pausa de 2 segundos para liberar recursos
        
        client.initialize(); 
    });

    client.on('ready', () => { 
        // 🔑 CLAVE: client.info está disponible aquí.
        globalThis.sessionInfo = {
            number: client.info.me.user, 
            name: client.info.pushname 
        };

        console.log(`[READY] Conectado como: ${globalThis.sessionInfo.name} (${globalThis.sessionInfo.number})`);
        
        globalThis.clientStatus = 'ready'; 
        globalThis.qrCodeText = null; 
        iniciarSeguimientoAutomatico(client); 
    });

    client.on('disconnected', (reason) => {
        console.log('[DISCONNECTED] Cliente desconectado:', reason);
        globalThis.clientStatus = 'disconnected';
        globalThis.sessionInfo = null;
        if (fs.existsSync(SESSION_FILE_PATH)) {
             fs.unlinkSync(SESSION_FILE_PATH);
        }
        client.initialize(); 
    });

    client.on('message', async msg => {
        if (msg.body.toLowerCase() === 'hola') {
            await client.sendMessage(msg.from, '¡Hola! Respondiendo desde el servidor Nuxt.');
        }
    });

    // 4. Inicialización
    client.initialize();
    return client;
}

// 5. Exportación del Plugin
export default (nuxtApp) => {
    if (!globalThis.whatsappClient) {
        globalThis.whatsappClient = initializeWhatsAppClient();
    }
}