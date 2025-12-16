import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'
import MoviesPage from './pages/MoviesPage'
import LoginPage from './pages/auth/login/LoginPage'
import RegisterPage from './pages/auth/register/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import MovieDetailsPage from './pages/MovieDetailsPage'
import TicketSelectionPage from './pages/TicketSelectionPage'
import SeatSelectionPage from './pages/SeatSelectionPage'
import PaymentPage from './pages/PaymentPage'
import BookingSuccessPage from './pages/BookingSuccessPage'

import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<MoviesPage />} />
          <Route path="movie/:id" element={<MovieDetailsPage />} />
          <Route
            path="tickets/:screeningId"
            element={
              <ProtectedRoute>
                <TicketSelectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="seats/:screeningId"
            element={
              <ProtectedRoute>
                <SeatSelectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="payment/:screeningId"
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="booking-success" element={<BookingSuccessPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App