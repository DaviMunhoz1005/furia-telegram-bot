require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const ADMIN_ID = 7902897006;
const CHAT_ID_TORCIDA = -1002588339041;

console.log("Starting Bot...");

let isPlaying = false;
let scoreboard = { furia: 0, enemy: 0 };

const csMaps = {
    INFERNO: {
        name: "Inferno",
        short: "inf"
    },
    MIRAGE: {
        name: "Mirage",
        short: "mrg"
    },
    NUKE: {
        name: "Nuke",
        short: "nuke"
    },
    ANCIENT: {
        name: "Ancient",
        short: "anc"
    },
    OVERPASS: {
        name: "Overpass",
        short: "ovp"
    },
    VERTIGO: {
        name: "Vertigo",
        short: "vert"
    },
    DUST2: {
        name: "Dust II",
        short: "d2"
    },
    ANUBIS: {
        name: "Anubis",
        short: "anu"
    }
};

// MODIFICA DE ACORDO COM O MAPA QUE ESTÁ JOGANDO
const mapData = csMaps.ANUBIS;
const map = mapData.name;

// TEMPO QUE SE ATUALIZA SEMPRE NO /update MANUALMENTE
let remainingTime = '2:00';

const knownChats = new Set();
const inactivityTimers = new Map();
let usersWatching = new Set();
let matchUpdateHistory = [];

const rivalTeams = {
    LIQUID: {
        name: "Team Liquid",
        players: [
            { nome: "NAF", emoji: "🧠" },
            { nome: "Twistzz", emoji: "⚡" },
            { nome: "NertZ", emoji: "🎯" },
            { nome: "ultimate", emoji: "🔫" },
            { nome: "siuhy", emoji: "🛡️" }
        ]
    },
    NAVI: {
        name: "Natus Vincere",
        players: [
            { nome: "s1mple", emoji: "💀" },
            { nome: "b1t", emoji: "🔫" },
            { nome: "jL", emoji: "⚙️" },
            { nome: "Aleksib", emoji: "🧠" },
            { nome: "iM", emoji: "🔥" }
        ]
    },
    VITALITY: {
        name: "Team Vitality",
        players: [
            { nome: "ZywOo", emoji: "🎯" },
            { nome: "flameZ", emoji: "🔥" },
            { nome: "Spinx", emoji: "⚡" },
            { nome: "Magisk", emoji: "🧱" },
            { nome: "apEX", emoji: "🧠" }
        ]
    },
    G2: {
        name: "G2 Esports",
        players: [
            { nome: "NiKo", emoji: "💥" },
            { nome: "huNter-", emoji: "🎯" },
            { nome: "m0NESY", emoji: "🔫" },
            { nome: "jks", emoji: "🛡️" },
            { nome: "HooXi", emoji: "🧠" }
        ]
    },
    ASTRALIS: {
        name: "Astralis",
        players: [
        { nome: "dev1ce", emoji: "💀" },
        { nome: "blameF", emoji: "🛡️" },
        { nome: "Staehr", emoji: "⚡" },
        { nome: "b0RUP", emoji: "🔥" },
        { nome: "Buzz", emoji: "🔫" }
        ]
    }
};

const furiaPlayers = [
    { nome: 'KSCERATO', emoji: '🎯', kda: '22/10/5' },
    { nome: 'yuurih', emoji: '🔥', kda: '18/12/6' },
    { nome: 'chelo', emoji: '⚡', kda: '15/14/3' },
    { nome: 'drop', emoji: '🛡️', kda: '11/15/7' },
    { nome: 'arT', emoji: '🧠', kda: '9/18/9' }
];

// MODIFICA DE ACORDO CONTRA QUEM ESTÁ JOGANDO
const teamEnemyName = rivalTeams.ASTRALIS.name; 
const enemyPlayers = rivalTeams.ASTRALIS.players;

const curiosities = [
    'A FURIA foi fundada em 2017 por ex-jogadores e empreendedores brasileiros.',
    'KSCERATO é considerado um dos jogadores mais consistentes da América Latina.',
    'A FURIA já participou de mais de 10 Majors internacionais de CS:GO.',
    'O time é conhecido por seu estilo de jogo agressivo e coordenado.'
];

