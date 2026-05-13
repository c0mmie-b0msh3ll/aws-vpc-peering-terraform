import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import CloseIcon from '@mui/icons-material/Close'
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined'
import { useWorkspaceBoards } from '~/hooks/workspaceBoard.hook'
import { useMemo, useState } from 'react'
import { backgroundBoardList } from '~/constant/backgroundBoard'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 960,
  maxWidth: 'calc(100vw - 32px)',
  maxHeight: '80vh',
  overflowY: 'auto',
  bgcolor: '#2f3136',
  color: '#fff',
  borderRadius: 3,
  boxShadow: 24,
  outline: 'none'
}

const mockBoards = [
  {
    _id: '1',
    title: '1111',
    workspaceName: 'Trello Workspace',
    status: 'archived',
    cover:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80'
  },
  {
    _id: '2',
    title: 'cccc',
    workspaceName: 'Trello Workspace',
    status: 'archived',
    cover:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80'
  },
  {
    _id: '3',
    title: 'My Trello board',
    workspaceName: 'Trello Workspace',
    status: 'archived',
    cover: ''
  }
]

export default function ArchivedBoardList() {
  const [open, setOpen] = useState(false)
  const [boards, setBoards] = useState(mockBoards)
  const { data } = useWorkspaceBoards()

  const archivedBoards = useMemo(() => {
    return data?.boardList?.boards?.filter((b) => b.status === 'archived') || []
  }, [data?.boardList?.boards])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  //   const handleReopenBoard = (boardId) => {
  //     setBoards((prev) =>
  //       prev.map((b) =>
  //         b._id === boardId ? { ...b, status: BOARD_STATUS[0] } : b
  //       )
  //     )
  //   }

  //   const handleDeleteBoard = (boardId) => {
  //     setBoards((prev) => prev.filter((b) => b._id !== boardId))
  //   }

  return (
    <Box>
      <Button
        onClick={handleOpen}
        variant="text"
        sx={{
          mt: 1,
          px: 0,
          minWidth: 'auto',
          textTransform: 'none',
          fontWeight: 600,
          color: 'white',
          backgroundColor: 'grey',
          padding: '5px 7px'
        }}
      >
        View closed boards
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="archived-board-modal-title"
        aria-describedby="archived-board-modal-description"
      >
        <Box sx={style}>
          <Box
            sx={{
              px: 3,
              py: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <ViewKanbanOutlinedIcon sx={{ color: '#d0d4db' }} />
              <Typography
                id="archived-board-modal-title"
                sx={{ fontSize: 20, fontWeight: 700, color: '#e6eaf0' }}
              >
                Closed boards
              </Typography>
            </Box>

            <IconButton onClick={handleClose} sx={{ color: '#d0d4db' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box id="archived-board-modal-description" sx={{ px: 3, pb: 3 }}>
            {archivedBoards.length === 0 ? (
              <Typography sx={{ color: '#c6cad1' }}>
                No closed boards found.
              </Typography>
            ) : (
              archivedBoards.map((board, index) => (
                <Box key={board._id}>
                  <Box
                    sx={{
                      py: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        minWidth: 0,
                        flex: 1
                      }}
                    >
                      {board.cover ? (
                        <Box
                          component="img"
                          src={board.cover.type === 'image' ? board.cover.value : backgroundBoardList.find((item) => item.key === board.cover?.value)?.src}
                          alt={board.title}
                          sx={{
                            width: 52,
                            height: 40,
                            borderRadius: 1,
                            objectFit: 'cover',
                            flexShrink: 0
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 52,
                            height: 40,
                            borderRadius: 1,
                            background:
                              'linear-gradient(135deg, #6366f1, #ec4899)',
                            flexShrink: 0
                          }}
                        />
                      )}

                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            color: '#6aa9ff',
                            textDecoration: 'underline',
                            fontSize: 16,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {board.title}
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.25,
                            color: '#c6cad1',
                            fontSize: 15
                          }}
                        >
                          {board.workspaceName}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.25,
                        flexShrink: 0
                      }}
                    >
                      <Button
                        variant="outlined"
                        // onClick={() => handleReopenBoard(board._id)}
                      >
                        Reopen
                      </Button>

                      <Button
                        variant="outlined"
                        color="error"
                        // onClick={() => handleDeleteBoard(board._id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>

                  {index !== archivedBoards.length - 1 && (
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                  )}
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Modal>
    </Box>
  )
}
