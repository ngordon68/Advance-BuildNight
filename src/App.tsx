import Header from './components/Header'
import MapPage from './pages/MapPage'

export default function App() {
  return (
    <div className="relative h-full overflow-hidden">
      <MapPage />
      <Header />
    </div>
  )
}
