import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Book, Calendar, Clock, Users, MoreVertical, FileText, ChevronRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card, { CardContent } from '../../components/ui/card';
import { LoadingOverlay } from '../../components/ui/Loading';

const CourseList = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_URL}/courses`, {
          headers: getHeaders()
        });
        
        if (!response.ok) throw new Error('Erreur lors de la récupération des cours');
        const data = await response.json();
        setCourses(data.data.courses);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [API_URL]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
                         course.code.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || course.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cours</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/courses/new')}
          icon={<Plus className="h-5 w-5" />}
        >
          Nouveau Cours
        </Button>
      </div>

      {/* Filtres */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" aria-hidden="true" />
              <input
                type="search"
                placeholder="Rechercher un cours..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Rechercher un cours"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 h-5 w-5" aria-hidden="true" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filtrer les cours"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="archived">Archivés</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des cours */}
      {loading ? (
        <LoadingOverlay show text="Chargement des cours..." />
      ) : (
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
          aria-label="Liste des cours"
        >
          {filteredCourses.map((course) => (
            <Card 
              key={course.id} 
              className="hover:shadow-lg transition-shadow duration-200"
              role="listitem"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Book className="h-5 w-5 text-blue-600" aria-hidden="true" />
                      <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{course.code}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" aria-hidden="true" />
                        <span>{course.professor}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" aria-hidden="true" />
                        <span>{course.schedule}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" aria-hidden="true" />
                        <span>{course.students} étudiants</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/courses/${course.id}`)}
                    aria-label={`Voir les détails de ${course.title}`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    course.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {course.status === 'active' ? 'Actif' : 'Archivé'}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/courses/${course.id}/documents`)}
                      aria-label="Voir les documents"
                    >
                      <FileText className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implémenter le menu d'actions
                      }}
                      aria-label="Plus d'actions"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;