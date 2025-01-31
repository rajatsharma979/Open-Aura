import { useState, useEffect } from "react"
import { Calendar, Clock, CheckCircle, Sun, Moon, LogOut, ChevronDown } from "lucide-react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

// Sample data for upcoming and past events
const upcomingEvents = [
  {
    id: "1",
    name: "Web Development Workshop",
    date: "2023-06-15",
    time: "14:00",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "2",
    name: "AI in Healthcare Conference",
    date: "2023-06-20",
    time: "09:00",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "3",
    name: "Startup Networking Mixer",
    date: "2023-06-25",
    time: "18:00",
    image: "/placeholder.svg?height=100&width=100",
  },
]

const pastEvents = [
  {
    id: "4",
    name: "Data Science Symposium",
    date: "2023-05-10",
    time: "10:00",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "5",
    name: "UX Design Masterclass",
    date: "2023-05-20",
    time: "13:00",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "6",
    name: "Blockchain Technology Summit",
    date: "2023-05-30",
    time: "09:00",
    image: "/placeholder.svg?height=100&width=100",
  },
]

// Sample data for user-created events
const myEvents = [
  {
    id: "my1",
    name: "Team Building Workshop",
    date: "2023-07-05",
    time: "10:00",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "my2",
    name: "Product Launch Webinar",
    date: "2023-07-12",
    time: "14:00",
    image: "/placeholder.svg?height=100&width=100",
  },
]

const EventLandingPage = () => {
  const [showCalendar, setShowCalendar] = useState(false)
  const [eventCode, setEventCode] = useState("")
  const [eventName, setEventName] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [darkMode, setDarkMode] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate();


  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const handleJoinEvent = (e) => {
    e.preventDefault()
    console.log("Joining event with code:", eventCode)
  }

  const handleCreateEvent = (e) => {
    e.preventDefault()
    console.log("Creating event:", eventName, "on", selectedDate)
    setShowCalendar(false)
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

const handleLogout = async () => {
  try {
    const response = await axios.post('http://localhost:3000/logout', {}, {
      withCredentials: true // This is crucial for sending cookies
    });

    if (response.status === 200) {
      console.log(response.data.msg); // 'logout successful'
      // Clear any client-side storage
      localStorage.removeItem('user'); // If you're storing any user data in localStorage
      sessionStorage.clear(); // Clear any session storage
      // Redirect to home page or login page
      navigate('/');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Logout failed:", error.response.data.error);
        if (error.response.status === 400) {
          // Handle "Access Denied" or "Invalid" errors
          alert(error.response.data.error);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error:", error);
    }
  }
};

  
  const handleJoinUpcomingEvent = (eventId) => {
    console.log("Joining upcoming event with ID:", eventId)
    // Implement your join event logic here
  }

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        {/* Header with Logo */}
        <header className="bg-white dark:bg-gray-800 shadow-md">
          <div className="container mx-auto px-4 py-6 flex items-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">OPEN-AURA</div>
            <nav className="ml-auto flex items-center">
              <a
                href="#about"
                className="mx-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                About
              </a>
              <a
                href="#events"
                className="mx-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Events
              </a>
              <a
                href="#contact"
                className="mx-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Contact
              </a>
              <div className="relative ml-4">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Settings
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10">
                    <button
                      onClick={toggleDarkMode}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                    >
                      {darkMode ? <Sun className="inline-block mr-2" /> : <Moon className="inline-block mr-2" />}
                      {darkMode ? "Light Mode" : "Dark Mode"}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                    >
                      <LogOut className="inline-block mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* My Events Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4 dark:text-white">My Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myEvents.map((event) => (
                <div key={event.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <img src={event.image || "/placeholder.svg"} alt={event.name} className="w-full h-32 object-cover" />
                  <div className="p-4">
                    <h4 className="font-bold text-lg mb-2 dark:text-white">{event.name}</h4>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-2">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span className="mr-4">{event.date}</span>
                      <Clock className="mr-2 h-4 w-4" />
                      <span>{event.time}</span>
                    </div>
                    <button
                      onClick={() => console.log("Manage event:", event.id)}
                      className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-sm"
                    >
                      Manage Event
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="mb-12">
            <h2 className="text-3xl font-bold mb-4 dark:text-white">About Us</h2>
            <p className="text-gray-700 dark:text-gray-300">
              EventHub is your go-to platform for creating and joining exciting events. Whether you&apos;re hosting a
              webinar, planning a meetup, or attending a conference, we&apos;ve got you covered with easy-to-use tools and a
              vibrant community.
            </p>
          </section>

          {/* Event Blocks */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Join Event Block */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4 dark:text-white">Join an Event</h3>
              <form onSubmit={handleJoinEvent}>
                <input
                  type="text"
                  placeholder="Enter event code"
                  className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={eventCode}
                  onChange={(e) => setEventCode(e.target.value)}
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Join Event
                </button>
              </form>
            </div>

            {/* Create Event Block */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4 dark:text-white">Create an Event</h3>
              <form onSubmit={handleCreateEvent}>
                <input
                  type="text"
                  placeholder="Event name"
                  className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowCalendar(true)}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 flex items-center justify-center"
                >
                  <Calendar className="mr-2" /> Schedule Event
                </button>
              </form>
            </div>
          </div>

          {/* Events Section */}
          <section id="events" className="mb-12">
            <h2 className="text-3xl font-bold mb-8 dark:text-white">Events</h2>

            {/* Upcoming Events */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4 dark:text-white">Upcoming Events</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.name}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="font-bold text-lg mb-2 dark:text-white">{event.name}</h4>
                      <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-2">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span className="mr-4">{event.date}</span>
                        <Clock className="mr-2 h-4 w-4" />
                        <span>{event.time}</span>
                      </div>
                      <button
                        onClick={() => handleJoinUpcomingEvent(event.id)}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-sm"
                      >
                        Join Event
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Past Events */}
            <div>
              <h3 className="text-2xl font-bold mb-4 dark:text-white">Past Events</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastEvents.map((event) => (
                  <div key={event.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.name}
                      className="w-full h-32 object-cover filter grayscale"
                    />
                    <div className="p-4">
                      <h4 className="font-bold text-lg mb-2 dark:text-white">{event.name}</h4>
                      <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span className="mr-4">{event.date}</span>
                        <Clock className="mr-2 h-4 w-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="mt-2 flex items-center text-green-600 dark:text-green-400 text-sm">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        <span>Completed</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Us Section */}
          <section id="contact" className="mb-12">
            <h2 className="text-3xl font-bold mb-4 dark:text-white">Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">Have questions or need support? Reach out to us!</p>
            <div>
              <p className="text-gray-700 dark:text-gray-300">Email: support@eventhub.com</p>
              <p className="text-gray-700 dark:text-gray-300">Phone: (123) 456-7890</p>
            </div>
          </section>
        </main>

        {/* Calendar Popup */}
        {showCalendar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 dark:text-white">Select Event Date</h3>
              <input
                type="date"
                className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <div className="flex justify-end">
                <button
                  onClick={() => setShowCalendar(false)}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded mr-2 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventLandingPage

