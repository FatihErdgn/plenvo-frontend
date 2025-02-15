import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const DoctorCalendar = () => {
  const [events, setEvents] = useState([
    {
      id: '1',
      title: 'Yoğunluk',
      start: '2025-02-10',
      end: '2025-02-10'
    },
    {
      id: '2',
      title: 'Yoğunluk',
      start: '2025-02-20',
      end: '2025-02-20'
    }
  ]);

  const handleDateSelect = (selectInfo) => {
    let title = prompt('Bu tarih aralığı için bir başlık ekleyin:');
    let calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); // Seçimi temizle
    if (title) {
      const newEvent = {
        id: String(events.length + 1),
        title: title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      };
      setEvents([...events, newEvent]);
      // Backend entegrasyonunu burada ekleyebilirsiniz.
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-white shadow-xl rounded-lg p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        initialView="dayGridMonth"
        selectable={true}
        selectMirror={true}
        select={handleDateSelect}
        events={events}
        height="auto"
      />
    </div>
  );
};

export default DoctorCalendar;
