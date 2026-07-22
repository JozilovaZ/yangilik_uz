import Hero from "../components/Hero";
import CategoryBlocks from "../components/CategoryBlocks";
import CurrencySection from "../components/CurrencySection";
import WeatherSection from "../components/WeatherSection";

export default function HomePage() {
    return (
        <>
            <Hero />
            <CategoryBlocks />

            {/* Yangilik / Valyuta / Ob-havo bo'limlarini ko'zга ko'rinarli ajratamiz */}
            <div className="mt-14 pt-14 border-t border-line">
                <CurrencySection />
            </div>

            <div className="mt-14 pt-14 border-t border-line">
                <WeatherSection />
            </div>
        </>
    );
}
