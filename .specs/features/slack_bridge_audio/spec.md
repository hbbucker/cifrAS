# Spec: Slack Bridge Audio Support (Fast-Track)

**Objetivo:** Permitir que o `slack_bridge` receba áudios via Slack, faça o download temporário e passe o caminho absoluto do arquivo no prompt para a Engine (AGY), para que ela processe a voz usando multimodalidade nativa, deletando o arquivo em seguida.

**Escopo (I0 - Fast-Track):**
- Identificar anexos de áudio no evento de mensagem do Slack (`audio/webm`, `audio/mp4`, `audio/m4a`, `audio/mpeg`, `audio/ogg`, etc).
- Fazer download do arquivo de áudio usando o Bearer token do Slack bot para a pasta OS temp.
- Repassar o caminho do arquivo no prompt: "[Usuário enviou uma mensagem de voz. O arquivo temporário está em /tmp/... Por favor, acesse o arquivo e responda.]"
- Garantir a deleção do arquivo de áudio usando bloco `try...finally` no processamento da mensagem, ou deletar após a engine receber a instrução de execução. (Na verdade, no adapter, a deleção precisa acontecer depois que a stream da Engine fechar).

**Critérios de Aceite:**
1. Áudios enviados pelo Slack são reconhecidos pelo bot.
2. O arquivo é salvo localmente em pasta temporária (ex: `/tmp/`).
3. O `ProcessMessageUseCase` inclui o caminho do arquivo de áudio no texto enviado para a engine.
4. O arquivo temporário é deletado logo após a engine terminar o processamento.

**Riscos e Contornos:**
- Risco: Vazamento de disco (Disco cheio).
- Contorno: `try/finally` ou deleção na conclusão da `executionStream` na bridge.
