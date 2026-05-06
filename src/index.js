import { Route, Routes, BrowserRouter } from 'react-router-dom'
import ReactDOM from "react-dom/client";
import "./styles/app.css";
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
import CreateHeat from "./components/admin/create/createHeat";
import UpdateHeat from "./components/admin/update/updateHeat";
import CreateEntry from "./components/admin/create/createEntry";
import EntryProtocol from "./components/entries/entryProtocol";
import GenerateHeats from "./components/admin/seeding/generateHeats";
import AddEntryItems from "./components/admin/entries/addEntryItems";
import SelectEntry from "./components/admin/entries/selectEntry";
import Sportmens from "./components/sportmens/sportmens";
import SportmenDetails from "./components/sportmens/sportmenDetails";
import AddResults from "./components/admin/create/addResults";
import Results from "./components/results/results";
import Protocols from "./components/protocols/protocols";
import CreateProtocol from "./components/admin/create/createProtocol";
import UpdateProtocol from "./components/admin/update/updateProtocol";
import DeleteProtocol from "./components/admin/delete/deleteProtocol";
import Heats from "./components/heats/heats";
import ShowEntryItems from "./components/admin/entries/showEntryItems";

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
            <Route path="/admin/heats/create" element={<CreateHeat />} />
            <Route path="/admin/heats/update" element={<UpdateHeat />} />
            <Route path="/admin/results/add" element={<AddResults />} />
            <Route path="/results" element={<Results />} />
            <Route path="/admin/entries/create" element={<CreateEntry />} />
            <Route path="/admin/entries/select" element={<SelectEntry />} />
            <Route path="/admin/entries/items/add" element={<AddEntryItems />} />
            <Route path="/entry-protocol" element={<EntryProtocol />} />
            <Route path="/admin/seeding/generate" element={<GenerateHeats />} />
            <Route path="/sportmens" element={<Sportmens />} />
            <Route path="/sportmens/:id" element={<SportmenDetails />} />
            <Route path="/protocols" element={<Protocols />} />
            <Route path="/admin/protocols/create" element={<CreateProtocol />} />
            <Route path="/admin/protocols/update" element={<UpdateProtocol />} />
            <Route path="/admin/protocols/delete" element={<DeleteProtocol />} />
            <Route path="/heats" element={<Heats />} />
            <Route path="/admin/showEntryItems" element={<ShowEntryItems />} />
        </Routes>
    </BrowserRouter>
)