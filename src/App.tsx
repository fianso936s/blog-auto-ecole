import { Routes, Route, Link } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import StudentLayout from "./layouts/StudentLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LegacyBlogRedirect from "./components/LegacyBlogRedirect";
import HomePage from "./pages/public/HomePage";
import WebedriveLanding from "./pages/WebedriveLanding";
import ArticlesPage from "./pages/public/ArticlesPage";
import ArticleDetailPage from "./pages/public/ArticleDetailPage";
import LoginPage from "./pages/public/LoginPage";
import QuizPage from "./pages/public/QuizPage";
import RegisterPage from "./pages/public/RegisterPage";
import ResetPasswordPage from "./pages/public/ResetPasswordPage";
import AuthConfirmPage from "./pages/public/AuthConfirmPage";
import DashboardPage from "./pages/admin/DashboardPage";
import ArticlesAdminPage from "./pages/admin/ArticlesAdminPage";
import ArticleEditorPage from "./pages/admin/ArticleEditorPage";
import SettingsPage from "./pages/admin/SettingsPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentQuizPage from "./pages/student/StudentQuizPage";
import CoursPage from "./pages/student/CoursPage";

export default function App() {
  return <Routes>
    <Route path="/" element={<WebedriveLanding />} />
    <Route element={<PublicLayout />}>
      <Route path="/blog" element={<HomePage />} />
      <Route path="/blog/articles" element={<ArticlesPage />} />
      <Route path="/blog/articles/:slug" element={<ArticleDetailPage />} />
      <Route path="/blog/quiz" element={<QuizPage />} />
      <Route path="*" element={<div className="blog-container blog-empty"><h1 className="text-3xl font-bold">Page introuvable</h1><p>Retrouvez votre parcours depuis l’accueil.</p><Link to="/">Retour à WEBEDRIVE</Link></div>} />
    </Route>
    <Route path="/articles" element={<LegacyBlogRedirect />} />
    <Route path="/articles/:slug" element={<LegacyBlogRedirect />} />
    <Route path="/quiz" element={<LegacyBlogRedirect />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/inscription" element={<RegisterPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/auth/confirm" element={<AuthConfirmPage />} />
    <Route element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
      <Route path="/eleve" element={<StudentDashboard />} />
      <Route path="/eleve/cours" element={<CoursPage />} />
      <Route path="/eleve/quiz" element={<StudentQuizPage />} />
    </Route>
    <Route element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
      <Route path="/admin" element={<DashboardPage />} />
      <Route path="/admin/articles" element={<ArticlesAdminPage />} />
      <Route path="/admin/articles/new" element={<ArticleEditorPage />} />
      <Route path="/admin/articles/:id/edit" element={<ArticleEditorPage />} />
      <Route path="/admin/settings" element={<SettingsPage />} />
    </Route>
  </Routes>;
}
