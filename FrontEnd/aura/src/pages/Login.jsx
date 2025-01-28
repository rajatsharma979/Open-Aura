import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors,setErrors]=useState([])
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault()
    setErrors([]);
    axios
    .post(
      "http://localhost:3000/login",
      {email,password},
      {headers:{"Content-Type":"application/json"}}
    )
    .then((result)=>{
      console.log(result.data);
      navigate("/event");
    })
    .catch((err)=>{
      if (axios.isAxiosError(err) && err.response) {
        // Handle validation errors
        if (err.response.status === 400 && err.response.data.errors) {
          const validationErrors = err.response.data.errors.map((error) => error.msg);
          setErrors(validationErrors); // Set validation errors
        } else {
          // Handle other types of errors
          setErrors([err.response.data.error || "An error occurred during sign-up"]);
        }
      } else {
        // Handle non-Axios errors
        setErrors(["An unexpected error occurred"]); // Log server error
      }
    });
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-black">
      <h2 className="text-4xl font-bold mb-8">Login</h2>
      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="text"
            id="name"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Sign In
          </button>
        </div>
        {errors.length > 0 && (
          <div className="error-messages mt-4">
            {errors.map((error, index) => (
              <div key={index} className="error-message text-red-500">
                {error}
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  )
}

