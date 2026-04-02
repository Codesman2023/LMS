export default function CourseTable({
  courses,
  onDelete,
  onTogglePublish,
}) {
  if (courses.length === 0) {
    return (
      <p className="text-gray-500 text-sm">
        No courses added yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto bg-white shadow rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Title</th>
            <th className="p-3">Price</th>
            <th className="p-3">Status</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id} className="border-t">
              <td className="p-3">{course.title}</td>
              <td className="p-3 text-center">₹{course.price || "Free"}</td>
              <td className="p-3 text-center">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    course.published
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {course.published ? "Published" : "Draft"}
                </span>
              </td>
              <td className="p-3 flex gap-2 justify-center">
                <button
                  onClick={() => onTogglePublish(course.id)}
                  className="text-blue-600 hover:underline"
                >
                  Toggle
                </button>
                <button
                  onClick={() => onDelete(course.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}