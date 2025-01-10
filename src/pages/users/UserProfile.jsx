import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Book, Calendar, Camera, Edit2, Save, X } from 'lucide-react';
import { LoadingOverlay } from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const UserProfile = () => {
 const { id } = useParams();
 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(true);
 const [editing, setEditing] = useState(false);
 const [formData, setFormData] = useState(null);
 const API_URL = import.meta.env.VITE_API_URL;

 const getHeaders = () => ({
   'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
   'Content-Type': 'application/json'
 });

 useEffect(() => {
   const fetchUser = async () => {
     try {
       const response = await fetch(`${API_URL}/users/${id}`, {
         headers: getHeaders()
       });
       
       if (!response.ok) throw new Error('Erreur lors de la récupération du profil');
       const data = await response.json();
       setUser(data.data);
       setFormData({
         firstName: data.data.firstName,
         lastName: data.data.lastName,
         email: data.data.email,
         phone: data.data.phone,
         address: data.data.address
       });
     } catch (error) {
       console.error('Failed to fetch user:', error);
     } finally {
       setLoading(false);
     }
   };

   fetchUser();
 }, [id, API_URL]);

 const handleSubmit = async (e) => {
   e.preventDefault();
   try {
     setLoading(true);
     const response = await fetch(`${API_URL}/users/${id}`, {
       method: 'PATCH',
       headers: getHeaders(),
       body: JSON.stringify(formData)
     });

     if (!response.ok) throw new Error('Erreur lors de la mise à jour');
     const updatedUser = await response.json();
     setUser(updatedUser.data);
     setEditing(false);
   } catch (error) {
     console.error('Failed to update user:', error);
   } finally {
     setLoading(false);
   }
 };

 const handleAvatarUpload = async (event) => {
   const file = event.target.files[0];
   if (!file) return;

   const formData = new FormData();
   formData.append('avatar', file);

   try {
     const response = await fetch(`${API_URL}/users/${id}/avatar`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${localStorage.getItem('jwt')}`
       },
       body: formData
     });

     if (!response.ok) throw new Error('Erreur lors du téléchargement');
     const data = await response.json();
     setUser(prev => ({
       ...prev,
       avatar: data.data.avatar
     }));
   } catch (error) {
     console.error('Failed to upload avatar:', error);
   }
 };
  if (loading) {
    return <LoadingOverlay show text="Chargement du profil..." />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Profil Utilisateur</h1>
        {!editing && (
          <Button
            variant="primary"
            onClick={() => setEditing(true)}
            icon={<Edit2 className="h-5 w-5" />}
          >
            Modifier
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informations Personnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-6">
                  {/* Photo de profil */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div 
                        className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center"
                        role="img"
                        aria-label={user.avatar ? `Photo de profil de ${user.firstName} ${user.lastName}` : "Avatar par défaut"}
                      >
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="h-24 w-24 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-12 w-12 text-gray-400" aria-hidden="true" />
                        )}
                      </div>
                      {editing && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute bottom-0 right-0 bg-white shadow-lg border border-gray-200"
                          onClick={() => document.getElementById('avatar-upload').click()}
                          aria-label="Changer la photo de profil"
                        >
                          <Camera className="h-4 w-4 text-gray-600" />
                          <input
                            id="avatar-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            />
                        </Button>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  {/* Champs de formulaire */}
                  {editing ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                            Prénom
                          </label>
                          <input
                            id="firstName"
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                            Nom
                          </label>
                          <input
                            id="lastName"
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Téléphone
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                          Adresse
                        </label>
                        <textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex justify-end gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setEditing(false)}
                          icon={<X className="h-5 w-5" />}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          icon={<Save className="h-5 w-5" />}
                        >
                          Enregistrer
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        <span>{user.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        <span>{user.address}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Informations académiques */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Académiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div role="group" aria-labelledby="class-info">
                <label id="class-info" className="text-sm text-gray-500">Classe actuelle</label>
                <div className="flex items-center gap-2 mt-1">
                  <Book className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  <span className="font-medium">{user.academicInfo.currentClass}</span>
                </div>
              </div>

              <div role="group" aria-labelledby="admission-date">
                <label id="admission-date" className="text-sm text-gray-500">Date d&apos;admission</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  <time dateTime={user.academicInfo.admissionDate} className="font-medium">
                    {user.academicInfo.admissionDate}
                  </time>
                </div>
              </div>

              <div role="group" aria-labelledby="average-grade">
                <label id="average-grade" className="text-sm text-gray-500">Moyenne générale</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="h-5 w-5 flex items-center justify-center text-gray-400 font-bold" aria-hidden="true">
                    A
                  </span>
                  <span className="font-medium">{user.academicInfo.averageGrade}</span>
                </div>
              </div>

              <div role="group" aria-labelledby="attendance-rate">
                <label id="attendance-rate" className="text-sm text-gray-500">Taux de présence</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="h-5 w-5 flex items-center justify-center text-gray-400" aria-hidden="true">
                    %
                  </span>
                  <span className="font-medium">{user.academicInfo.attendance}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;