import { observer } from 'mobx-react-lite';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '..';
import Navigation from '../components/navigation/Navigation';
import styles from './Login.module.css';


function Login() {
    const {authStore} = useContext(StoreContext);
    const [password, setPassword] = useState('');
    
    const navigate = useNavigate();

    const submitLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        await authStore.login(password);
        
        if (authStore.isAuth) {
            navigate('/', { replace: true });
        };
    };

    const changeInputPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.persist()

        setPassword(event.target.value);
    }

    return (
        <>
            <Navigation numPage={0} />
            
            <div className={styles.login}>
                <h1 className={styles.login__header}>Login</h1>

                <form className={styles.login__form} onSubmit={submitLogin}>
                    <div className={styles.login__form__content}>
                        <div className={styles.login__form__input}>
                            <h2>Password</h2>
                            <input className="password" type="password" onChange={changeInputPassword}/>
                        </div>
                    </div>
                    <button className={styles.login__form__button} type="submit">Submit</button>
                </form>
            </div>
        </>
    )
}

export default observer(Login);