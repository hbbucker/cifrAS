# Plano Técnico de Implementação: Modo Tela Cheia e Live Preview Dividido

- **ID da Feature**: `song-editor-fullscreen-preview`
- **Classificação**: `I1` (Fast-Track)
- **Componentes Afetados**:
  - `codebase/src/main/webui/src/components/music/SongEditorFullscreen.tsx` (Novo)
  - `codebase/src/main/webui/src/pages/SongFormPage.tsx` (Modificação)
  - `codebase/src/main/webui/src/locales/pt-BR.json` (Adição de chaves i18n)
  - `codebase/src/main/webui/src/locales/en.json` (Adição de chaves i18n)
  - `codebase/src/main/webui/src/locales/es.json` (Adição de chaves i18n)
  - `codebase/src/main/webui/src/tests/SongEditorFullscreen.test.tsx` (Novo)
  - `codebase/src/main/webui/src/tests/SongFormPage.test.tsx` (Modificação)

---

## 1. Arquitetura e Design de Componentes

### 1.1 `SongEditorFullscreen.tsx`
Componente responsável por orquestrar a visualização maximizada em tela cheia com overlay.

#### Interface / Props:
```typescript
export type ViewMode = 'editor' | 'split' | 'preview';

export interface SongEditorFullscreenProps {
  isOpen: boolean;
  content: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  title: string;
  artist: string;
  songKey: string;
  insertText: (text: string) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
}
```

#### Estados Internos:
- `viewMode: ViewMode`: inicializado baseado no viewport (`window.innerWidth >= 1280 ? 'split' : 'editor'`).

#### Estrutura de Layout do Overlay:
```text
┌────────────────────────────────────────────────────────────────────────┐
│ Header Maximizado:                                                     │
│ [<- Restaurar] [Título / Artista (Tom)] [Tags Rápidas]                 │
│              [Editor | Dividido | Preview]               [Salvar (Ctrl+S)] │
├──────────────────────────────────┬─────────────────────────────────────┤
│ (Se viewMode === 'split')        │                                     │
│ Painel Esquerdo (50%):           │ Painel Direito (50%):               │
│ - Linha guia vertical (40ch)     │ - Live Preview (ChordSheet)         │
│ - Textarea com scroll próprio    │ - Acordes estilizados               │
│                                  │ - Scroll próprio                    │
└──────────────────────────────────┴─────────────────────────────────────┘
```

### 1.2 Integração em `SongFormPage.tsx`
- Adicionar estado `isFullscreen: boolean`.
- Adicionar botão com ícone `Maximize2` na barra de ferramentas do card de cifras, com tooltip internacionalizado.
- Renderizar condicionalmente `<SongEditorFullscreen ... />` quando `isFullscreen === true`.
- Repassar os métodos `setContent`, `handleSave`, `insertText`, `title`, `artist`, `key`.

### 1.3 Internacionalização (i18n)
Adicionar chaves sob o bloco `"songForm"` em `pt-BR.json`, `en.json` e `es.json`:
- `fullscreenBtn`: "Maximizar editor (Tela cheia)"
- `restoreBtn`: "Restaurar editor"
- `viewMode`: "Modo de visualização"
- `viewEditor`: "Editor"
- `viewSplit`: "Dividido"
- `viewPreview`: "Preview"
- `livePreview`: "Pré-visualização"
- `emptyPreview`: "A pré-visualização da cifra aparecerá aqui conforme você digita."
- `escShortcut`: "Esc para sair"
- `saveShortcut`: "Ctrl+S para salvar"

---

## 2. Rastreabilidade com os Critérios de Aceite (ACs)

| AC | Descrição | Onde é Atendido | Teste Automatizado |
|---|---|---|---|
| **AC01** | Botão de maximizar no card de cifras | `SongFormPage.tsx` | `SongFormPage.test.tsx` |
| **AC02** | Overlay 100% viewport | `SongEditorFullscreen.tsx` | `SongEditorFullscreen.test.tsx` |
| **AC03** | Viewport >= 1280px abre em `split` | `SongEditorFullscreen.tsx` | `SongEditorFullscreen.test.tsx` |
| **AC04** | Viewport < 1280px abre em `editor` | `SongEditorFullscreen.tsx` | `SongEditorFullscreen.test.tsx` |
| **AC05** | Seletor segmentado alterna entre os 3 modos | `SongEditorFullscreen.tsx` | `SongEditorFullscreen.test.tsx` |
| **AC06** | Digitação reflete instantaneamente no preview | `SongEditorFullscreen.tsx` + `ChordSheet` | `SongEditorFullscreen.test.tsx` |
| **AC07** | Inserção rápida de marcadores no fullscreen | `SongEditorFullscreen.tsx` | `SongEditorFullscreen.test.tsx` |
| **AC08** | Tecla `Esc` ou botão Restaurar fecha overlay | `SongEditorFullscreen.tsx` | `SongEditorFullscreen.test.tsx` |
| **AC09** | Tecla `Ctrl+S` / `Cmd+S` e botão Salvar salvam música | `SongEditorFullscreen.tsx` | `SongEditorFullscreen.test.tsx` |
| **AC10** | i18n nos 3 idiomas (pt-BR, en, es) | `locales/*.json` | `SongEditorFullscreen.test.tsx` |
| **AC11** | Cobertura Vitest >= 90% no diff | Vitest | `npm run test` com relatório de cobertura |

---

## 3. Estratégia de Verificação e Qualidade
1. Testes unitários com Vitest cobrindo 100% dos caminhos de renderização e eventos de teclado.
2. Execução de lint (`npm run lint`) garantindo 0 warnings.
3. Verificação de cobertura no diff garantindo threshold `>= 90%`.
