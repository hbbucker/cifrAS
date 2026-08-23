/**
 * @interface IThreadSessionRepository
 * Contrato abstrato para persistência e recuperação do agregado ThreadSession.
 */
class IThreadSessionRepository {
  async getByThreadId(threadId) {
    throw new Error('IThreadSessionRepository.getByThreadId() must be implemented');
  }

  async save(threadSession) {
    throw new Error('IThreadSessionRepository.save() must be implemented');
  }

  async delete(threadId) {
    throw new Error('IThreadSessionRepository.delete() must be implemented');
  }
}

module.exports = { IThreadSessionRepository };
