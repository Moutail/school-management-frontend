import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { LoadingOverlay } from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import api from '../../services/api';

const scheduleAPI = {
  getWeekSchedule: (startDate) => api.get('/student/schedule', { params: { startDate } }),
};

const CourseCard = ({ course, compact }) => (
  <div className={`bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg 
                  border-2 border-blue-200 hover:border-blue-300 transition-colors
                  transform hover:-translate-y-0.5 cursor-pointer
                  ${compact ? 'p-2' : 'p-3'}`}>
    <div className="flex justify-between items-start mb-1">
      <span className="text-xs font-medium text-blue-600">{course.schedule?.time}</span>
      <span className="text-xs font-medium text-blue-600">{course.room}</span>
    </div>
    <h3 className="font-semibold text-gray-800 mb-1 text-sm">{course.title}</h3>
    <p className="text-xs text-gray-600">
      👨‍🏫 {course.professor.firstName} {course.professor.lastName}
    </p>
  </div>
);

CourseCard.propTypes = {
  course: PropTypes.shape({
    title: PropTypes.string.isRequired,
    professor: PropTypes.shape({
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired
    }).isRequired,
    room: PropTypes.string.isRequired,
    schedule: PropTypes.shape({
      time: PropTypes.string.isRequired,
      day: PropTypes.number.isRequired
    })
  }).isRequired,
  compact: PropTypes.bool
};

const StudentSchedule = () => {
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekSchedule, setWeekSchedule] = useState([]);
  const [selectedDay, setSelectedDay] = useState(1); // Pour la vue mobile
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getWeekStartDate = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const startDate = getWeekStartDate(currentDate);
        const response = await scheduleAPI.getWeekSchedule(startDate.toISOString());
        setWeekSchedule(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'emploi du temps:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [currentDate]);

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const getCoursesForDay = (dayIndex) => {
    return weekSchedule.filter(course => course.schedule.day === dayIndex + 1)
      .sort((a, b) => a.schedule.time.localeCompare(b.schedule.time));
  };

  if (loading) {
    return <LoadingOverlay show text="Chargement de l'emploi du temps..." />;
  }

  return (
    <div className="p-3 sm:p-6 bg-blue-50/30 min-h-screen">
      {/* En-tête responsive */}
      <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border-2 border-blue-100 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
              <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-blue-800">
                📅 Emploi du temps
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Semaine du {getWeekStartDate(currentDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Button
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 
                       rounded-full text-sm transition-transform hover:scale-105"
              onClick={() => setCurrentDate(new Date())}
            >
              Aujourd&apos;hui
            </Button>
            <div className="flex items-center bg-white rounded-full border-2 border-blue-100">
              <Button
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-blue-50 transition-colors"
                onClick={() => navigateWeek(-1)}
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </Button>
              <Button
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-blue-50 transition-colors"
                onClick={() => navigateWeek(1)}
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Vue mobile : sélecteur de jour et liste des cours */}
      {isMobileView && (
        <div className="space-y-4">
          {/* Sélecteur de jour */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-white p-3 rounded-lg border-2 border-blue-100">
            {days.map((day, index) => (
              <Button
                key={day}
                onClick={() => setSelectedDay(index + 1)}
                className={`p-2 rounded-lg text-sm ${
                  selectedDay === index + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                {day}
              </Button>
            ))}
          </div>

          {/* Liste des cours du jour sélectionné */}
          <div className="space-y-3">
            {getCoursesForDay(selectedDay - 1).map((course, index) => (
              <CourseCard key={index} course={course} />
            ))}
            {getCoursesForDay(selectedDay - 1).length === 0 && (
              <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-gray-500">Aucun cours ce jour</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vue desktop : grille traditionnelle */}
      {!isMobileView && (
        <div className="bg-white rounded-xl border-2 border-blue-100 p-4 overflow-x-auto">
          <div className="min-w-[800px] space-y-4">
            {/* En-tête des jours */}
            <div className="grid grid-cols-6 gap-3">
              {days.map((day) => (
                <div key={day} 
                     className="bg-blue-600 text-white p-3 rounded-xl text-center font-semibold">
                  {day}
                </div>
              ))}
            </div>

            {/* Grille des horaires */}
            <div className="space-y-3">
              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-6 gap-3">
                  {days.map((day, dayIndex) => {
                    const coursesAtTime = weekSchedule.filter(
                      course => course.schedule.day === dayIndex + 1 && 
                              course.schedule.time === time
                    );
                    return coursesAtTime.length > 0 ? (
                      <CourseCard 
                        key={`${day}-${time}`}
                        course={coursesAtTime[0]}
                        compact={true}
                      />
                    ) : (
                      <div
                        key={`${day}-${time}`}
                        className="bg-gray-50 rounded-lg p-3 border-2 border-dashed 
                                 border-gray-200 flex items-center justify-center"
                      >
                        <span className="text-xs text-gray-400">{time}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Légende responsive */}
      <div className="mt-4 sm:mt-6 bg-white rounded-lg sm:rounded-xl border-2 border-blue-100 p-3 sm:p-4">
        <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">Légende</h3>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-200 mr-2"></div>
            <span className="text-xs sm:text-sm text-gray-600">Cours programmé</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 mr-2">
            </div>
            <span className="text-xs sm:text-sm text-gray-600">Créneau libre</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSchedule;