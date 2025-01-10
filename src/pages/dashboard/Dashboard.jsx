import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Calendar, ChevronRight, FileText, Users, BookOpen, Home } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { LoadingOverlay } from '../../components/ui/Loading';

const Dashboard = () => {
 const navigate = useNavigate();
 const [collapsed, setCollapsed] = useState(false);
 const API_URL = import.meta.env.VITE_API_URL;
 
 const [loading, setLoading] = useState(true);
 const [stats, setStats] = useState({
   totalStudents: 0,
   activeCourses: 0,
   sharedDocuments: 0,
   studentGrowth: '',
   courseGrowth: '',
   documentGrowth: ''
 });
 const [activities, setActivities] = useState([]);
 const [events, setEvents] = useState([]);
 const [userData, setUserData] = useState({
   name: '',
   role: '',
   avatar: '/api/placeholder/32/32',
   notifications: 0
 });

 const menuItems = [
   { icon: Home, label: 'Dashboard', link: '/' },
   { icon: Users, label: 'Utilisateurs', link: '/users' },
   { icon: BookOpen, label: 'Cours', link: '/courses' },
   { icon: Calendar, label: 'Emploi du temps', link: '/schedule' },
   { icon: FileText, label: 'Documents', link: '/documents' },
 ];

 const quickActions = [
   { label: 'Ajouter Étudiant', action: () => navigate('/users/new') },
   { label: 'Créer Cours', action: () => navigate('/courses/new') },
   { label: 'Planning', action: () => navigate('/schedule') },
   { label: 'Documents', action: () => navigate('/documents') }
 ];

 const getHeaders = () => ({
   'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
   'Content-Type': 'application/json'
 });

 useEffect(() => {
   const fetchDashboardData = async () => {
     try {
       setLoading(true);

       const [statsRes, activitiesRes, eventsRes, userRes] = await Promise.all([
         fetch(`${API_URL}/dashboard/stats`, { headers: getHeaders() }),
         fetch(`${API_URL}/dashboard/activities`, { headers: getHeaders() }),
         fetch(`${API_URL}/dashboard/events`, { headers: getHeaders() }),
         fetch(`${API_URL}/users/profile`, { headers: getHeaders() })
       ]);

       if (!statsRes.ok || !activitiesRes.ok || !eventsRes.ok || !userRes.ok) {
         throw new Error('Une erreur est survenue lors du chargement des données');
       }

       const [statsData, activitiesData, eventsData, userData] = await Promise.all([
         statsRes.json(),
         activitiesRes.json(),
         eventsRes.json(),
         userRes.json()
       ]);

       setStats(statsData.data);
       setActivities(activitiesData.data);
       setEvents(eventsData.data);
       setUserData(userData.data);

     } catch (error) {
       console.error('Erreur:', error);
     } finally {
       setLoading(false);
     }
   };

   fetchDashboardData();
 }, [API_URL]);

 if (loading) {
   return <LoadingOverlay show text="Chargement du tableau de bord..." />;
 }

 return (
   <div className="flex h-screen bg-gray-100">
     {/* Sidebar */}
     <aside className={`bg-white shadow-lg transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
       <div className="p-4 flex justify-between items-center border-b">
         <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
           <img src="/api/placeholder/32/32" alt="Logo" className="h-8 w-8 rounded" />
           {!collapsed && <span className="ml-2 font-semibold text-lg">EduManager</span>}
         </div>
         <Button
           variant="ghost"
           size="icon"
           onClick={() => setCollapsed(!collapsed)}
         >
           <ChevronRight className={`transform transition-transform ${collapsed ? 'rotate-180' : ''}`} />
         </Button>
       </div>
       
       <nav className="p-4">
         {menuItems.map((item, index) => (
           <Button
             key={index}
             variant="ghost"
             className="w-full justify-start mb-2"
             onClick={() => navigate(item.link)}
           >
             <item.icon className="h-5 w-5" />
             {!collapsed && <span className="ml-3">{item.label}</span>}
           </Button>
         ))}
       </nav>
     </aside>

     {/* Main Content */}
     <div className="flex-1 flex flex-col overflow-hidden">
       {/* Header */}
       <header className="bg-white shadow-sm">
         <div className="px-6 py-4 flex justify-between items-center">
           <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
           <div className="flex items-center space-x-4">
             <Button
               variant="ghost"
               size="icon"
               className="relative"
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
                 alt={`Photo de profil de ${userData.name}`}
                 className="h-8 w-8 rounded-full"
               />
               <div className={collapsed ? 'hidden' : 'block'}>
                 <p className="text-sm font-medium text-gray-700">{userData.name}</p>
                 <p className="text-xs text-gray-500">{userData.role}</p>
               </div>
             </div>
           </div>
         </div>
       </header>

       {/* Main Content */}
       <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
         {/* Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
           <Card>
             <CardHeader className="flex flex-row items-center justify-between pb-2">
               <CardTitle className="text-sm font-medium">Total Étudiants</CardTitle>
               <Users className="h-4 w-4 text-gray-600" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
               <p className="text-xs text-gray-600 mt-1">{stats.studentGrowth}</p>
             </CardContent>
           </Card>

           <Card>
             <CardHeader className="flex flex-row items-center justify-between pb-2">
               <CardTitle className="text-sm font-medium">Cours Actifs</CardTitle>
               <BookOpen className="h-4 w-4 text-gray-600" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{stats.activeCourses}</div>
               <p className="text-xs text-gray-600 mt-1">{stats.courseGrowth}</p>
             </CardContent>
           </Card>

           <Card>
             <CardHeader className="flex flex-row items-center justify-between pb-2">
               <CardTitle className="text-sm font-medium">Documents Partagés</CardTitle>
               <FileText className="h-4 w-4 text-gray-600" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{stats.sharedDocuments}</div>
               <p className="text-xs text-gray-600 mt-1">{stats.documentGrowth}</p>
             </CardContent>
           </Card>
         </div>

         {/* Activities */}
         <Card className="mb-6">
           <CardHeader>
             <CardTitle>Activités Récentes</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
               {activities.map((activity) => (
                 <div 
                   key={activity.id} 
                   className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg"
                 >
                   <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                     <FileText className="h-5 w-5 text-blue-600" />
                   </div>
                   <div className="flex-1">
                     <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                     <p className="text-sm text-gray-500">{activity.description}</p>
                   </div>
                   <time className="text-xs text-gray-500">{activity.time}</time>
                 </div>
               ))}
             </div>
           </CardContent>
         </Card>

         {/* Quick Actions & Events */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Card>
             <CardHeader>
               <CardTitle>Actions Rapides</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-2 gap-4">
                 {quickActions.map((action, i) => (
                   <Button
                     key={i}
                     variant="ghost"
                     onClick={action.action}
                     className="p-4 h-auto text-center justify-center"
                   >
                     {action.label}
                   </Button>
                 ))}
               </div>
             </CardContent>
           </Card>

           <Card>
             <CardHeader>
               <CardTitle>Événements à Venir</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {events.map((event) => (
                   <div key={event.id} className="flex items-center space-x-3">
                     <div className="flex-shrink-0 w-16 text-center">
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
   </div>
 );
};

export default Dashboard;