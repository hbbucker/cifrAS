# Clarify/Plan: Links de Compartilhamento (Share Links)

## 1. Classificação Técnica e Consolidada
- **Nível Consolidado**: I2 (Requer alteração de banco de dados, novos endpoints protegidos e públicos, manipulação de estado pós-OAuth).

## 2. Estratégia Técnica e Banco de Dados
A tabela existente de compartilhamento de músicas (ou convites de grupos) deve ser substituída/adaptada para focar na entidade `ShareLink`.

### Tabela `ShareLinkEntity`
- `id` (UUID, PK)
- `token` (String/UUID único, indexado)
- `type` (Enum: `SONG`, `GROUP`)
- `resource_id` (UUID - ID da música ou grupo)
- `created_by` (UUID - autor)
- `expires_at` (Timestamp - criado em + 5 dias)
- `created_at` (Timestamp)

## 3. Contrato de API (DTOs)

### `POST /api/share-links` (Protegido)
**Request:**
```json
{
  "type": "SONG",
  "resourceId": "uuid-da-musica"
}
```
**Response (201 Created):**
```json
{
  "token": "token-unico-1234",
  "expiresAt": "2026-09-04T12:00:00Z",
  "url": "https://cifras.app/invite/token-unico-1234"
}
```

### `GET /api/share-links/{token}` (Público)
**Response (200 OK):**
```json
{
  "type": "SONG",
  "resourceId": "uuid-da-musica",
  "resourceName": "Nome da Música",
  "authorName": "Nome do Anfitrião",
  "expiresAt": "2026-09-04T12:00:00Z"
}
```
*(Se expirado, retorna 404 ou 410 Gone).*

### `POST /api/share-links/{token}/accept` (Protegido)
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Música adicionada ao repertório"
}
```

## 4. Tratamento no Frontend
- Rota `/invite/:token` acessada.
- Se usuário deslogado: Salva o `token` em `localStorage.getItem('pendingShareToken')` antes de redirecionar para `/login`.
- Após login/OAuth: O componente principal verifica se existe `pendingShareToken` no `localStorage`. Se existir, mostra "Processando convite..." e chama `POST /api/share-links/{token}/accept`, redirecionando após o sucesso para a página da música ou do grupo.

## 5. Estratégia de Testes
- **Backend**: Testes de Integração (REST Assured) para testar fluxo completo de expiração, autorização do aceite, erro 404 em token inválido. Cobertura ≥ 90% no diff (JaCoCo).
- **Frontend**: Teste E2E (Playwright) para acessar `/invite/:token`, simular clique e checar gravação no localStorage; Teste Unitário (Vitest) no hook/page de invite.

## 6. Rollback / Segurança
- O aceite de um convite de `GROUP` deve inserir o membro na tabela do grupo.
- Validação no backend se o `token` já foi expirado (`expires_at < now()`).
- Rate limiting no endpoint de criação de convites para prevenir abuso.
