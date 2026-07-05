const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const port = 3001;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    }
});

let isReady = false;

client.on('qr', (qr) => {
    console.log('SCAN THE QR CODE BELOW WITH WHATSAPP:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
    isReady = true;
});

client.on('authenticated', () => {
    console.log('WhatsApp Client is authenticated!');
});

client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
});

const fs = require('fs');
const path = require('path');

// Limpa o arquivo de trava (SingletonLock) do Chromium para evitar erro de reinicialização no Docker
try {
    const lockPath = path.join(__dirname, '.wwebjs_auth', 'session', 'SingletonLock');
    if (fs.existsSync(lockPath)) {
        fs.unlinkSync(lockPath);
        console.log('Trava de sessão antiga (SingletonLock) removida com sucesso!');
    }
} catch (err) {
    console.log('Aviso ao limpar trava de sessão antiga (pode ser ignorado):', err.message);
}

console.log('Inicializando cliente do WhatsApp. Isso pode demorar um pouco na primeira vez, pois ele baixa o navegador Chromium nos bastidores...');
client.initialize();
console.log('Aguardando geração do QR Code...');

app.post('/send', async (req, res) => {
    if (!isReady) {
        return res.status(503).json({ error: 'WhatsApp client is not ready yet. Please scan the QR code.' });
    }

    const { phone, message } = req.body;

    if (!phone || !message) {
        return res.status(400).json({ error: 'Please provide phone and message' });
    }

    try {
        // Formato brasileiro com DDI (55)
        let formattedPhone = phone.replace(/\D/g, '');
        if (!formattedPhone.startsWith('55')) {
            formattedPhone = '55' + formattedPhone;
        }
        
        const chatId = `${formattedPhone}@c.us`;
        await client.sendMessage(chatId, message);
        
        return res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({ error: 'Failed to send message', details: error.toString() });
    }
});

app.get('/status', (req, res) => {
    return res.json({ ready: isReady });
});

app.listen(port, () => {
    console.log(`WhatsApp API running on http://localhost:${port}`);
});
