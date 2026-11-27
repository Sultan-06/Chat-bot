/**
 * Cross-chat memory utility.
 * Builds a compact memory snapshot from recent past sessions
 * to give the AI context about previous conversations.
 */

const MAX_PAST_SESSIONS = 4
const MAX_TOTAL_CHARS = 5800

function getValidMessages(session) {
  return (session.messages ?? []).filter(
    (m) => (m.role === 'user' || m.role === 'assistant') && m.content?.trim()
  )
}

/**
 * Keep opening context (first 2 messages) plus most recent messages
 * when a conversation is long, so key facts from the start are not lost.
 */
function selectMessagesForMemory(msgs, maxMessages) {
  if (msgs.length <= maxMessages) return msgs
  const head = msgs.slice(0, 2)
  const tail = msgs.slice(-(maxMessages - 2))
  return [...head, { role: 'note', content: '[... earlier messages in this chat omitted ...]' }, ...tail]
}

export function getMemorySessions(sessions, activeId) {
  return sessions
    .filter((s) => s.id !== activeId && getValidMessages(s).length > 0)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_PAST_SESSIONS)
}

export function countMemorySessions(sessions, activeId) {
  return getMemorySessions(sessions, activeId).length
}

/**
 * Given all sessions and the active session ID,
 * returns a compact memory string to include in the system prompt.
 */
export function buildMemoryContext(sessions, activeId) {
  const past = getMemorySessions(sessions, activeId)
  if (past.length === 0) return null

  const blocks = []
  let totalLen = 0

  for (let i = 0; i < past.length; i++) {
    const session = past[i]
    const isMostRecent = i === 0
    const maxMsgs = isMostRecent ? 12 : 6
    const maxMsgChars = isMostRecent ? 600 : 350

    const date = new Date(session.updatedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    const label = isMostRecent
      ? `### Previous Chat 1 (Most Recent): "${session.title}" (${date})`
      : `### Previous Chat ${i + 1}: "${session.title}" (${date})`

    const lines = [label]
    const msgs = selectMessagesForMemory(getValidMessages(session), maxMsgs)

    for (const m of msgs) {
      if (m.role === 'note') {
        lines.push(m.content)
        continue
      }
      const speaker = m.role === 'user' ? 'User' : 'Aura AI'
      const raw = m.content.trim()
      const content =
        raw.length > maxMsgChars ? raw.slice(0, maxMsgChars).trimEnd() + '…' : raw
      lines.push(`${speaker}: ${content}`)
    }

    const block = lines.join('\n')
    if (totalLen + block.length + 2 > MAX_TOTAL_CHARS) {
      if (blocks.length === 0) {
        blocks.push(block.slice(0, MAX_TOTAL_CHARS).trimEnd() + '…')
      }
      break
    }

    blocks.push(block)
    totalLen += block.length + 2
  }

  return blocks.join('\n\n').trim() || null
}
