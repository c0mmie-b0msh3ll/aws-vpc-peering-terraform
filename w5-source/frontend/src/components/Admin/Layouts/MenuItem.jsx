import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import WallpaperOutlinedIcon from '@mui/icons-material/WallpaperOutlined'
import WorkspacesOutlinedIcon from '@mui/icons-material/WorkspacesOutlined'
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'

export const menuSections = [
  {
    title: 'Main',
    items: [
      {
        label: 'User',
        path: '/admin/user',
        icon: <PersonOutlineOutlinedIcon />
      },
      {
        label: 'Board',
        path: '/admin/board',
        icon: <DashboardCustomizeOutlinedIcon />
      },
      {
        label: 'Permission',
        path: '/admin/permission',
        icon: <AdminPanelSettingsOutlinedIcon />
      },
      {
        label: 'Background',
        path: '/admin/background',
        icon: <WallpaperOutlinedIcon />
      },
      {
        label: 'Workspace',
        path: '/admin/workspace',
        icon: <WorkspacesOutlinedIcon />
      }
    ]
  },
  {
    title: 'Billing',
    items: [
      {
        label: 'Subscription',
        path: '/admin/subscription',
        icon: <CreditCardOutlinedIcon />
      },
      {
        label: 'Plan',
        path: '/admin/plan',
        icon: <WorkspacePremiumOutlinedIcon />
      }
    ]
  }
]