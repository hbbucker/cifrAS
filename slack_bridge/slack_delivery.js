const path = require('node:path');
const fs = require('node:fs');
const { default: PQueue } = require('p-queue');
const { createAccessibleFallback, redactLocalPaths, extractLocalFiles, splitMarkdownForSlack, formatMarkdownForSlack } = require('./message_rendering');

const STATUS_INTERVAL_MS = 15_000;
const ACKNOWLEDGEMENT_STATUS = 'CEO entendeu a solicitação e está avaliando o encaminhamento.';
const QUEUED_STATUS = 'CEO está concluindo o processamento anterior; esta solicitação está na fila.';
const slackQueues = {};

function getSlackQueue(threadTimestamp) {
  if (!slackQueues[threadTimestamp]) slackQueues[threadTimestamp] = new PQueue({ concurrency: 1 });
  return slackQueues[threadTimestamp];
}

function waitForSlackQueue(threadTimestamp) {
  return getSlackQueue(threadTimestamp).onIdle();
}

async function postFinalMessage(client, channel, threadTimestamp, markdown) {
  const fallback = createAccessibleFallback(markdown) || 'A resposta foi concluída.';
  const formattedMarkdown = formatMarkdownForSlack(markdown);
  const nativePayload = {
    channel,
    thread_ts: threadTimestamp,
    text: fallback,
    blocks: [{ type: 'section', text: { type: 'mrkdwn', text: formattedMarkdown.slice(0, 3000) } }],
  };
  try {
    await client.chat.postMessage(nativePayload);
  } catch (error) {
    const slackError = error && error.data && error.data.error;
    if (slackError !== 'invalid_blocks' && slackError !== 'invalid_arguments') throw error;
    await client.chat.postMessage({ channel, thread_ts: threadTimestamp, text: formattedMarkdown });
  }
}

function publishStatus(client, threadTimestamp, channel, publication, status, options = {}) {
  const statusOptions = options === true ? { bypassInterval: true } : options;
  const cleanStatus = redactLocalPaths(status).replace(/[\n*_`#]/g, ' ').replace(/\s+/g, ' ').trim();
  const now = Date.now();
  if (!cleanStatus || cleanStatus === publication.lastStatus) return false;
  if (!statusOptions.bypassInterval && !statusOptions.blocking && now - publication.lastStatusAt < STATUS_INTERVAL_MS) return false;
  publication.lastStatus = cleanStatus;
  publication.lastStatusAt = now;
  getSlackQueue(threadTimestamp).add(() => client.chat.postMessage({ channel, thread_ts: threadTimestamp, text: cleanStatus }));
  if (global.logDebug) global.logDebug('status_queued');
  return true;
}

function publishQueuedStatus(client, threadTimestamp, channel, task) {
  const publication = task.statusPublication || (task.mappingEntry && task.mappingEntry.publication);
  return publication ? publishStatus(client, threadTimestamp, channel, publication, QUEUED_STATUS, { bypassInterval: true }) : false;
}

function publishAcknowledgement(client, threadTimestamp, channel, mappingEntry) {
  if (mappingEntry.acknowledgementPublished) return false;
  mappingEntry.acknowledgementPublished = true;
  if (global.logDebug) global.logDebug('ack_queued');
  getSlackQueue(threadTimestamp).add(async () => {
    try {
      await client.chat.postMessage({ channel, thread_ts: threadTimestamp, text: ACKNOWLEDGEMENT_STATUS });
      if (global.logDebug) global.logDebug('ack_published');
    } catch (error) {
      if (global.logDebug) global.logDebug('ack_failed');
    }
  });
  return true;
}

function publishFinalWithUploads(client, threadTimestamp, channel, publication) {
  if (publication.finalPublished) return false;
  if (!publication.latestRootResponse) {
    if (global.logDebug) global.logDebug('final_skipped_no_root_response');
    return false;
  }
  publication.finalPublished = true;
  const extracted = extractLocalFiles(publication.latestRootResponse);
  if (global.logDebug) global.logDebug('final_queued');
  getSlackQueue(threadTimestamp).add(async () => {
    try {
      for (const markdown of splitMarkdownForSlack(extracted.markdown)) {
        await postFinalMessage(client, channel, threadTimestamp, markdown);
      }
    } catch (error) {
      if (global.logDebug) global.logDebug('final_publication_failed');
      await client.chat.postMessage({ channel, thread_ts: threadTimestamp, text: 'Não consegui publicar a resposta agora. Tente novamente em instantes.' });
      return;
    }
    if (global.logDebug) global.logDebug('final_published');
    for (const filePath of extracted.filePaths) {
      if (!fs.existsSync(filePath)) continue;
      try {
        await client.files.uploadV2({
          channel_id: channel,
          thread_ts: threadTimestamp,
          file: fs.createReadStream(filePath),
          filename: path.basename(filePath),
        });
      } catch (error) {
        if (global.logDebug) global.logDebug('file_upload_failed');
        await client.chat.postMessage({ channel, thread_ts: threadTimestamp, text: 'Não consegui publicar a resposta agora. Tente novamente em instantes.' });
      }
    }
  });
  return true;
}

function publishIntermediateNarrative(client, threadTimestamp, channel, publication, narrative) {
  if (publication.finalPublished || !narrative || !narrative.markdown) return false;
  getSlackQueue(threadTimestamp).add(async () => {
    await postFinalMessage(client, channel, threadTimestamp, narrative.markdown);
  });
  return true;
}

function publishConsolidation(client, threadTimestamp, channel, publication) {
  const otherParticipants = publication.participantRoles.filter(r => r !== 'CEO');
  const participantText = otherParticipants.length ? ` com contribuição de ${otherParticipants.join(' e ')}` : '';
  publishStatus(client, threadTimestamp, channel, publication, `CEO está consolidando a entrega${participantText}.`, { bypassInterval: true });
}

async function downloadSlackFile(fileUrl, targetPath, botToken) {
  const response = await fetch(fileUrl, { headers: { Authorization: `Bearer ${botToken}` } });
  if (!response.ok) throw new Error(`Slack download failed with status ${response.status}`);
  fs.writeFileSync(targetPath, Buffer.from(await response.arrayBuffer()));
  return targetPath;
}

module.exports = {
  STATUS_INTERVAL_MS,
  ACKNOWLEDGEMENT_STATUS,
  QUEUED_STATUS,
  getSlackQueue,
  waitForSlackQueue,
  postFinalMessage,
  publishStatus,
  publishQueuedStatus,
  publishAcknowledgement,
  publishFinalWithUploads,
  publishIntermediateNarrative,
  publishConsolidation,
  downloadSlackFile
};
