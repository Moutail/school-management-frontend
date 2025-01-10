import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, XCircle, AlertCircle, Clock, ChevronLeft, ChevronRight, Check, ClipboardList, X, FileText } from 'lucide-react';
import PropTypes from 'prop-types';
import { LoadingOverlay } from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import api from '../../services/api';

const statusConfig = {
  PRESENT: {
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: CheckCircle,
    label: 'Présent'
  },
  ABSENT: {
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: XCircle,
    label: 'Absent'
  },
  LATE: {
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: Clock,
    label: 'En retard'
  },
  EXCUSED: {
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: AlertCircle,
    label: 'Excusé'
  }
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status];
  const Icon = config?.icon || XCircle;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${config?.bg} ${config?.color} border ${config?.border}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config?.label || status}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.oneOf(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']).isRequired
};

const JustificationBadge = ({ status }) => {
  const configs = {
    PENDING: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      label: 'En attente'
    },
    APPROVED: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Approuvée'
    },
    REJECTED: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      label: 'Rejetée'
    }
  };
  const config = configs[status] || configs.PENDING;
  return (
    <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

JustificationBadge.propTypes = {
  status: PropTypes.oneOf(['PENDING', 'APPROVED', 'REJECTED']).isRequired
};

const attendanceAPI = {
  getAttendanceHistory: (params) => api.get('/student/attendance/history', { params }),
  getAttendanceStats: () => api.get('/student/attendance/stats')
};

const AttendanceCard = ({ attendance, onJustify }) => (
  <div className="bg-white rounded-lg border-2 border-blue-100 p-4 space-y-3">
    <div className="flex justify-between items-start">
      <div className="space-y-1">
        <p className="text-sm text-gray-600">
          {new Date(attendance.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}
        </p>
        <h3 className="font-medium">{attendance.course.title}</h3>
        <p className="text-sm text-gray-600">
          {attendance.course.professor.firstName} {attendance.course.professor.lastName}
        </p>
      </div>
      <StatusBadge status={attendance.status} />
    </div>
    
    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
      {attendance.status === 'ABSENT' && !attendance.justification ? (
        <Button
          onClick={() => onJustify(attendance._id)}
          className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
        >
          <FileText className="w-4 h-4 mr-1" />
          Justifier
        </Button>
      ) : attendance.justification ? (
        <JustificationBadge status={attendance.justification.status} />
      ) : (
        <span></span>
      )}
    </div>
  </div>
);

AttendanceCard.propTypes = {
  attendance: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    course: PropTypes.shape({
      title: PropTypes.string.isRequired,
      professor: PropTypes.shape({
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired
      }).isRequired
    }).isRequired,
    justification: PropTypes.shape({
      status: PropTypes.string.isRequired
    })
  }).isRequired,
  onJustify: PropTypes.func.isRequired
};

