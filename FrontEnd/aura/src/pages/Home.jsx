import { Link } from "react-router-dom"

export default function Home() {
  return (
    <div className="bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% ...">
    <div className="flex flex-col items-center justify-center min-h-screen text-black">
      <h1 className="text-6xl font-bold mb-8">OPENAURA</h1><br></br>
      <div className="space-x-4">
        <Link to="/login" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Login
        </Link>
        <Link to="/signup" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
          Signup
        </Link>
      </div>
    </div>
    </div>
  )
}

