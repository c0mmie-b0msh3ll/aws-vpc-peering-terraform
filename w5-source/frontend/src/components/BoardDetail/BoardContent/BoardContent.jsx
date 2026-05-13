import ListColumns from './ListColumns/ListColumns'
import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'
import Box from '@mui/material/Box'
import useBoardContent from '~/hooks/boardContent.hook'
import { DndContext, DragOverlay } from '@dnd-kit/core'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({
  board,
  moveColumns,
  moveCardInTheSameColumn,
  moveCardToDifferentColumn,
  columnCollapseMode,
  clearColumnCollapseMode
}) {
  const {
    sensors,
    orderedColumns,
    activeDragItemType,
    activeDragItemData,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    customDropAnimation,
    collisionDetectionStrategy
  } = useBoardContent({
    board,
    moveColumns,
    moveCardInTheSameColumn,
    moveCardToDifferentColumn
  })

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box
        sx={{
          height: (theme) => theme.trello.boardContentHeight,
          p: '10px 0'
        }}
      >
        <ListColumns columns={orderedColumns} columnCollapseMode={columnCollapseMode} clearColumnCollapseMode={clearColumnCollapseMode} />
        <DragOverlay dropAnimation={customDropAnimation}>
          {!activeDragItemType && null}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && (
            <Column column={activeDragItemData} columnCollapseMode={columnCollapseMode} clearColumnCollapseMode={clearColumnCollapseMode}/>
          )}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD && (
            <Card card={activeDragItemData} />
          )}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent
