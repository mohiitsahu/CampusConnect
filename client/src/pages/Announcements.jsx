import { announcements } from "../data/announcements";

export default function Announcements() {
  const tagColor = (tag) => {
    switch (tag) {
      case "Exam":
        return "bg-red-100 text-red-700";
      case "Event":
        return "bg-indigo-100 text-indigo-700";
      case "Notice":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Announcements</h2>

      <div className="space-y-4">
        {announcements.map((a) => (
          <div
            key={a.id}
            className="bg-white border rounded-xl p-5 hover:shadow-sm transition"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-base">{a.title}</h3>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${tagColor(
                  a.tag
                )}`}
              >
                {a.tag}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {a.description}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{a.author}</span>
              <span>{a.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
