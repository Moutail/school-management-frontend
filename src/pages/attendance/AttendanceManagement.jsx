import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight, Filter, Download, Users, Check, X, Clock } from 'lucide-react';
import Card from "../../components/ui/card";
import { LoadingOverlay } from "../../components/ui/Loading";

// Composant Toast pour les notifications
const Toast = ({ message, type = 'info', onClose }) => {
  Toast.propTypes = {
    message: PropTypes.string.isRequired,
    type: PropTypes.string,
    onClose: PropTypes.func.isRequired
  };
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-500',
    erreur: 'bg-red-500',
    info: 'bg-blue-500'
  }[type];

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg text-white ${bgColor} shadow-lg z-50`}>
      {message}
    </div>
  );
};

// Hook personnalisé pour les notifications
const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const hideToast = () => setToast(null);

  return {
    toast,
    showToast,
    hideToast,
    ToastComponent: toast && (
      <Toast
        message={toast.message}
        type={toast.type} 
        onClose={hideToast}
      />
    )
  };
};

// Composant principal de gestion des présences
const AttendanceManagement = () => {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCourse, setSelectedCourse] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [courses, setCourses] = useState([]);
  const { showToast, ToastComponent } = useToast();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Gestion du token JWT
  const getAuthToken = () => localStorage.getItem('jwt');
  const getHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json'
  });

  // Récupération des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupération des cours
        const coursesResponse = await fetch(`${API_URL}/courses`, {
          headers: getHeaders()
        });
        
        if (!coursesResponse.ok) throw new Error('Erreur lors de la récupération des cours');
        const coursesData = await coursesResponse.json();
        setCourses(coursesData.data.courses);

        // Récupération des présences
        if (selectedCourse) {
          const dateString = selectedDate.toISOString().split('T')[0];
          const attendanceResponse = await fetch(
            `${API_URL}/attendance?date=${dateString}&courseId=${selectedCourse}`,
            { headers: getHeaders() }
          );

          if (!attendanceResponse.ok) throw new Error('Erreur lors de la récupération des présences');
          const attendanceResult = await attendanceResponse.json();
          setAttendanceData(attendanceResult.data);
        }

      } catch (error) {
        console.error('Erreur:', error);
        showToast("Impossible de charger les données. Veuillez réessayer.", 'erreur');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate, selectedCourse, API_URL]);

  // Gestion des changements de statut
  const handleStatusChange = async (studentId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/attendance/bulk`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          courseId: selectedCourse,
          date: selectedDate.toISOString().split('T')[0],
          attendances: [{
            studentId,
            status: newStatus
          }]
        })
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour du statut');

      setAttendanceData(prev =>
        prev.map(student =>
          student.id === studentId
            ? { ...student, status: newStatus }
            : student
        )
      );

      showToast("Statut de présence mis à jour", 'success');

    } catch (error) {
      console.error('Erreur:', error);
      showToast("Impossible de mettre à jour le statut", 'erreur');
    }
  };

  // Export des données
  const handleExport = async () => {
    try {
      const response = await fetch(
        `${API_URL}/attendance/export?date=${selectedDate.toISOString().split('T')[0]}&courseId=${selectedCourse}`,
        { headers: getHeaders() }
      );

      if (!response.ok) throw new Error('Erreur lors de l\'export');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presence-${selectedDate.toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur:', error);
      showToast("Impossible d'exporter les données", 'erreur');
    }
  };

  // Utilitaires
  const getStatusColor = (status) => {
    const colors = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Interface utilisateur
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {ToastComponent}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Présences</h1>
        <p className="text-gray-500">Suivi des présences et absences des étudiants</p>
      </div>

      <Card className="mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() - 1);
                  setSelectedDate(newDate);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="text-center">
                <div className="font-medium text-gray-900">
                  {formatDate(selectedDate)}
                </div>
              </div>

              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() + 1);
                  setSelectedDate(newDate);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <Filter className="text-gray-400 h-5 w-5" />
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les cours</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              <Download className="h-5 w-5" />
              Exporter
            </button>
          </div>
        </div>
      </Card>

      {loading ? (
        <LoadingOverlay show text="Chargement des données..." />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Étudiant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Heure d&apos;arrivée
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Historique
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceData.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(student.status)}`}>
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.arrivalTime && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {student.arrivalTime}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <span className="text-sm text-green-600">{student.history?.present || 0} P</span>
                      <span className="text-sm text-red-600">{student.history?.absent || 0} A</span>
                      <span className="text-sm text-yellow-600">{student.history?.late || 0} R</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStatusChange(student.id, 'present')}
                        className={`p-2 rounded-full ${student.status === 'present' ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'}`}
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        className={`p-2 rounded-full ${student.status === 'absent' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'}`}
                      >
                        <X className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.id, 'late')}
                        className={`p-2 rounded-full ${student.status === 'late' ? 'bg-yellow-100 text-yellow-600' : 'hover:bg-gray-100'}`}
                      >
                        <Clock className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;