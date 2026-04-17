import { Route, Routes, BrowserRouter } from 'react-router-dom'
import ReactDOM from "react-dom/client";
import MainPage from "./components/main/mainPage";
import AdminConsole from "./components/admin/adminConsole";
import CreateCompetition from "./components/admin/create/createCompetition";
import AdminLogin from "./components/admin/adminLogin";
import DeleteCompetition from "./components/admin/delete/deleteCompetition";
import Distances from "./components/distances/distances";
import CreateDistance from "./components/admin/create/createDistance";
import DeleteDistance from "./components/admin/delete/deleteDistance";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/admin" element={<AdminConsole />} />
            <Route path="/admin/competition/create" element={<CreateCompetition />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/competition/delete" element={<DeleteCompetition />} />
            <Route path="/distances" element={<Distances />} />
            <Route path="/admin/distances/create" element={<CreateDistance />} />
            <Route path="/admin/distances/delete" element={<DeleteDistance />} />
        </Routes>
    </BrowserRouter>
)