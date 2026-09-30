import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { BalancesPage } from './pages/BalancesPage'
import { ChoresPage } from './pages/ChoresPage'
import { ExpensesPage } from './pages/ExpensesPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<BalancesPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="chores" element={<ChoresPage />} />
      </Route>
    </Routes>
  )
}
