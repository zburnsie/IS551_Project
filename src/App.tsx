import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth, RequireRoom } from './components/guards'
import { AppLayout, OnboardingLayout, PublicLayout } from './components/Layout'
import {
  AddChorePage,
  AssignChorePage,
  ChoreDetailPage,
  ChoreDonePage,
  ChoreListPage,
  ChoresIndexPage,
  ChoresOverviewPage,
  CreateChoreListPage,
  EditChoreListPage,
} from './pages/chores/ChorePages'
import { InboxPage, IouDetailPage, LogIouPage, MoneyPage, SettleUpPage } from './pages/money/MoneyPages'
import {
  CreateProfilePage,
  CreateRoomPage,
  InviteRoommatesPage,
  JoinRoomPage,
  RoomChoicePage,
} from './pages/onboarding/OnboardingPages'
import { InviteLinkPage, LogInPage, SignUpPage } from './pages/public/AuthPages'
import { HomePage } from './pages/public/HomePage'
import { RoomHomePage } from './pages/room/RoomHomePage'
import { SettingsPage } from './pages/room/SettingsPage'

export default function App() {
  return (
    <Routes>
      {/* Public: homepage first, then sign up or log in */}
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="login" element={<LogInPage />} />
      </Route>
      <Route path="join/:code" element={<InviteLinkPage />} />

      {/* 1. Onboarding: profile → room → invite */}
      <Route element={<RequireAuth />}>
        <Route path="welcome" element={<OnboardingLayout />}>
          <Route path="profile" element={<CreateProfilePage />} />
          <Route path="room" element={<RoomChoicePage />} />
          <Route path="room/new" element={<CreateRoomPage />} />
          <Route path="join" element={<JoinRoomPage />} />
          <Route element={<RequireRoom />}>
            <Route path="invite" element={<InviteRoommatesPage />} />
          </Route>
        </Route>
      </Route>

      {/* 2. Chores and 3. Money, inside a room */}
      <Route element={<RequireRoom />}>
        <Route element={<AppLayout />}>
          <Route path="room" element={<RoomHomePage />} />
          <Route path="room/invite" element={<InviteRoommatesPage inApp />} />
          <Route path="chores" element={<ChoresIndexPage />} />
          <Route path="chores/overview" element={<ChoresOverviewPage />} />
          <Route path="chores/lists/new" element={<CreateChoreListPage />} />
          <Route path="chores/lists/:listId" element={<ChoreListPage />} />
          <Route path="chores/lists/:listId/edit" element={<EditChoreListPage />} />
          <Route path="chores/lists/:listId/add" element={<AddChorePage />} />
          <Route path="chores/:choreId" element={<ChoreDetailPage />} />
          <Route path="chores/:choreId/assign" element={<AssignChorePage />} />
          <Route path="chores/:choreId/done" element={<ChoreDonePage />} />
          <Route path="money" element={<MoneyPage />} />
          <Route path="money/new" element={<LogIouPage />} />
          <Route path="money/ious/:iouId" element={<IouDetailPage />} />
          <Route path="money/settle/:userId" element={<SettleUpPage />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
