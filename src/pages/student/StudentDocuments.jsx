import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  FileText, 
  Book, 
  Download, 
  Search,
  Filter,
  Check,
  Eye,
  AlertCircle,
  Calendar,
  ChevronDown,
  X
} from 'lucide-react';
import { LoadingOverlay } from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import api from '../../services/api';

const documentAPI = {
  getDocuments: (params) => api.get('/student/documents', { params }),
  markAsRead: (documentId) => api.post(`/student/documents/${documentId}/read`),
  downloadDocument: (documentId) => api.get(`/documents/${documentId}/download`, { responseType: 'blob' })
};

// PropTypes communs
const coursePropType = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
});

const documentPropType = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  isRead: PropTypes.bool.isRequired,
  createdAt: PropTypes.string.isRequired,
  course: coursePropType.isRequired
});

// Composant pour afficher le type de document
const DocumentTypeTag = ({ type }) => {
  const styles = {
    COURSE: 'bg-blue-100 text-blue-800',
    EXERCISE: 'bg-green-100 text-green-800',
    EXAM: 'bg-purple-100 text-purple-800',
    OTHER: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[type] || styles.OTHER}`}>
      {type}
    </span>
  );
};

DocumentTypeTag.propTypes = {
  type: PropTypes.oneOf(['COURSE', 'EXERCISE', 'EXAM', 'OTHER']).isRequired
};

// Composant pour les cartes de statistiques
const StatCard = ({ label, value, icon: Icon, bgColor }) => (
  <div className="bg-white rounded-lg sm:rounded-xl border-2 border-blue-100 p-4 sm:p-6
                transform hover:-translate-y-1 transition-all duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-2xl sm:text-3xl font-bold text-blue-800">{value}</p>
      </div>
      <div className={`bg-${bgColor}-100 p-3 sm:p-4 rounded-full`}>
        <Icon className={`h-6 w-6 sm:h-8 sm:w-8 text-${bgColor}-500`} />
      </div>
    </div>
  </div>
);

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired,
  bgColor: PropTypes.string
};

StatCard.defaultProps = {
  bgColor: 'blue'
};

// Composant pour les cartes de documents
const DocumentCard = ({ doc, onDownload, onMarkAsRead, onPreview }) => (
  <div className="bg-white rounded-lg sm:rounded-xl border-2 border-blue-100 overflow-hidden
                transform hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
    <div className="p-4 sm:p-6">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1 mr-3">
          <h3 className="font-semibold text-blue-800 mb-1 line-clamp-2">{doc.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-1">{doc.course.title}</p>
        </div>
        <DocumentTypeTag type={doc.type} />
      </div>

      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center text-xs sm:text-sm text-gray-500">
          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
          {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-gray-500">
            {(doc.size / 1024).toFixed(2)} KB
          </span>
          {!doc.isRead && (
            <span className="text-yellow-600 text-xs sm:text-sm font-medium flex items-center">
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Non lu
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 sm:mt-6">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center justify-center text-xs sm:text-sm"
          onClick={() => onDownload(doc)}
        >
          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          <span className="hidden sm:inline">Télécharger</span>
          <span className="inline sm:hidden">DL</span>
        </Button>
        {!doc.isRead && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center justify-center text-xs sm:text-sm"
            onClick={() => onMarkAsRead(doc._id)}
          >
            <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Lu
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="flex items-center justify-center text-xs sm:text-sm"
          onClick={() => onPreview(doc._id)}
        >
          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          <span className="hidden sm:inline">Aperçu</span>
          <span className="inline sm:hidden">Voir</span>
        </Button>
      </div>
    </div>
  </div>
);

DocumentCard.propTypes = {
  doc: documentPropType.isRequired,
  onDownload: PropTypes.func.isRequired,
  onMarkAsRead: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired
};

// Composant pour la barre de filtres
const FilterBar = ({ filters, setFilters, courses, showMobile, onClose }) => {
  const filterOptions = [
    {
      value: filters.course,
      onChange: (e) => setFilters(f => ({ ...f, course: e.target.value })),
      icon: Book,
      label: "Cours",
      options: [
        { value: "all", label: "Tous les cours" },
        ...courses.map(course => ({ value: course._id, label: course.title }))
      ]
    },
    {
      value: filters.type,
      onChange: (e) => setFilters(f => ({ ...f, type: e.target.value })),
      icon: FileText,
      label: "Type",
      options: [
        { value: "all", label: "Tous les types" },
        { value: "COURSE", label: "Cours" },
        { value: "EXERCISE", label: "Exercices" },
        { value: "EXAM", label: "Examens" }
      ]
    },
    {
      value: filters.status,
      onChange: (e) => setFilters(f => ({ ...f, status: e.target.value })),
      icon: Eye,
      label: "Statut",
      options: [
        { value: "all", label: "Tous les statuts" },
        { value: "unread", label: "Non lus" },
        { value: "read", label: "Lus" }
      ]
    }
  ];

  const content = (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 
                    ${showMobile ? 'p-4' : ''}`}>
      {filterOptions.map((filter, index) => (
        <div key={index} className="relative group">
          <filter.icon className="absolute left-3 top-1/2 transform -translate-y-1/2 
                                text-gray-400 group-hover:text-blue-500 transition-colors 
                                h-4 w-4" />
          <select
            value={filter.value}
            onChange={filter.onChange}
            className="w-full pl-10 pr-8 py-2 rounded-lg sm:rounded-xl border-2 
                     border-blue-100 appearance-none bg-white
                     focus:ring-2 focus:ring-blue-200 focus:border-blue-300 
                     transition-all cursor-pointer text-sm"
          >
            {filter.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 
                                pointer-events-none h-4 w-4 text-gray-400" />
        </div>
      ))}
    </div>
  );

  if (showMobile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 sm:hidden">
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Filtres</h3>
            <button onClick={onClose} className="p-2">
              <X className="h-5 w-5" />
            </button>
          </div>
          {content}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => {
                setFilters({ course: 'all', type: 'all', status: 'all' });
                onClose();
              }}
            >
              Réinitialiser
            </Button>
            <Button
              className="w-full bg-blue-600 text-white"
              onClick={onClose}
            >
              Appliquer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return content;
};

