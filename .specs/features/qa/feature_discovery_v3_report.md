**Parecer QA Lead**

1. **Tradução (i18n):** As chaves `singerMode` e `playlistExport` foram adicionadas com sucesso aos arquivos `pt-BR.json`, `en.json` e `es.json`, refletindo os textos exatos solicitados na especificação.
2. **Componente Visual:** O arquivo `FeatureDiscoveryModal.tsx` foi atualizado para exibir novas features utilizando novas chaves do i18n (`t('featureDiscovery.singerMode')` e `t('featureDiscovery.playlistExport')`) juntamente com os emojis adequados (🎤 e 📊). As chaves antigas foram removidas da exibição, focando apenas nas novidades atuais.
3. **Gatilho de Estado:** No arquivo `SongViewPage.tsx`, chave do `localStorage` foi devidamente alterada de `feature_discovery_02_seen` para `feature_discovery_03_seen`, tanto na verificação de leitura quanto no salvamento ao fechar o modal.
4. **Cobertura (Regra dos 90%):** O diff apresenta 100% de cobertura, com testes recém-criados/atualizados em `FeatureDiscoveryModal.test.tsx` e `SongViewPage.test.tsx` para garantir o funcionamento da UI e o controle do gatilho pelo *localStorage*.

Todas as 3 exigências da microespecificação em `.specs/features/feature_discovery_v3.md` foram atendidas integralmente.

PRONTA PARA INTEGRAÇÃO
