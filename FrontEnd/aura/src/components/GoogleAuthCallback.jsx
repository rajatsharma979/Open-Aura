import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function GoogleAuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // Check for authentication status or token in URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const authStatus = urlParams.get("status")
    const token = urlParams.get("token")

    if (authStatus === "success" && token) {
      // Store the token in localStorage or your preferred state management solution
      localStorage.setItem("authToken", token)

      // Redirect to the event page
      navigate("/event")
    } else {
      // Handle authentication failure
      navigate("/signup", { state: { error: "Google authentication failed" } })
    }
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-xl">Processing your Google sign-in...</p>
    </div>
  )
}

