/**
 * Cross-chat memory utility.
 * Builds a compact memory snapshot from recent past sessions
 * to give the AI context about previous conversations.
 */

const MAX_PAST_SESSIONS = 4   // how many past chats to include
const MAX_MSGS_PER_SESSION = 6 // messages (user+ai pairs) to include per session

/**
 * Given all sessions and the active session ID,
 * returns a compact memory string to include in the system prompt.
 */
export function buildMemoryContext(sessions, activeId) {
  const past = sessions
    .filter((s) => s.id !== activeId && s.messages.length > 0)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_PAST_SESSIONS)

  if (past.length === 0) return null

  const lines = []
  for (const session of past) {
    const date = new Date(session.updatedAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
    lines.push(`### Chat: "${session.title}" (${date})`)

    const msgs = session.messages
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && m.content?.trim())
      .slice(-MAX_MSGS_PER_SESSION)

    for (const m of msgs) {
      const speaker = m.role === 'user' ? 'User' : 'Aura AI'
      // Truncate very long messages to keep token count reasonable
      const content = m.content.length > 400
        ? m.content.slice(0, 400).trimEnd() + '…'
        : m.content
      lines.push(`${speaker}: ${content}`)
    }
    lines.push('')
  }

  return lines.join('\n').trim()
}