bot.onText(/\/start/, (msg) => {
    const userChatId = msg.chat.id;
    knownChats.add(msg.chat.id);
    resetInactivityTimer(userChatId);
    
    const name = msg.from.first_name || 'fã';

    const message = `Fala FUR ${name}! 👊
        Bem-vindo ao Chat Interativo da FURIA! 🐾

        Comandos disponíveis:

        🎮 /game – Ver status da partida atual 
        📊 /stats – Ver estatísticas do time 
        🔥 /live – Acessar atualizações ao vivo da partida   
        🎉 /curiosidade – Curiosidade aleatória sobre a FURIA  
        💬 /torcida_link – Link para o grupo oficial da torcida  
        💡 /inspiracao – Conheça o bot que inspirou este projeto  
        🆘 /help – Ver lista de comandos

        Boa diversão e VAMOS FURIA! 💥`;

    bot.sendMessage(userChatId, message);
});

bot.onText(/\/game/, (msg) => {
    const userChatId = msg.chat.id;
    if (!isPlaying) {
        return bot.sendMessage(userChatId, '⚠️ Nenhuma partida está acontecendo no momento.');
    }

    const status = `🎮 Partida em andamento:
    
    🗺️ Mapa: ${map}
    📊 Placar: FURIA ${scoreboard.furia} x ${scoreboard.enemy} ${teamEnemyName}
    ⏱️ Tempo restante: ${remainingTime}`;
    
    bot.sendMessage(userChatId, status);
    resetInactivityTimer(msg.chat.id);
});

bot.onText(/\/stats/, (msg) => {
    const chatId = msg.chat.id;
    
    if (!isPlaying) {
        return bot.sendMessage(chatId, '⚠️ Nenhuma partida em andamento para mostrar estatísticas.');
    }
    
    const furiaMsg = furiaPlayers
        .map(p => `- ${p.emoji} ${p.nome.padEnd(10)} ${p.kda.padStart(10)}`)
        .join('\n');

    const enemyMsg = enemyPlayers
        .map(p => `- ${p.emoji} ${p.nome.padEnd(12)} ${p.kda.padStart(10)}`)
        .join('\n');

    const message = `📊 Estatísticas da Partida Atual

    🐾 FURIA em campo:
${furiaMsg}

    🛡️ Adversários:
${enemyMsg}

    Vamos pra cima! 💥`;

    bot.sendMessage(chatId, message);
    resetInactivityTimer(msg.chat.id);
});

