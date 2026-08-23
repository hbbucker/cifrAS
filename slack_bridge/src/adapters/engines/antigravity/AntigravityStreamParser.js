class AntigravityStreamParser {
  static create(onEvent) {
    let pending = '';
    const parse = (chunk) => {
      pending += chunk.toString('utf8');
      const lines = pending.split('\n');
      pending = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const event = JSON.parse(trimmed);
          onEvent(event);
        } catch {}
      }
    };

    parse.flush = () => {
      if (pending.trim()) {
        try {
          const event = JSON.parse(pending.trim());
          onEvent(event);
        } catch {}
        pending = '';
      }
    };

    return parse;
  }
}

module.exports = { AntigravityStreamParser };
