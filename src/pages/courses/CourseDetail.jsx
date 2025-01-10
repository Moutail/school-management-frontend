import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Book, User, Calendar, FileText, Edit2, Archive, Save, X, Download, Upload } from 'lucide-react';
import { LoadingOverlay } from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(null);

  const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`${API_URL}/courses/${id}`, {
          headers: getHeaders()
        });
        
        if (!response.ok) throw new Error('Erreur lors de la récupération du cours');
        const data = await response.json();
        setCourse(data.data);
        setFormData({
          title: data.data.title,
          code: data.data.code,
          description: data.data.description,
          schedule: data.data.schedule
        });
      } catch (error) {
        console.error('Failed to fetch course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, API_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/courses/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour du cours');
      const updatedCourse = await response.json();
      setCourse(updatedCourse.data);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentId) => {
    try {
      const response = await fetch(`${API_URL}/documents/${documentId}/download`, {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Erreur lors du téléchargement');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.pdf'; // Utilisez le nom réel du fichier depuis l'API
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (loading) {
    return <LoadingOverlay show text="Chargement du cours..." />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-gray-500">{course.code}</p>
        </div>
        <div className="flex items-center gap-3">
          {!editing ? (
            <>
              <Button
                variant="primary"
                onClick={() => setEditing(true)}
                icon={<Edit2 className="h-5 w-5" />}
              >
                Modifier
              </Button>
              <Button
                variant="secondary"
                onClick={() => {/* TODO: Implémenter l'archivage */}}
                icon={<Archive className="h-5 w-5" />}
              >
                Archiver
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setEditing(false)}
                icon={<X className="h-5 w-5" />}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                icon={<Save className="h-5 w-5" />}
              >
                Enregistrer
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informations du cours</CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Titre
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                    Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-start gap-4" role="group" aria-label="Description du cours">
                  <Book className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  <div>
                    <h3 className="font-medium text-gray-900">Description</h3>
                    <p className="text-gray-600">{course.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4" role="group" aria-label="Informations du professeur">
                  <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  <div>
                    <h3 className="font-medium text-gray-900">Professeur</h3>
                    <p className="text-gray-600">{course.professor.name}</p>
                    <p className="text-sm text-gray-500">{course.professor.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4" role="group" aria-label="Horaires du cours">
                  <Calendar className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  <div>
                    <h3 className="font-medium text-gray-900">Horaires</h3>
                    <p className="text-gray-600">{course.schedule.days.join(', ')}</p>
                    <p className="text-sm text-gray-500">{course.schedule.time} - Salle {course.schedule.room}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Liste des étudiants */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Étudiants</CardTitle>
            <span className="text-sm text-gray-500">{course.students.length} inscrits</span>
          </CardHeader>
          <CardContent>
            <div className="space-y-4" role="list">
              {course.students.map((student) => (
                <div 
                  key={student.id} 
                  className="flex items-center justify-between py-2"
                  role="listitem"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Présence: {student.attendance}</span>
                        <span>Note: {student.grade}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="link"
                    onClick={() => navigate(`/users/${student.id}`)}
                  >
                    Voir profil
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Documents du cours */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Documents</CardTitle>
            <Button
              variant="link"
              onClick={() => navigate(`/courses/${course.id}/documents/upload`)}
              icon={<Upload className="h-4 w-4" />}
            >
              Ajouter
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4" role="list">
              {course.documents.map((doc) => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between py-2"
                  role="listitem"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-gray-900">{doc.title}</p>
                      <p className="text-sm text-gray-500">{doc.type} • {doc.date}</p>
                    </div>
                  </div>
                  <Button
                    variant="link"
                    onClick={() => handleDownload(doc.id)}
                    icon={<Download className="h-4 w-4" />}
                  >
                    Télécharger
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseDetail;