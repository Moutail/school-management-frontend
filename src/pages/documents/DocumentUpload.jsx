import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, FileText, Check, ChevronLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card, { CardContent } from '../../components/ui/card';
import Alert from '../../components/ui/Alert';

const DocumentUpload = () => {
 const API_URL = import.meta.env.VITE_API_URL;
 const navigate = useNavigate();
 const fileInputRef = useRef(null);
 const [dragActive, setDragActive] = useState(false);
 const [files, setFiles] = useState([]);
 const [uploading, setUploading] = useState(false);
 const [uploadProgress, setUploadProgress] = useState({});
 const [selectedCourse, setSelectedCourse] = useState('');
 const [documentType, setDocumentType] = useState('');
 const [error, setError] = useState('');
 const [courses, setCourses] = useState([]);

 const getHeaders = (isFormData = false) => ({
   'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
   ...(!isFormData && {'Content-Type': 'application/json'})
 });

 useEffect(() => {
   const fetchCourses = async () => {
     try {
       const response = await fetch(`${API_URL}/courses`, {
         headers: getHeaders()
       });
       if (!response.ok) throw new Error('Erreur lors de la récupération des cours');
       const data = await response.json();
       setCourses(data.data);
     } catch (error) {
       console.error('Erreur:', error);
       setError('Impossible de charger les cours');
     }
   };

   fetchCourses();
 }, [API_URL]);

 const handleDrag = (e) => {
   e.preventDefault();
   e.stopPropagation();
   if (e.type === "dragenter" || e.type === "dragover") {
     setDragActive(true);
   } else if (e.type === "dragleave") {
     setDragActive(false);
   }
 };

 const handleDrop = (e) => {
   e.preventDefault();
   e.stopPropagation();
   setDragActive(false);
   
   if (e.dataTransfer.files && e.dataTransfer.files[0]) {
     handleFiles(e.dataTransfer.files);
   }
 };

 const handleChange = (e) => {
   e.preventDefault();
   if (e.target.files && e.target.files[0]) {
     handleFiles(e.target.files);
   }
 };

 const handleFiles = (newFiles) => {
   const validFiles = Array.from(newFiles).filter(file => {
     if (file.size > 10 * 1024 * 1024) {
       setError(`${file.name} est trop volumineux. La taille maximale est de 10MB.`);
       return false;
     }
     return true;
   });

   setFiles(prev => [...prev, ...validFiles]);
   setError('');
 };

 const removeFile = (fileToRemove) => {
   setFiles(files.filter(file => file !== fileToRemove));
 };

 const handleSubmit = async (e) => {
   e.preventDefault();
   if (!files.length || !selectedCourse || !documentType) {
     setError('Veuillez remplir tous les champs requis.');
     return;
   }

   setUploading(true);
   try {
     const formData = new FormData();
     files.forEach(file => {
       formData.append('files', file);
     });
     formData.append('courseId', selectedCourse);
     formData.append('type', documentType);

     const response = await fetch(`${API_URL}/documents/upload`, {
       method: 'POST',
       headers: getHeaders(true),
       body: formData
     });

     if (!response.ok) throw new Error('Erreur lors de l\'upload');

     // Simuler la progression
     files.forEach(file => {
       const interval = setInterval(() => {
         setUploadProgress(prev => {
           const currentProgress = prev[file.name] || 0;
           if (currentProgress >= 100) {
             clearInterval(interval);
             return prev;
           }
           return {
             ...prev,
             [file.name]: currentProgress + 10
           };
         });
       }, 200);
     });

     navigate('/documents');
   } catch (error) {
     console.error('Upload failed:', error);
     setError('L\'upload a échoué. Veuillez réessayer.');
   } finally {
     setUploading(false);
   }
 };

 return (
   <div className="p-6 max-w-4xl mx-auto">
     {/* En-tête */}
     <div className="flex items-center gap-4 mb-6">
       <Button
         variant="ghost"
         size="icon"
         onClick={() => navigate(-1)}
         aria-label="Retour"
       >
         <ChevronLeft className="h-6 w-6" />
       </Button>
       <div>
         <h1 className="text-2xl font-bold text-gray-900">Upload de Documents</h1>
         <p className="text-gray-500">Ajoutez des documents à votre cours</p>
       </div>
     </div>

     <form onSubmit={handleSubmit}>
       <Card className="mb-6">
         <CardContent className="p-6">
           {/* Zone de drag & drop */}
           <div
             className={`relative border-2 border-dashed rounded-lg p-6 ${
               dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
             }`}
             onDragEnter={handleDrag}
             onDragLeave={handleDrag}
             onDragOver={handleDrag}
             onDrop={handleDrop}
             role="button"
             tabIndex="0"
             aria-label="Zone de dépôt de fichiers"
           >
             <input
               ref={fileInputRef}
               type="file"
               multiple
               onChange={handleChange}
               accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
               className="hidden"
               aria-label="Sélectionner des fichiers"
             />

             <div className="text-center">
               <Upload className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
               <p className="mt-2 text-sm text-gray-600">
                 Glissez-déposez vos fichiers ici, ou{' '}
                 <Button
                   variant="link"
                   onClick={() => fileInputRef.current?.click()}
                   type="button"
                 >
                   parcourez
                 </Button>
               </p>
               <p className="mt-1 text-xs text-gray-500">
                 PDF, Word, Excel, PowerPoint, Images jusqu&apos;à 10MB
               </p>
             </div>
           </div>

           {/* Liste des fichiers */}
           {files.length > 0 && (
             <div className="mt-6 space-y-4" role="list">
               {files.map((file, index) => (
                 <div 
                   key={index} 
                   className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                   role="listitem"
                 >
                   <div className="flex items-center gap-3">
                     <FileText className="h-5 w-5 text-gray-400" aria-hidden="true" />
                     <div>
                       <p className="text-sm font-medium text-gray-900">{file.name}</p>
                       <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-4">
                     {uploadProgress[file.name] !== undefined && (
                       <div 
                         className="w-24 bg-gray-200 rounded-full h-2"
                         role="progressbar"
                         aria-valuenow={uploadProgress[file.name]}
                         aria-valuemin="0"
                         aria-valuemax="100"
                       >
                         <div
                           className="bg-blue-600 h-2 rounded-full"
                           style={{ width: `${uploadProgress[file.name]}%` }}
                         />
                       </div>
                     )}
                     {uploadProgress[file.name] === 100 ? (
                       <Check className="h-5 w-5 text-green-500" aria-label="Upload terminé" />
                     ) : (
                       <Button
                         variant="ghost"
                         size="icon"
                         onClick={() => removeFile(file)}
                         aria-label={`Supprimer ${file.name}`}
                       >
                         <X className="h-5 w-5 text-gray-400" />
                       </Button>
                     )}
                   </div>
                 </div>
               ))}
             </div>
           )}
         </CardContent>
       </Card>

       <Card className="mb-6">
         <CardContent className="p-6 space-y-6">
           {/* Sélection du cours */}
           <div>
             <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
               Cours <span className="text-red-500" aria-hidden="true">*</span>
             </label>
             <select
               id="course"
               value={selectedCourse}
               onChange={(e) => setSelectedCourse(e.target.value)}
               className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
               required
             >
               <option value="">Sélectionnez un cours</option>
               {courses.map(course => (
                 <option key={course.id} value={course.id}>
                   {course.name}
                 </option>
               ))}
             </select>
           </div>

           {/* Type de document */}
           <div>
             <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-2">
               Type de document <span className="text-red-500" aria-hidden="true">*</span>
             </label>
             <select
               id="documentType"
               value={documentType}
               onChange={(e) => setDocumentType(e.target.value)}
               className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
               required
             >
               <option value="">Sélectionnez un type</option>
               <option value="course">Cours</option>
               <option value="exercise">Exercice</option>
               <option value="exam">Examen</option>
               <option value="other">Autre</option>
             </select>
           </div>
         </CardContent>
       </Card>

       {/* Message d'erreur */}
       {error && (
         <Alert type="error" title="Erreur" message={error} className="mb-6" />
       )}

       {/* Boutons d'action */}
       <div className="flex justify-end gap-4">
         <Button
           variant="outline"
           onClick={() => navigate(-1)}
         >
           Annuler
         </Button>
         <Button
           type="submit"
           variant="primary"
           disabled={uploading || !files.length}
           loading={uploading}
         >
           {uploading ? 'Upload en cours...' : 'Upload'}
         </Button>
       </div>
     </form>
   </div>
 );
};

export default DocumentUpload;