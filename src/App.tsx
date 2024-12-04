import { Provider as StoreProvider } from 'react-redux'
import './App.css'
import MultiPageForm from './Features/MultipageForm'
import { store } from './Redux/store'

function App() {
  
  return (
    <StoreProvider store={store}>
    <MultiPageForm/>    
    </StoreProvider>
  )
}

export default App
