/**
 * Export the active conversation as a .txt file
 */
export function exportTranscript({ title, messages, persona, language }) {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10)
  const timeStr = now.toLocaleString()

  const lines = [
    `Aura AI – Conversation Transcript`,
    `=====================================`,
    `Title:    ${title || 'Untitled Conversation'}`,
    `Exported: ${timeStr}`,
    `Persona:  ${persona || 'General Assistant'}`,
    `Language: ${language || 'English'}`,
    `=====================================`,
    ``,
  ]

  for (const msg of messages) {
    const role = msg.role === 'user' ? 'You' : 'Aura AI'
    const ts = msg.timestamp
      ? new Date(msg.timestamp).toLocaleTimeString()
      : ''
    lines.push(`[${ts}] ${role}:`)
    lines.push(msg.content)
    lines.push(``)
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `aura-ai-transcript-${dateStr}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
