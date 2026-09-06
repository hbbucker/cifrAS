const fs = require('node:fs');
const path = require('node:path');

const SLACK_MARKDOWN_LIMIT = 2900;

class SlackMrkdwnFormatter {
  format(text) {
    if (!text) return '';
    return String(text)
      // Converte links: [texto](url) -> <url|texto>
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<$2|$1>')
      // Converte headers: # Header -> *Header*
      .replace(/^#{1,6}\s+(.*)$/gm, '*$1*')
      // Converte negrito padrão GFM (**texto**) para negrito Slack (*texto*)
      .replace(/\*\*([^*]+)\*\*/g, '*$1*')
      // Converte sublinhado Slack (__texto__) para negrito Slack (*texto*)
      .replace(/__([^_]+)__/g, '*$1*');
  }

  redactLocalPaths(text) {
    return String(text || '')
      .replace(/file:\/\/\/[^\s)\]}]+/gi, '[arquivo local removido]')
      .replace(/(?:^|[\s(])(?:\/[A-Za-z0-9._-]+){2,}/g, (match) => `${match[0]}[caminho local removido]`);
  }

  extractLocalFiles(markdown, options = {}) {
    const workspaceDir = options.workspaceDir || process.cwd();
    const filePaths = [];

    const transformedMarkdown = String(markdown || '').replace(/!?\[([^\]]*)\]\(([^)\s]+)\)/g, (match, label, rawLocation) => {
      // Ignora links web HTTP / HTTPS / mailto
      if (/^(https?:\/\/|mailto:)/i.test(rawLocation)) {
        return match;
      }

      let location = rawLocation;
      if (location.startsWith('file:///')) {
        location = decodeURIComponent(location.slice('file://'.length));
      } else if (location.startsWith('file://')) {
        location = decodeURIComponent(location.slice('file://'.length));
      }

      // Descarta fragmento de linha (#L...) e query (?...)
      const cleanedLocation = location.split('#')[0].split('?')[0];

      let resolvedPath = cleanedLocation;
      if (!path.isAbsolute(resolvedPath) && workspaceDir) {
        const candidate = path.resolve(workspaceDir, resolvedPath);
        if (fs.existsSync(candidate) || /^(\.|\.\.|\.specs|\/)/.test(resolvedPath) || path.extname(resolvedPath)) {
          resolvedPath = candidate;
        }
      }

      // Checa se é diretório no disco para ignorar
      let isDirectory = false;
      try {
        if (fs.existsSync(resolvedPath)) {
          const stat = fs.statSync(resolvedPath);
          isDirectory = stat.isDirectory();
        }
      } catch {
        isDirectory = false;
      }

      if (path.isAbsolute(resolvedPath) && !isDirectory) {
        filePaths.push(resolvedPath);
      }

      let displayLabel = label || path.basename(resolvedPath) || 'arquivo';
      if (path.isAbsolute(displayLabel)) {
        displayLabel = path.basename(displayLabel);
      }
      return match.startsWith('!') ? `*🖼️ ${displayLabel}*` : `*${displayLabel}*`;
    });

    return {
      filePaths: [...new Set(filePaths)],
      markdown: this.redactLocalPaths(transformedMarkdown).trim(),
    };
  }

  createAccessibleFallback(markdown) {
    return this.redactLocalPaths(markdown)
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/```[\w-]*\n?/g, '')
      .replace(/```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/`+/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1')
      .trim();
  }

  splitMarkdownForSlack(markdown) {
    const blocks = String(markdown || '').trim().split(/\n{2,}/).filter(Boolean);
    const chunks = [];
    let currentChunk = '';

    for (const block of blocks) {
      if (block.length > SLACK_MARKDOWN_LIMIT) {
        // Divide o bloco por quebra direta de caracteres, respeitando o limite
        let remaining = block;
        let isCodeBlock = /^```/.test(block);
        while (remaining.length > 0) {
          const slice = remaining.slice(0, SLACK_MARKDOWN_LIMIT);
          remaining = remaining.slice(SLACK_MARKDOWN_LIMIT);
          chunks.push(slice.trim());
        }
        continue;
      }
      const candidate = currentChunk ? `${currentChunk}\n\n${block}` : block;
      if (candidate.length <= SLACK_MARKDOWN_LIMIT) {
        currentChunk = candidate;
      } else {
        chunks.push(currentChunk);
        currentChunk = block;
      }
    }
    if (currentChunk) chunks.push(currentChunk);
    return chunks;
  }
}

module.exports = { SlackMrkdwnFormatter, SLACK_MARKDOWN_LIMIT };
