import { test } from 'node:test'
import assert from 'node:assert'
import { formatWorkspace } from '../lib/workspaceFormatter.mjs'

test('formats empty workspace with just header', () => {
  const md = formatWorkspace({
    workspace: { _id: 'w1', title: 'Empty WS', memberCount: 1 },
    boards: [], columns: [], cards: []
  })
  assert.match(md, /# Workspace: Empty WS/)
  assert.match(md, /Members: 1 \| Boards: 0 \| Cards: 0/)
})

test('formats workspace with boards, columns, cards', () => {
  const md = formatWorkspace({
    workspace: { _id: 'w1', title: 'Sprint', memberCount: 2 },
    boards: [{ _id: 'b1', title: 'Dev', description: 'Main dev board' }],
    columns: [
      { _id: 'c1', title: 'To Do', boardId: 'b1' },
      { _id: 'c2', title: 'Done', boardId: 'b1' }
    ],
    cards: [
      {
        _id: 'card1', title: 'Impl login', columnId: 'c1', boardId: 'b1',
        memberIds: ['u1'], dueAt: '2027-01-01T00:00:00Z',
        isCompleted: false, taskCount: 3, completedTaskCount: 1
      },
      {
        _id: 'card2', title: 'Setup CI', columnId: 'c2', boardId: 'b1',
        memberIds: ['u2'], dueAt: null, isCompleted: true,
        taskCount: 0, completedTaskCount: 0
      }
    ]
  })
  assert.match(md, /## Board: Dev/)
  assert.match(md, /Main dev board/)
  assert.match(md, /### Column: To Do \(1 cards\)/)
  assert.match(md, /### Column: Done \(1 cards\)/)
  assert.match(md, /Impl login/)
  assert.match(md, /Setup CI/)
  assert.match(md, /\[DONE\]/)
  assert.match(md, /tasks 1\/3/)
})

test('tags OVERDUE when dueAt in past and not completed', () => {
  const pastDate = new Date(Date.now() - 7 * 86400 * 1000).toISOString()
  const md = formatWorkspace({
    workspace: { _id: 'w1', title: 'X', memberCount: 1 },
    boards: [{ _id: 'b1', title: 'B' }],
    columns: [{ _id: 'c1', title: 'Col', boardId: 'b1' }],
    cards: [{
      _id: 'x', title: 'Late task', columnId: 'c1', boardId: 'b1',
      memberIds: [], dueAt: pastDate, isCompleted: false,
      taskCount: 0, completedTaskCount: 0
    }]
  })
  assert.match(md, /OVERDUE/)
})

test('does not tag OVERDUE when card is completed', () => {
  const pastDate = new Date(Date.now() - 7 * 86400 * 1000).toISOString()
  const md = formatWorkspace({
    workspace: { _id: 'w1', title: 'X', memberCount: 1 },
    boards: [{ _id: 'b1', title: 'B' }],
    columns: [{ _id: 'c1', title: 'Col', boardId: 'b1' }],
    cards: [{
      _id: 'x', title: 'Late but done', columnId: 'c1', boardId: 'b1',
      memberIds: [], dueAt: pastDate, isCompleted: true,
      taskCount: 0, completedTaskCount: 0
    }]
  })
  assert.doesNotMatch(md, /OVERDUE/)
  assert.match(md, /\[DONE\]/)
})

test('applies size guard: filters to last 30 days when >200 cards', () => {
  const now = Date.now()
  const oldDate = new Date(now - 60 * 86400 * 1000).toISOString()
  const recentDate = new Date(now - 5 * 86400 * 1000).toISOString()
  const cards = []
  for (let i = 0; i < 250; i++) cards.push({
    _id: `c${i}`, title: `old ${i}`, columnId: 'c1', boardId: 'b1',
    memberIds: [], dueAt: null, isCompleted: false, taskCount: 0, completedTaskCount: 0,
    updatedAt: oldDate
  })
  for (let i = 0; i < 30; i++) cards.push({
    _id: `r${i}`, title: `recent ${i}`, columnId: 'c1', boardId: 'b1',
    memberIds: [], dueAt: null, isCompleted: false, taskCount: 0, completedTaskCount: 0,
    updatedAt: recentDate
  })
  const md = formatWorkspace({
    workspace: { _id: 'w1', title: 'Big', memberCount: 1 },
    boards: [{ _id: 'b1', title: 'B' }],
    columns: [{ _id: 'c1', title: 'Col', boardId: 'b1' }],
    cards
  })
  assert.match(md, /Based on \d+ recently-active cards/)
  assert.ok(!md.includes('old 0'))
  assert.ok(md.includes('recent 0'))
})

test('throws on hard limit 500 cards', () => {
  const cards = Array.from({ length: 600 }, (_, i) => ({
    _id: `c${i}`, title: `t${i}`, columnId: 'c1', boardId: 'b1',
    memberIds: [], dueAt: null, isCompleted: false, taskCount: 0, completedTaskCount: 0,
    updatedAt: new Date().toISOString()
  }))
  assert.throws(() => formatWorkspace({
    workspace: { _id: 'w1', title: 'Huge', memberCount: 1 },
    boards: [{ _id: 'b1', title: 'B' }],
    columns: [{ _id: 'c1', title: 'Col', boardId: 'b1' }],
    cards
  }), /exceeds hard limit/)
})
