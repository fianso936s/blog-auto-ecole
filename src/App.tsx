import { Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import StudentLayout from "./layouts/StudentLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/public/HomePage";
import ArticlesPage from "./pages/public/ArticlesPage";
import ArticleDetailPage from "./pages/public/ArticleDetailPage";
import LoginPage from "./pages/public/LoginPage";
import QuizPage from "./pages/public/QuizPage";
import RegisterPage from "./pages/public/RegisterPage";
import DashboardPage from "./pages/admin/DashboardPage";
import ArticlesAdminPage from "./pages/admin/ArticlesAdminPage";
import ArticleEditorPage from "./pages/admin/ArticleEditorPage";
import SettingsPage from "./pages/admin/SettingsPage";
import StudentDashboard from "./pages/student/StudentDashboard";

export default function App() {
  return (
    <Routes>
      {/* Pages publiques */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/articles/:slug" element={<ArticleDetailPage />} />
        <Route path="/quiz" element={<QuizPage />} />
      </Route>

      {/* Auth pages (sans layout) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/inscription" element={<RegisterPage />} />

      {/* Pages élève protégées */}
      <Route
        element={
          <ProtectedRoute>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/eleve" element={<StudentDashboard />} />
      </Route>

      {/* Pages admin protégées */}
      <Route
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<DashboardPage />} />
        <Route path="/admin/articles" element={<ArticlesAdminPage />} />
        <Route path="/admin/articles/new" element={<ArticleEditorPage />} />
        <Route path="/admin/articles/:id/edit" element={<ArticleEditorPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