const StatCard = ({ title, value, Icon, color, bgColor, borderColor }) => (
  <div className={`bg-white rounded-xl border-2 ${borderColor} p-4 sm:p-5
                transform hover:-translate-y-1 transition-all duration-200`}>
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-gray-600 mb-1">{title}</div>
        <div className={`text-2xl sm:text-3xl font-bold ${color}`}>{value}</div>
      </div>
      <div className={`${bgColor} p-2 sm:p-3 rounded-full`}>
        <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${color}`} />
      </div>
    </div>
  </div>
);

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  Icon: PropTypes.elementType.isRequired,
  color: PropTypes.string.isRequired,
  bgColor: PropTypes.string.isRequired,
  borderColor: PropTypes.string.isRequired
};

const StudentAttendance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [attendances, setAttendances] = useState([]);
  const [stats, setStats] = useState({
    totalPresences: 0,
    totalAbsences: 0,
    totalLates: 0,
    attendanceRate: 0
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const [attendanceRes, statsRes] = await Promise.all([
          attendanceAPI.getAttendanceHistory({
            page,
            limit: 10,
            month: selectedMonth
          }),
          attendanceAPI.getAttendanceStats()
        ]);

        setAttendances(attendanceRes.data.attendances);
        setTotalPages(attendanceRes.data.pagination.pages);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Erreur lors du chargement des présences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [page, selectedMonth]);

  if (loading) {
    return <LoadingOverlay show text="Chargement des présences..." />;
  }

  const handleJustify = (attendanceId) => {
    navigate(`/student/attendance/${attendanceId}/justify`);
  };

  return (
    <div className="p-3 sm:p-6 bg-blue-50/30 min-h-screen space-y-4 sm:space-y-6">
      {/* En-tête responsive */}
      <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border-2 border-blue-100">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
              <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-blue-800">
                ✓ Mes Présences
              </h1>
            </div>
          </div>
   
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 rounded-full border-2 border-blue-100 
                       bg-white text-gray-700 focus:border-blue-300 focus:ring-2 
                       focus:ring-blue-200 outline-none transition-all text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date(2024, i, 1);
                return (
                  <option key={i} value={`2024-${String(i + 1).padStart(2, '0')}`}>
                    {date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </option>
                );
              })}
            </select>
            <Button 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 
                       rounded-full flex items-center justify-center space-x-2 
                       hover:scale-105 transition-all text-sm"
              onClick={() => navigate('/student/schedule')}
            >
              <Calendar className="w-4 h-4" />
              <span>Emploi du temps</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats responsives */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Taux de présence */}
        <div className="col-span-2 lg:col-span-1">
          <div className="bg-white rounded-xl border-2 border-green-100 p-4 
                        transform hover:-translate-y-1 transition-all duration-200">
            <div className="flex justify-between items-start mb-3">
              <div className="text-sm font-medium text-gray-600">Taux de présence</div>
              <div className={`text-2xl sm:text-3xl font-bold ${
                stats.attendanceRate >= 80 ? 'text-green-600' :
                stats.attendanceRate >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {stats.attendanceRate}%
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 sm:h-3">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.attendanceRate >= 80 ? 'bg-green-500' :
                  stats.attendanceRate >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${stats.attendanceRate}%` }}
              />
            </div>
          </div>
        </div>

        <StatCard
          title="Présences"
          value={stats.totalPresences}
          Icon={Check}
          color="text-blue-600"
          bgColor="bg-blue-100"
          borderColor="border-blue-100"
        />

        <StatCard
          title="Absences"
          value={stats.totalAbsences}
          Icon={X}
          color="text-red-600"
          bgColor="bg-red-100"
          borderColor="border-red-100"
        />

        <StatCard
          title="Retards"
          value={stats.totalLates}
          Icon={Clock}
          color="text-yellow-600"
          bgColor="bg-yellow-100"
          borderColor="border-yellow-100"
        />
      </div>

      {/* Liste des présences - Vue mobile */}
      <div className="block lg:hidden space-y-3">
        {attendances.map((attendance) => (
          <AttendanceCard
            key={attendance._id}
            attendance={attendance}
            onJustify={handleJustify}
          />
        ))}
      </div>

      {/* Liste des présences - Vue desktop */}
      <div className="hidden lg:block bg-white rounded-xl border-2 border-blue-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-blue-50 border-b-2 border-blue-100">
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase">
                  Cours
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase">
                  Justification
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {attendances.map((attendance) => (
                <tr key={attendance._id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-800">
                      {new Date(attendance.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{attendance.course.title}</div>
                    <div className="text-sm text-gray-500">
                      {attendance.course.professor.firstName} {attendance.course.professor.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={attendance.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {attendance.status === 'ABSENT' && !attendance.justification ? (
                      <Button
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                        onClick={() => handleJustify(attendance._id)}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Justifier
                      </Button>
                    ) : attendance.justification ? (
                      <JustificationBadge status={attendance.justification.status} />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination responsive */}
        {totalPages > 1 && (
          <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between 
                        border-t-2 border-blue-100 bg-blue-50/30 gap-3">
            <Button
              className="w-full sm:w-auto px-4 py-2 rounded-full bg-white border-2 border-blue-200
                       hover:bg-blue-50 text-blue-600 transition-colors text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Précédent</span>
            </Button>
            <span className="text-sm font-medium text-blue-800">
              Page {page} sur {totalPages}
            </span>
            <Button
              className="w-full sm:w-auto px-4 py-2 rounded-full bg-white border-2 border-blue-200
                       hover:bg-blue-50 text-blue-600 transition-colors text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              <span>Suivant</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Pagination pour la vue mobile */}
      {totalPages > 1 && (
        <div className="lg:hidden p-3 flex flex-col sm:flex-row items-center justify-between gap-3 
                      bg-white rounded-lg border-2 border-blue-100">
          <Button
            className="w-full sm:w-auto px-4 py-2 rounded-full bg-white border-2 border-blue-200
                     hover:bg-blue-50 text-blue-600 transition-colors text-sm
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Précédent</span>
          </Button>
          <span className="text-sm font-medium text-blue-800">
            Page {page} sur {totalPages}
          </span>
          <Button
            className="w-full sm:w-auto px-4 py-2 rounded-full bg-white border-2 border-blue-200
                     hover:bg-blue-50 text-blue-600 transition-colors text-sm
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            <span>Suivant</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;