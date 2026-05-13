import AppBar from '~/components/AppBar/AppBar'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'
import SideBar from '~/components/Board/SideBar'
import BoardList from '~/components/Board/BoardList'
import useBoardList from '~/hooks/board.hook'
import CreateBoardModal from '~/components/Board/CreateBoardModal'
import Box from '@mui/material/Box'

function BoardPage() {
  const { ui, data, handler } = useBoardList()
  const { workspace } = data.workspace

  return (
    <>
      {!workspace && <PageLoadingSpinner caption="Loading Boards..." />}
      {workspace && (
        <Container disableGutters maxWidth={false}>
          <AppBar />
          <Box sx={{ paddingX: 2, my: 4 }}>
            <Grid container spacing={2}>
              <SideBar
                ui={ui.sideBar}
                data={data.workspace}
                handler={handler.sideBar}
              />
              {workspace?.map((w) => (
                <BoardList key={w._id} ui={ui.board} data={w.boards} />
              ))}
            </Grid>
          </Box>
          <CreateBoardModal ui={ui.createModal} handler={handler.createModal} />
        </Container>
      )}
    </>
  )
}

export default BoardPage
