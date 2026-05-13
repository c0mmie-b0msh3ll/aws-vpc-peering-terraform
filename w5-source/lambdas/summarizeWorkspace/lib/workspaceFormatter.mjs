const SOFT_LIMIT = 200
const HARD_LIMIT = 500
const RECENT_DAYS = 30

export function formatWorkspace({ workspace, boards, columns, cards }) {
  if (cards.length > HARD_LIMIT) {
    throw new Error(`Workspace cards (${cards.length}) exceeds hard limit ${HARD_LIMIT}`)
  }

  let activeCards = cards
  let filterNote = ''
  if (cards.length > SOFT_LIMIT) {
    const cutoff = Date.now() - RECENT_DAYS * 86400 * 1000
    activeCards = cards.filter(c => c.updatedAt && new Date(c.updatedAt).getTime() >= cutoff)
    filterNote = `\n_Based on ${activeCards.length} recently-active cards (${RECENT_DAYS} days, filtered from ${cards.length} total)._\n`
  }

  const lines = [
    `# Workspace: ${workspace.title}`,
    workspace.description ? `Description: ${workspace.description}` : '',
    `Members: ${workspace.memberCount} | Boards: ${boards.length} | Cards: ${activeCards.length}`,
    filterNote
  ].filter(Boolean)

  const cardsByColumn = new Map()
  for (const c of activeCards) {
    if (!cardsByColumn.has(c.columnId)) cardsByColumn.set(c.columnId, [])
    cardsByColumn.get(c.columnId).push(c)
  }

  const now = Date.now()
  for (const board of boards) {
    lines.push(`\n## Board: ${board.title}`)
    if (board.description) lines.push(`  ${board.description.slice(0, 200)}`)
    const boardCols = columns.filter(col => col.boardId === board._id)
    for (const col of boardCols) {
      const colCards = cardsByColumn.get(col._id) || []
      lines.push(`\n### Column: ${col.title} (${colCards.length} cards)`)
      for (const card of colCards) {
        const flags = []
        if (card.isCompleted) flags.push('DONE')
        if (card.dueAt) {
          const due = new Date(card.dueAt).getTime()
          if (!card.isCompleted && due < now) flags.push('OVERDUE')
          else if (!card.isCompleted && due < now + 3 * 86400 * 1000) flags.push('DUE SOON')
        }
        const progress = card.taskCount > 0 ? ` tasks ${card.completedTaskCount}/${card.taskCount}` : ''
        const assignees = card.memberIds.length > 0 ? ` assignees:${card.memberIds.length}` : ''
        const due = card.dueAt ? ` due:${card.dueAt.slice(0, 10)}` : ''
        const flagStr = flags.length > 0 ? ` [${flags.join(',')}]` : ''
        lines.push(`- ${card.title}${flagStr}${due}${assignees}${progress}`)
        if (card.description) {
          const desc = card.description.toString().slice(0, 150).replace(/\s+/g, ' ')
          lines.push(`  > ${desc}`)
        }
      }
    }
  }

  return lines.join('\n')
}

export const _LIMITS = { SOFT_LIMIT, HARD_LIMIT, RECENT_DAYS }
