# Research & ToT: Gerenciamento do ciclo de vida da CLI (agy) no Slack Bridge

## O Problema Identificado
O usuário pontuou a preocupação de que:
1. Com `--print-timeout 0s`: O agente dispara o sub-agente, o processo do CLI morre e o bot "para de dar retorno".
2. Com `--print-timeout 24h`: O CLI fica travado (blocking) o `exec` do Node.js, empilhando mensagens subsequentes na queue, deixando o bot irresponsivo para novos inputs na thread.
3. Precisamos da solução arquitetural ideal para rodar sub-agentes/schedulers, acompanhar o resultado, e não travar o bot.

## Tree of Thoughts (ToT) Analítica

### Premissa 1: A Arquitetura do Antigravity
O `agy` (CLI) **não é o agente**. O `agy` é apenas um "thin client" (interface) que envia o prompt para o **daemon/backend** do Antigravity que roda no SO. 
Quando o agente invoca um sub-agente (`invoke_subagent`), a tarefa é gerenciada inteiramente pelo daemon em background. 
**Conclusão 1:** Se o processo do terminal do `agy` for encerrado (morte da CLI), o daemon, o agente principal e o sub-agente **continuam rodando normalmente** em background.

### Premissa 2: O Funcionamento do Slack Bridge (`bot.js`)
Como o `bot.js` obtém as respostas para enviar ao Slack?
Ele faz a leitura da saída do terminal (stdout) do comando `exec("agy")`? **NÃO!**
O `bot.js` usa a biblioteca `chokidar` (linhas 120-156) para escutar as alterações **direto no disco**, no arquivo `transcript.jsonl` gerado pelo daemon do Antigravity.
**Conclusão 2:** A comunicação (o "retorno" ou feedback) não depende de o processo do `agy` continuar rodando no terminal. O feedback é inteiramente assíncrono e guiado por I/O de arquivos. 

### Premissa 3: O Impacto do `--print-timeout`
O parâmetro `--print-timeout` dita o tempo que o "thin client" (CLI) fica bloqueando o terminal aguardando por logs do daemon antes de devolver o controle do prompt ao usuário.
- Se for **24h**: O comando no terminal não termina (exit 0) até o sub-agente terminar ou passarem 24h. O `exec` do Node em `bot.js` fica aguardando. Como `processQueue` possui um lock (`isExecuting`), o bot fica surdo para novas mensagens na thread.
- Se for **0s**: O comando `agy` entrega a mensagem ao daemon e faz "exit 0" assim que a resposta atual do agente terminar. O `exec` é liberado, a fila avança, e o Node.js volta a aceitar mensagens.
- **E o retorno?** Como já provado na Premissa 2, o retorno (log) já é injetado no Slack pelo `chokidar`, que está rodando de forma perpétua (daemonizado) dentro do Node.js, independente do processo `agy`. E com o último commit (002-bot-subagent-feedback), o `chokidar` agora escuta também o `transcript.jsonl` do sub-agente!

## A Solução Definitiva
O uso do `--print-timeout 0s` é não só a solução correta, mas a **única solução que suporta concorrência real**. 
Ao usar `0s`, alcançamos o melhor dos dois mundos:
1. **O Agent/Sub-agent trabalha até terminar:** Porque o daemon nunca morre.
2. **O Feedback não para:** Porque o `chokidar` continua lendo o `transcript.jsonl` (do Main e do Sub-agente) no disco sempre que o daemon escreve algo lá.
3. **O Bot não trava:** Porque o `exec("agy")` finaliza rápido, liberando a `executionQueue` para permitir que o usuário interaja novamente na thread (ex: dizendo "Pare a execução" ou "Mude o escopo").

## Ação Proposta
Manter a alteração implementada na step anterior (0s) e reativar a execução do CTO.
