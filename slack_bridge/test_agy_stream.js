const { appendAgentResponseDelta, createPublicationState } = require('./agy_execution');
const publication = createPublicationState();
publication.roleByConversation['123'] = 'CEO';
const event1 = { step_type: 'agent_response', conversation_id: '123', step_id: 'abc', status: 'ACTIVE', text_delta: 'Entendi a tarefa: Identificar e listar os próximos passos mapeados no roadmap atual do projeto CifrAS.\n\nAndamento: Iniciando a etapa de consulta e levantamento (Fase de Specify). \n\nPróximo passo: Delegar a verificação dos artefatos de documentação ao papel do CPO para que ele levante a situação atual do roadmap e as prioridades mapeadas. Retornarei em seguida com o resultado real da pesquisa estrutural.' };
const event2 = { step_type: 'agent_response', conversation_id: '123', step_id: 'abc', status: 'DONE', text_delta: '' };

console.log('1:', appendAgentResponseDelta(event1, publication));
console.log('2:', appendAgentResponseDelta(event2, publication));
