import './App.css'
import {CreateAlias, AliasNotCreated, AliasCreated, DeleteAlias, AliasDeleted, AliasNotDeleted} from './CreateAlias'
import {Modalize} from './Modalize.tsx';
import {Routes, Route} from 'react-router-dom';
function App() {
  return (
    <Modalize>
      <Routes>
        <Route path="/"           element={<CreateAlias/>} />
        <Route path="/create"     element={<CreateAlias/>} />
        <Route path="/created"    element={<AliasCreated/>} />
        <Route path="/notcreated" element={<AliasNotCreated/>} />
        <Route path="/delete"     element={<DeleteAlias/>} />
        <Route path="/deleted"    element={<AliasDeleted/>} />
        <Route path="/notdeleted" element={<AliasNotDeleted/>} />
      </Routes>
    </Modalize>
  )
}

export default App;
