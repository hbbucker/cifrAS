const fs = require('node:fs');
const path = require('node:path');
const { IThreadSessionRepository } = require('../../domain/ports/IThreadSessionRepository');
const { ThreadSession } = require('../../domain/entities/ThreadSession');

class JsonFileThreadRepository extends IThreadSessionRepository {
  constructor(filePath = path.join(__dirname, '..', '..', '..', 'thread_mapping.json')) {
    super();
    this.filePath = filePath;
  }

  _readAll() {
    if (!fs.existsSync(this.filePath)) return {};
    try {
      const content = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(content || '{}');
    } catch {
      return {};
    }
  }

  _writeAll(data) {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  async getByThreadId(threadId) {
    const data = this._readAll();
    const entry = data[threadId];
    if (!entry) return null;
    return ThreadSession.fromJSON(threadId, entry);
  }

  async save(threadSession) {
    const data = this._readAll();
    data[threadSession.threadId] = threadSession.toJSON();
    this._writeAll(data);
  }

  async delete(threadId) {
    const data = this._readAll();
    if (data[threadId]) {
      delete data[threadId];
      this._writeAll(data);
    }
  }
}

module.exports = { JsonFileThreadRepository };
