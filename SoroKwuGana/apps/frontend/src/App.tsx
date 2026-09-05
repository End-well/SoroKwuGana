import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Trending from './pages/Trending';
import Reviews from './pages/Reviews';
import Article from './pages/Article';
import Movies from './pages/categories/Movies';
import TVShows from './pages/categories/TVShows';
import Music from './pages/categories/Music';
import Celebrity from './pages/categories/Celebrity';
import Fashion from './pages/categories/Fashion';
import Beauty from './pages/categories/Beauty';
import Health from './pages/categories/Health';
import Travel from './pages/categories/Travel';
import Food from './pages/categories/Food';
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
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/article/:slug" element={<Article />} />
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
