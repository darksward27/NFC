import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import './index.css';

function App() {
    const [auth, setAuth] = useState(() => {
        const saved = localStorage.getItem('auth');
        return saved ? JSON.parse(saved) : null;
    });

    const handleLogin = (authData) => {
        localStorage.setItem('auth', JSON.stringify(authData));
        setAuth(authData);
    };

    const handleLogout = () => {
        localStorage.removeItem('auth');
        setAuth(null);
    };

    return (
        <div className="App">
            {auth ? (
                <Dashboard 
                    organizationId={auth.organizationId} 
                    onLogout={handleLogout}
                />
            ) : (
                <Login onLogin={handleLogin} />
            )}
        </div>
    );
}

export default App;
