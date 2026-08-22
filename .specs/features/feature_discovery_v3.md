# Microespecificação: Feature Discovery v3

## Objetivo
Atualizar o `FeatureDiscoveryModal` para exibir as novidades recentes do CifrAS (Modo Cantor e Exportação de Playlists para PPTX) e forçar a exibição para todos os usuários ao acessarem uma cifra.

## Escopo (Fast-Track)
1. **Tradução (i18n):**
   - Atualizar os arquivos `en.json`, `es.json` e `pt-BR.json` na seção `featureDiscovery`.
   - Adicionar chave `singerMode` com o texto referente ao "Modo Cantor no Modo Teatro (apenas letras)".
   - Adicionar chave `playlistExport` com o texto referente a "Exportação de Playlists (.pptx) sem tablaturas".
   - (Opcional) Manter as chaves antigas se necessário para histórico, mas o modal só exibirá as duas novas.

2. **Componente Visual (`FeatureDiscoveryModal.tsx`):**
   - Alterar as linhas exibidas no modal para usar as novas chaves: `t('featureDiscovery.singerMode')` e `t('featureDiscovery.playlistExport')`.
   - Atualizar os emojis/ícones textuais de forma adequada (ex: 🎤 para Modo Cantor, 📊 ou 📁 para Exportação de Playlists).

3. **Gatilho de Estado (`SongViewPage.tsx`):**
   - Alterar a chave do localStorage de `feature_discovery_02_seen` para `feature_discovery_03_seen`.
   - Garantir que a lógica de reset force o aparecimento do modal uma única vez até ser "entendido" pelo usuário.

## Nível de Impacto
I0 / I1 (Baixo Impacto). Nenhuma quebra de interface ou banco de dados. Funcionalidade apenas de UI/Estado local. Testes unitários/E2E aplicáveis se a cobertura da página cair (exigência de >=90% no diff).
