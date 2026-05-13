import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import SubjectRoundedIcon from '@mui/icons-material/SubjectRounded'
import CardDateBadge from '~/components/BoardDetail/BoardContent/CardDateBadge'
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined'
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined'
import Box from '@mui/material/Box'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import { useSelector } from 'react-redux'
import BoardMemberGroup from '../BoardDetail/BoardBar/BoardMemberGroup'
import { BOARD_LABEL_COLORS } from '~/constant/labelBackgroundColor'

function CardBadge({ card }) {
  const hasDateBadge = !!(card?.startedAt || card?.dueAt)
  const hasTaskBadge = (card?.taskCount || 0) > 0
  const hasDescriptionBadge = !!card?.isHasDescription
  const hasCommentBadge = (card?.commentCount || 0) > 0
  const hasMember = card?.memberIds?.length > 0
  const hasAttachment = card?.attachmentCount > 0
  const hasLabels = card?.labelIds?.length > 0
  const hasBadges =
    hasDateBadge ||
    hasTaskBadge ||
    hasDescriptionBadge ||
    hasCommentBadge ||
    hasMember ||
    hasAttachment ||
    hasLabels

  const boardMember = useSelector((state) => state.activeBoard.members)
  const boardLabel = useSelector((state) => state.activeBoard.labels)

  if (!hasBadges) return null

  const cardMember = hasMember
    ? card.memberIds
        .map((id) =>
          boardMember.find((item) => item._id?.toString() === id?.toString())
        )
        .filter(Boolean)
    : []

  const cardLabel = hasLabels
    ? card.labelIds
        .map((id) =>
          boardLabel.find((item) => item._id?.toString() === id?.toString())
        )
        .filter(Boolean)
    : []

  return (
    <CardActions
      sx={{
        mt: 1,
        ml: -1,
        flexWrap: 'wrap',
        alignItems: 'center',
        rowGap: 1
      }}
    >
      {hasLabels && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.5,
            width: '100%',
            pr: 1,
            pl: 1
          }}
        >
          {cardLabel.map((label) => {
            const colorConfig =
              BOARD_LABEL_COLORS[label.color] || BOARD_LABEL_COLORS.none
            const labelTitle = label.title || label.name || ''

            return (
              <Tooltip key={label._id} title={labelTitle || label.color}>
                <Box
                  sx={(theme) => ({
                    minWidth: 55,
                    maxWidth: 238,
                    height: 20,
                    px: labelTitle ? 1.25 : 0,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: labelTitle ? 'flex-start' : 'center',
                    bgcolor: colorConfig[theme.palette.mode],
                    color: label.color === 'yellow' ? '#172b4d' : '#ffffff',
                    overflow: 'hidden',
                    padding: 1
                  })}
                >
                  {labelTitle && (
                    <Typography
                      variant="span"
                      sx={{
                        fontSize: 12,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {labelTitle}
                    </Typography>
                  )}
                </Box>
              </Tooltip>
            )
          })}
        </Box>
      )}
      {hasDateBadge && (
        <Box>
          <CardDateBadge
            startedAt={card?.startedAt}
            dueAt={card?.dueAt}
            isCompleted={card?.isCompleted}
            clickable={false}
          />
        </Box>
      )}

      {hasTaskBadge && (
        <Tooltip title="Checklist items">
          <Button
            size="small"
            sx={(theme) => ({
              display: 'flex',
              px: 1,
              py: 0.5,
              borderRadius: 1.5,
              alignItems: 'center',
              gap: 0.5,
              color:
                card.completedTaskCount === card.taskCount
                  ? theme.palette.mode === 'dark'
                    ? '#000'
                    : '#fff'
                  : theme.palette.mode === 'dark'
                    ? '#c7d1db'
                    : '#44546f',
              bgcolor:
                card.completedTaskCount === card.taskCount
                  ? '#94C748'
                  : theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(9,30,66,0.06)',
              '&:hover': {
                bgcolor:
                  card.completedTaskCount === card.taskCount
                    ? '#86b63f'
                    : theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(9,30,66,0.1)'
              }
            })}
          >
            <CheckBoxOutlinedIcon sx={{ fontSize: 16 }} />
            {card.completedTaskCount}/{card.taskCount}
          </Button>
        </Tooltip>
      )}

      {hasDescriptionBadge && (
        <Tooltip title="This card has a description.">
          <SubjectRoundedIcon
            sx={{
              color: (theme) =>
                theme.palette.mode === 'dark' ? '#c7d1db' : '#44546f'
            }}
          />
        </Tooltip>
      )}

      {hasCommentBadge && (
        <Tooltip title="Comments">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: (theme) =>
                theme.palette.mode === 'dark' ? '#c7d1db' : '#44546f'
            }}
          >
            <ChatOutlinedIcon fontSize="small" />
            <Typography component="span" sx={{ fontSize: 15 }}>
              {card.commentCount}
            </Typography>
          </Box>
        </Tooltip>
      )}

      {hasAttachment && (
        <Tooltip title="Comments">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: (theme) =>
                theme.palette.mode === 'dark' ? '#c7d1db' : '#44546f'
            }}
          >
            <AttachFileOutlinedIcon fontSize="small" />
            <Typography component="span" sx={{ fontSize: 15 }}>
              {card.attachmentCount}
            </Typography>
          </Box>
        </Tooltip>
      )}

      {hasMember && <BoardMemberGroup members={cardMember} limit={4} />}
    </CardActions>
  )
}

export default CardBadge
