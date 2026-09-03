# Spec: BUG-PWA-ICON-01: Ícone incorreto na instalação PWA (Chrome)

## Background
Ao utilizar o recurso de instalação do Chrome (PWA / Adicionar à Tela Inicial / Instalar Aplicativo), o ícone exibido no atalho do aplicativo instalado é o ícone padrão do template Vite (raio roxo de 150x144 px) em vez da identidade visual oficial do CifrAS (palheta roxa com diagrama de acordes).

## Impact Classification
- **Nível de Impacto:** I1 (Correção pontual de assets estáticos e manifesto PWA)
- **Fast-Track:** Aplicável (sem alteração de arquitetura, contratos de backend ou lógica de domínio).

## Root Cause
1. O arquivo estático `codebase/src/main/webui/public/favicon.png` continha a imagem legada do Vite (150x144 px).
2. O arquivo `codebase/src/main/webui/vite.config.ts` na configuração do `VitePWA` apontava as resoluções `192x192` e `512x512` para `/favicon.png` com `purpose: 'any maskable'`.
3. O `index.html` utilizava `apple-touch-icon` apontando para `/favicon.png`.
4. Não havia ícones dedicados em alta resolução (192x192, 512x512, maskable e apple-touch-icon) gerados a partir do `favicon.svg` oficial.

## Solution
1. Gerar assets PNG de alta fidelidade e resolução adequada a partir do SVG oficial da marca (`favicon.svg`):
   - `pwa-192x192.png` (192x192 px, propósito 'any')
   - `pwa-512x512.png` (512x512 px, propósito 'any')
   - `pwa-maskable-192x192.png` (192x192 px com margem segura de respiro para ícones adaptativos no Android / Chrome, propósito 'maskable')
   - `pwa-maskable-512x512.png` (512x512 px com margem segura de respiro, propósito 'maskable')
   - `apple-touch-icon.png` (180x180 px para iOS)
   - `favicon.png` (atualizado para o logo oficial do CifrAS)
   - `favicon-32x32.png` / `favicon.ico`
2. Atualizar `codebase/src/main/webui/vite.config.ts` para registrar corretamente todos os ícones no manifesto com seus tamanhos e propósitos explícitos (`any` e `maskable`).
3. Atualizar `codebase/src/main/webui/index.html` para referenciar o `apple-touch-icon.png` e os favicons atualizados.
4. Sincronizar os ícones correspondentes para `codebase-admin/src/main/webui/public` para manter coerência visual no painel administrativo.
5. Executar os builds e testes de frontend para garantir integridade do pacote gerado.

## Acceptance Criteria
- [ ] O manifesto PWA (`manifest.webmanifest`) deve conter entradas válidas para ícones 192x192 e 512x512 tanto para propósito 'any' quanto 'maskable'.
- [ ] Todos os arquivos PNG referenciados no manifesto e no HTML devem existir na pasta `public/` e conter o logo oficial do CifrAS (palheta roxa com diagrama).
- [ ] O `favicon.png` legado deve ser substituído pelo logo oficial.
- [ ] O build do Vite e os testes unitários do frontend devem passar com 100% de sucesso.
