import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import HrJobs from './pages/hr/HrJobs'
import JobForm from './pages/hr/JobForm'
import ProtectedRoute from './components/ProtectedRoute'
import HrRoute from './components/HrRoute'
import Layout from './components/Layout'
import Referrals from './pages/Referrals'
import ReferralForm from './pages/ReferralForm'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={
          <ProtectedRoute><Layout><Jobs /></Layout></ProtectedRoute>
        } />
        <Route path="/jobs/:id" element={
          <ProtectedRoute><Layout><JobDetail /></Layout></ProtectedRoute>
        } />
        <Route path="/hr/jobs" element={
          <ProtectedRoute><HrRoute><Layout><HrJobs /></Layout></HrRoute></ProtectedRoute>
        } />
        <Route path="/hr/jobs/new" element={
          <ProtectedRoute><HrRoute><Layout><JobForm /></Layout></HrRoute></ProtectedRoute>
        } />
          <Route path="/referrals" element={
          <ProtectedRoute><Layout><Referrals /></Layout></ProtectedRoute>
        } />
          <Route path="/jobs/:id/referral" element={
          <ProtectedRoute><Layout><ReferralForm /></Layout></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App