import './App.scss'
import { Main } from './components/layouts/Main'
import { Sidebar } from './components/layouts/Sidebar'

function App() {
  return (
    <>
      <div
        className={`min-h-screen w-full bg-gray-900 text-gray-600 transition-all duration-500`}>
        <Main />
        <Sidebar />
      </div>
    </>
  )
}

export default App
