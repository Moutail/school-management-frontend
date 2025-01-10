import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Calendar,
  FileText
} from 'lucide-react';
import Card from '../../components/ui/card';
import { LoadingOverlay } from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import api from '../../services/api';

const professorAPI = {
  getDashboardStats: () => api.get('/professor/dashboard/stats'),
  getSchedule: () => api.get('/professor/schedule'),
  getActivities: () => api.get('/professor/activities')
};

const ProfessorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    averageAttendance: 0,
    upcomingExams: 0
  });
  const [schedule, setSchedule] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, scheduleRes, activitiesRes] = await Promise.all([
          professorAPI.getDashboardStats(),
          professorAPI.getSchedule(),
          professorAPI.getActivities()
        ]);

        setStats(statsRes.data);
        setSchedule(scheduleRes.data);
        setActivities(activitiesRes.data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingOverlay show text="Chargement du tableau de bord..." />;
  }

  const menuItems = [
    {
      title: "Mes Cours",
      icon: BookOpen,
      value: stats.totalCourses,
      color: "text-blue-600",
      link: "/professor/courses"
    },
    {
      title: "Étudiants",
      icon: Users,
      value: stats.totalStudents,
      color: "text-green-600",
      link: "/professor/students"
    },
    {
      title: "Taux de présence",
      icon: Clock,
      value: `${stats.averageAttendance}%`,
      color: "text-yellow-600",
      link: "/professor/attendance"
    },
    {
      title: "Examens à venir",
      icon: Calendar,
      value: stats.upcomingExams,
      color: "text-purple-600",
      link: "/professor/exams"
    }
  ];

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Tableau de bord Professeur
        </h1>
        <Button 
          variant="outline"
          onClick={() => navigate('/professor/courses/new')}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Nouveau cours
        </Button>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {menuItems.map((item, index) => (
          <Card 
            key={index}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(item.link)}
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-gray-600">{item.title}</p>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <p className="text-2xl font-bold">{item.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emploi du temps */}
        <Card>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Emploi du temps aujourd&apos;hui</h2>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => navigate('/professor/schedule')}
              >
                Voir tout
              </Button>
            </div>
            <div className="space-y-4">
              {schedule.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  Aucun cours prévu aujourd&apos;hui
                </p>
              ) : (
                schedule.map((course) => (
                  <div 
                    key={course.id}
                    className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-16 text-center">
                      <p className="text-sm font-semibold text-blue-600">
                        {course.time}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{course.title}</p>
                      <p className="text-xs text-gray-500">{course.class} • {course.room}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/professor/attendance/${course.id}`)}
                    >
                      Présences
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Activités récentes */}
        <Card>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Activités récentes</h2>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3"
                >
                  <div className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                    ${activity.type === 'attendance' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'document' ? 'bg-green-100 text-green-600' :
                      activity.type === 'exam' ? 'bg-purple-100 text-purple-600' :
                      'bg-gray-100 text-gray-600'}
                  `}>
                    {activity.type === 'attendance' && <Clock className="w-4 h-4" />}
                    {activity.type === 'document' && <FileText className="w-4 h-4" />}
                    {activity.type === 'exam' && <Calendar className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfessorDashboard;