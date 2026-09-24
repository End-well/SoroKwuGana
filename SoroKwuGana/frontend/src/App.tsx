import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// ── User (public) layout & pages ──────────────────────────────────────────────
import Layout from './user/components/layout/Layout';
import Home from './user/pages/Home';
import About from './user/pages/About';
import Contact from './user/pages/Contact';
import Trending from './user/pages/Trending';
import Reviews from './user/pages/Reviews';
import Advertise from './user/pages/Advertise';
import AdvertConversation from './user/pages/AdvertConversation';
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

// ── Admin layout & pages ──────────────────────────────────────────────────────
import { AuthProvider } from './admin/context/AuthContext';
import ProtectedRoute from './admin/components/ProtectedRoute';
import RoleGuard from './admin/components/RoleGuard';
import AdminLayout from './admin/components/AdminLayout';
import AdminLogin from './admin/pages/Login';
import Dashboard from './admin/pages/Dashboard';
import Posts from './admin/pages/Posts';
import PostEditor from './admin/pages/PostEditor';
import Categories from './admin/pages/Categories';
import Comments from './admin/pages/Comments';
import Users from './admin/pages/Users';
import Settings from './admin/pages/Settings';
import Subscribers from './admin/pages/Subscribers';
import AdminReviews from './admin/pages/AdminReviews';
import Adverts from './admin/pages/Adverts';
import AdvertMessages from './admin/pages/AdvertMessages';

import './App.css';

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

        {/* ── Public user routes ── */}
        <Route element={<Layout />}>
          <Route path="/"                        element={<Home />} />
          <Route path="/article/:slug"           element={<Article />} />
          <Route path="/trending"                element={<Trending />} />
          <Route path="/advertise"               element={<Advertise />} />
          <Route path="/advert/:id"              element={<AdvertConversation />} />
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

        {/* ── Admin routes ── */}
        <Route path="/admin/*" element={<AuthProvider><AdminRoutes /></AuthProvider>} />

      </Routes>
    </BrowserRouter>
  );
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />

      <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        {/* All authenticated users */}
        <Route index                 element={<Dashboard />} />
        <Route path="posts"          element={<Posts />} />
        <Route path="posts/new"      element={<PostEditor />} />
        <Route path="posts/:id/edit" element={<PostEditor />} />
        <Route path="reviews"        element={<AdminReviews />} />
        <Route path="adverts"        element={<RoleGuard minRole="ADMIN"><Adverts /></RoleGuard>} />
        <Route path="adverts/:id/messages" element={<RoleGuard minRole="ADMIN"><AdvertMessages /></RoleGuard>} />

        {/* ADMIN + SUPER_ADMIN only */}
        <Route path="comments"     element={<RoleGuard minRole="ADMIN"><Comments /></RoleGuard>} />
        <Route path="categories"   element={<RoleGuard minRole="ADMIN"><Categories /></RoleGuard>} />
        <Route path="subscribers"  element={<RoleGuard minRole="ADMIN"><Subscribers /></RoleGuard>} />

        {/* SUPER_ADMIN only */}
        <Route path="users" element={<RoleGuard minRole="SUPER_ADMIN"><Users /></RoleGuard>} />

        {/* All authenticated users */}
        <Route path="settings" element={<Settings />} />

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
