import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { CoursesPage } from './pages/CoursesPage'
import { LessonListPage } from './pages/LessonListPage'
import { PracticePage } from './pages/PracticePage'
import { SpeedTestPage } from './pages/SpeedTestPage'
import { StatsPage } from './pages/StatsPage'
import { AchievementsPage } from './pages/AchievementsPage'
import { SettingsPage } from './pages/SettingsPage'
import { CustomTextPage } from './pages/CustomTextPage'
import { GamesHubPage } from './pages/GamesHubPage'
import { WordRainPage } from './pages/WordRainPage'
import { ShooterPage } from './pages/ShooterPage'
import { ZombiesPage } from './pages/ZombiesPage'
import { MemoryPage } from './pages/MemoryPage'
import { SnakePage } from './pages/SnakePage'
import { RhythmPage } from './pages/RhythmPage'
import { LoginPage } from './pages/LoginPage'
import { RacePage } from './pages/RacePage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { VimTerminalPage } from './pages/VimTerminalPage'
import { syncAchievements } from './features/achievements/achievements'
import { syncStats } from './features/stats/remoteStats'
import { useAuth } from './lib/auth'

export default function App() {
  const userId = useAuth((s) => s.user?.id)

  useEffect(() => {
    syncAchievements()
  }, [])

  useEffect(() => {
    if (userId) void syncStats()
  }, [userId])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<LessonListPage />} />
        <Route path="/practice/:courseId/:lessonId" element={<PracticePage />} />
        <Route path="/speed-test" element={<SpeedTestPage />} />
        <Route path="/race" element={<RacePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/custom" element={<CustomTextPage />} />
        <Route path="/game" element={<GamesHubPage />} />
        <Route path="/game/word-rain" element={<WordRainPage />} />
        <Route path="/game/shooter" element={<ShooterPage />} />
        <Route path="/game/zombies" element={<ZombiesPage />} />
        <Route path="/game/memory" element={<MemoryPage />} />
        <Route path="/game/snake" element={<SnakePage />} />
        <Route path="/game/rhythm" element={<RhythmPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/vim-terminal" element={<VimTerminalPage />} />
      </Routes>
    </Layout>
  )
}