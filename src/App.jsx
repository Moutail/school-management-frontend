import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { AuthProvider } from './contexts/AuthContext';
import store from './store/store';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/layout/PrivateRoute';
import StudentDashboard from './pages/student/StudentDashboard';
import ParentDashboard from './pages/parent/ParentDashboard';
import NotFound from './components/shared/NotFound';
import StudentCourses from './pages/student/StudentCourses';
import StudentSchedule from './pages/student/StudentSchedule';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentDocuments from './pages/student/StudentDocuments';
import MajorDashboard from './pages/major/MajorDashboard';
import MajorActivities from './pages/major/MajorActivities';
import ClassManagement from './pages/major/ClassManagement';
import ProfessorDashboard from './pages/professor/ProfessorDashboard';
import CourseManagement from './pages/professor/CourseManagement';
import AttendanceManagement from './pages/attendance/AttendanceManagement';




function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Routes publiques */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Routes protégées avec Layout */}
            <Route path="/" element={<Layout />}>
              {/* Redirection racine */}
              <Route index element={<Navigate to="/login" replace />} />

              {/* Routes étudiant */}
              <Route path="student">
                <Route
                  index
                  element={
                    <PrivateRoute roles={['student']}>
                      <StudentDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="parent"
                  element={
                    <PrivateRoute roles={['parent']}>
                      <ParentDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="courses"
                  element={
                    <PrivateRoute roles={['student']}>
                      <StudentCourses />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="schedule"
                  element={
                    <PrivateRoute roles={['student']}>
                      <StudentSchedule />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="attendance"
                  element={
                    <PrivateRoute roles={['student']}>
                      <StudentAttendance />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="documents"
                  element={
                    <PrivateRoute roles={['student']}>
                      <StudentDocuments />
                    </PrivateRoute>
                  }
                />
              </Route>

              {/* Routes major */}
              <Route path="major">
                <Route
                  index
                  element={
                    <PrivateRoute roles={['major']}>
                      <MajorDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="activities"
                  element={
                    <PrivateRoute roles={['major']}>
                      <MajorActivities />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="class-management"
                  element={
                    <PrivateRoute roles={['major']}>
                      <ClassManagement />
                    </PrivateRoute>
                  }
                />
              </Route>

              {/* Routes professeur */}
              <Route path="professor">
                <Route
                  index
                  element={
                    <PrivateRoute roles={['professor']}>
                      <ProfessorDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="courses"
                  element={
                    <PrivateRoute roles={['professor']}>
                      <CourseManagement />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="attendance"
                  element={
                    <PrivateRoute roles={['professor']}>
                      <AttendanceManagement />
                    </PrivateRoute>
                  }
                />
              </Route>

              {/* Page 404 */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;