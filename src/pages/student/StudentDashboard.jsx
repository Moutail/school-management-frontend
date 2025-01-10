import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, BookOpen, Clock } from 'lucide-react';
import Button from '../../components/ui/Button';
import { LoadingOverlay } from '../../components/ui/Loading';
import api from '../../services/api';

const studentAPI = {
  getDashboardStats: () => api.get('/student/dashboard/stats'),
  getDashboardActivities: () => api.get('/student/dashboard/activities'),
  getDashboardSchedule: () => api.get('/student/dashboard/schedule')
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    attendanceRate: 0,
    nextExam: null,
    documentsToRead: 0
  });
  const [activities, setActivities] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [userData, setUserData] = useState({
    name: '',
    role: '',
    avatar: '/api/placeholder/32/32',
    notifications: 0
  });

  const menuItems = [
    { 
      icon: BookOpen, 
      label: 'Mes Cours', 
      action: () => navigate('/student/courses'),
      stats: stats.totalCourses
    },
    { 
      icon: Calendar, 
      label: 'Emploi du temps', 
      action: () => navigate('/student/schedule'),
      stats: schedule.length
    },
    { 
      icon: FileText, 
      label: 'Documents', 
      action: () => navigate('/student/documents'),
      stats: stats.documentsToRead
    },
    { 
      icon: Clock, 
      label: 'Présences', 
      action: () => navigate('/student/attendance'),
      stats: `${stats.attendanceRate}%`
    }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, activitiesData, scheduleData, userData] = await Promise.all([
          studentAPI.getDashboardStats(),
          studentAPI.getDashboardActivities(),
          studentAPI.getDashboardSchedule(),
          api.get('/users/profile')
        ]);
        setStats(statsData.data);
        setActivities(activitiesData.data);
        setSchedule(scheduleData.data);
        setUserData(userData.data);
      } catch (error) {
        console.error('Erreur lors du chargement du dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingOverlay show text="Chargement de votre espace..." />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-blue-50/50">
      {/* Header optimisé pour mobile */}
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
        <div className="px-4 py-3 sm:px-6 sm:py-4">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 flex items-center">
            <span className="mr-2">📚</span> Mon Espace
          </h1>
          <p className="text-sm sm:text-base text-blue-100">Bienvenue, {userData.name}!</p>
        </div>
      </header>

      {/* Main Content avec meilleur espacement mobile */}
      <main className="flex-1 p-3 sm:p-6">
        {/* Cards avec layout optimisé */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
          {menuItems.map((item, index) => (
            <div 
              key={index}
              onClick={item.action}
              className="bg-white rounded-lg sm:rounded-xl border border-blue-200 hover:border-blue-400 
                       p-3 sm:p-4 cursor-pointer transform hover:-translate-y-1 transition-all
                       shadow-sm hover:shadow-md overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-400"></div>
              <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-2 sm:mb-3">
                <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mb-1 sm:mb-0" />
                <span className="text-sm sm:text-lg font-semibold text-blue-800 text-center sm:text-left">
                  {item.label}
                </span>
              </div>
              <div className="text-xl sm:text-3xl font-bold text-blue-700 text-center sm:text-left">
                {item.stats}
              </div>
            </div>
          ))}
        </div>

        {/* Conteneur flexible pour l'emploi du temps et les activités */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Emploi du temps */}
          <div className="bg-white rounded-lg sm:rounded-xl border-2 border-yellow-200 p-3 sm:p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-yellow-800 flex items-center">
                <span className="mr-2">📅</span> Emploi du temps
              </h2>
              <Button
                onClick={() => navigate('/student/schedule')}
                className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs sm:text-sm rounded-full px-3 py-1"
              >
                Voir tout
              </Button>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {schedule.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <span className="text-3xl sm:text-4xl mb-2">🌞</span>
                  <p className="text-sm sm:text-base">Aucun cours aujourd&apos;hui !</p>
                </div>
              ) : (
                schedule.map((course) => (
                  <div key={course.id} 
                       className="flex items-center p-2 sm:p-3 rounded-lg bg-yellow-50 hover:bg-yellow-100
                                border-l-4 border-yellow-400">
                    <div className="w-16 sm:w-20 text-center font-mono text-yellow-800 text-sm sm:text-base">
                      {course.time}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base">{course.title}</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        👨‍🏫 {course.professor} | 🚪 {course.room}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activités récentes */}
          <div className="bg-white rounded-lg sm:rounded-xl border-2 border-green-200 p-3 sm:p-4 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-green-800 mb-3 sm:mb-4 flex items-center">
              <span className="mr-2">📌</span> Activités Récentes
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} 
                     className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg bg-green-50
                              hover:bg-green-100 border-l-4 border-green-400">
                  <div className="rounded-full bg-green-200 p-1.5 sm:p-2">
                    <activity.icon className="h-4 w-4 sm:h-5 sm:w-5 text-green-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">{activity.title}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-green-600 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;