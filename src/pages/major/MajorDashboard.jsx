import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Bell, Calendar, CheckSquare, MessageSquare } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { LoadingOverlay } from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import api from '../../services/api';

const majorAPI = {
  getDashboardStats: () => api.get('/major/stats/class'),
  getActivities: () => api.get('/major/activities'),
  getUpcomingEvents: () => api.get('/major/events')
};

const MajorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageAttendance: 0,
    documentsCount: 0,
    pendingRequests: 0
  });
  const [activities, setActivities] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  const menuItems = [
    {
      icon: Users,
      label: 'Gestion Classe',
      action: () => navigate('/major/class-management'),
      stats: stats.totalStudents
    },
    {
      icon: Calendar,
      label: 'Activités',
      action: () => navigate('/major/activities'),
      stats: activities.length
    },
    {
      icon: CheckSquare,
      label: 'Demandes',
      action: () => navigate('/major/requests'),
      stats: stats.pendingRequests
    }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, activitiesData, eventsData] = await Promise.all([
          majorAPI.getDashboardStats(),
          majorAPI.getActivities(),
          majorAPI.getUpcomingEvents()
        ]);

        setStats(statsData.data);
        setActivities(activitiesData.data);
        setUpcomingEvents(eventsData.data);
      } catch (error) {
        console.error('Erreur lors du chargement du dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingOverlay show text="Chargement du dashboard délégué..." />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard Délégué</h1>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="h-6 w-6 text-gray-600" />
              {stats.pendingRequests > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {stats.pendingRequests}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {menuItems.map((item, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={item.action}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                <item.icon className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.stats}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activités Récentes */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Activités Récentes</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/major/activities')}
              >
                Voir tout
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                      <time className="text-xs text-gray-400">{activity.time}</time>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Événements à venir */}
          <Card>
            <CardHeader>
              <CardTitle>Événements à venir</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-20 text-center">
                      <time className="text-sm font-semibold text-blue-600">{event.date}</time>
                      <p className="text-xs text-gray-500">{event.time}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MajorDashboard;