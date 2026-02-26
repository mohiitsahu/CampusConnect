import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import {
  fetchEventById,
  registerEvent,
} from "../api/events";

export default function EventDetail() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const [event, setEvent] = useState(null);

  const loadEvent = async () => {
    const res = await fetchEventById(id, token);
    setEvent(res.data);
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  if (!event)
    return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <span className="text-xs px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
          {event.category}
        </span>

        <h1 className="text-2xl font-semibold mt-2">
          {event.title}
        </h1>

        <p className="text-gray-600 mt-3">
          {event.description}
        </p>

        <div className="grid grid-cols-2 gap-4 mt-5 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(event.startDate).toDateString()} –{" "}
            {new Date(event.endDate).toDateString()}
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {event.time}
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {event.location}
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {event.attendeesCount} attending
          </div>
        </div>

        <div className="mt-6">
          {event.isRegistered ? (
            <button
              disabled
              className="px-5 py-2 rounded-lg bg-green-100 text-green-700"
            >
              Registered
            </button>
          ) : (
            <button
              onClick={async () => {
                await registerEvent(event._id, token);
                loadEvent();
              }}
              className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Register
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
