import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Filter, Edit, Trash2, Shield } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card, { CardContent } from '../../components/ui/card';
import { LoadingOverlay } from '../../components/ui/Loading';

const UserList = () => {
 const API_URL = import.meta.env.VITE_API_URL;
 const [users, setUsers] = useState([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 const [filter, setFilter] = useState('all');
 const navigate = useNavigate();

 const getHeaders = () => ({
   'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
   'Content-Type': 'application/json'
 });

 const roleColors = {
   admin: 'bg-red-100 text-red-800',
   professor: 'bg-blue-100 text-blue-800', 
   student: 'bg-green-100 text-green-800',
   parent: 'bg-purple-100 text-purple-800'
 };

 useEffect(() => {
   const fetchUsers = async () => {
     try {
       const response = await fetch(`${API_URL}/users`, {
         headers: getHeaders()
       });
       
       if (!response.ok) throw new Error('Erreur lors de la récupération des utilisateurs');
       const data = await response.json();
       setUsers(data.data);
     } catch (error) {
       console.error('Failed to fetch users:', error);
     } finally {
       setLoading(false);
     }
   };

   fetchUsers();
 }, [API_URL]);

 const handleDeleteUser = async (userId) => {
   if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
   
   try {
     const response = await fetch(`${API_URL}/users/${userId}`, {
       method: 'DELETE',
       headers: getHeaders()
     });

     if (!response.ok) throw new Error('Erreur lors de la suppression');
     setUsers(users.filter(user => user.id !== userId));
   } catch (error) {
     console.error('Failed to delete user:', error);
   }
 };

 const handleUpdateRole = async (userId, role) => {
   try {
     const response = await fetch(`${API_URL}/users/${userId}/role`, {
       method: 'PATCH',
       headers: getHeaders(),
       body: JSON.stringify({ role })
     });

     if (!response.ok) throw new Error('Erreur lors de la mise à jour du rôle');
     const updatedUser = await response.json();
     setUsers(users.map(user => 
       user.id === userId ? { ...user, role: updatedUser.data.role } : user
     ));
   } catch (error) {
     console.error('Failed to update role:', error);
   }
 };

 const filteredUsers = users.filter(user => {
   const matchesSearch = 
     user.firstName.toLowerCase().includes(search.toLowerCase()) ||
     user.lastName.toLowerCase().includes(search.toLowerCase()) ||
     user.email.toLowerCase().includes(search.toLowerCase());
   
   const matchesFilter = filter === 'all' || user.role === filter;
   return matchesSearch && matchesFilter;
 });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/users/new')}
          icon={<UserPlus className="h-5 w-5" aria-hidden="true" />}
        >
          Nouvel Utilisateur
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" aria-hidden="true" />
              <input
                type="search"
                placeholder="Rechercher un utilisateur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Rechercher un utilisateur"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 h-5 w-5" aria-hidden="true" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filtrer par rôle"
              >
                <option value="all">Tous les rôles</option>
                <option value="student">Étudiants</option>
                <option value="professor">Professeurs</option>
                <option value="parent">Parents</option>
                <option value="admin">Administrateurs</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <LoadingOverlay show text="Chargement des utilisateurs..." />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" role="grid">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center" aria-hidden="true">
                          <span className="text-gray-600 font-medium">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[user.role]}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/users/${user.id}`)}
                          aria-label="Modifier l'utilisateur"
                        >
                          <Edit className="h-5 w-5 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(user.id)}
                          aria-label="Supprimer l'utilisateur"
                        >
                          <Trash2 className="h-5 w-5 text-red-600" />
                        </Button>
                        {user.role !== 'admin' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUpdateRole(user.id, 'admin')}
                            aria-label="Gérer les rôles"
                          >
                            <Shield className="h-5 w-5 text-purple-600" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;