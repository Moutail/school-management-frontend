import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card, { CardContent } from '../../components/ui/card';
import { LoadingOverlay } from '../../components/ui/Loading';

const Schedule = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('week');
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('all');

  const startHour = 8;
  const endHour = 18;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const startDate = selectedDate.toISOString().split('T')[0];
        const response = await fetch(
          `${API_URL}/schedule?startDate=${startDate}&view=${view}&filter=${filter}`,
          { headers: getHeaders() }
        );

        if (!response.ok) throw new Error('Erreur lors du chargement');
        const data = await response.json();
        setEvents(data.data);
      } catch (error) {
        console.error('Failed to fetch schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [selectedDate, view, filter, API_URL]);

  const handleAddEvent = async () => {
    try {
      const eventData = {
        title: 'Nouvel événement',
        startTime: '09:00',
        endTime: '10:00',
        day: weekDays[0],
        room: 'A101',
        type: 'course'
      };

      const response = await fetch(`${API_URL}/schedule/events`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(eventData)
      });

      if (!response.ok) throw new Error('Erreur lors de la création');
      const data = await response.json();
      setEvents(prev => [...prev, data.data]);
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getEventStyle = (event) => {
    const [startHour, startMin] = event.startTime.split(':').map(Number);
    const [endHour, endMin] = event.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const dayStart = startHour * 60;
    const totalMinutes = (endHour - startHour + 1) * 60;

    const top = ((startMinutes - dayStart) / totalMinutes) * 100;
    const height = ((endMinutes - startMinutes) / totalMinutes) * 100;

    return {
      top: `${top}%`,
      height: `${height}%`,
      position: 'absolute',
      width: 'calc(100% - 1rem)',
      left: '0.5rem',
      backgroundColor: event.type === 'course' ? 'rgb(219 234 254)' : 'rgb(254 226 226)',
      borderLeft: event.type === 'course' ? '4px solid rgb(59 130 246)' : '4px solid rgb(239 68 68)'
    };
  };

  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    const days = view === 'week' ? 7 : 1;
    newDate.setDate(newDate.getDate() + (days * direction));
    setSelectedDate(newDate);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emploi du temps</h1>
          <time dateTime={selectedDate.toISOString()} className="text-gray-500">
            {formatDate(selectedDate)}
          </time>
        </div>
        <Button
          variant="primary"
          onClick={handleAddEvent}
          icon={<Plus className="h-5 w-5" />}
        >
          Nouvel Événement
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateDate(-1)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateDate(1)}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              <Button
                variant="link"
                onClick={() => setSelectedDate(new Date())}
              >
                Aujourd&apos;hui
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex rounded-lg border border-gray-200 p-1">
                <Button
                  variant={view === 'day' ? 'primary' : 'ghost'}
                  className="px-4"
                  onClick={() => setView('day')}
                >
                  Jour
                </Button>
                <Button
                  variant={view === 'week' ? 'primary' : 'ghost'}
                  className="px-4"
                  onClick={() => setView('week')}
                >
                  Semaine
                </Button>
              </div>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les cours</option>
                <option value="my-courses">Mes cours</option>
                <option value="exams">Examens</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <LoadingOverlay show text="Chargement de l'emploi du temps..." />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-[auto,1fr] h-[800px]">
            <div className="w-20 border-r border-gray-200">
              <div className="h-12 border-b border-gray-200" />
              {hours.map((hour) => (
                <div key={hour} className="h-20 border-b border-gray-200 text-right pr-2">
                  <time dateTime={`${hour}:00`} className="text-sm text-gray-500">
                    {hour.toString().padStart(2, '0')}:00
                  </time>
                </div>
              ))}
            </div>

            <div className={`grid ${view === 'week' ? 'grid-cols-6' : 'grid-cols-1'}`}>
              {weekDays.slice(0, view === 'week' ? 6 : 1).map((day) => (
                <div key={day} className="h-12 border-b border-gray-200 px-4 flex items-center">
                  <span className="text-sm font-medium text-gray-900">{day}</span>
                </div>
              ))}

              {weekDays.slice(0, view === 'week' ? 6 : 1).map((day) => (
                <div key={day} className="relative">
                  {hours.map((hour) => (
                    <div key={hour} className="h-20 border-b border-r border-gray-200" />
                  ))}

                  {events
                    .filter(event => event.day === day)
                    .map((event) => (
                      <div
                        key={event.id}
                        style={getEventStyle(event)}
                        className="rounded-lg p-2 overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="font-medium text-sm mb-1">{event.title}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <time>{event.startTime} - {event.endTime}</time>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{event.room}</span>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;