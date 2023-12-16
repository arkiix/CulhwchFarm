import {useContext} from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';
import FlagsPage from "./pages/Flags";
import LoginPage from "./pages/Login";
import Teams from './pages/Teams';
import { StoreContext } from '.';
import { observer } from 'mobx-react-lite';
import Settings from './pages/Settings';

function App() {
  const {authStore} = useContext(StoreContext);

  return (
    <>
      <Routes>
        {!authStore.isAuth && <Route path="/login" element={ <LoginPage /> } /> }
        {authStore.isAuth && <Route path="/login" element={ <Navigate to="/" /> } /> }
        {authStore.isAuth && <Route path="/" element={ <FlagsPage /> } /> }
        {authStore.isAuth && <Route path="/teams" element={ <Teams /> } /> }
        {authStore.isAuth && <Route path="/settings" element={ <Settings /> } /> }
        {!authStore.isAuth && <Route path="*" element={ <Navigate to="/login" /> } /> }
        {authStore.isAuth && <Route path='*' element={<Navigate to="/" />} /> }
      </Routes>
    </>
  );
}

export default observer(App);
