import type { ClassSlot } from '../data/site';

export default function ScheduleTable({ slots }: { slots: ClassSlot[] }) {
  return (
    <div className="schedule-table-wrap">
      <table className="schedule-table">
        <thead>
          <tr>
            <th>ශ්‍රේණිය / කණ්ඩායම</th>
            <th>දිනය</th>
            <th>වේලාව</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr key={`${slot.group}-${slot.day}`}>
              <td data-label="ශ්‍රේණිය">{slot.group}</td>
              <td data-label="දිනය">
                <span className="day-pill">{slot.day}</span>
              </td>
              <td data-label="වේලාව">
                <span className="time-pill">{slot.time}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
