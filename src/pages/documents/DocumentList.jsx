import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Upload, Download, Trash2, FileText, File, Image, Archive, MoreVertical } from 'lucide-react';
import { LoadingOverlay } from '../../components/ui/Loading';
import Card, { CardContent } from '../../components/ui/card';
import Button from '../../components/ui/Button';

const DocumentList = () => {
 const navigate = useNavigate();
 const API_URL = import.meta.env.VITE_API_URL;
 const [documents, setDocuments] = useState([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 const [filter, setFilter] = useState('all');
 const [selectedCourse, setSelectedCourse] = useState('');
 const [courses, setCourses] = useState([]);

 const fileTypes = {
   'pdf': { icon: FileText, color: 'text-red-500' },
   'doc': { icon: File, color: 'text-blue-500' },
   'image': { icon: Image, color: 'text-green-500' },
   'archive': { icon: Archive, color: 'text-yellow-500' }
 };

 const getHeaders = () => ({
   'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
   'Content-Type': 'application/json'
 });

 useEffect(() => {
   const fetchData = async () => {
     try {
       const [coursesResponse, documentsResponse] = await Promise.all([
         fetch(`${API_URL}/courses`, { headers: getHeaders() }),
         fetch(`${API_URL}/documents?search=${search}&type=${filter}&course=${selectedCourse}`, { 
           headers: getHeaders() 
         })
       ]);

       if (!coursesResponse.ok || !documentsResponse.ok) {
         throw new Error('Erreur lors de la récupération des données');
       }

       const coursesData = await coursesResponse.json();
       const documentsData = await documentsResponse.json();

       setCourses(coursesData.data);
       setDocuments(documentsData.data);
     } catch (error) {
       console.error('Erreur:', error);
     } finally {
       setLoading(false);
     }
   };

   fetchData();
 }, [API_URL, search, filter, selectedCourse]);

 const handleDownload = async (documentId) => {
   try {
     const response = await fetch(`${API_URL}/documents/${documentId}/download`, {
       headers: getHeaders()
     });
     if (!response.ok) throw new Error('Erreur de téléchargement');
     
     const blob = await response.blob();
     const url = window.URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `document-${documentId}`;
     document.body.appendChild(a);
     a.click();
     window.URL.revokeObjectURL(url);
   } catch (error) {
     console.error('Erreur de téléchargement:', error);
   }
 };

 const handleDelete = async (documentId) => {
   try {
     const response = await fetch(`${API_URL}/documents/${documentId}`, {
       method: 'DELETE',
       headers: getHeaders()
     });

     if (!response.ok) throw new Error('Erreur de suppression');
     setDocuments(docs => docs.filter(doc => doc.id !== documentId));
   } catch (error) {
     console.error('Erreur de suppression:', error);
   }
 };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || doc.type === filter;
    const matchesCourse = !selectedCourse || doc.course === selectedCourse;
    return matchesSearch && matchesFilter && matchesCourse;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500">Gérez tous vos documents de cours</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/documents/upload')}
          icon={<Upload className="h-5 w-5" aria-hidden="true" />}
        >
          Nouveau Document
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
                placeholder="Rechercher un document..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Rechercher un document"
              />
            </div>
            <div className="flex items-center gap-4">
              <Filter className="text-gray-400 h-5 w-5" aria-hidden="true" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filtrer par type de document"
              >
                <option value="all">Tous les types</option>
                <option value="pdf">PDF</option>
                <option value="doc">Documents</option>
                <option value="image">Images</option>
                <option value="archive">Archives</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filtrer par cours"
              >
                <option value="">Tous les cours</option>
                {courses.map(course => (
                  <option key={course.id} value={course.name}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des documents */}
      {loading ? (
        <LoadingOverlay show text="Chargement des documents..." />
      ) : (
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
          aria-label="Liste des documents"
        >
          {filteredDocuments.map((doc) => {
            const FileIcon = fileTypes[doc.type]?.icon || File;
            const iconColor = fileTypes[doc.type]?.color || 'text-gray-500';

            return (
              <Card 
                key={doc.id} 
                className="hover:shadow-lg transition-shadow duration-200"
                role="listitem"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gray-100 ${iconColor}`}>
                        <FileIcon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{doc.title}</h3>
                        <p className="text-sm text-gray-500">{doc.type.toUpperCase()}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Plus d'options"
                    >
                      <MoreVertical className="h-5 w-5 text-gray-400" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Taille</span>
                      <span className="text-gray-900">{doc.size}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Cours</span>
                      <span className="text-gray-900">{doc.course}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Téléchargements</span>
                      <span className="text-gray-900">{doc.downloads}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <span>{doc.uploadedBy}</span>
                      <time dateTime={doc.uploadedAt} className="ml-1">
                        • {doc.uploadedAt}
                      </time>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(doc.id)}
                        aria-label="Télécharger le document"
                      >
                        <Download className="h-5 w-5 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doc.id)}
                        aria-label="Supprimer le document"
                      >
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DocumentList;