import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import UnverifiedBanner from './components/UnverifiedBanner';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage } from './pages/PasswordPages';
import HomePage         from './pages/HomePage';
import PreferencesPage  from './pages/PreferencesPage';
import SharedWithMePage from './pages/SharedWithMePage';

function Private({ children }) {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary"/></div>;
    if (!isAuthenticated) return <Navigate to="/login" replace/>;
    return <><UnverifiedBanner/>{children}</>;
}
function Guest({ children }) {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return null;
    return isAuthenticated ? <Navigate to="/" replace/> : children;
}

export default function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login"           element={<Guest><LoginPage/></Guest>}/>
                        <Route path="/register"        element={<Guest><RegisterPage/></Guest>}/>
                        <Route path="/forgot-password" element={<Guest><ForgotPasswordPage/></Guest>}/>
                        <Route path="/reset-password"  element={<Guest><ResetPasswordPage/></Guest>}/>
                        <Route path="/verify-email"    element={<VerifyEmailPage/>}/>
                        <Route path="/"                element={<Private><HomePage/></Private>}/>
                        <Route path="/preferences"     element={<Private><PreferencesPage/></Private>}/>
                        <Route path="/shared-with-me"  element={<Private><SharedWithMePage/></Private>}/>
                        <Route path="*"                element={<Navigate to="/" replace/>}/>
                    </Routes>
                </BrowserRouter>
            </ThemeProvider>
        </AuthProvider>
    );
}
