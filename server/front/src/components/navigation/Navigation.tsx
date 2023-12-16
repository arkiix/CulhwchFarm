import { useContext } from 'react';
import { StoreContext } from '../..';
import { observer } from 'mobx-react-lite';
import logo from '../../assets/navigation/logo.svg'
import styles from "./Navigation.module.css"
import { useNavigate } from 'react-router-dom';


interface NavigationProps {
    numPage: number;
}

function Navigation({ numPage }: NavigationProps) {
    const {authStore} = useContext(StoreContext);
    const navigate = useNavigate();

    function onLogout() {
        authStore.logout();
        navigate('/login', { replace: true });
    };
    
    return (
        <header id="header" className={styles.header}>
            <div className="container">
                <div className={styles.nav}>
                    <img src={logo} alt="Culhwch Logo" className={styles.logo} />
                    { numPage !== 0 && 
                        <div className={styles.nav__menu} id="menu">
                            <ul className={styles.nav__pages}>
                                <li><a href="/" className={numPage === 1 ? styles.nav__page_active : styles.nav__page}>Flags</a></li>
                                <li><a href="/teams" className={numPage === 2 ? styles.nav__page_active : styles.nav__page}>Teams</a></li>
                                <li><a href="/settings" className={numPage === 3 ? styles.nav__page_active : styles.nav__page}>Settings</a></li>                       
                            </ul>
                            <button className={styles.logout__button} onClick={onLogout}>Logout</button>
                        </div>
                    }
                </div>
            </div>
        </header>
    );
}

export default observer(Navigation);