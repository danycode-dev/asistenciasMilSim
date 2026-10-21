import { useState, useEffect } from 'react'
import AttendanceTab from './tabs/AttendanceTab';
import { useDashboardData } from '../context/DataContext';
import StatsTab from './tabs/StatsTab';
import MemberTab from './tabs/MembersTab';
import NameTab from './tabs/layautTab';
import UsersTab from './tabs/UsersTab';


export default function DashboardPage() {


    const [activeTab, setActiveTab] = useState('registro');
    const { dashboardData, setDashboardData } = useDashboardData();

    function TabBtn({name, identify}){
            return(
                <button className={`tab-btn ${activeTab === identify ? 'active' : ''}`} onClick={() => setActiveTab(`${identify}`)}>{name}</button>

            )
    }


    return (
    <>
        <div className="tabs overflow-x-auto">
            <TabBtn identify="registro" name="Registro Diario" />
            <TabBtn identify="estadisticas" name="Estadísticas" />
            {/* <TabBtn identify="meses" name="Meses" /> */}
            <TabBtn identify="miembros" name="Gestionar Miembros" />
            <TabBtn identify="users" name="Usuarios y Roles" />
            <TabBtn identify="prox" name="Gestionar Unidades" />
        </div>


        {activeTab === 'registro' && <AttendanceTab />}
        {activeTab === 'estadisticas' && <StatsTab />}
        {activeTab === 'miembros' && <MemberTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'prox' && <NameTab />}
    </>
    );
} 