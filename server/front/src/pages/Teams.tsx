import Navigation from '../components/navigation/Navigation';
import {ReactComponent as DeleteButton} from '../assets/teams/delete.svg';
import styles from './Teams.module.css';
import { useContext, useEffect, useState } from 'react';
import { StoreContext } from '..';
import { observer } from 'mobx-react-lite';


function Teams() {
    const {teamsStore} = useContext(StoreContext);

    useEffect(() => {
        teamsStore.getTeams();
    }, []);

    const [genData, setGenData] = useState(() => {
        return {
            name_template: '',
            ip_template: '',
            start_num: '0',
            count_teams: 0
        }
    })

    const [addTeamData, setAddTeamData] = useState(() => {
        return {
            team_ip: '',
            team_name: ''
        }
    })

    const changeAddTeamData = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.persist()
        setAddTeamData(prev => {
            return {
                ...prev,
                [event.target.name]: event.target.value,
            }
        })
    };

    const changeGenerateTeamsData = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.persist()
        setGenData(prev => {
            return {
                ...prev,
                [event.target.name]: event.target.value,
            }
        })
    };

    function deleteTeams(e: React.MouseEvent<HTMLButtonElement>, teamId: number | null) {
        teamsStore.deleteTeams(teamId);
    };

    function generateTeams(event: React.FormEvent) {
        event.preventDefault();
        teamsStore.generateTeams(genData);
    };

    function addTeam(event: React.FormEvent) {
        event.preventDefault();
        teamsStore.addTeam(addTeamData);
    };

    return (
        <>
            <Navigation numPage={2} />
            
            <section id="teams" className={styles.teams}>
                <div className={["container", styles.teams__container].join(" ")}>
                    <table className={styles.teams__table}>
                        <thead>
                            <tr>
                                <th>Team</th>
                                <th>IP</th>
                                <th><button onClick={event => deleteTeams(event, null)} className={styles.delete__team__button_all}><DeleteButton /></button></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                teamsStore.teams.map(function(item){
                                    return <tr key={item.team_id.toString()}>
                                        <td>{item.team_name}</td>
                                        <td>{item.team_ip}</td>
                                        <td><button onClick={event => deleteTeams(event, item.team_id)} className={styles.delete__team__button}><DeleteButton /></button></td>
                                    </tr>
                                })
                            }
                        </tbody>
                    </table>
                    <div className={styles.team__windows}>
                        <form className={styles.team__add} onSubmit={addTeam}>
                            <div className={styles.team__add__header}>
                                <h1>Add Team</h1>
                                <button type="submit" className={teamsStore.addTeamLoading ? styles.button__loading : ''} disabled={teamsStore.addTeamLoading}>
                                    {teamsStore.addTeamLoading ? <div className='button__loading__spinner'></div> : 'ADD'}
                                </button>
                            </div>
                            <div className={styles.team__add__input}>
                                <h2>Team</h2>
                                <input type="text" className={styles.team__name} placeholder="89cr3w" name="team_name" onChange={changeAddTeamData} required/>
                            </div>
                            <div className={styles.team__add__input}>
                                <h2>IP</h2>
                                <input type="text" className={styles.team__ip} placeholder="192.168.0.1" name="team_ip" onChange={changeAddTeamData} required/>
                            </div>
                        </form>
                        <form className={styles.team__generate} onSubmit={generateTeams}>
                            <div className={styles.team__add__header}>
                                <h1>Generate Teams</h1>
                                <button type="submit" className={teamsStore.genTeamsLoading ? styles.button__loading : ''} disabled={teamsStore.genTeamsLoading}>
                                    {teamsStore.genTeamsLoading ? <div className='button__loading__spinner'></div> : 'GEN'}
                                </button>
                            </div>
                            <div className={styles.team__add__row}>
                                <div className={styles.team__add__input}>
                                    <h2>Name template</h2>
                                    <input type="text" className={styles.team__name} placeholder="Team #$" name="name_template" onChange={changeGenerateTeamsData} required/>
                                </div>
                                <div className={styles.team__add__input_r}>
                                    <h2>Start with</h2>
                                    <input type="text" className={styles.team__ip} placeholder="0" name="start_num" onChange={changeGenerateTeamsData} required/>
                                </div>
                            </div>
                            <div className={styles.team__add__row}>
                                <div className={styles.team__add__input}>
                                    <h2>IP template</h2>
                                    <input type="text" className={styles.team__ip} placeholder="192.168.0.$" name="ip_template" onChange={changeGenerateTeamsData} required/>
                                </div>
                                <div className={styles.team__add__input_r}>
                                    <h2>Count</h2>
                                    <input type="number" className={styles.team__ip} placeholder="0" name="count_teams" onChange={changeGenerateTeamsData} required/>
                                </div>
                            </div>
                            <p>$ - template parameter</p>
                        </form>
                    </div>
                </div>
            </section>
        </>
    )
}

export default observer(Teams);