bot.onText(/\/live/, (msg) => {
    const userChatId = msg.chat.id;
    if (!isPlaying) {
        return bot.sendMessage(userChatId, '⚠️ Nenhuma partida ao vivo no momento.');
    }
    usersWatching.add(userChatId);
    bot.sendMessage(userChatId, 
        `🎥 Você entrou na transmissão da partida!
        
        🗺️ Mapa: ${map}
        📊 Placar: FURIA ${scoreboard.furia} x ${scoreboard.enemy} ${teamEnemyName}
        ⏱️ Tempo restante: ${remainingTime}`);

    if (matchUpdateHistory.length > 0) {
        (async () => {
            await bot.sendMessage(userChatId, '🕘 Enviando atualizações anteriores...');
            for (const update of matchUpdateHistory) {
                await bot.sendMessage(userChatId, `🔁 Replay: ${update}`);
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        })();
    }
    resetInactivityTimer(userChatId);
});

bot.onText(/\/init_live/, (msg) => {
    const userChatId = msg.chat.id;
    if (isUser(msg)) {
        return bot.sendMessage(userChatId, '❌ Você não tem permissão para usar esse comando.');
    }
    console.log("Starting Live Chat!");
    isPlaying = true;
    scoreboard = { furia: 0, enemy: 0 };
    matchUpdateHistory = [];
    usersWatching.clear();
    const message = `✅ Partida ao vivo iniciada!

    🗺️ Mapa: ${map}
    📊 Placar: FURIA ${scoreboard.furia} x ${scoreboard.enemy} ${teamEnemyName}
    ⏱️ Tempo restante: ${remainingTime}
    `;
    bot.sendMessage(msg.chat.id, message);
    bot.sendMessage(CHAT_ID_TORCIDA, `📢 Atualização para a torcida:\n${message}`);

    const messageToFans = `🔥 *Nova partida começou!* 🔥

🐾 A FURIA já está em campo e você não vai querer perder nenhum lance!

📲 Use o comando /live para acompanhar as atualizações AO VIVO, lance a lance, com a torcida!

💬 Quer vibrar junto com outros fãs? Use também /torcida_link para acessar o chat da torcida e interagir com nosso elenco de fãs da FURIA!

*VAMOS FURIA!* 💥🐺`;
    knownChats.forEach(chatId => {
        if (chatId !== CHAT_ID_TORCIDA && chatId !== ADMIN_ID) {
            bot.sendMessage(chatId, messageToFans, { parse_mode: "Markdown" });
        }
    });
});

bot.onText(/\/update (\d{2}:\d{2}) (.+)/, (msg, match) => {
    const userChatId = msg.chat.id;
    if (isUser(msg)) {
        return bot.sendMessage(userChatId, '❌ Você não tem permissão para usar esse comando.');
    }
    console.log("Sending Match Update!");
    remainingTime = match[1];
    const updateMessage = match[2];
    matchUpdateHistory.push(updateMessage);
    usersWatching.forEach(id => {
        bot.sendMessage(id, `🚨 Atualização: ${updateMessage}`);
    });
    bot.sendMessage(CHAT_ID_TORCIDA, `📢 Atualização para a torcida:\n${updateMessage}`);
});

bot.onText(/\/end/, (msg) => {
    const userChatId = msg.chat.id;
    if (isUser(msg)) {
        return bot.sendMessage(userChatId, '❌ Você não tem permissão para usar esse comando.');
    }
    console.log("Ending Live Chat!");
    isPlaying = false;
    matchUpdateHistory = [];
    const message = '🛑 A partida terminou. Obrigado por acompanhar!';
    usersWatching.forEach(userId => {
        bot.sendMessage(userId, message);
    });
    bot.sendMessage(userChatId, message);
    bot.sendMessage(CHAT_ID_TORCIDA, `📢 Atualização para a torcida:\n${message}`);
    usersWatching.clear();
});

function isUser(msg) {
    return msg.from.id !== ADMIN_ID;
}

bot.onText(/\/curiosidade/, (msg) => {
    const userChatId = msg.chat.id;
    const randonCuriositie = curiosities[Math.floor(Math.random() * curiosities.length)];
    bot.sendMessage(userChatId, `🧠 Curiosidade: ${randonCuriositie}`);
    resetInactivityTimer(userChatId);
});

bot.onText(/\/torcida_link/, (msg) => {
    const userChatId = msg.chat.id;
    bot.sendMessage(userChatId,
        '💬 Quer conversar com outros fãs da FURIA em tempo real?\n\n' +
        'Entre no nosso grupo oficial de torcida no Telegram!\n' +
        '👉 https://t.me/+GF1dxw5NU0FhMzc5'
    );
    resetInactivityTimer(userChatId);
});

bot.onText(/\/inspiracao/, (msg) => {
    const userChatId = msg.chat.id;
    bot.sendMessage(userChatId,
        '🤖 Nosso bot foi inspirado no Contato Inteligente da FURIA no WhatsApp!\n\n' +
        'Você pode conhecer aqui (closed beta):\n' +
        '👉 https://wa.me/5511993404466'
    );
    resetInactivityTimer(userChatId);
});

bot.onText(/\/help/, (msg) => {
    const userChatId = msg.chat.id;
    const helpMessage = `Comandos disponíveis:

        🎮 /game – Ver status da partida atual (em breve)  
        📊 /stats – Ver estatísticas do time (em breve)  
        🔥 /live – Iniciar uma partida ao vivo simulada   
        🎉 /fato – Curiosidade aleatória sobre a FURIA  
        💬 /torcida_link – Link para o grupo oficial da torcida  
        💡 /inspiracao – Conheça o bot que inspirou este projeto  
        🆘 /help – Ver esta lista de comandos novamente`;
        
    bot.sendMessage(userChatId, helpMessage);
    resetInactivityTimer(userChatId);
});

function resetInactivityTimer(userId) {
    if (inactivityTimers.has(userId)) {
        clearTimeout(inactivityTimers.get(userId));
    }

    const timer = setTimeout(() => {
        const isWatching = usersWatching.has(userId);
        if (!isWatching || !isPlaying) {
            bot.sendMessage(userId, `👋 Vou fechar esse bate-papo, ok?\nQuando quiser conversar de novo, é só dar um salve! 💬\n\n📋 *Comandos úteis:*\n/start - Iniciar o bot\n/live - Ver status da live se estiver com alguma partida ativa\n/help - Ver comandos disponíveis`, { parse_mode: 'Markdown' });
        }
        inactivityTimers.delete(userId);
    }, 5 * 60 * 1000); // 5 minutos

    inactivityTimers.set(userId, timer);
}