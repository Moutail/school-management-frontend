import { Home, Users, BookOpen, Calendar, FileText, 
    ClipboardList, Settings, Bell } from 'lucide-react';

// Configuration des routes
export const routes = [
{
path: '/dashboard',
name: 'Dashboard',
icon: Home,
component: 'Dashboard',
roles: ['admin', 'professor', 'student', 'parent']
},
{
path: '/users',
name: 'Utilisateurs',
icon: Users,
component: 'UserList',
roles: ['admin'],
children: [
 {
   path: ':id',
   name: 'Profil Utilisateur',
   component: 'UserProfile',
   hidden: true
 }
]
},
{
path: '/courses',
name: 'Cours',
icon: BookOpen,
component: 'CourseList',
roles: ['admin', 'professor', 'student'],
children: [
 {
   path: ':id',
   name: 'Détail du Cours',
   component: 'CourseDetail',
   hidden: true
 }
]
},
{
path: '/schedule',
name: 'Emploi du temps',
icon: Calendar,
component: 'Schedule',
roles: ['admin', 'professor', 'student']
},
{
path: '/documents',
name: 'Documents',
icon: FileText,
component: 'DocumentList',
roles: ['admin', 'professor', 'student'],
children: [
 {
   path: 'upload',
   name: 'Upload Document',
   component: 'DocumentUpload',
   hidden: true
 }
]
},
{
path: '/attendance',
name: 'Présences',
icon: ClipboardList,
component: 'AttendanceManagement',
roles: ['admin', 'professor']
},
{
path: '/notifications',
name: 'Notifications',
icon: Bell,
component: 'Notifications',
roles: ['admin', 'professor', 'student', 'parent']
},
{
path: '/settings',
name: 'Paramètres',
icon: Settings,
component: 'Settings',
roles: ['admin', 'professor', 'student', 'parent']
}
];

// Fonctions utilitaires pour la gestion des routes
export const routeUtils = {
// Récupérer toutes les routes accessibles pour un rôle donné
getAccessibleRoutes: (userRole) => {
return routes.filter(route => route.roles.includes(userRole));
},

// Vérifier si un utilisateur a accès à une route
hasAccess: (path, userRole) => {
const route = routes.find(r => r.path === path);
return route && route.roles.includes(userRole);
},

// Obtenir le composant pour une route donnée
getRouteComponent: (path) => {
const route = routes.find(r => r.path === path);
return route ? route.component : null;
},

// Obtenir le breadcrumb pour une route donnée
getBreadcrumb: (path) => {
const parts = path.split('/').filter(Boolean);
const breadcrumb = [];
let currentPath = '';

parts.forEach(part => {
 currentPath += `/${part}`;
 const route = routes.find(r => r.path === currentPath);
 if (route) {
   breadcrumb.push({
     path: currentPath,
     name: route.name
   });
 }
});

return breadcrumb;
}
};

// Configuration des redirections
export const redirects = {
// Redirection après connexion basée sur le rôle
afterLogin: {
admin: '/dashboard',
professor: '/courses',
student: '/schedule',
parent: '/dashboard'
},

// Redirection par défaut pour les routes non autorisées
unauthorized: '/dashboard',

// Redirection pour les routes non trouvées
notFound: '/404'
};

// Pages publiques (accessibles sans authentification)
export const publicPages = [
'/login',
'/register',
'/forgot-password',
'/reset-password',
'/404',
'/500'
];

export default {
routes,
routeUtils,
redirects,
publicPages
};