FilterBar.propTypes = {
  filters: PropTypes.shape({
    course: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  setFilters: PropTypes.func.isRequired,
  courses: PropTypes.arrayOf(coursePropType).isRequired,
  showMobile: PropTypes.bool,
  onClose: PropTypes.func
};

FilterBar.defaultProps = {
  showMobile: false,
  onClose: () => {}
};

// Composant principal
const StudentDocuments = () => {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    unreadDocuments: 0
  });
  const [filters, setFilters] = useState({
    course: 'all',
    type: 'all',
    status: 'all'
  });
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await documentAPI.getDocuments({
          ...filters,
          search,
          page: 1,
          limit: 50
        });

        setDocuments(response.data.documents);
        setStats(response.data.stats);
        setCourses(response.data.courses);
      } catch (error) {
        console.error('Erreur lors du chargement des documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [filters, search]);

  const handleDownload = async (document) => {
    try {
      const response = await documentAPI.downloadDocument(document._id);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.title);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  const handleMarkAsRead = async (documentId) => {
    try {
      await documentAPI.markAsRead(documentId);
      setDocuments(docs => docs.map(doc => 
        doc._id === documentId ? { ...doc, isRead: true } : doc
      ));
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const openPreview = (documentId) => {
    window.open(`/documents/${documentId}/preview`, '_blank');
  };

  if (loading) {
    return <LoadingOverlay show text="Chargement des documents..." />;
  }

  return (
    <div className="p-3 sm:p-6 bg-blue-50/30 min-h-screen">
      {/* En-tête responsive */}
      <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm 
                    border-2 border-blue-100 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-blue-800">
                📚 Mes Documents
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Gérez vos ressources pédagogiques
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center 
                        gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 
                              text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg sm:rounded-full 
                         border-2 border-blue-100 text-sm
                         focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
              />
            </div>
            <Button 
              className="sm:hidden w-full bg-blue-600 hover:bg-blue-700 text-white 
                       rounded-lg px-4 py-2 flex items-center justify-center space-x-2"
              onClick={() => setShowMobileFilters(true)}
            >
              <Filter className="h-4 w-4" />
              <span>Filtres</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="hidden sm:block mb-6">
        <FilterBar 
          filters={filters}
          setFilters={setFilters}
          courses={courses}
        />
      </div>

      {/* Filtres mobile */}
      {showMobileFilters && (
        <FilterBar 
          filters={filters}
          setFilters={setFilters}
          courses={courses}
          showMobile={true}
          onClose={() => setShowMobileFilters(false)}
        />
      )}

      {/* Statistiques responsives */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <StatCard 
          label="Total des documents"
          value={stats.totalDocuments}
          icon={FileText}
          bgColor="blue"
        />
        <StatCard
          label="Documents non lus"
          value={stats.unreadDocuments}
          icon={AlertCircle}
          bgColor="yellow"
        />
      </div>

      {/* Liste des documents responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {documents.map((doc) => (
          <DocumentCard
            key={doc._id}
            doc={doc}
            onDownload={handleDownload}
            onMarkAsRead={handleMarkAsRead}
            onPreview={openPreview}
          />
        ))}
      </div>

      {/* Message "Aucun document" responsive */}
      {documents.length === 0 && (
        <div className="bg-white rounded-lg sm:rounded-xl border-2 border-blue-100 
                      p-6 sm:p-12 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full 
                        flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-blue-800 mb-2">
            Aucun document trouvé
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            Modifiez vos filtres pour voir plus de résultats
          </p>
          <Button
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 
                     rounded-full text-sm transform hover:scale-105 transition-all"
            onClick={() => {
              setFilters({ course: 'all', type: 'all', status: 'all' });
              setSearch('');
            }}
          >
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
};

export default StudentDocuments;