import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
    const { pathname } = useLocation();
    // Sahifa almashganda tepaga scroll
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <>
            <Header />
            <main className="container min-h-[60vh]">
                <Outlet />
            </main>
            <Footer />
        </>
    );
}
