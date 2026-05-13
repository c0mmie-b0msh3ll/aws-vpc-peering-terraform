import { Box } from '@mui/material'
import BoardList from '~/components/Board/BoardList'
import { useWorkspaceBoards } from '~/hooks/workspaceBoard.hook'

function WorkspaceBoardsPage() {
  const { ui, data, handler } = useWorkspaceBoards()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <BoardList
        ui={ui.boardList}
        data={data.boardList}
        handler={handler.boardList}
      />
    </Box>
  )
}
export default WorkspaceBoardsPage
