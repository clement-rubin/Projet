import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import AppLayout from '@/components/layout/AppLayout'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import StudentDashboard from '@/pages/dashboard/StudentDashboard'
import SupervisorDashboard from '@/pages/dashboard/SupervisorDashboard'
import ProjectList from '@/pages/projects/ProjectList'
import ProjectCreate from '@/pages/projects/ProjectCreate'
import ProjectDetail from '@/pages/projects/ProjectDetail'
import Profile from '@/pages/profile/Profile'
import NotFound from '@/pages/NotFound'

function ProtectedRoute() {
  const { session, loading } = useAuthStore()
  if (loading) return <FullPageLoader />
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}

function RoleGuard({ allow, children }) {
  const role = useAuthStore((s) => s.profile?.role)
  if (!role) return <FullPageLoader />
  if (!allow.includes(role)) return <Navigate to="/dashboard" replace />
  return children
}

function DashboardSwitch() {
  const role = useAuthStore((s) => s.profile?.role)
  if (!role) return <FullPageLoader />
  return role === 'supervisor' ? <SupervisorDashboard /> : <StudentDashboard />
}

function FullPageLoader() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    </div>
  )
}

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardSwitch /> },
          {
            path: '/projects',
            element: (
              <RoleGuard allow={['supervisor']}>
                <ProjectList />
              </RoleGuard>
            ),
          },
          {
            path: '/projects/new',
            element: (
              <RoleGuard allow={['supervisor']}>
                <ProjectCreate />
              </RoleGuard>
            ),
          },
          { path: '/projects/:id', element: <ProjectDetail /> },
          { path: '/profile', element: <Profile /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
])
