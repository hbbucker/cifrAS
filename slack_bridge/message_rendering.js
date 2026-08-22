const path = require('node:path');

const SLACK_MARKDOWN_LIMIT = 11_500;
const INTERMEDIATE_NARRATIVE_LIMIT = 750;

function createAccessibleFallback(markdown) {
  return redactLocalPaths(markdown)
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1')
    .replace(/```[\w-]*\n?/g, '')
    .replace(/```/g, '')
    .trim();
}

function redactLocalPaths(text) {
  return String(text || '')
    .replace(/file:\/\/\/[^\s)\]}]+/gi, '[arquivo local removido]')
    .replace(/(?:^|[\s(])(?:\/[A-Za-z0-9._-]+){2,}/g, (match) => `${match[0]}[caminho local removido]`);
}

function extractLocalFiles(markdown) {
  const filePaths = [];
  const markdownWithoutLocalFiles = String(markdown || '').replace(/!?\[([^\]]*)\]\((file:\/\/\/[^)]+|\/(?:[^)\s]+))\)/g, (match, label, location) => {
    const filePath = location.startsWith('file:///') ? decodeURIComponent(location.slice('file://'.length)) : location;
    if (path.isAbsolute(filePath)) filePaths.push(filePath);
    return '';
  });
  return { filePaths: [...new Set(filePaths)], markdown: redactLocalPaths(markdownWithoutLocalFiles).trim() };
}

function splitMarkdownForSlack(markdown) {
  const blocks = String(markdown || '').trim().split(/\n{2,}/).filter(Boolean);
  const chunks = [];
  let currentChunk = '';

  for (const block of blocks) {
    if (block.length > SLACK_MARKDOWN_LIMIT && /^```/.test(block)) {
      throw new Error('code block exceeds Slack Markdown limit');
    }
    if (block.length > SLACK_MARKDOWN_LIMIT) {
      const words = block.split(/(\s+)/);
      let fragment = '';
      for (const word of words) {
        if (fragment.length + word.length > SLACK_MARKDOWN_LIMIT) {
          if (!fragment.trim()) throw new Error('Markdown token exceeds Slack Markdown limit');
          chunks.push(fragment.trim());
          fragment = word.trimStart();
        } else {
          fragment += word;
        }
      }
      if (fragment.trim()) chunks.push(fragment.trim());
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

function sanitizeIntermediateNarrative(text) {
  let narrative = String(text || '').trim();
  if (!narrative) return null;
  
  // Segurança básica: bloqueia segredos reais vazados
  const hasSecrets = /(?:xox[baprs]-|sk-[A-Za-z0-9_-]+|AIza[\w-]+|\b(?:api[_ -]?key|authorization|bearer)\b)/i.test(narrative);
  if (hasSecrets) return null;

  // Bloqueia se parecer um dump bruto de comando bash, leitura ou edição sem contexto narrativo
  const isRawToolLeak = /^(?:```(?:bash|sh|json)\n)?\s*(?:npm|node|git|curl|wget|cat|grep|sed|awk|ls|view_file|replace_file_content|write_to_file)\b/im.test(narrative);
  if (isRawToolLeak && narrative.length < 200) return null;

  // Limite de segurança para a API do Slack (truncamento gracioso)
  if (narrative.length > 2900) {
    narrative = narrative.substring(0, 2900) + '...\n_(texto truncado pelo limite do Slack)_';
  }

  return narrative;
}

function getRoleIcon(role) {
  const norm = String(role || '').toLowerCase();
  if (norm.includes('ceo')) return '👔 CEO';
  if (norm.includes('cto')) return '🛠️ CTO';
  if (norm.includes('cpo')) return '🎯 CPO';
  if (norm.includes('qa')) return '🛡️ QA Lead';
  if (norm.includes('frontend')) return '🎨 Frontend Staff';
  if (norm.includes('backend')) return '⚙️ Backend Staff';
  if (norm.includes('orquestrador')) return '🧠 Orquestrador';
  return role ? `🤖 ${role}` : '🤖 Sistema';
}

function createConsolidatedFinal(publication) {
  const otherParticipants = publication.participantRoles.filter(r => r !== 'CEO');
  const rootNarrative = sanitizeIntermediateNarrative(publication.latestRootResponse);
  const isDuplicated = rootNarrative && publication.publishedNarratives.includes(`CEO:${rootNarrative}`);

  let participantText = '';
  if (otherParticipants.length > 0) {
    const formattedParticipants = otherParticipants.map(getRoleIcon).join(' e ');
    participantText = ` com participação confirmada de ${formattedParticipants}`;
  } else if (!isDuplicated) {
    participantText = ' — concluído diretamente sem especialistas adicionais';
  }

  const ceoIcon = getRoleIcon('CEO');

  if (isDuplicated) {
    return `**${ceoIcon} — execução concluída${participantText}**`;
  }

  return `**${ceoIcon} — consolidação${participantText}**\n\n${publication.latestRootResponse}`;
}

function formatMarkdownForSlack(text) {
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

module.exports = {
  SLACK_MARKDOWN_LIMIT,
  INTERMEDIATE_NARRATIVE_LIMIT,
  createAccessibleFallback,
  redactLocalPaths,
  extractLocalFiles,
  splitMarkdownForSlack,
  sanitizeIntermediateNarrative,
  createConsolidatedFinal,
  formatMarkdownForSlack,
  getRoleIcon
};
