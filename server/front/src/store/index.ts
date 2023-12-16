import {injectStores} from '@mobx-devtools/tools';

import AuthStore from './AuthStore';
import FlagsStore from './FlagsStore';
import TeamsStore from './TeamsStore';
import SettingsStore from './SettingsStore';

injectStores({
    AuthStore,
    FlagsStore,
    TeamsStore,
    SettingsStore
});

export {AuthStore, FlagsStore, TeamsStore, SettingsStore};