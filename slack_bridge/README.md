# Slack Bridge

O Slack Bridge é a ponte de comunicação que permite interagir com diferentes motores de Inteligência Artificial diretamente pelo Slack, utilizando uma arquitetura agnóstica de Eventos e Server-Sent Events.

## Funcionalidades
- **Motores Múltiplos**: suporte a `antigravity` (AGY CLI 1.1.27) e `openai` (Codex CLI 0.153.4).
- **Streaming incremental**: respostas parciais renderizadas no Slack conforme eventos públicos de texto são recebidos.
- **Gestão de Sessão**: Mantém histórico das theads para continuidade das conversas.
- **Clean Architecture**: Código segregado em Adapters e UseCases para facilitar testes e adições.

## Status operacional ao vivo

Ao aceitar um turno, o indicador nativo da Assistant Thread mostra `Preparando a análise…`. Atualizações `STATUS_UPDATED` seguras podem substituí-lo com uma etapa operacional curta. A prioridade é `engine > subagente > heartbeat > fallback`: uma fonte genérica nunca rebaixa informação mais específica já vigente.

O indicador aceita uma única linha, sem Markdown, comandos, caminhos, URLs, payloads, diagnósticos, credenciais, prompts ou raciocínio interno. O texto é limitado a 120 pontos de código Unicode, deduplicado e atualizado com intervalo mínimo de 15 segundos. Candidatos recebidos durante a janela são coalescidos, preservando o mais recente da maior prioridade.

Sucesso, erro, timeout, cancelamento e quota limpam imediatamente o indicador e invalidam atualizações pendentes. O payload usa apenas `channel_id`, `thread_ts` e `status`; `loading_messages` não é enviado. Se a Assistant API estiver ausente ou rejeitar o fallback inicial, pode ser publicada no máximo uma mensagem de reconhecimento. Status dinâmico, heartbeat e falha de limpeza nunca viram mensagens persistentes.

O diretório `templates/slack_bridge` é a fonte canônica. Instalações derivadas só recebem a mudança por atualização ou reinstalação controlada e reinício deliberado. Para rollback, restaure `slack_bridge@1.7.0` e `create-startupos@1.3.0`, reinstale o template aprovado e execute o smoke operacional do ambiente; não há migração de dados ou scopes a reverter.

## Contrato operacional do stream JSON

Os dois motores usam o mesmo transporte resiliente, mantendo tradutores de protocolo separados. O pipeline oferece:

- UTF-8 incremental e JSONL com linha máxima de 1 MiB;
- fila de até 128 eventos ou 8 MiB, evento máximo de 4 MiB e retomada abaixo de 64 eventos e 4 MiB;
- resposta final exclusivamente do terminal corrente (`result.response` no AGY e `agent_message` confirmado por `turn.completed` no Codex);
- timeout de inatividade de 300.000 ms e duração máxima de 7.200.000 ms, preservando os overrides `LLM_INACTIVITY_TIMEOUT_MS` e `LLM_MAX_TURN_TIMEOUT_MS`;
- terminal único, cancelamento do consumidor e cleanup gracioso após 250 ms, seguido de `SIGTERM`, espera de 2.000 ms e `SIGKILL` com confirmação de até 500 ms;
- diagnóstico apenas estrutural e limitado, sem prompt, argumentos, stdout/stderr, transcript, resposta ou segredo.

`TurnResultDTO.metrics` pode conter `protocolEventCount`, `malformedLineCount`, `unknownEventCount`, `backpressurePauseCount`, `maxQueueDepth`, `maxQueueBytes`, `terminalReason`, `cleanupStrategy`, `cleanupSignal`, `cleanupForced` e `cleanupConfirmed`. Esses campos não contêm conteúdo do stream.

### Compatibilidade de cleanup

| Plataforma | Estratégia | Garantia |
|---|---|---|
| Linux | grupo POSIX próprio | processo raiz, descendentes e descritores associados |
| macOS | grupo POSIX próprio | mesma estratégia do Linux; depende da semântica POSIX do host |
| Windows | sinal no processo direto | integridade e terminal único; árvore completa não é garantida |

### Rollback

Reverta em conjunto os adapters e os três módulos em `src/adapters/engines/shared/`; não mantenha o parser legado em paralelo. Depois do rollback, restaure a versão anterior dos manifestos e execute a suíte completa do template. A cópia ativa em outro projeto não deve ser atualizada manualmente durante o rollback do template.

## Como Executar

### 1. Dependências
Certifique-se de instalar as dependências:
```bash
cd templates/slack_bridge
npm install
```

### 2. Configuração
Crie um arquivo `.env` baseado no `.env.example`:
```bash
cp .env.example .env
```
Preencha as variáveis de ambiente com os tokens do seu Slack App.

### 3. Escolhendo a Engine (OpenAI Codex)
Por padrão, o bot usa a engine `antigravity`. Para alternar para a integração nativa com a OpenAI, altere no `.env`:
```env
LLM_ENGINE=openai
OPENAI_API_KEY=sk-sua-chave-aqui
# Opcional (padrão é gpt-4o):
OPENAI_MODEL=gpt-4o
```

### 4. Rodando o Bot
```bash
node bot.js
```

Para depuração do streaming, ative a flag de debug no `.env`:
```env
SLACK_BRIDGE_DEBUG=1
```
