import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Users, Clock, FileText, Bookmark } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { LoadingOverlay } from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import api from '../../services/api';

const courseAPI = {
  getMyCourses: () => api.get('/courses/student'),
  getCourseDetails: (courseId) => api.get(`/courses/${courseId}`),
  getCourseDocuments: (courseId) => api.get(`/courses/${courseId}/documents`),
  getAttendanceStats: (courseId) => api.get(`/courses/${courseId}/attendance/stats`)
};

const StudentCourses = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [courseDetails, setCourseDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await courseAPI.getMyCourses();
        setCourses(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des cours:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseClick = async (courseId) => {
    try {
      const details = await courseAPI.getCourseDetails(courseId);
      setCourseDetails(details.data);
      setShowDetails(true);
    } catch (error) {
      console.error('Erreur lors du chargement des détails du cours:', error);
    }
  };

  if (loading) {
    return <LoadingOverlay show text="Chargement des cours..." />;
  }

  return (
    <div className="p-3 sm:p-6 bg-blue-50/30 min-h-screen">
      {/* En-tête adaptatif */}
      <div className="mb-4 sm:mb-8">
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border-2 border-blue-100">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-1 sm:mb-2 flex items-center">
                <span className="mr-2">📚</span> Mes Cours
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Retrouvez tous vos cours et ressources</p>
            </div>
            <Button 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 
                       rounded-full flex items-center justify-center space-x-2 
                       transform hover:scale-105 transition-all"
              onClick={() => navigate('/student/schedule')}
            >
              <Clock className="h-4 w-4" />
              <span>Emploi du temps</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Grille de cours optimisée */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {courses.map((course) => (
          <Card 
            key={course._id}
            className="bg-white rounded-lg sm:rounded-xl border-2 border-blue-100 
                     hover:border-blue-300 transform hover:-translate-y-1 
                     transition-all duration-200 overflow-hidden"
            onClick={() => handleCourseClick(course._id)}
          >
            <div className="h-1 sm:h-2 bg-gradient-to-r from-blue-500 to-blue-400" />
            
            <CardHeader className="p-3 sm:p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5 sm:space-y-1">
                  <CardTitle className="text-lg sm:text-xl font-bold text-blue-800">
                    {course.title}
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-gray-500 flex items-center">
                    <Bookmark className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {course.code}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-100 
                              flex items-center justify-center">
                  <Book className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-3 sm:p-5 pt-0">
              <div className="space-y-3 sm:space-y-4">
                {/* Information professeur */}
                <div className="flex items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2 sm:mr-3" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-800">Enseignant</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Prof. {course.professor.firstName} {course.professor.lastName}
                    </p>
                  </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-gray-50 rounded-lg text-center">
                    <p className={`text-xl sm:text-2xl font-bold ${
                      course.attendanceRate >= 80 ? 'text-green-600' :
                      course.attendanceRate >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {course.attendanceRate}%
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">Présence</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">
                      {course.documentsCount}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">Documents</p>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2">
                  <Button 
                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg sm:rounded-xl 
                              p-2 sm:p-3 flex items-center justify-center text-xs sm:text-sm transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/student/courses/${course._id}/documents`);
                    }}
                  >
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Documents
                  </Button>
                  <Button 
                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg sm:rounded-xl 
                              p-2 sm:p-3 flex items-center justify-center text-xs sm:text-sm transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/student/courses/${course._id}/attendance`);
                    }}
                  >
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Présences
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message "aucun cours" responsive */}
      {courses.length === 0 && (
        <div className="text-center py-8 sm:py-12 bg-white rounded-lg sm:rounded-xl 
                      border-2 border-blue-100">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📚</div>
          <p className="text-lg sm:text-xl text-gray-600">
            Aucun cours n&apos;est disponible pour le moment.
          </p>
        </div>
      )}

      {/* Modal détails adaptatif */}
      {showDetails && courseDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center 
                      justify-center p-2 sm:p-4 z-50">
          <Card className="w-full max-w-lg sm:max-w-2xl bg-white rounded-lg sm:rounded-xl 
                        border-2 border-blue-100 max-h-[90vh] overflow-y-auto">
            <div className="h-1 sm:h-2 bg-gradient-to-r from-blue-500 to-blue-400" />
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-blue-800">
                    {courseDetails.title}
                  </CardTitle>
                  <p className="text-sm sm:text-base text-gray-600">{courseDetails.code}</p>
                </div>
                <Button
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gray-100 hover:bg-gray-200 
                           flex items-center justify-center text-lg sm:text-xl"
                  onClick={() => setShowDetails(false)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Description</h3>
                  <p className="text-sm sm:text-base text-gray-700">{courseDetails.description}</p>
                </div>
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Objectifs</h3>
                  <ul className="space-y-2">
                    {courseDetails.objectives?.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">📍</span>
                        <span className="text-sm sm:text-base text-gray-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex justify-end pt-2 sm:pt-4">
                <Button 
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white 
                           px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base"
                  onClick={() => setShowDetails(false)}
                >
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudentCourses;