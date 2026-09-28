import { HashRouter, NavLink, Route, Routes } from 'react-router-dom';
import { useConnectionStatus } from './changes';
import { CreateFlatPage } from './pages/CreateFlatPage';
import { FlatDetailsPage } from './pages/FlatDetailsPage';
import { FlatLookupPage } from './pages/FlatLookupPage';
import { FlatsPage } from './pages/FlatsPage';
import { CoordinatesPage, HousesPage } from './pages/RelatedObjectsPage';
import { SpecialOpsPage } from './pages/SpecialOpsPage';

const MENU = [
  { to: '/', label: 'Квартиры', end: true },
  { to: '/flats/new', label: 'Добавить квартиру' },
  { to: '/flats/lookup', label: 'Найти по ID' },
  { to: '/coordinates', label: 'Координаты' },
  { to: '/houses', label: 'Дома' },
  { to: '/special', label: 'Спецоперации' },
];

function ConnectionIndicator() {
  const connected = useConnectionStatus();
  return (
    <span className={connected ? 'status status--online' : 'status status--offline'} title="Обновления в реальном времени">
      {connected ? 'Онлайн' : 'Нет связи'}
    </span>
  );
}

export function App() {
  return (
    <HashRouter>
      <header className="topbar">
        <span className="topbar__brand">Квартиры</span>
        <nav className="menu">
          {MENU.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? 'menu__link menu__link--active' : 'menu__link')}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <ConnectionIndicator />
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<FlatsPage />} />
          <Route path="/flats/new" element={<CreateFlatPage />} />
          <Route path="/flats/lookup" element={<FlatLookupPage />} />
          <Route path="/flats/:id" element={<FlatDetailsPage />} />
          <Route path="/coordinates" element={<CoordinatesPage />} />
          <Route path="/houses" element={<HousesPage />} />
          <Route path="/special" element={<SpecialOpsPage />} />
          <Route path="*" element={<div className="page"><h1>Страница не найдена</h1></div>} />
        </Routes>
      </main>
    </HashRouter>
  );
}
