import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Users, FileText, MessageSquare, Search } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { LoadingOverlay } from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import api from '../../services/api';

const classAPI = {
  getClassInfo: () => api.get('/major/stats/class'),
  getClassmates: () => api.get('/major/class/students'),
  sendAlert: (data) => api.post('/major/alerts', data),
  getClassStats: () => api.get('/major/stats/class')
};

const StatCard = ({ title, value, icon: Icon }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <span>{title}</span>
        {Icon && <Icon className="h-5 w-5 text-gray-400" />}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {value}
      </div>
    </CardContent>
  </Card>
);

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType
};

const StudentCard = ({ student }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center space-x-4">
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
          {student.profileImage ? (
            <img
              src={student.profileImage}
              alt={`${student.firstName} ${student.lastName}`}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <Users className="h-6 w-6 text-gray-400" />
          )}
        </div>
        <div>
          <h3 className="font-medium">{student.firstName} {student.lastName}</h3>
          <p className="text-sm text-gray-500">{student.email}</p>
          {student.attendanceRate !== undefined && (
            <div className="mt-1">
              <span className={`text-sm ${
                student.attendanceRate >= 80 ? 'text-green-600' :
                student.attendanceRate >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                Présence: {student.attendanceRate}%
              </span>
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

StudentCard.propTypes = {
  student: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    profileImage: PropTypes.string,
    attendanceRate: PropTypes.number
  }).isRequired
};

const AlertForm = ({ onClose, onSubmit, students }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'NORMAL',
    recipients: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Nouvelle Alerte</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Titre</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full border rounded-md p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="w-full border rounded-md p-2"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priorité</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              className="w-full border rounded-md p-2"
            >
              <option value="NORMAL">Normale</option>
              <option value="IMPORTANT">Importante</option>
              <option value="URGENT">Urgente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Destinataires</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.recipients.length === students.length}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      recipients: e.target.checked ? students.map(s => s._id) : []
                    });
                  }}
                  className="rounded"
                />
                <span>Tous les étudiants</span>
              </label>
              <div className="mt-2 max-h-40 overflow-y-auto">
                {students.map(student => (
                  <label key={student._id} className="flex items-center space-x-2 p-1">
                    <input
                      type="checkbox"
                      checked={formData.recipients.includes(student._id)}
                      onChange={(e) => {
                        const newRecipients = e.target.checked
                          ? [...formData.recipients, student._id]
                          : formData.recipients.filter(id => id !== student._id);
                        setFormData({ ...formData, recipients: newRecipients });
                      }}
                      className="rounded"
                    />
                    <span>{student.firstName} {student.lastName}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button type="submit">
              Envoyer l&apos;alerte
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

AlertForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  students: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired
  })).isRequired
};

const ClassManagement = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [stats, setStats] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classData, studentsData, statsData] = await Promise.all([
        classAPI.getClassInfo(),
        classAPI.getClassmates(),
        classAPI.getClassStats()
      ]);

      setClassInfo(classData.data);
      setStudents(studentsData.data);
      setStats(statsData.data);
      setUpcomingEvents(statsData.data.upcomingEvents || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAlertSubmit = async (alertData) => {
    try {
      await classAPI.sendAlert(alertData);
      setShowAlertForm(false);
      fetchData();
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'alerte:', error);
    }
  };

  const filteredStudents = students.filter(student => 
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingOverlay show text="Chargement des données de classe..." />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Gestion de Classe
          </h1>
          {classInfo && (
            <p className="text-gray-600 mt-1">
              {classInfo.name} - {classInfo.level}
            </p>
          )}
        </div>
        <Button onClick={() => setShowAlertForm(true)}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Nouvelle Alerte
        </Button>
      </div>

      {showAlertForm && (
        <AlertForm
          onClose={() => setShowAlertForm(false)}
          onSubmit={handleAlertSubmit}
          students={students}
        />
      )}

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'students' 
              ? 'bg-blue-100 text-blue-800' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('students')}
        >
          <Users className="h-4 w-4 inline-block mr-2" />
          Étudiants
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'stats' 
              ? 'bg-blue-100 text-blue-800' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('stats')}
        >
          <FileText className="h-4 w-4 inline-block mr-2" />
          Statistiques
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'students' ? (
        <div>
          {/* Search bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un étudiant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Students list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => (
              <StudentCard key={student._id} student={student} />
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun étudiant trouvé</p>
            </div>
          )}
        </div>
      ) : (
        // Statistics tab
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Présence Moyenne"
            value={`${classInfo?.averageAttendance || 0}%`}
            icon={Users}
          />
          
          <StatCard
            title="Documents Partagés"
            value={stats?.documentsCount || 0}
            icon={FileText}
          />

          <StatCard
            title="Notifications Actives"
            value={stats?.notifications || 0}
            icon={MessageSquare}
          />
          
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Événements à venir</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg">
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-gray-500">{event.date}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Aucun événement à venir
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;