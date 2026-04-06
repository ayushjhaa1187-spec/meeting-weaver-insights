import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import Footer from "./Footer";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <main className="flex-1 p-6 lg:p-8 pt-16 lg:pt-8">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
