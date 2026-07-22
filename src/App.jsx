import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import ArticlePage from "./pages/ArticlePage";
import CurrencyPage from "./pages/CurrencyPage";
import CurrencyDetailPage from "./pages/CurrencyDetailPage";
import WeatherPage from "./pages/WeatherPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/kategoriya/:slug" element={<CategoryPage />} />
                    <Route path="/maqola/:slug" element={<ArticlePage />} />
                    <Route path="/valyuta" element={<CurrencyPage />} />
                    <Route path="/valyuta/:code" element={<CurrencyDetailPage />} />
                    <Route path="/ob-havo" element={<WeatherPage />} />
                    <Route path="/kirish" element={<LoginPage />} />
                    <Route path="/royxat" element={<RegisterPage />} />
                    <Route path="/profil" element={<ProfilePage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
