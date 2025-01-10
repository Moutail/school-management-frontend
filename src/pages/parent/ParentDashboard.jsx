import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, FileText, Users, BookOpen, Clock, Calendar } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { LoadingOverlay } from '../../components/ui/Loading';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childStats, setChildStats] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [userData, setUserData] = useState({
    name: '',
    role: '',
    avatar: '/api/placeholder/32/32',
    notifications: 0
  });

  const menuItems = [
    {
      icon: Clock,
      label: 'Voir les présences',
      action: () => navigate(`/parent/children/${selectedChild}/attendance`)
    },
    {
      icon: FileText,
      label: 'Documents',
      action: () => navigate(`/parent/children/${selectedChild}/documents`)
    },
    {
      icon: Calendar,
      label: 'Planning complet',
      action: () => navigate(`/parent/children/${selectedChild}/schedule`)
    },
    {
      icon: Users,
      label: 'Profil',
      action: () => navigate(`/parent/children/${selectedChild}/profile`)
    }
  ];

  const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    const fetchChildrenData = async () => {
      try {
        const response = await fetch(`${API_URL}/parent/children`, { 
          headers: getHeaders() 
        });
        if (response.ok) {
          const data = await response.json();
          setChildren(data.data.children);
          if (data.data.children.length > 0) {
            setSelectedChild(data.data.children[0]._id);
          }
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchChildrenData();
  }, [API_URL]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!selectedChild) return;

      try {
        setLoading(true);

        const [statsRes, scheduleRes, userRes] = await Promise.all([
          fetch(`${API_URL}/parent/children/${selectedChild}/stats`, { headers: getHeaders() }),
          fetch(`${API_URL}/parent/children/${selectedChild}/schedule`, { headers: getHeaders() }),
          fetch(`${API_URL}/users/profile`, { headers: getHeaders() })
        ]);

        if (!statsRes.ok || !scheduleRes.ok || !userRes.ok) {
          throw new Error('Une erreur est survenue lors du chargement des données');
        }

        const [statsData, scheduleData, userData] = await Promise.all([
          statsRes.json(),
          scheduleRes.json(),
          userRes.json()
        ]);

        setChildStats(statsData.data);
        setSchedule(scheduleData.data);
        setUserData(userData.data);

      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedChild) {
      fetchDashboardData();
    }
  }, [API_URL, selectedChild]);

  if (loading) {
    return <LoadingOverlay show text="Chargement de votre espace..." />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-gray-800">Espace Parent</h1>
            {children.length > 0 && (
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="border rounded-md px-3 py-1"
              >
                {children.map((child) => (
                  <option key={child._id} value={child._id}>
                    {child.firstName} {child.lastName}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="h-6 w-6 text-gray-600" />
              {userData.notifications > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {userData.notifications}
                </span>
              )}
            </Button>
            <div className="flex items-center space-x-3">
              <img
                src={userData.avatar}
                alt="Photo de profil"
                className="h-8 w-8 rounded-full"
              />
              <div>
                <p className="text-sm font-medium text-gray-700">{userData.name}</p>
                <p className="text-xs text-gray-500">Parent</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {childStats && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Cours Suivis</CardTitle>
                  <BookOpen className="h-4 w-4 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{childStats.stats.coursesCount}</div>
                  <p className="text-xs text-gray-600 mt-1">Cours inscrits</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Taux de Présence</CardTitle>
                  <Clock className="h-4 w-4 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{childStats.stats.attendanceRate}%</div>
                  <p className="text-xs text-gray-600 mt-1">Moyenne globale</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Documents Non Lus</CardTitle>
                  <Users className="h-4 w-4 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{childStats.stats.unreadDocuments}</div>
                  <p className="text-xs text-gray-600 mt-1">À consulter</p>
                </CardContent>
              </Card>
            </div>

            {/* Schedule */}
            <Card className="mb-6">
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Emploi du temps</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/parent/children/${selectedChild}/schedule`)}
                >
                  Voir tout
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schedule.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Aucun cours prévu pour aujourd&apos;hui
                    </p>
                  ) : (
                    schedule.map((course) => (
                      <div key={course.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-20 text-center">
                          <time className="text-sm font-semibold text-blue-600">{course.time}</time>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{course.title}</p>
                          <p className="text-xs text-gray-500">{course.professor} • {course.room}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {menuItems.map((item, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={item.action}
                      className="p-4 h-auto text-center justify-center"
                    >
                      <item.icon className="h-5 w-5 mb-2" />
                      <span>{item.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default ParentDashboard;