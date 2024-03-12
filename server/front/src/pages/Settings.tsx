import Navigation from '../components/navigation/Navigation';
import styles from './Settings.module.css';
import { useContext, useEffect } from 'react';
import { StoreContext } from '..';
import { observer } from 'mobx-react-lite';
import { configure } from "mobx"

configure({
    enforceActions: "never",
})

function Settings() {
    const {settingsStore, flagsStore} = useContext(StoreContext);

    useEffect(() => {
        settingsStore.getSettings();
        settingsStore.getProtocols();
        settingsStore.getValidators();
    }, []);

    const changeSettingsData = (event: React.ChangeEvent<HTMLInputElement>) => {
        let curSettings = settingsStore.settings;

        let new_value = event.target.value;
        if (/^[0-9]+$/.test(new_value) && event.target.name !== "regex_flag_format")
            curSettings[event.target.name] = Number(new_value)
        else
            curSettings[event.target.name] = new_value

        settingsStore.setSettings(curSettings);
    };
    
    const changeSelectData = (event: React.ChangeEvent<HTMLSelectElement>) => {
        let curSettings = settingsStore.settings;
        curSettings[event.target.name] = Number(event.target.value);
        settingsStore.setSettings(curSettings);
        settingsStore.getProtocolParams();
    };
    
    const changeParamValue = (event: React.ChangeEvent<HTMLInputElement>) => {
        let curParamsSettings = settingsStore.protocolParams;
        curParamsSettings[Number(event.target.name.split('_')[2])].protocol_param_value = event.target.value;
        settingsStore.setProtocolParams(curParamsSettings);
    };
    
    const changeValidateActive = (event: React.ChangeEvent<HTMLInputElement>) => {
        let curSettings = settingsStore.validators;
        curSettings[Number(event.target.name)].validator_is_active = event.target.checked;
        settingsStore.setValidatorsSettings(curSettings);
    };
    
    const changeValidateParam = (event: React.ChangeEvent<HTMLInputElement>) => {
        let curSettings = settingsStore.validators;
        const [validatorIdx, paramIdx] = event.target.name.split('__').map((idx: String) => Number(idx.split('_')[1]));
        curSettings[validatorIdx].validator_params[paramIdx].validator_param_value = event.target.value;

        settingsStore.setValidatorsSettings(curSettings);
    };

    function clearFlags(event: React.FormEvent) {
        event.preventDefault();

        flagsStore.clearFlags();
    };

    function updateSettings(event: React.FormEvent) {
        event.preventDefault();

        settingsStore.updateSettings();
    };
    
    return (
        <>
            <Navigation numPage={3} />
            
            <section id="settings" className={styles.settings}>
                <div className="container">
                    <form className={styles.settings__body} onSubmit={updateSettings}>
                        <div className={styles.global__settings}>
                            <h1>Culhwch Settings</h1>
                            <div className={styles.settings__input}>
                                <h2>Regex Flag Format</h2>
                                <input type="text" name="regex_flag_format" placeholder="[A-Z0-9]{31}=" onChange={changeSettingsData} value={settingsStore.settings.regex_flag_format} required/>
                            </div>
                            <div className={styles.settings__input}>
                                <h2>System protocol</h2>
                                <select name="system_protocol_id" className={styles.settings__select} onChange={changeSelectData} value={settingsStore.settings.system_protocol_id}>
                                    <option value="0">Null</option>    
                                    {
                                        settingsStore.protocols.map(function(item){
                                            return <option value={item.protocol_id} key={item.protocol_id}>{item.protocol_name}</option>
                                        })
                                    }
                                </select>
                            </div>
                            <div className={styles.flex__input}>
                                <div className={styles.settings__input}>
                                    <h2>Submit Limit</h2>
                                    <input type="number" name="submit_flag_limit" placeholder="50" onChange={changeSettingsData} value={settingsStore.settings.submit_flag_limit} required/>
                                </div>
                                <div className={styles.settings__input}>
                                    <h2>Submit Period</h2>
                                    <input type="number" name="submit_period" placeholder="5" onChange={changeSettingsData} value={settingsStore.settings.submit_period} required/>
                                </div>
                                <div className={styles.settings__input}>
                                    <h2>Flag Lifetime</h2>
                                    <input type="number" name="flag_lifetime" placeholder="300" onChange={changeSettingsData} value={settingsStore.settings.flag_lifetime} required/>
                                </div>
                                <div className={styles.settings__input}>
                                    <h2>Round Length</h2>
                                    <input type="number" name="round_length" placeholder="120" onChange={changeSettingsData} value={settingsStore.settings.round_length} required/>
                                </div>
                            </div>
                            {settingsStore.protocolParams.length > 0 && <h1>Protocol Settings</h1>}
                            {
                                settingsStore.protocolParams.map(function(protocol_param, paramIdx) {
                                    return <div className={styles.settings__input} key={protocol_param.protocol_param_id}>
                                        <h2>{protocol_param.protocol_param_name}</h2>
                                        <input type="text" name={`protocol_param_${paramIdx}`} onChange={changeParamValue} value={protocol_param.protocol_param_value}/>
                                    </div>
                                })
                            }
                            {settingsStore.validators.length > 0 && <h1>Validators</h1>}
                            {
                                settingsStore.validators.map(function(validator, validatorIdx) {
                                    return <div className={styles.settings__validator}> 
                                        <div className={styles.settings__validator__header} key={validator.validator_id}>
                                            <h2>{validator.validator_name}</h2>
                                            <input type="checkbox" name={String(validatorIdx)} onChange={changeValidateActive} defaultChecked={validator.validator_is_active}/>
                                        </div>
                                        {
                                            validator.validator_is_active && validator.validator_params.map(function(validatorParam, paramIdx){
                                                return <div className={styles.settings__input} key={validatorParam.validator_param_id}>
                                                    <h2>{validatorParam.validator_param_name}</h2>
                                                    <input type="text" name={`validator_${validatorIdx}__param_${paramIdx}`} onChange={changeValidateParam} value={validatorParam.validator_param_value}/>
                                                </div>  
                                            })
                                        }
                                    </div>
                                })
                            }
                            <h1>Other</h1>
                            <button className={flagsStore.deleteFlagsLoading ? styles.button__loading : ''} onClick={clearFlags} disabled={flagsStore.deleteFlagsLoading}>
                                {flagsStore.deleteFlagsLoading ? <div className='button__loading__spinner'></div> : 'Clear flags and exploits'}
                            </button>
                        </div>
                        <button type="submit" className={settingsStore.updateSettingsLoading ? styles.button__loading : ''} disabled={settingsStore.updateSettingsLoading}>
                            {settingsStore.updateSettingsLoading ? <div className='button__loading__spinner'></div> : 'Update'}
                        </button>
                    </form>
                </div>
            </section>
        </>
    )
}

export default observer(Settings);