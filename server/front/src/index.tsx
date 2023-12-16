import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import { AuthStore, FlagsStore, TeamsStore, SettingsStore } from './store';
import { createContext } from 'react';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const authStore = new AuthStore();
const flagsStore = new FlagsStore();
const teamsStore = new TeamsStore();
const settingsStore = new SettingsStore();

interface IStore {
  authStore: AuthStore,
  flagsStore: FlagsStore,
  teamsStore: TeamsStore,
  settingsStore: SettingsStore
}

export const StoreContext = createContext<IStore>({
  authStore, flagsStore, teamsStore, settingsStore
})

authStore.initAuth();

root.render(
  <BrowserRouter>
    <StoreContext.Provider value={{
      authStore, flagsStore, teamsStore, settingsStore
    }}>
      <App />
    </StoreContext.Provider>
  </BrowserRouter>
);
