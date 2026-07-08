import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Stub pages — will be built out
const Posts = () => <div className="text-gray-900"><h1 className="text-2xl font-black mb-2">Posts</h1><p className="text-gray-500">Manage all blog posts.</p></div>;
const Categories = () => <div className="text-gray-900"><h1 className="text-2xl font-black mb-2">Categories</h1><p className="text-gray-500">Manage categories.</p></div>;
const Comments = () => <div className="text-gray-900"><h1 className="text-2xl font-black mb-2">Comments</h1><p className="text-gray-500">Moderate comments.</p></div>;
const Users = () => <div className="text-gray-900"><h1 className="text-2xl font-black mb-2">Users</h1><p className="text-gray-500">Manage authors and admins.</p></div>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/comments" element={<Comments />} />
            <Route path="/users" element={<Users />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
