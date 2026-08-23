class ThreadSession {
  constructor({
    threadId,
    channelId,
    sessionId = null,
    pendingId = null,
    offset = 0,
    isActive = false,
    participantRoles = ['CEO'],
    publishedNarratives = [],
    subagents = new Map(),
  }) {
    this.threadId = threadId;
    this.channelId = channelId;
    this.sessionId = sessionId;
    this.pendingId = pendingId;
    this.offset = offset;
    this.isActive = isActive;
    this.participantRoles = Array.isArray(participantRoles) ? [...participantRoles] : ['CEO'];
    this.publishedNarratives = Array.isArray(publishedNarratives) ? [...publishedNarratives] : [];
    this.subagents = subagents instanceof Map ? subagents : new Map(Object.entries(subagents || {}));
    this.lastStatus = '';
    this.lastStatusAt = 0;
  }

  bindSessionId(sessionId) {
    this.sessionId = String(sessionId || '').trim() || null;
    this.pendingId = null;
  }

  markActive(isActive = true) {
    this.isActive = Boolean(isActive);
  }

  registerSubagent(conversationId, role) {
    this.subagents.set(conversationId, {
      conversationId,
      role: role.name || role,
      offset: 0,
    });
    if (!this.participantRoles.includes(role.name || role)) {
      this.participantRoles.push(role.name || role);
    }
  }

  getRoleForConversation(conversationId) {
    const sub = this.subagents.get(conversationId);
    if (!sub) {
      if (conversationId === this.sessionId) return { name: 'CEO' };
      return null;
    }
    return { name: sub.role };
  }

  addPublishedNarrative(narrativeKey) {
    if (!this.publishedNarratives.includes(narrativeKey)) {
      this.publishedNarratives.push(narrativeKey);
    }
  }

  hasPublishedNarrative(narrativeKey) {
    return this.publishedNarratives.includes(narrativeKey);
  }

  resetSession() {
    this.sessionId = null;
    this.pendingId = null;
    this.offset = 0;
    this.isActive = false;
    this.subagents.clear();
    this.participantRoles = ['CEO'];
    this.publishedNarratives = [];
  }

  toJSON() {
    return {
      channel: this.channelId,
      sessionId: this.sessionId,
      pendingId: this.pendingId,
      offset: this.offset,
      participantRoles: this.participantRoles,
      subagents: Object.fromEntries(this.subagents),
      publication: {
        publishedNarratives: this.publishedNarratives,
        lastStatus: this.lastStatus,
        lastStatusAt: this.lastStatusAt,
      },
    };
  }

  static fromJSON(threadId, data = {}) {
    return new ThreadSession({
      threadId,
      channelId: data.channel,
      sessionId: data.sessionId || null,
      pendingId: data.pendingId || null,
      offset: data.offset || 0,
      participantRoles: data.participantRoles || ['CEO'],
      publishedNarratives: (data.publication && data.publication.publishedNarratives) || [],
      subagents: data.subagents || {},
    });
  }
}

module.exports = { ThreadSession };
