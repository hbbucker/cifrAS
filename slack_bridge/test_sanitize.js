const { sanitizeIntermediateNarrative } = require('./message_rendering');
const text = `Entendi a tarefa: Identificar e listar os próximos passos mapeados no roadmap atual do projeto CifrAS.\n\nAndamento: Iniciando a etapa de consulta e levantamento (Fase de Specify). \n\nPróximo passo: Delegar a verificação dos artefatos de documentação ao papel do CPO para que ele levante a situação atual do roadmap e as prioridades mapeadas. Retornarei em seguida com o resultado real da pesquisa estrutural.`;
console.log('Result:', sanitizeIntermediateNarrative(text));
