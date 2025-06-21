import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./App.css";

function getFormattedDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedDate, setSelectedDate] = useState(getFormattedDate(new Date()));
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [repeat, setRepeat] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editDate, setEditDate] = useState(""); 
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editRepeat, setEditRepeat] = useState([]);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const today = getFormattedDate(new Date());
  const isPast = selectedDate < today;

  // Show all active tasks
  const activeTasks = tasks.filter(task => !task.done);
  const completedTasks = tasks.filter(task => task.done);

  function addTask(e) {
    e.preventDefault();
    if (!input) return;
    setTasks(prevTasks => [
      ...prevTasks,
      {
        id: Date.now(),
        text: input,
        date: selectedDate,
        done: false,
        startTime: "",
        endTime: "",
        repeat: [],
      }
    ]);
    setInput("");
  }

  const updateTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id
        ? {
            ...task,
            text: editValue,
            date: editDate,
            startTime: editStartTime,
            endTime: editEndTime,
            repeat: editRepeat
          }
        : task
    ));
    setEditId(null);
    setEditValue("");
    setEditDate("");
    setEditStartTime("");
    setEditEndTime("");
    setEditRepeat([]);
  };

  const toggleDone = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, done: !task.done } : task
    ));
  };

  const deleteTask = (id) => setTasks(tasks.filter(task => task.id !== id));

  const startEdit = (task) => {
    setEditId(task.id);
    setEditValue(task.text);
    setEditDate(task.date); 
    setEditStartTime(task.startTime || "");
    setEditEndTime(task.endTime || "");
    setEditRepeat(task.repeat || []);
  };

  const handleRepeatChange = (day) => {
    setRepeat(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleEditRepeatChange = (day) => {
    setEditRepeat(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="desktop-layout">
      <aside className="calendar-sidebar">
        <Calendar
          value={new Date(selectedDate)}
          onChange={date => setSelectedDate(getFormattedDate(date))}
          tileDisabled={({ date }) => getFormattedDate(date) < today}
          tileClassName={({ date }) =>
            getFormattedDate(date) === today ? "today-highlight" : ""
          }
        />
      </aside>
      <main className="tasks-panel">
        <h1>Task Planner 🎉</h1>
        <form className="task-form" onSubmit={addTask}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Add a new task..."
          />
          <button type="submit">Add</button>
        </form>

        <h2>Active Tasks</h2>
        <ul className="task-list">
          {activeTasks.length === 0 && <li>No active tasks 🎉</li>}
          {activeTasks.map(task => (
            <li key={task.id}>
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleDone(task.id)}
                disabled={isPast}
              />
              {editId === task.id ? (
                <>
                  <input
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                  />
                  <input
                    type="date"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                  />
                  <input
                    type="time"
                    value={editStartTime}
                    onChange={e => setEditStartTime(e.target.value)}
                  />
                  <input
                    type="time"
                    value={editEndTime}
                    onChange={e => setEditEndTime(e.target.value)}
                  />
                  <div className="repeat-days">
                    {weekDays.map(day => (
                      <label key={day}>
                        <input
                          type="checkbox"
                          checked={editRepeat.includes(day)}
                          onChange={() => handleEditRepeatChange(day)}
                        />
                        {day.slice(0, 3)}
                      </label>
                    ))}
                  </div>
                  <button onClick={() => updateTask(task.id)}>Save</button>
                  <button onClick={() => setEditId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <span>{task.text}</span>
                  <span> [{task.date}</span>
                  {task.startTime && <span> {task.startTime}</span>}
                  {task.endTime && <span>-{task.endTime}</span>}
                  <span>]</span>
                  {task.repeat.length > 0 && (
                    <span> [Repeats: {task.repeat.map(d=>d.slice(0,3)).join(", ")}]</span>
                  )}
                  <button onClick={() => startEdit(task)} disabled={isPast}>Edit</button>
                  <button onClick={() => deleteTask(task.id)} disabled={isPast}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>

        <h2>Completed Tasks</h2>
        <ul className="task-list completed-list">
          {completedTasks.length === 0 && <li>No completed tasks yet</li>}
          {completedTasks.map(task => (
            <li key={task.id} className="done">
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleDone(task.id)}
                disabled={isPast}
              />
              <span>{task.text}{" "}</span>
              {task.startTime && <span>({task.startTime}</span>}
              {task.endTime && <span>-{task.endTime})</span>}
              {task.repeat.length > 0 && (
                <span> [Repeats: {task.repeat.map(d=>d.slice(0,3)).join(", ")}]</span>
              )}
              <button onClick={() => deleteTask(task.id)} disabled={isPast}>Delete</button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default App;