import {useState, useEffect, useRef} from 'react';
import {useAuth} from "../context/AuthContext";
import "./styles/ProfileModal.css"

const ProfileModalDesktop = ({onClose}) => {
    const {authFetch, user} = useAuth();
    const [initialName, setInitialName] = useState('');
    const [initialEmail, setInitialEmail] = useState('');

    const [initialCreatedAt, setInitialCreatedAt] = useState('');
    const [initialLastLogin, setInitialLastLogin] = useState('');

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');


    const [createdAt, setCreatedAt] = useState('');
    const [lastLogin, setLastLogin] = useState('');


    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const avatarSrc = isMobile
        ? require('../assets/Icon.png')
        : require('../assets/Icon@1x.png');
    const handleSaveProfileTask = async () => {
        const taskData = {
            name: name || null,   // соответствие *string
            email: email || null, // соответствие *string
        };

        console.log('Обновление профиля:', taskData);

        try {
            const response = await authFetch('http://gustav.website:8010/api/user/update', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(taskData),
            });

            if (response.ok) {
                window.location.reload(); // 🔄 Перезагрузка страницы
            } else {
                const errorData = await response.json();
                console.error('Ошибка при обновлении профиля:', errorData);
            }
        } catch (error) {
            console.error('Сетевая ошибка:', error);
        }
    };

    useEffect(() => {
        if (user) {
            const nameVal = user.name || '';
            const emailVal = user.email || '';
            const lastLoginRaw = user.last_login || '';
            const createdAtRaw = user.created_at || '';

            const formatDate = (dateStr: string) => {
                const date = new Date(dateStr);
                return date.toLocaleString('ru-RU', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                }).replace(',', '');
            };

            const lastLoginVal = lastLoginRaw ? formatDate(lastLoginRaw) : '';
            const createdAtVal = createdAtRaw ? formatDate(createdAtRaw) : '';

            setInitialName(nameVal);
            setInitialEmail(emailVal);

            setInitialLastLogin(lastLoginVal);
            setInitialCreatedAt(createdAtVal);

            setName(nameVal);
            setEmail(emailVal);

            setLastLogin(lastLoginVal);
            setCreatedAt(createdAtVal);
        }
    }, [user]);

    const isChanged = name !== initialName || email !== initialEmail;

    return (
        <div className="modal-overlay-profile" onClick={onClose}>
            <div className="modal-profile-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-button-profile" onClick={onClose}>Закрыть</button>
                <p className="modal-title-profile">
                    Профиль
                </p>

                <img src={avatarSrc} alt="Аватар" className="profile-avatar"/>

                <div className="profile-extra-rectangle">
                    <p className="title-profile">Контактная информация</p>

                    <div className="profile-field">
                        <label htmlFor="name">Имя</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="profile-field">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="profile-field">
                        <label htmlFor="last_login">Дата и время последнего входа</label>
                        <input
                            type="text"
                            id="last_login"
                            value={lastLogin}
                            disabled={true}
                        />
                    </div>
                    <div className="profile-field">
                        <label htmlFor="created_at">Дата регистрации аккаунта</label>
                        <input
                            type="text"
                            id="created_at"
                            value={createdAt}
                            disabled={true}
                        />
                    </div>
                </div>

                <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem'}}>
                    <button
                        className="edit-profile-button"
                        onClick={handleSaveProfileTask}
                        disabled={!isChanged}  // кнопка неактивна, если проект не выбран
                        style={{
                            cursor: !isChanged ? 'not-allowed' : 'pointer',
                            opacity: !isChanged ? 0.5 : 1,
                        }}
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileModalDesktop;