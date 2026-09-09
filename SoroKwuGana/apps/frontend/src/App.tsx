import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ── User (public) ─────────────────────────────────────────────────────────────
import Layout from './user/components/layout/Layout';
import Home from './user/pages/Home';
import About from './user/pages/About';
import Contact from './user/pages/Contact';
import Trending from './user/pages/Trending';
import Reviews from './user/pages/Reviews';
import Article from './user/pages/Article';
import Movies from './user/pages/categories/Movies';
import TVShows from './user/pages/categories/TVShows';
import Music from './user/pages/categories/Music';
import Celebrity from './user/pages/categories/Celebrity';
import Fashion from './user/pages/categories/Fashion';
import Beauty from './user/pages/categories/Beauty';
import Health from './user/pages/categories/Health';
import Travel from './user/pages/categories/Travel';
import Food from './user/pages/categories/Food';

// ── Admin ─────────────────────────────────────────────────────────────────────
import { AuthProvider } from './admin/context/AuthContext';
import ProtectedRoute from './admin/components/ProtectedRoute';
import AdminLayout from './admin/components/AdminLayout';
import AdminLogin from './admin/pages/Login';
import Dashboard from './admin/pages/Dashboard';

import './App.css';

// Admin stub pages
const AdminPosts      = () => <div className="text-gray-900 dark:text-white"><h1 className="text-2xl font-black mb-2">Posts</h1><p className="text-gray-500">Manage all blog posts.</p></div>;
const AdminCategories = () => <div className="text-gray-900 dark:text-white"><h1 className="text-2xl font-black mb-2">Categories</h1><p className="text-gray-500">Manage categories.</p></div>;
const AdminComments   = () => <div className="text-gray-900 dark:text-white"><h1 className="text-2xl font-black mb-2">Comments</h1><p className="text-gray-500">Moderate comments.</p></div>;
const AdminUsers      = () => <div className="text-gray-900 dark:text-white"><h1 className="text-2xl font-black mb-2">Users</h1><p className="text-gray-500">Manage authors and admins.</p></div>;

function NotFound() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-32 text-center">
      <p className="text-8xl font-black gradient-text">404</p>
      <h1 className="mt-4 font-display font-black text-3xl text-gray-900 dark:text-white">Page Not Found</h1>
      <p className="mt-2 text-gray-500">Looks like this story got lost. Let's get you back to the good stuff.</p>
      <a href="/" className="mt-8 inline-flex items-center gap-2 bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-bold px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity shadow-lg">
        ← Back to Home
      </a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Admin routes — /admin/* ──────────────────────────────────────── */}
        <Route path="/admin/login" element={
          <AuthProvider><AdminLogin /></AuthProvider>
        } />
        <Route path="/admin/*" element={
          <AuthProvider>
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          </AuthProvider>
        }>
          <Route index element={<Dashboard />} />
          <Route path="posts"      element={<AdminPosts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="comments"   element={<AdminComments />} />
          <Route path="users"      element={<AdminUsers />} />
        </Route>

        {/* ── Public user routes ───────────────────────────────────────────── */}
        <Route element={<Layout />}>
          <Route path="/"                        element={<Home />} />
          <Route path="/article/:slug"           element={<Article />} />
          <Route path="/trending"                element={<Trending />} />
          <Route path="/reviews"                 element={<Reviews />} />
          <Route path="/about"                   element={<About />} />
          <Route path="/contact"                 element={<Contact />} />
          <Route path="/entertainment/movies"    element={<Movies />} />
          <Route path="/entertainment/tv-shows"  element={<TVShows />} />
          <Route path="/entertainment/music"     element={<Music />} />
          <Route path="/entertainment/celebrity" element={<Celebrity />} />
          <Route path="/lifestyle/fashion"       element={<Fashion />} />
          <Route path="/lifestyle/beauty"        element={<Beauty />} />
          <Route path="/lifestyle/health"        element={<Health />} />
          <Route path="/lifestyle/travel"        element={<Travel />} />
          <Route path="/lifestyle/food"          element={<Food />} />
          <Route path="*"                        element={<NotFound />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
