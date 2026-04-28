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
import UpdateCompetitionName from "./components/admin/update/updateCompetitionName";
import UpdateDistanceName from "./components/admin/update/updateDistanceName";
import Heats from "./components/heats/heats";
import CreateHeat from "./components/admin/create/createHeat";
import UpdateHeat from "./components/admin/update/updateHeat";
import Sportmens from "./components/sportmens/sportmens";
import SportmenDetails from "./components/sportmens/sportmenDetails";
import CreateSportmen from "./components/admin/create/createSportmen";
import DeleteSportmen from "./components/admin/delete/deleteSportmen";
import UpdateSportmen from "./components/admin/update/updateSportmen";

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
            <Route path="/admin/competition/update" element={<UpdateCompetitionName />} />
            <Route path="/admin/distances/update" element={<UpdateDistanceName />} />
            <Route path="/heats" element={<Heats />} />
            <Route path="/admin/heats/create" element={<CreateHeat />} />
            <Route path="/admin/heats/update" element={<UpdateHeat />} />
            <Route path="/sportmens" element={<Sportmens />} />
            <Route path="/sportmens/:id" element={<SportmenDetails />} />
            <Route path="/admin/sportmens/create" element={<CreateSportmen />} />
            <Route path="/admin/sportmens/delete" element={<DeleteSportmen />} />
            <Route path="/admin/sportmens/update" element={<UpdateSportmen />} />
        </Routes>
    </BrowserRouter>
)