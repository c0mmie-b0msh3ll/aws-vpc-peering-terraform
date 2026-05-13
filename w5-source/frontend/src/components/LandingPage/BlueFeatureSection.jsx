import { Box, Container, Paper, Typography, Grid, Stack } from '@mui/material'

const featureBanners = [
  {
    eyebrow: 'EMAIL MAGIC',
    title: 'Easily turn your emails into to-dos',
    text: 'Just forward them to your Taskio Inbox, and they’ll be transformed by AI into organized to-dos with all the links you need.',
    image:
      'https://images.ctfassets.net/rz1oowkt5gyp/2QvggeQ9nzUdaDnhJCSUwA/3ef97067e1aa3d0a5e6a04b5780fd751/email-todos.png?w=1110&fm=webp'
  },
  {
    eyebrow: 'MESSAGE APP SORCERY',
    title: 'Save messages from Slack or Teams directly to your board',
    text: 'Need to follow up on a message from Slack or Microsoft Teams? Send it directly to your Taskio board. Your favorite app interface lets you save messages that appear in your Trello Inbox with AI-generated summaries and links.',
    image:
      'https://images.ctfassets.net/rz1oowkt5gyp/3r1BvsfEsj4THe6YwpBOVy/2b1befa1e5e3522a2b0daae0dd3f3de0/slackteams-to-inbox.png?w=1110&fm=webp'
  }
]

function FeatureBanner({ eyebrow, title, text, image, reverse = false }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: '10px',
        bgcolor: '#fff',
        boxShadow: '0 10px 28px rgba(9, 30, 66, 0.16)'
      }}
    >
      <Grid
        container
        spacing={{ xs: 2, md: 4 }}
        direction={reverse ? 'row-reverse' : 'row'}
        alignItems="center"
      >
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              bgcolor: '#f1f2f4',
              borderRadius: '8px',
              overflow: 'hidden',
              minHeight: { xs: 180, md: 240 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box
              component="img"
              src={image}
              alt={title}
              sx={{
                width: '100%',
                height: '100%',
                display: 'block',
                objectFit: 'cover'
              }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 800,
              color: '#42526e',
              mb: 1.5,
              letterSpacing: '0.04em'
            }}
          >
            {eyebrow}
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: 24, md: 28 },
              fontWeight: 700,
              lineHeight: 1.3,
              color: '#172b4d',
              mb: 2
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              fontSize: 18,
              lineHeight: 1.7,
              color: '#172b4d'
            }}
          >
            {text}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default function BlueFeatureSection() {
  return (
    <Box
      sx={{
        bgcolor: '#0b66ff',
        py: { xs: 8, md: 10 }
      }}
    >
      <Container maxWidth="lg">
        <Typography
          align="center"
          sx={{
            color: '#fff',
            fontSize: { xs: 30, md: 36 },
            fontWeight: 700,
            mb: 1.5
          }}
        >
          From message to action
        </Typography>

        <Typography
          align="center"
          sx={{
            color: 'rgba(255,255,255,0.9)',
            maxWidth: 760,
            mx: 'auto',
            fontSize: 18,
            lineHeight: 1.7,
            mb: 6
          }}
        >
          Quickly turn communication from your favorite apps into to-dos, keeping all
          your discussions and tasks organized in one place.
        </Typography>

        <Stack spacing={4} sx={{ maxWidth: 980, mx: 'auto' }}>
          <FeatureBanner
            eyebrow={featureBanners[0].eyebrow}
            title={featureBanners[0].title}
            text={featureBanners[0].text}
            image={featureBanners[0].image}
          />

          <FeatureBanner
            reverse
            eyebrow={featureBanners[1].eyebrow}
            title={featureBanners[1].title}
            text={featureBanners[1].text}
            image={featureBanners[1].image}
          />
        </Stack>
      </Container>
    </Box>
  )
}