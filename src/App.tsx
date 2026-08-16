import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { CoursesPage } from './pages/CoursesPage'
import { PracticePage } from './pages/PracticePage'
import { SpeedTestPage } from './pages/SpeedTestPage'
import { StatsPage } from './pages/StatsPage'
import { AchievementsPage } from './pages/AchievementsPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<PracticePage />} />
        <Route path="/speed-test" element={<SpeedTestPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
      </Routes>
    </Layout>
  )
}