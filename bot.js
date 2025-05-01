require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const ADMIN_ID = 7902897006;
const CHAT_ID_TORCIDA = -1002588339041;

console.log("Starting Bot...");

let isPlaying = false;
let scoreboard = { furia: 0, enemy: 0 };
let map = 'Inferno';
let remainingTime = '00:30';

let usersWatching = new Set();
let matchUpdateHistory = [];

const furiaPlayers = [
    { nome: 'KSCERATO', emoji: '🎯', kda: '22/10/5' },
    { nome: 'yuurih', emoji: '🔥', kda: '18/12/6' },
    { nome: 'chelo', emoji: '⚡', kda: '15/14/3' },
    { nome: 'drop', emoji: '🛡️', kda: '11/15/7' },
    { nome: 'arT', emoji: '🧠', kda: '9/18/9' }
];

const teamEnemyName = "LIQUID";
const enemyPlayers = [
    { nome: 's1mple', emoji: '💀', kda: '25/10/4' },
    { nome: 'b1t', emoji: '🔫', kda: '20/11/5' },
    { nome: 'electronic', emoji: '⚙️', kda: '17/14/6' },
    { nome: 'Perfecto', emoji: '🎯', kda: '12/16/4' },
    { nome: 'Boombl4', emoji: '🧨', kda: '8/19/3' }
];

const curiosities = [
    'A FURIA foi fundada em 2017 por ex-jogadores e empreendedores brasileiros.',
    'KSCERATO é considerado um dos jogadores mais consistentes da América Latina.',
    'A FURIA já participou de mais de 10 Majors internacionais de CS:GO.',
    'O time é conhecido por seu estilo de jogo agressivo e coordenado.'
];

bot.onText(/\/start/, (msg) => {
    const userChatId = msg.chat.id;
    const name = msg.from.first_name || 'fã';

    const message = `Fala ${name}! 👊
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
});

bot.onText(/\/init_live/, (msg) => {
    const userChatId = msg.chat.id;
    if (isUser(msg)) {
        return bot.sendMessage(userChatId, '❌ Você não tem permissão para usar esse comando.');
    }
    console.log("Starting Live Chat!");
    isPlaying = true;
    scoreboard = { furia: 0, enemy: 0 };
    remainingTime = '00:30';
    map = 'Inferno';
    matchUpdateHistory = [];
    usersWatching.clear();
    const message = `✅ Partida ao vivo iniciada!

    🗺️ Mapa: ${map}
    📊 Placar: FURIA ${scoreboard.furia} x ${scoreboard.enemy} ${teamEnemyName}
    ⏱️ Tempo restante: ${remainingTime}
    `;
    bot.sendMessage(msg.chat.id, message);
    bot.sendMessage(CHAT_ID_TORCIDA, `📢 Atualização para a torcida:\n${message}`);
});

bot.onText(/\/update (.+)/, (msg, match) => {
    const userChatId = msg.chat.id;
    if (isUser(msg)) {
        return bot.sendMessage(userChatId, '❌ Você não tem permissão para usar esse comando.');
    }
    console.log("Sending Match Update!");
    const updateMessage = match[1];
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
});

bot.onText(/\/torcida_link/, (msg) => {
    const userChatId = msg.chat.id;
    bot.sendMessage(userChatId,
        '💬 Quer conversar com outros fãs da FURIA em tempo real?\n\n' +
        'Entre no nosso grupo oficial de torcida no Telegram!\n' +
        '👉 https://t.me/+GF1dxw5NU0FhMzc5'
    );
});

bot.onText(/\/inspiracao/, (msg) => {
    const userChatId = msg.chat.id;
    bot.sendMessage(userChatId,
        '🤖 Nosso bot foi inspirado no Contato Inteligente da FURIA no WhatsApp!\n\n' +
        'Você pode conhecer aqui (closed beta):\n' +
        '👉 https://wa.me/5511993404466'
    );
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
});