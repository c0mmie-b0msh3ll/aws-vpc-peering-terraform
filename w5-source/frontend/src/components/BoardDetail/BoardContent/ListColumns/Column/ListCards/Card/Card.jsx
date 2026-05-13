import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import useCard from '~/hooks/car.hook'
import cardCoverColor from '~/constant/cardCoverColor'
import CardBadge from '~/components/Card/CardBadge'
import Box from '@mui/material/Box'
import { useState } from 'react'

function Card({ card }) {
  const [isHovered, setIsHovered] = useState(false)

  const {
    setNodeRef,
    attributes,
    listeners,
    dndKitCardStyles,
    setActiveCard,
    handleUpdateIsCompleted
  } = useCard({ card })

  const showCheckbox = isHovered || card?.isCompleted

  const coverImage =
    card?.cover?.type === 'attachment' ? card?.cover?.value : null

  const coverColor = card?.cover?.type === 'color' ? card?.cover?.value : null

  return (
    <MuiCard
      onClick={setActiveCard}
      ref={setNodeRef}
      style={dndKitCardStyles}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        height: 'auto',
        mt: 1.5,
        cursor: 'pointer',
        display: card?.FE_PlaceholderCard ? 'none' : 'block',
        borderRadius: 2,
        overflow: 'hidden',
        outline: '2px solid transparent',
        boxShadow: '0 1px 1px rgba(0,0,0,0.12)',
        bgcolor: 'background.paper',
        transition: 'outline-color 0.18s ease, box-shadow 0.18s ease',
        '&:hover': {
          outlineColor: 'primary.main',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 4px 12px rgba(0,0,0,0.35)'
              : '0 4px 12px rgba(9, 30, 66, 0.15)'
        }
      }}
    >
      {coverImage && (
        <CardMedia
          component="img"
          image={coverImage}
          alt="card-cover"
          sx={{
            height: 140,
            width: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />
      )}

      {coverColor && (
        <Box
          sx={{
            height: 45,
            bgcolor: (theme) =>
              cardCoverColor?.[coverColor]?.[theme.palette.mode]
          }}
        />
      )}

      <CardContent
        sx={{
          p: 1.5,
          '&:last-child': { p: 1.5 }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
          <Box
            onClick={(e) => {
              e.stopPropagation()
              handleUpdateIsCompleted()
            }}
            onMouseDown={(e) => e.stopPropagation()}
            data-no-dnd="true"
            sx={{
              mt: '1px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              width: showCheckbox ? 20 : 0,
              opacity: showCheckbox ? 1 : 0,
              overflow: 'hidden',
              transition: 'width 0.16s ease, opacity 0.16s ease',
              color: card?.isCompleted ? '#94C748' : 'text.disabled',
              '&:hover': {
                color: card?.isCompleted ? '#a5dd50' : 'text.secondary'
              }
            }}
          >
            {card?.isCompleted ? (
              <CheckCircleIcon sx={{ fontSize: 20 }} />
            ) : (
              <RadioButtonUncheckedIcon sx={{ fontSize: 20 }} />
            )}
          </Box>

          <Typography
            variant="body2"
            sx={{
              flex: 1,
              fontWeight: 500,
              lineHeight: 1.35,
              wordBreak: 'break-word',
              textDecoration: card?.isCompleted ? 'line-through' : 'none',
              color: card?.isCompleted ? 'text.secondary' : 'text.primary',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {card?.title}
          </Typography>
        </Box>
        <CardBadge card={card} />
      </CardContent>
    </MuiCard>
  )
}

export default Card
