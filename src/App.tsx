import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { CoursesPage } from './pages/CoursesPage'
import { PracticePage } from './pages/PracticePage'
import { SpeedTestPage } from './pages/SpeedTestPage'
import { StatsPage } from './pages/StatsPage'
import { AchievementsPage } from './pages/AchievementsPage'
import { SettingsPage } from './pages/SettingsPage'
import { CustomTextPage } from './pages/CustomTextPage'
import { GamePage } from './pages/GamePage'
import { LoginPage } from './pages/LoginPage'
import { RacePage } from './pages/RacePage'
import { VimTerminalPage } from './pages/VimTerminalPage'
import { syncAchievements } from './features/achievements/achievements'

export default function App() {
  useEffect(() => {
    syncAchievements()
  }, [])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<PracticePage />} />
        <Route path="/speed-test" element={<SpeedTestPage />} />
        <Route path="/race" element={<RacePage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/custom" element={<CustomTextPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/vim-terminal" element={<VimTerminalPage />} />
      </Routes>
    </Layout>
  )
}