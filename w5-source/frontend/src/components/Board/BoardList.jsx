import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Pagination from '@mui/material/Pagination'
import PaginationItem from '@mui/material/PaginationItem'
import Box from '@mui/material/Box'
import CreateBoardModal from './CreateBoardModal'
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined'
import Divider from '@mui/material/Divider'
import ArchivedBoardList from './ArchivedBoardModal'
import { Link } from 'react-router-dom'
import { backgroundBoardList } from '~/constant/backgroundBoard'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'
import { useState } from 'react'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import AIGenerateBoardModal from './AIGenerateBoardModal'

function BoardList({ ui, data, handler }) {
  const { page } = ui
  const { boards, count } = data
  const { handleOpenCreateBoard } = handler
  const [isOpenAIModal, setIsOpenAIModal] = useState(false)

  const truncateText = (text, maxLength) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <ViewKanbanOutlinedIcon fontSize="large" />
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Your boards
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {boards
          ?.filter((b) => b.status !== 'archived')
          .map((b) => {
            const itemBackground = backgroundBoardList.find(
              (item) => item.key === b?.cover?.value
            )?.src

            const backgroundImage =
              b?.cover?.type === 'image' ? b?.cover?.value : itemBackground
            return (
              <Grid xs={12} sm={6} md={3} key={b._id}>
                <Box component={Link} to={`/boards/${b._id}`}>
                  <Card
                    sx={{
                      width: '100%',
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <Box
                      sx={{
                        height: 100,
                        backgroundImage: backgroundImage
                          ? `url("${backgroundImage}")`
                          : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        bgcolor: 'action.hover'
                      }}
                    />

                    <CardContent sx={{ p: 1.5 }}>
                      <Typography
                        variant="span"
                        sx={{
                          fontSize: 18,
                          fontWeight: 700,
                          lineHeight: 1.4,
                          minHeight: 42,
                          textWrap: 'nowrap'
                        }}
                      >
                        {truncateText(b.title, 17)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
            )
          })}

        <Grid xs={12} sm={6} md={3}>
          <Card
            onClick={handleOpenCreateBoard}
            sx={(theme) => ({
              width: '100%',
              height: 164,
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid',
              borderColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(9,30,66,0.08)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.04)'
                  : 'rgba(9,30,66,0.04)',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? '0 10px 24px rgba(0,0,0,0.3)'
                    : '0 10px 24px rgba(9,30,66,0.12)',
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.07)'
                    : 'rgba(9,30,66,0.06)'
              }
            })}
          >
            <CardContent
              sx={{
                p: 2,
                '&:last-child': { p: 2 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%'
              }}
            >
              <Typography
                variant="span"
                sx={{
                  fontSize: 18,
                  fontWeight: 700,
                  lineHeight: 1.4,
                  color: 'text.primary'
                }}
              >
                Create a new board
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card
            onClick={() => setIsOpenAIModal(true)}
            sx={(theme) => ({
              width: '100%',
              height: 164,
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid',
              borderColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(167, 139, 250, 0.2)'
                  : 'rgba(124, 58, 237, 0.15)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(167, 139, 250, 0.04)'
                  : 'rgba(124, 58, 237, 0.03)',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? '0 10px 24px rgba(124, 58, 237, 0.2)'
                    : '0 10px 24px rgba(124, 58, 237, 0.12)',
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(167, 139, 250, 0.08)'
                    : 'rgba(124, 58, 237, 0.06)'
              }
            })}
          >
            <CardContent
              sx={{
                p: 2,
                '&:last-child': { p: 2 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                gap: 1
              }}
            >
              <AutoAwesomeOutlinedIcon
                sx={{
                  fontSize: 28,
                  color: (theme) =>
                    theme.palette.mode === 'dark' ? '#a78bfa' : '#7c3aed'
                }}
              />
              <Typography
                variant="span"
                sx={{
                  fontSize: 18,
                  fontWeight: 700,
                  lineHeight: 1.4,
                  color: (theme) =>
                    theme.palette.mode === 'dark' ? '#a78bfa' : '#7c3aed'
                }}
              >
                AI Generate Board
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <CreateBoardModal ui={ui.createModal} handler={handler.createModal} />

      <AIGenerateBoardModal
        isOpen={isOpenAIModal}
        handleClose={() => setIsOpenAIModal(false)}
        handleGenerate={handler.createModal.handleAIGenerateBoard}
        isSubmitting={handler.createModal.isSubmitting}
      />

      {count > 0 && (
        <Box
          sx={{
            my: 3,
            pr: 5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end'
          }}
        >
          <Pagination
            size="large"
            color="secondary"
            showFirstButton
            showLastButton
            count={Math.ceil(count / DEFAULT_ITEMS_PER_PAGE)}
            page={page}
            renderItem={(item) => (
              <PaginationItem
                component={Link}
                to={`/boards${
                  item.page === DEFAULT_PAGE ? '' : `?page=${item.page}`
                }`}
                {...item}
              />
            )}
          />
        </Box>
      )}
      <Box sx={{ mt: 4 }}>
        <Divider sx={{ marginBottom: '10px' }} />
        <ArchivedBoardList />
      </Box>
    </>
  )
}
export default BoardList
