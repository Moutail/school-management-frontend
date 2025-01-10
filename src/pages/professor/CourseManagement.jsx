import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Plus, 
  FileText,
  Users,
  MoreVertical,
  Clock,
  Archive,
  Edit,
  Trash2
} from 'lucide-react';
import Card from '../../components/ui/card';
import { LoadingOverlay } from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import api from '../../services/api';

const courseAPI = {
  getCourses: (params) => api.get('/professor/courses', { params }),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  archiveCourse: (id) => api.patch(`/courses/${id}/archive`)
};

const CourseManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    status: 'active',
    period: 'current'
  });
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await courseAPI.getCourses({
          ...filters,
          search,
          page: 1,
          limit: 50
        });
        setCourses(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des cours:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [filters, search]);

  const handleArchive = async (courseId) => {
    try {
      await courseAPI.archiveCourse(courseId);
      setCourses(courses.filter(course => course._id !== courseId));
    } catch (error) {
      console.error('Erreur lors de l\'archivage:', error);
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      try {
        await courseAPI.deleteCourse(courseId);
        setCourses(courses.filter(course => course._id !== courseId));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  if (loading) {
    return <LoadingOverlay show text="Chargement des cours..." />;
  }

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Gestion des Cours</h1>
        <Button 
          onClick={() => navigate('/professor/courses/new')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau cours
        </Button>
      </div>

      {/* Filtres et recherche */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un cours..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full border rounded-lg p-2"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
          className="border rounded-lg p-2"
        >
          <option value="active">Actifs</option>
          <option value="archived">Archivés</option>
          <option value="all">Tous</option>
        </select>
        <select
          value={filters.period}
          onChange={(e) => setFilters(f => ({ ...f, period: e.target.value }))}
          className="border rounded-lg p-2"
        >
          <option value="current">Période actuelle</option>
          <option value="past">Périodes passées</option>
          <option value="all">Toutes les périodes</option>
        </select>
      </div>

      {/* Liste des cours */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card 
            key={course._id}
            className="hover:shadow-lg transition-shadow"
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-lg">{course.title}</h3>
                  <p className="text-sm text-gray-500">{course.code}</p>
                </div>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCourse(selectedCourse === course._id ? null : course._id)}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                  {selectedCourse === course._id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                      <div className="py-1">
                        <button
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => navigate(`/professor/courses/${course._id}/edit`)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </button>
                        <button
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => handleArchive(course._id)}
                        >
                          <Archive className="w-4 h-4 mr-2" />
                          Archiver
                        </button>
                        <button
                          className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          onClick={() => handleDelete(course._id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <Users className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                    <p className="font-medium">{course.studentsCount}</p>
                    <p className="text-xs text-gray-500">Étudiants</p>
                  </div>
                  <div className="text-center">
                    <FileText className="w-4 h-4 mx-auto mb-1 text-green-500" />
                    <p className="font-medium">{course.documentsCount}</p>
                    <p className="text-xs text-gray-500">Documents</p>
                  </div>
                  <div className="text-center">
                    <Clock className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                    <p className="font-medium">{course.attendanceRate}%</p>
                    <p className="text-xs text-gray-500">Présence</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/professor/courses/${course._id}/attendance`)}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Présences
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/professor/courses/${course._id}/documents`)}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Documents
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/professor/courses/${course._id}/students`)}
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Étudiants
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">
            Aucun cours ne correspond à vos critères
          </p>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;