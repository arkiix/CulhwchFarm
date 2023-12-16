import { observer } from 'mobx-react-lite';
import {ReactComponent as SwitchGraphIcon} from '../assets/flags/switch_graph.svg';
import Navigation from '../components/navigation/Navigation';
import FlagsArea from "../components/flags/Area";
import FlagsDoughnut from "../components/flags/Doughnut";
import styles from './Flags.module.css';
import { useContext, useEffect, useState } from 'react';
import { StoreContext } from '..';


function Flags() {
    const {flagsStore} = useContext(StoreContext);
    const [manualFlag, setManualFlag] = useState('');

    useEffect(() => {
		updatePageData();

        const interval = setInterval(() => {
            updatePageData();
        }, 3000);
    
        return () => clearInterval(interval);
    }, []);

    const changeManualFlag = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.persist();
        setManualFlag(event.target.value);
    };

    function submitManualFlag (event: React.FormEvent) {
        event.preventDefault();
        flagsStore.submitFlag(manualFlag);
    }

    function updatePageData () {
        flagsStore.getFlags();
		flagsStore.getFlagsInfo();
		flagsStore.getSploits();
    }

    function changeGraph () {
        flagsStore.setGraph();
    }

    const changeSelectData = (event: React.ChangeEvent<HTMLSelectElement>) => {
        let sploitId = parseInt(event.target.value);

        flagsStore.setSploitId(isNaN(sploitId) ? null : sploitId);
        updatePageData();
    };
                                    
    return (
        <>
            <Navigation numPage={1}/>
            
            <section id="flags" className={styles.flags}>
                <div className="container">
                    <div className={styles.flags__windows}>
                        <div className={styles.flags__info}>
                            <div className={styles.flags__info__content}>
                                <h1>Info</h1>
                                <div className={styles.flags__info__metrics}>
                                    <p>Total flags: {flagsStore.flagsInfo.total_flags}</p>
                                    <p>Last 10 minutes: {flagsStore.flagsInfo.latest_flags}</p>
                                    <p>Last round: {flagsStore.flagsInfo.rounds_info ? flagsStore.flagsInfo.rounds_info[flagsStore.flagsInfo.rounds_info.length - 2] : 0}</p>
                                    <br />
                                    <p>Exploits: {flagsStore.flagsInfo.exploits}</p>
                                </div>
                                <div className={styles.flags__control}>
                                    <select className={styles.exploit__select} onChange={changeSelectData} value={String(flagsStore.sploitId)}>
                                        <option>All</option>
                                        {
                                            flagsStore.sploits.map(function(item){
                                                return <option value={item.sploit_id} key={item.sploit_id}>{item.sploit_name}</option>
                                            })
                                        }
                                    </select>
                                    <button className={styles.switch__graph} onClick={changeGraph}><SwitchGraphIcon /></button>
                                </div>
                            </div>
                            {flagsStore.graph === 1 && <div className={styles.flags__doughnut}>
                                <FlagsDoughnut />
                            </div>}
                            {flagsStore.graph === 2 && <div className={styles.flags__area}>
                                <FlagsArea />
                            </div>}
                        </div>
                        <form className={styles.flags__submit} onSubmit={submitManualFlag}>
                            <div className={styles.flags__submit__header}>
                                <h1>Manual check</h1>
                                <button type="submit" className={flagsStore.submitFlagLoading ? styles.button__loading : ''} disabled={flagsStore.submitFlagLoading}>
                                    {flagsStore.submitFlagLoading ? <div className='button__loading__spinner'></div> : 'Submit'}
                                </button>
                            </div>
                            <input type="text" onChange={changeManualFlag} required/>
                        </form>
                    </div>
                    <table className={styles.flags__table}>
                        <thead>
                            <tr>
                                <th>Sploit</th>
                                <th>Team</th>
                                <th>Flag</th>
                                <th>Time</th>
                                <th>Status</th>
                                <th>Response</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                flagsStore.flags.map(function(item, i){
                                    return <tr key={i.toString()}>
                                        <td>{item.sploit_name}</td>
                                        <td>{item.team_name}</td>
                                        <td>{item.flag}</td>
                                        <td>{item.create_dt}</td>
                                        <td>{item.status_name}</td>
                                        <td>{item.response}</td>
                                    </tr>
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    )
}

export default observer(Flags);