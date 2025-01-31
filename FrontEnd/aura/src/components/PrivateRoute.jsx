import { useState } from "react"
import { Navigate, Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "./AuthContext"

const PrivateRoute = () => {
  const { isAuthenticated } = useAuth()
  const [redirecting, setRedirecting] = useState(false)
  const navigate = useNavigate()

  const handleRedirect = () => {
    setRedirecting(true)
    navigate("/login", { replace: true })
  }

  if (!isAuthenticated) {
    if (redirecting) {
      return <Navigate to="/login" replace />
    }

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-bold mb-4">Access Denied</h2>
          <p className="mb-4">Please log in to access this page.</p>
          <button
            onClick={handleRedirect}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Go to Login Page
          </button>
        </div>
      </div>
    )
  }

  return <Outlet />
}

export default PrivateRoute

