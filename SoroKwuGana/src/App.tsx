import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Trending from './pages/Trending';
import Reviews from './pages/Reviews';
import Movies from './pages/categories/Movies';
import TVShows from './pages/categories/TVShows';
import Music from './pages/categories/Music';
import Celebrity from './pages/categories/Celebrity';
import Fashion from './pages/categories/Fashion';
import Beauty from './pages/categories/Beauty';
import Health from './pages/categories/Health';
import Travel from './pages/categories/Travel';
import Food from './pages/categories/Food';

function NotFound() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 lg:px-6 py-24 text-center">
      <h1 className="text-6xl font-black text-gray-900 dark:text-white">404</h1>
      <p className="mt-4 text-gray-500 text-lg">Page not found.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Entertainment */}
          <Route path="/entertainment/movies" element={<Movies />} />
          <Route path="/entertainment/tv-shows" element={<TVShows />} />
          <Route path="/entertainment/music" element={<Music />} />
          <Route path="/entertainment/celebrity" element={<Celebrity />} />

          {/* Lifestyle */}
          <Route path="/lifestyle/fashion" element={<Fashion />} />
          <Route path="/lifestyle/beauty" element={<Beauty />} />
          <Route path="/lifestyle/health" element={<Health />} />
          <Route path="/lifestyle/travel" element={<Travel />} />
          <Route path="/lifestyle/food" element={<Food />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
