import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useSelector } from 'react-redux'
import { BOARD_LABEL_COLORS } from '~/constant/labelBackgroundColor'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'

function CardLabelGroup({ labelIds = [] }) {
  const boardLabel = useSelector((state) => state.activeBoard.labels)

  if (labelIds.length === 0) return

  const cardLabel = labelIds
    ?.map((id) =>
      boardLabel.find((item) => item._id?.toString() === id?.toString())
    )
    .filter(Boolean)

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <LocalOfferOutlinedIcon />
        <Typography variant="span" sx={{ fontWeight: 600, fontSize: 20 }}>
          Labels
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          width: '100%',
          mt: 2
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
    </Box>
  )
}

export default CardLabelGroup
