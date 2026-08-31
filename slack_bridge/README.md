# Slack Bridge

O Slack Bridge é a ponte de comunicação que permite interagir com diferentes motores de Inteligência Artificial diretamente pelo Slack, utilizando uma arquitetura agnóstica de Eventos e Server-Sent Events.

## Funcionalidades
- **Motores Múltiplos**: Suporte Nativo para `antigravity` (AGY 2.0 CLI) e `openai` (Codex/GPT-4o).
- **Zero-Latency Streaming**: Respostas renderizadas no Slack no momento em que a IA processa o pensamento (Text Deltas bypass).
- **Gestão de Sessão**: Mantém histórico das theads para continuidade das conversas.
- **Clean Architecture**: Código segregado em Adapters e UseCases para facilitar testes e adições.

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
