import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from '../../components/BoardDetail/BoardBar/BoardBar'
import BoardContent from '../../components/BoardDetail/BoardContent/BoardContent'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import useBoardDetail from '~/hooks/boardDetail.hook'
import CardDetailModal from '~/components/BoardDetail/BoardContent/CardDetailModal/_CardDetailModal'
import AccessDenied from '~/components/Common/AccessDenied'
import { useState } from 'react'
import { backgroundBoardList } from '~/constant/backgroundBoard'

function BoardDetail() {
  const {
    board,
    isDenied,
    members,
    moveColumns,
    moveCardInTheSameColumn,
    moveCardToDifferentColumn,
    boardModal,
    boardPopover
  } = useBoardDetail()

  const [columnCollapseMode, setColumnCollapseMode] = useState(null)
  // null | 'collapse' | 'expand'

  const handleCollapseAllColumns = () => {
    setColumnCollapseMode('collapse')
  }

  const handleExpandAllColumns = () => {
    setColumnCollapseMode('expand')
  }

  const clearColumnCollapseMode = () => {
    setColumnCollapseMode(null)
  }

  const itemBackground = backgroundBoardList.find(
    (item) => item.key === board?.cover?.value
  )?.src

  const bgValue =
    board?.cover?.type === 'image' ? board?.cover?.value : itemBackground

  if (isDenied) {
    return (
      <>
        <AppBar />
        <AccessDenied />
      </>
    )
  }

  if (!board) {
    return <PageLoadingSpinner caption="Loading Board..." />
  }

  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{
        height: '100vh',
        width: '100%',
        backgroundImage: bgValue
          ? `linear-gradient(rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08)), url("${bgValue}")`
          : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <AppBar />
      <CardDetailModal />
      <BoardBar
        members={members}
        board={board}
        boardModal={boardModal}
        boardPopover={boardPopover}
        columnCollapseMode={columnCollapseMode}
        onCollapseAllColumns={handleCollapseAllColumns}
        onExpandAllColumns={handleExpandAllColumns}
      />

      <BoardContent
        board={board}
        moveColumns={moveColumns}
        moveCardInTheSameColumn={moveCardInTheSameColumn}
        moveCardToDifferentColumn={moveCardToDifferentColumn}
        columnCollapseMode={columnCollapseMode}
        clearColumnCollapseMode={clearColumnCollapseMode}
      />
    </Container>
  )
}

export default BoardDetail
