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

  extractLocalFiles(markdown) {
    const filePaths = [];
    const markdownWithoutLocalFiles = String(markdown || '').replace(/!?\[([^\]]*)\]\((file:\/\/\/[^)]+|\/(?:[^)\s]+))\)/g, (match, label, location) => {
      const filePath = location.startsWith('file:///') ? decodeURIComponent(location.slice('file://'.length)) : location;
      if (path.isAbsolute(filePath)) filePaths.push(filePath);
      return '';
    });
    return {
      filePaths: [...new Set(filePaths)],
      markdown: this.redactLocalPaths(markdownWithoutLocalFiles).trim(),
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
