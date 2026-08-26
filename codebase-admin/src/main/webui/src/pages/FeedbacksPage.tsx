import React, { useEffect, useState } from 'react';
import { getFeedbacks, replyFeedback } from '../api/feedback';
import { FeedbackDTO } from '../types/feedback';

export const FeedbacksPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackDTO | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const data = await getFeedbacks();
      setFeedbacks(data);
    } catch (e) {
      console.error('Error fetching feedbacks', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeedback || !replyMessage.trim()) return;

    setSubmitting(true);
    try {
      await replyFeedback(selectedFeedback.id, { replyMessage });
      await fetchFeedbacks();
      setSelectedFeedback(null);
      setReplyMessage('');
    } catch (e) {
      console.error('Error replying feedback', e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Carregando feedbacks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Feedbacks</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#dadad3] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f6f6f3] text-[#62625b] border-b border-[#dadad3]">
              <tr>
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold">Usuário</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Mensagem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dadad3]">
              {feedbacks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[#62625b]">
                    Nenhum feedback encontrado.
                  </td>
                </tr>
              ) : (
                feedbacks.map((fb) => (
                  <tr 
                    key={fb.id} 
                    className="hover:bg-[#f6f6f3] cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedFeedback(fb);
                      setReplyMessage(fb.adminReply || '');
                    }}
                  >
                    <td className="px-4 py-3 text-[#62625b]">
                      {new Date(fb.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {fb.userId || 'Anônimo'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        fb.status === 'PENDING' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {fb.status === 'PENDING' ? 'Pendente' : 'Respondido'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#62625b] max-w-[200px] truncate">
                      {fb.message}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#dadad3]">
              <h3 className="font-bold text-lg">Detalhes do Feedback</h3>
              <button 
                onClick={() => setSelectedFeedback(null)}
                className="text-[#62625b] hover:text-black"
                aria-label="Fechar modal"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <p className="text-xs font-bold text-[#62625b] uppercase mb-1">Mensagem do Usuário</p>
                <div className="bg-[#f6f6f3] p-4 rounded-md text-sm whitespace-pre-wrap">
                  {selectedFeedback.message}
                </div>
              </div>
              
              <form onSubmit={handleReplySubmit} className="space-y-4 pt-4 border-t border-[#dadad3]">
                <p className="text-xs font-bold text-[#62625b] uppercase mb-1">Responder</p>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  disabled={selectedFeedback.status === 'REPLIED' || submitting}
                  className="w-full h-32 p-3 border border-[#dadad3] rounded-md text-sm outline-none focus:border-[#aa3bff] focus:ring-1 focus:ring-[#aa3bff] resize-none disabled:bg-[#f6f6f3] disabled:text-[#62625b]"
                  placeholder="Escreva a resposta aqui..."
                  required
                />
                {selectedFeedback.status === 'PENDING' && (
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedFeedback(null)}
                      disabled={submitting}
                      className="px-4 py-2 rounded-md font-semibold text-sm border border-[#dadad3] hover:bg-[#f6f6f3] transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !replyMessage.trim()}
                      className="px-4 py-2 rounded-md font-semibold text-sm bg-[#aa3bff] text-white hover:bg-[#9933e6] transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Enviando...' : 'Enviar Resposta'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
