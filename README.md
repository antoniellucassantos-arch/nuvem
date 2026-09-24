# 🖥️ Inforeal

Jogo de navegador em que você começa com pouco dinheiro, monta um PC fraco, faz lives e vai melhorando o setup até virar um streamer famoso.

## Como jogar

Abra o `index.html` no navegador. Não precisa instalar nada.

1. **Loja:** compre peças reais: processadores Intel e AMD, placas-mãe ASUS, Gigabyte, ASRock e MSI, memórias Kingston, Corsair e G.Skill, placas de vídeo NVIDIA e AMD, SSDs, HDs e fontes.
2. **Montagem:** veja as peças aparecerem dentro do gabinete, instale todas e aperte **Ligar PC**. Com o PC ligado, as ventoinhas giram e o RGB acende. O cooler muda com o processador (box, torre ou water cooler), e dá para comprar gabinetes diferentes (pretos, brancos e com RGB). Fique de olho na compatibilidade:
   - o soquete do processador precisa ser o mesmo da placa-mãe;
   - a memória precisa ser do tipo que a placa aceita (DDR4 ou DDR5);
   - a fonte precisa aguentar o consumo do PC. E cuidado com a fonte genérica… 💥
3. **Live:** na mesa do streamer, clique no **StreamZinho** no monitor, escolha o jogo e a duração. O jogo aparece rodando na tela, no FPS que o seu PC aguenta. Clique em **Jogar eu mesmo** (ou use Espaço, setas e clique) para jogar de verdade: mandar bem aumenta o público. Webcam, ring light, microfone, stream deck, monitores maiores e as placas de seguidores aparecem no cenário.
   - **Eventos:** raids, clipes viralizando, o gato no teclado, patrocínios, haters, queda de luz (o nobreak salva), internet oscilando (o roteador salva), PC esquentando e a **fonte genérica, que pode explodir a qualquer momento** (e às vezes levar outra peça junto).
4. **Dormir:** recupera a energia e passa o dia. Jogar sempre o mesmo jogo cansa o público.
   - **O mercado anda sozinho:** com o passar dos dias, NVIDIA, AMD, Intel e outras marcas lançam peças novas (inclusive soquete novo, que exige trocar a placa-mãe), e outros estúdios lançam jogos novos e mais pesados, que chegam com hype. Jogos antigos perdem público e peças antigas ficam mais baratas. Os lançamentos continuam para sempre, cada vez mais potentes.
   - **Extras:** a mãe manda desligar o PC de noite (até você se mudar), usados baratos na Loja (às vezes vem um tijolo 🧱), overclock com risco de queimar peça, jogo pirata que pode trazer vírus, capivara pet no InfoOS, casas que dão mais energia e, no fim do jogo, sua IA ganha consciência.
   - O app **📰 GameNews**, no monitor, mostra os lançamentos, os rumores do que vem por aí e os seus jogos.
5. **Objetivos:** complete metas para ganhar prêmios em dinheiro.

### Fase 2: virar desenvolvedor (aba Dev)

Com 300 seguidores você desbloqueia a aba **Dev**:

1. **Estude** Programação, Arte e Som (YouTube, curso online ou bootcamp).
2. **Aprenda ferramentas**: Scratch → Python → JavaScript → Godot → Unity → Unreal Engine 5. As melhores pedem mais nível de programação e um PC mais forte.
3. **Crie um jogo**: escolha nome, ferramenta, gênero, tema, tamanho e foco (gameplay, gráficos ou som). Algumas combinações de gênero e tema o público ama, outras odeia.
4. **Programe e corrija bugs**. Um processador mais forte programa mais rápido.
5. **Lance** e receba as notas da crítica. O jogo vende todo dia, e fazer live dele dá hype e aumenta as vendas.

O progresso fica salvo no navegador. Em **Objetivos → Modo anos 2000** dá para começar um save separado em 2004, com gabinete bege, monitor de tubo e internet discada. Para levar o save de um aparelho para outro, use **Objetivos → Levar o save para outro aparelho** (exportar e importar um código).

### Fase 3: IA criadora de jogos (aba IA)

Com 3 jogos lançados e Programação nível 5, monte um laboratório e treine sua IA. O treino usa a placa de vídeo e a RAM (ou GPUs alugadas na nuvem). A IA cria jogos sob encomenda e, no nível 5, lança um jogo por noite sozinha.

### Fase 4: sua linguagem e sua própria IA (aba Lab)

Com a IA no nível 5, crie sua própria linguagem de programação (nome, estilo das palavras e tipos), desenvolva as 5 etapas do compilador e lance para o mundo: ela vira a melhor ferramenta da aba Dev e ganha devs todo dia. Depois, monte um **servidor de IA com super peças** (Loja → Servidor de IA: rack com refrigeração líquida, AMD EPYC e aceleradoras NVIDIA A100/H100/H200/B200 e AMD Instinct), treine sua própria IA de conversa, lance para o público e converse com ela.

**Para zerar:** sua IA no nível 10 e 100 mil devs usando sua linguagem.

## Estrutura

- `index.html`: página do jogo
- `js/core.js`: sistema de ganchos (`Hooks.on` / `Hooks.run` / `Hooks.filter`). O jogo base anuncia o que acontece (redesenhou a tela, passou o dia, a live acabou, calculou um preço...) e cada módulo se inscreve só no que precisa
- `css/style.css`: visual
- `js/data.js`: peças, jogos, objetivos e mensagens do chat
- `js/game.js`: lógica do jogo (montagem, loja, lives)
- `js/draw.js`: desenhos em SVG (gabinete, peças, rack do servidor, miniaturas da loja e capas dos jogos)
- `js/sim.js`: simulação jogável que aparece no monitor durante a live
- `js/sim-modes.js`: modos extras da simulação (futebol, kart, quebra-cabeça e batalha de RPG)
- `js/events.js`: eventos aleatórios (fonte explodindo, raids, queda de luz...)
- `js/extras.js`: a mãe, usados com golpe, overclock, vírus, capivara pet, casas e IA consciente
- `js/pack1.js`: exportar/importar save, conquistas secretas, sons, tendências da semana, crise dos chips e personagem
- `js/pack2.js`: aba Carreira (funcionários, campeonatos, collab, skins, ranking de rivais) e decoração do quarto
- `js/retro.js` e `js/retro-ui.js`: modo anos 2000 (save separado, peças e jogos da época, monitor de tubo, internet discada)
- `js/releases.js`: lançamentos do mercado (peças e jogos novos com o passar dos dias)
- `js/dev-data.js`: dados da Fase 2 (ferramentas, gêneros, temas, cursos)
- `js/dev.js`: lógica da Fase 2 (estudar, programar, lançar e vender)
- `js/lab-data.js` e `js/lab.js`: Fases 3 e 4 (IA, linguagem e sua própria IA)

## Testes

A pasta `tests/` tem testes automáticos que abrem o jogo num navegador (Playwright) e jogam cada parte:

```bash
tests/run-all.sh                 # roda todos os testes
node tests/bot-balanceamento.js  # robô que joga 120 dias e mostra em que dia chega a cada marco
```
