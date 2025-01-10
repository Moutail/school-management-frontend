import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Plus, Calendar, MessageSquare, Trash2 } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { LoadingOverlay } from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import api from '../../services/api';

const activityAPI = {
  getActivities: (params) => api.get('/major/activities', { params }),
  createActivity: (data) => api.post('/major/activities', data),
  updateActivity: (id, data) => api.patch(`/major/activities/${id}`, data),
  deleteActivity: (id) => api.delete(`/major/activities/${id}`)
};

const ACTIVITY_TYPES = {
  EVENT: 'Événement',
  ANNOUNCEMENT: 'Annonce',
  MEETING: 'Réunion'
};

const PriorityBadge = ({ priority }) => {
  const colors = {
    HIGH: 'bg-red-100 text-red-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    LOW: 'bg-green-100 text-green-800'
  };

  const labels = {
    HIGH: 'Haute',
    MEDIUM: 'Moyenne',
    LOW: 'Basse'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${colors[priority]}`}>
      {labels[priority]}
    </span>
  );
};

PriorityBadge.propTypes = {
  priority: PropTypes.oneOf(['HIGH', 'MEDIUM', 'LOW']).isRequired
};

const ActivityCard = ({ activity, onDelete }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            {activity.type === 'EVENT' ? (
              <Calendar className="h-5 w-5 text-blue-600" />
            ) : (
              <MessageSquare className="h-5 w-5 text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium">{activity.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
            <div className="flex items-center mt-2 space-x-4">
              <span className="text-sm text-gray-500">
                {new Date(activity.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <PriorityBadge priority={activity.priority} />
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-800"
          onClick={() => onDelete(activity._id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

ActivityCard.propTypes = {
  activity: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    priority: PropTypes.oneOf(['HIGH', 'MEDIUM', 'LOW']).isRequired
  }).isRequired,
  onDelete: PropTypes.func.isRequired
};

const MajorActivities = () => {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [showNewActivityForm, setShowNewActivityForm] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    type: 'EVENT',
    date: '',
    priority: 'MEDIUM'
  });

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await activityAPI.getActivities();
      setActivities(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des activités:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleSubmitActivity = async (e) => {
    e.preventDefault();
    try {
      await activityAPI.createActivity(newActivity);
      setShowNewActivityForm(false);
      setNewActivity({
        title: '',
        description: '',
        type: 'EVENT',
        date: '',
        priority: 'MEDIUM'
      });
      fetchActivities();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette activité ?')) {
      try {
        await activityAPI.deleteActivity(activityId);
        fetchActivities();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  if (loading) {
    return <LoadingOverlay show text="Chargement des activités..." />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Activités de Classe</h1>
        <Button onClick={() => setShowNewActivityForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Activité
        </Button>
      </div>

      {/* Formulaire nouvelle activité */}
      {showNewActivityForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nouvelle Activité</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitActivity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type d&apos;activité</label>
                <select
                  value={newActivity.type}
                  onChange={(e) => setNewActivity({...newActivity, type: e.target.value})}
                  className="w-full border rounded-md p-2"
                >
                  {Object.entries(ACTIVITY_TYPES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Titre</label>
                <input
                  type="text"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                  className="w-full border rounded-md p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                  className="w-full border rounded-md p-2"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="datetime-local"
                    value={newActivity.date}
                    onChange={(e) => setNewActivity({...newActivity, date: e.target.value})}
                    className="w-full border rounded-md p-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Priorité</label>
                  <select
                    value={newActivity.priority}
                    onChange={(e) => setNewActivity({...newActivity, priority: e.target.value})}
                    className="w-full border rounded-md p-2"
                  >
                    <option value="LOW">Basse</option>
                    <option value="MEDIUM">Moyenne</option>
                    <option value="HIGH">Haute</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewActivityForm(false)}
                >
                  Annuler
                </Button>
                <Button type="submit">
                  Créer l&apos;activité
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Liste des activités */}
      <div className="space-y-4">
        {activities.map((activity) => (
          <ActivityCard 
            key={activity._id} 
            activity={activity} 
            onDelete={handleDeleteActivity}
          />
        ))}

        {activities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Aucune activité pour le moment
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MajorActivities;