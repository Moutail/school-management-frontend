import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Check, X, Clock, Download, Users } from 'lucide-react';
import Card from '../../components/ui/card';
import { LoadingOverlay } from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import api from '../../services/api';

const attendanceAPI = {
  getCourseAttendance: (courseId) => api.get(`/professor/courses/${courseId}/attendance`),
  markAttendance: (courseId, data) => api.post(`/professor/courses/${courseId}/attendance`, data),
  getAttendanceStats: (courseId) => api.get(`/professor/courses/${courseId}/attendance/stats`),
  exportAttendance: (courseId) => api.get(`/professor/courses/${courseId}/attendance/export`)
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card className="p-4">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
      </div>
      <Icon className={`w-8 h-8 text-${color}-500`} />
    </div>
  </Card>
);

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.string.isRequired
};

const AttendanceManagement = () => {
  // Enlevé useNavigate car pas utilisé
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [date, setDate] = useState(new Date());
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/professor/courses');
        setCourses(response.data);
        if (response.data.length > 0) {
          setSelectedCourse(response.data[0]._id);
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!selectedCourse) return;
      
      try {
        setLoading(true);
        const [attendanceRes, statsRes] = await Promise.all([
          attendanceAPI.getCourseAttendance(selectedCourse),
          attendanceAPI.getAttendanceStats(selectedCourse)
        ]);

        setAttendanceData(attendanceRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [selectedCourse]);

  const handleMarkAttendance = async (studentId, status) => {
    try {
      await attendanceAPI.markAttendance(selectedCourse, {
        studentId,
        status,
        date: date.toISOString()
      });

      setAttendanceData(data =>
        data.map(item =>
          item.student._id === studentId
            ? { ...item, status }
            : item
        )
      );
    } catch (error) {
      console.error('Erreur lors du marquage de la présence:', error);
    }
  };

  const handleExportAttendance = async () => {
    try {
      const response = await attendanceAPI.exportAttendance(selectedCourse);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-${selectedCourse}-${date.toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };

  if (loading) {
    return <LoadingOverlay show text="Chargement des présences..." />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Gestion des Présences</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gérez les présences des étudiants pour chaque cours
          </p>
        </div>
        <div className="flex gap-4">
          <select
            value={selectedCourse || ''}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="border rounded-lg p-2"
          >
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={date.toISOString().split('T')[0]}
            onChange={(e) => setDate(new Date(e.target.value))}
            className="border rounded-lg p-2"
          />

          <Button 
            variant="outline"
            onClick={handleExportAttendance}
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Étudiants"
          value={stats.totalStudents}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Présents"
          value={stats.presentCount}
          icon={Check}
          color="green"
        />
        <StatCard
          title="Absents"
          value={stats.absentCount}
          icon={X}
          color="red"
        />
        <StatCard
          title="En retard"
          value={stats.lateCount}
          icon={Clock}
          color="yellow"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
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
                  Taux de présence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceData.map(({ student, status, stats }) => (
                <tr key={student._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img 
                          className="h-10 w-10 rounded-full"
                          src={student.profileImage || '/api/placeholder/32/32'}
                          alt={`${student.firstName} ${student.lastName}`}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.studentId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full mr-2">
                        <div 
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${stats.attendanceRate}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {stats.attendanceRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAttendance(student._id, 'PRESENT')}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAttendance(student._id, 'LATE')}
                        className="text-yellow-600 hover:text-yellow-700"
                      >
                        <Clock className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAttendance(student._id, 'ABSENT')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AttendanceManagement;