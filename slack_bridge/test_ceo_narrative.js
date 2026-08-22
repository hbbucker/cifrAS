const { appendAgentResponseDelta, createPublicationState } = require('./agy_execution');
const publication = createPublicationState();
publication.roleByConversation['123'] = 'CEO';
const event1 = { step_type: 'agent_response', conversation_id: '123', step_id: 'abc', status: 'ACTIVE', text_delta: 'Hello world' };
const event2 = { step_type: 'agent_response', conversation_id: '123', step_id: 'abc', status: 'DONE', text_delta: '.' };

console.log('1:', appendAgentResponseDelta(event1, publication));
console.log('2:', appendAgentResponseDelta(event2, publication));
