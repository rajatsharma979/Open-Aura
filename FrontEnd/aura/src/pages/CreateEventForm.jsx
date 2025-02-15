"use client"

import { useState } from "react"
import { Calendar, Clock } from "lucide-react"
import axios from "axios"

export function CreateEventForm(onEventCreated) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [eventTime, setEventTime] = useState("")


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(title, description, eventDate, eventTime);
  
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("date", eventDate);
    formData.append("time", eventTime);
   
  
    axios.post("http://localhost:3000/createEvent", {
      title,
      description,
      date: eventDate,
      time: eventTime
    }, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    })
    .then((response) => {
      if (response.status === 200) {
        console.log("Event created successfully:", response.data);
        alert("Event created successfully!");
        // Reset form fields
        setTitle("");
        setDescription("");
        setEventDate("");
        setEventTime("");
        
      }
    })
    .catch((error) => {
      console.error("Failed to create event:", error.response?.data || error.message);
      alert("Failed to create event. Please try again.");
    });
  };
  

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold mb-4 dark:text-white">Create an Event</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Event Title"
          className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Event Description"
          className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <div className="flex mb-4">
          <div className="flex items-center mr-4">
            <Calendar className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
            <input
              type="date"
              className="p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
            <input
              type="time"
              className="p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Create Event
        </button>
      </form>
    </div>
  )
}

