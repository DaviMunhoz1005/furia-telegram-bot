<h1 align="center"> FURIA Telegram Bot </h1>

<p align="center">
  > Status do Projeto: Concluido :heavy_check_mark:
</p>

## Resumo do projeto
Este projeto consiste no desenvolvimento de um chatbot para o Telegram, focado no time FURIA CS:GO, como parte de um Challenge no processo seletivo da FURIA. O bot oferece uma experiência interativa para os fãs, permitindo que recebam atualizações em tempo real sobre as partidas do FURIA, além de curiosidades sobre o time e o jogo. O bot também fornece acesso direto ao canal oficial da torcida do FURIA CS:GO no Telegram, fortalecendo a interação entre os fãs e o time.

## Hospedagem

Este bot está hospedado na plataforma Railway, que permite rodar aplicações diretamente na nuvem. Ao contrário de outros serviços, o Railway oferece uma hospedagem contínua sem a necessidade de um sistema de "ping" externo. Com isso, o bot permanece ativo durante todo o tempo, sem correr o risco de ser interrompido por inatividade.

No Railway, o bot é configurado para reiniciar automaticamente sempre que houver necessidade, garantindo que ele continue funcionando sem a intervenção manual do desenvolvedor. Essa abordagem oferece maior estabilidade e confiabilidade para a execução do bot.

Com a migração para o Railway, a questão da hibernação, que poderia ocorrer em plataformas gratuitas como o Replit, não é mais um problema. O bot permanece disponível para interação contínua com os usuários, sem interrupções.

## 🔨 Funcionalidades do projeto

- `/start`: Inicia a interação com o bot mostrando todos os comandos disponíveis;
- `/game`: Informa ao usuário se existe uma partida em andamento e o status dela;
- `/stats`: Informa ao usuárioz, se existe uma partida em andamento, quem está jogando no momento;
- `/live`: Se uma partida estiver em andamento, permite o usuário receber as atualizações sobre a rodada;
- `/init_live`: Apenas o ADMIN pode usar esse comando, informa a todos os usuários que uma partida começou;
- `/update tempo_restante mensagem`: Apenas o ADMIN pode usar esse comando, atualiza todos os usuários que utilizaram o /live com o comentário que o ADMIN escreveu e também atualiza o tempo restante;
- `/end`: Apenas o ADMIN pode usar esse comando, atualiza todos os usuários que utilizaram o /live que a partida acabou;
- `/curiosidade`: Informa uma curiosidade sobre o time FURIA de CS:GO;
- `/torcida_link`: Redireciona o usuário para o canal da torcida da FURIA CS:GO;
- `/inspiracao`: Informa ao usuário qual foi o chatbot de inspiração;
- `/help`: Mostra todos os comandos disponíveis;

## ✔️ Tecnologias e Bibliotecas Utilizadas

<p align="center">
  <img loading="lazy" src="https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E"/>
  <img loading="lazy" src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img loading="lazy" src="https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white"/>
</p>
  
- **[dotenv](https://www.npmjs.com/package/dotenv)**: Biblioteca usada para carregar variáveis de ambiente de forma segura e separada em um arquivo `.env`.

Instalação:
```bash
npm install dotenv
```

- **[node-telegram-bot-api](https://www.npmjs.com/package/node-telegram-bot-api)**: Biblioteca utilizada para criar bots no Telegram. Ela facilitando a integração, permite o envio de mensagens e criação de comandos personalizados.

Instalação:
```bash
npm install node-telegram-bot-api
```
