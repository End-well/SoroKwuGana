import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Posts from './pages/Posts';
import PostEditor from './pages/PostEditor';
import Categories from './pages/Categories';
import Comments from './pages/Comments';
import Users from './pages/Users';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route path="/"                  element={<Dashboard />} />
            <Route path="/posts"             element={<Posts />} />
            <Route path="/posts/new"         element={<PostEditor />} />
            <Route path="/posts/:id/edit"    element={<PostEditor />} />
            <Route path="/categories"        element={<Categories />} />
            <Route path="/comments"          element={<Comments />} />
            <Route path="/users"             element={<Users />} />
            <Route path="*"                  element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
