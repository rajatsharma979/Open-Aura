import { useState, useEffect } from "react"
import { Calendar, Clock, CheckCircle, LogOut, ChevronDown } from "lucide-react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { CreateEventForm } from "./CreateEventForm"

const EventLandingPage = () => {
  const [showCalendar, setShowCalendar] = useState(false)
  const [eventCode, setEventCode] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [myEvents,setMyEvents] = useState("")
  const [pastEvents, setPastEvents] = useState("")
  const [upcomingEvents, setUpcomingEvents]=useState("")

  useEffect(() => {
    axios.get("http://localhost:3000/getEvents", { withCredentials: true })
      .then((response) => {
        console.log("Fetched Events:", response.data);
        setMyEvents(response.data.myEvents)
        setPastEvents(response.data.pastEvents)
        setUpcomingEvents(response.data.upcomingEvents)
        setIsAuthenticated(true);
      })
      .catch((error) => {
        console.error("Failed to fetch events:", error);
        navigate('/');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [navigate]);
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen text-lg">Authenticating...</div>;
  }
  
  if (!isAuthenticated) {
    return null; // Prevent any content from rendering if not authenticated
  }
    

  const fetchMyEvents = async () => {
    try {
      const response = await axios.get("http://localhost:3000/getEvents", { withCredentials: true });
      if (response.status === 200) {
        console.log("Fetched Events:", response.data.myEvents);
        setMyEvents(response.data.myEvents);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error.message);
      alert("Unable to fetch events. Please try again.");
    }
  };
  
  
  const handleEventCreated = () => {
    fetchMyEvents()
  }

  const formatDateTime = (dateTime) => {
    const dateObj = new Date(dateTime);
    const date = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = dateObj.toISOString().split('T')[1].slice(0, 5); // HH:MM
    return { date, time };
  };
  



  const handleJoinEvent = (e) => {
    e.preventDefault()
    console.log("Joining event with code:", eventCode)
  }

  const handleCreateEvent = (e) => {
    e.preventDefault()
    console.log("Creating event:", "on", selectedDate)
    setShowCalendar(false)
  }


  const handleLogout = async () => {
    try {
        const response = await axios.post("http://localhost:3000/logout", {}, { withCredentials: true });
        if (response.status === 200) {
            console.log("Signing Off...");
            navigate("/");
        }
    } catch (error) {
        console.error("Error logging out:", error);
        alert("Logout failed. Please try again.");
    }
  }

  
  const handleJoinUpcomingEvent = (eventId) => {
    console.log("Joining upcoming event with ID:", eventId)
    // Implement your join event logic here
  }

  return (

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
          <div className="min-h-[200px] bg-gray-100 dark:bg-gray-900">
  <h2 className="text-3xl font-bold mb-4 dark:text-white">My Events</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {myEvents.length > 0 ? (
      myEvents.map((event) => {
        // Format the event date and time
        const { date, time } = formatDateTime(event.eventDateTime);

        return (
          <div key={event._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <img src={event.image || "/placeholder.svg"} alt={event.name} className="w-full h-32 object-cover" />
            <div className="p-4">
              <h4 className="font-bold text-lg mb-2 dark:text-white">{event.title}</h4>
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                <span className="mr-4">📅 {date}</span>
                <span>🕒 {time}</span>
              </div>
              <button
                onClick={() => console.log("Manage event:", event.id)}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
              >
                Manage Event
              </button>
            </div>
          </div>
        );
      })
    ) : (
      <p className="text-center text-gray-600 dark:text-gray-300">No events found.</p>
    )}
  </div>
</div>


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
            {<CreateEventForm onEventCreated={handleEventCreated} /> }
          </div>

          {/* Events Section */}
          <section id="events" className="mb-12">
            <h2 className="text-3xl font-bold mb-8 dark:text-white">Events</h2>

            {/* Upcoming Events */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4 dark:text-white">Upcoming Events</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingEvents.map((event) => (
                  <div key={event._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <img
                      src={event.image || "/placeholder.svg"}
                      // alt={event.name}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="font-bold text-lg mb-2 dark:text-white">{event.title}</h4>
                      <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-2">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span className="mr-4">{event.eventDate}</span>
                        <Clock className="mr-2 h-4 w-4" />
                        <span>{event.eventTime}</span>
                      </div>
                      <button
                        onClick={() => handleJoinUpcomingEvent(event.eventId)}
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
    {pastEvents.map((event) => {
      const { date, time } = formatDateTime(event.eventDateTime);

      // Missing 'return' statement fixed here
      return (
        <div key={event._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <img
            src={event.image || "/placeholder.svg"}
            className="w-full h-32 object-cover filter grayscale"
            alt={event.eventHost}
          />
          <div className="p-4">
            <h4 className="font-bold text-lg mb-2 dark:text-white">{event.title}</h4>
            <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
              <Calendar className="mr-2 h-4 w-4" />
              <span className="mr-4">{date}</span>
              <Clock className="mr-2 h-4 w-4" />
              <span>{time}</span>
            </div>
            <div className="mt-2 flex items-center text-green-600 dark:text-green-400 text-sm">
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Completed</span>
            </div>
          </div>
        </div>
      );
    })}
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
  )
}

export default EventLandingPage

