import BoardPage from './pages/Board/Board.page'
import { Route, Routes, Navigate, Outlet } from 'react-router-dom'
import NotFound from './pages/404/NotFound'
import Auth from './pages/Auth/Auth'
import AccountVerification from './pages/Auth/AccountVerification'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from './redux/user/userSlice'
import Settings from './pages/Settings/Settings'
import BoardDetail from './pages/BoardDetail/BoardDetail.page'
import HomeLayout from './layout/Home.layout'
import WorkspaceBoardsPage from './pages/Home/WorkspaceBoards.page'
import WorkspaceMemberPage from './pages/Home/WorkspaceMembers.page'
import WorkspaceLayout from './layout/Workspace.layout'
import WorkspaceSettingsPage from './pages/Home/WorkspaceSettings.page'
import LangdingPage from './pages/Langding/LandingPage'
import WorkspaceBillingPage from './pages/Home/WorkspaceBilling.page'
import AdminLayout from './layout/Admin.layout'
import UserPage from './pages/Admin/User/User.page'
import CreateUserPage from './pages/Admin/User/Create.page'
import PlanPage from './pages/Admin/Plan/Plan.page'
import CreatePlanPage from './pages/Admin/Plan/Create.page'
import UpdateUserPage from './pages/Admin/User/Update.page'
import UpdatePlanPage from './pages/Admin/Plan/Update.page'
import BackgroundPage from './pages/Admin/Background/Background.page'
import CreateBackgroundPage from './pages/Admin/Background/Create.page'
import UpdateBackgroundPage from './pages/Admin/Background/Update.page'
import LoginPage from './pages/Admin/Auth/Login.page'
import WorkspacePage from './pages/Admin/Workspace/Workspace.page'
import CreateWorkspacePage from './pages/Admin/Workspace/CreateWorkspace.page'
import UpdateWorkspacePage from './pages/Admin/Workspace/UpdateWorkspace.page'
import PermissionPage from './pages/Admin/Permission/Permission.page'
import BoardPages from './pages/Admin/Board/Board.page'
import CreateBoardPage from './pages/Admin/Board/CreateBoard.page'
import UpdateBoardPage from './pages/Admin/Board/UpdateBoard.page'
import SubscriptionPage from './pages/Admin/Subcription/Subcription.page'
import UpdateSubscriptionPage from './pages/Admin/Subcription/UpdateSubcription.page'
import CreateSubscriptionPage from './pages/Admin/Subcription/CrerateSubcription.page'
import DocsChatWidget from '~/components/AI/DocsChatWidget'
/**
 * Giải pháp Clean Code trong việc xác định các route nào cần đăng nhập tài khoản xong thì mới cho truy cập
 * Sử dụng <Outlet /> của react-router-dom để hiển thị các Child Route (xem cách sử dụng trong App() bên dưới)
 * https://reactrouter.com/en/main/components/outlet
 * Một bài hướng dẫn khá đầy đủ:
 * https://www.robinwieruch.de/react-router-private-routes/
 */
const ProtectedRoute = ({ user }) => {
  if (!user) return <Navigate to="/auth/login" replace={true} />
  return <Outlet />
}

const UnauthorizedRoute = ({ user }) => {
  // if (user) return <Navigate to="/" replace={true} />
  return <Outlet />
}

function App() {
  const currentUser = useSelector(selectCurrentUser)

  return (
    <>
    <Routes>
      <Route
        path="/"
        element={
          // replace = true : ví dụ truy cập route '/' thì sẽ nhảy qua trang
          // boards/6643599343c42cd4fa6c7210 và không lưu lại lịch sử trang '/'
          <Navigate to="/auth/login" replace={true} />
        }
      />

      {/* Protected Routes (Hiểu đơn giản trong dự án của chúng ta là những route chỉ cho truy cập sau khi đã login) */}
      <Route element={<ProtectedRoute user={currentUser} />}>
        {/* <Outlet /> của react-router-dom sẽ chạy vào các child route trong này */}

        {/* Board details  */}
        <Route path="/boards/:boardId" element={<BoardDetail />} />

        {/* Board list  */}
        <Route path="/h" element={<HomeLayout />}>
          <Route path="boards" element={<BoardPage />} />

          <Route path="workspaces" element={<WorkspaceLayout />}>
            <Route
              path=":workspaceId/boards"
              element={<WorkspaceBoardsPage />}
            />

            <Route
              path=":workspaceId/members"
              element={<WorkspaceMemberPage />}
            />

            <Route
              path=":workspaceId/settings"
              element={<WorkspaceSettingsPage />}
            />

            <Route
              path=":workspaceId/billing"
              element={<WorkspaceBillingPage />}
            />
          </Route>

          {/* <Route index element={<Navigate to="boards" replace />} />
          <Route path="boards" element={<BoardsOverviewPage />} />
          
          <Route
            path="workspaces/:workspaceId/billing"
            element={<WorkspaceBillingPage />}
          /> */}
        </Route>

        {/* user setting */}
        <Route path="/settings/account" element={<Settings />} />
        <Route path="/settings/security" element={<Settings />} />
      </Route>

      <Route element={<UnauthorizedRoute user={currentUser} />}>
        {/* Authentication  */}
        <Route path="/auth/login" element={<Auth />} />
        <Route path="/auth/register" element={<Auth />} />
        <Route path="/auth/reset-password" element={<Auth />} />
        <Route path="/auth/check-email" element={<Auth />} />
        <Route path="/auth/change-password" element={<Auth />} />
        <Route path="/account/verification" element={<AccountVerification />} />
      </Route>

      <Route path='/admin' element={< AdminLayout/>}>
          {/* <Route index element={<Navigate to='/user' replace />} */}
          <Route path='user' element={<UserPage />} /> 
          <Route path='user/create' element={<CreateUserPage />} />
          <Route path='user/update/:_id' element={<UpdateUserPage />} />
          
          <Route path='board' element={<BoardPages />} />
          <Route path='board/create' element={<CreateBoardPage />} />
          <Route path='board/update/:_id' element={<UpdateBoardPage />} />

          <Route path='permission' element={<PermissionPage />} />

          <Route path='background' element={<BackgroundPage />} />
          <Route path='background/create' element={<CreateBackgroundPage />} />
          <Route path='background/update/:_id' element={<UpdateBackgroundPage />} />

          <Route path='workspace' element={<WorkspacePage />} />
          <Route path='workspace/create' element={<CreateWorkspacePage />} />
          <Route path='workspace/update/:_id' element={<UpdateWorkspacePage />} />
          
          <Route path='subscription' element={<SubscriptionPage />} />
          <Route path='subscription/create' element={<CreateSubscriptionPage />} />
          <Route path='subscription/update/:_id' element={<UpdateSubscriptionPage />} />

          <Route path='plan' element={<PlanPage />} /> 
          <Route path='plan/create' element={<CreatePlanPage />} /> 
          <Route path='plan/update/:_id' element={<UpdatePlanPage />} /> 
      </Route>

      <Route path="/admin/auth/login" element={<LoginPage />} />

      {/* 404 not found  */}
      <Route
        path="*"
        element={<Navigate to="/404-not-found" replace={true} />}
      />
      <Route path="/404-not-found" element={<NotFound />} />
      <Route path="/landing-page" element={<LangdingPage />} />
    </Routes>
    {currentUser && <DocsChatWidget />}
    </>
  )
}

export default App
