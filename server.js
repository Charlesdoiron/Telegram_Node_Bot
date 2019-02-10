const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

//telegram token
const token = '717924426:AAFNpZdpUAkRluVfH20A1JZV1jsKddJciMM';

const ideasByStatus = status => `https://en-marche.fr/api/ideas-workshop/ideas?status=${status}`;

// Template for Ideas Response
const IdeasTemplate = (total_items, status) => {
	// if (status === 'PENDING') {
	// 	return `Il y'a ${total_items} idées en cours de publication `;
	// }
	if (status === 'PUBLISHED') {
		return `Il y'a ${total_items} idées en cours de publication `;
	} else if (status === 'FINALIZED') {
		return `Il y'a ${total_items} idées publiées `;
	} else if (status === 'PENDING') {
		return `Il y'a ${total_items} idées en mode brouillon `;
	}
};

// Created instance of TelegramBot
const bot = new TelegramBot(token, {
	polling: true
});

// Function that gets the ideas by status
const getIdeasByStatus = (chatId, status) => {
	const endpoint = ideasByStatus(status);

	axios.get(endpoint, status).then(
		resp => {
			const { total_items } = resp.data.metadata;
			bot.sendMessage(chatId, IdeasTemplate(total_items, status), {
				parse_mode: 'HTML'
			});
		},
		error => {
			console.log('error', error);
			bot.sendMessage(chatId, `Ooops...I couldn't be able to get ideas</b>`, {
				parse_mode: 'HTML'
			});
		}
	);
};

// Listener (handler) for telegram's /weather event

bot.onText(/\/published/, (msg, match) => {
	const chatId = msg.chat.id;
	getIdeasByStatus(chatId, 'PUBLISHED');
});
bot.onText(/\/finalized/, (msg, match) => {
	const chatId = msg.chat.id;
	getIdeasByStatus(chatId, 'FINALIZED');
});

bot.onText(/\/draft/, (msg, match) => {
	const chatId = msg.chat.id;
	getIdeasByStatus(chatId, 'PENDING');
});

// Listener (handler) for telegram's /start event
// This event happened when you start the conversation with both by the very first time
// Provide the list of available commands
bot.onText(/\/start/, msg => {
	const chatId = msg.chat.id;
	bot.sendMessage(
		chatId,
		`Bienvenue sur le bot de l'<b>Atelier des idées</b>, merci de m'utiliser tendrement
      
  Commandes disponibles:
  
  /finalized - Affiche le nombre d'idées finalisées
  /published - Affiche le nombre d'idées publiées
  /draft - Affiche le nombre d'idées en mode brouillon
    `,
		{
			parse_mode: 'HTML'
		}
	);
});
