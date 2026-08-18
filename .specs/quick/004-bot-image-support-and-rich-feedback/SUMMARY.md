# Bot Image Support & Rich Feedback Tracking

## Description
O `slack_bridge/bot.js` apresentava duas limitações principais na experiência de uso via Slack:
1. **Suporte a Imagens/Anexos:** Mensagens com arquivos anexados (imagens) eram ignoradas devido ao filtro de `event.subtype === 'file_share'`, e quando presentes não eram baixadas nem repassadas para a LLM inspecionar via multimodalidade.
2. **Feedback Contextual e Transparente:** O status de execução no Slack mostrava apenas mensagens vagas como `🧠 *CEO AI trabalhando:* Viewing AGENTS.md`, sem explicar o que estava sendo feito, qual era o plano de ação, para quem a tarefa estava sendo delegada ou quais comandos/arquivos estavam sendo manipulados.

## Changes Implemented
1. **Processamento de Imagens e Arquivos do Slack:**
   - Habilitado tratamento de `event.subtype === 'file_share'` e detecção de `event.files`.
   - Download automático e seguro dos anexos via Slack API com `Authorization: Bearer ${SLACK_BOT_TOKEN}` para a pasta local `slack_bridge/downloads/`.
   - Injeção das informações do anexo (nome, mimetype e caminho local absoluto) no prompt para a LLM, acompanhado da instrução mandatória de utilizar a tool `view_file` para inspeção visual multimodal.
   - Feedback inicial amigável no Slack indicando o recebimento dos arquivos.

2. **Formatação Rica de Tool Calls & Delegações:**
   - Criada a função `formatToolCall(t)` que analisa detalhadamente o tipo e argumentos da ferramenta:
     - `invoke_subagent`: Exibe `🚀 *Delegando para [Role]:* "[Prompt resumido]"`.
     - `view_file`: Exibe `📄 Lendo: \`[caminho_relativo]\``.
     - `write_to_file` / `replace_file_content`: Exibe `📝 Criando / ✏️ Editando: \`[caminho_relativo]\` ([Descrição])`.
     - `run_command`: Exibe `⚙️ Executando: \`[comando]\``.
     - `grep_search`: Exibe `🔍 Buscando por: \`[query]\``.
     - `list_dir`: Exibe `📁 Listando pasta: \`[diretório]\``.
     - `search_web`: Exibe `🌐 Pesquisando na web: \`[query]\``.
   - Notificações de ferramentas agrupadas e formatadas por papel (`🧠 *CEO AI:*`, `💻 *CTO AI:*`, etc.) em vez de mensagens genéricas.

3. **Diretrizes de Comunicação Proativa:**
   - Atualizado o prompt do CEO AI para incluir diretrizes explícitas de transparência: fornecer mensagem inicial de abertura sobre o entendimento da demanda e o plano de ação antes de iniciar a execução e delegações.

## Verification
- Testes unitários e simulação de pipeline de logs validados em `slack_bridge/test_bridge_improvements.js`.
- Verificação de sintaxe `node -c slack_bridge/bot.js` aprovada com sucesso.
