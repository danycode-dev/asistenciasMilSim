import { useState } from 'react'

import './App.css'
import DashboardPage from './dashboard/DashboardPage';
import { DataProvider } from './context/DataContext';
import { useUser } from './context/UserContext';
import AuthForm from './auth/AuthForm';
import { ModalProvider } from './context/ModalContext';
import ModalRenderer from './components/modals/ModalRenderer';


// NOTA: MIGRANDO DESDE CODIGO LEGACY A REACT

function App() {
    const { user, isLoading, error } = useUser();

  

    // codigo legacy, no está activo, solo de referencia para migrar a react. Se puede eliminar después de migrar todo a react sin problemas.
        const CATEGORIAS = ['Oficiales', 'Cadetes', 'Aspirantes', 'Reclutas'];
        const DEFAULT_MEMBERS = {
            'Oficiales': ['[GRL.D] Pegaso', '[V. Comodoro] Eban', '[T.Coronel] Lucho', '[MY] Venom', '[MY] Gonxol'],
            'Cadetes': ['[CDTE] Gestgu', '[CDTE] Pepos', '[CDTE] Necros', '[CDTE] Daniel'],
            'Aspirantes': ['[ASP] Butin', '[ASP] Carcho', '[ASP] Fredy', '[ASP] Panamasado', '[ASP] Calaca', '[ASP] Elbno', '[ASP] Carrera', '[ASP] Caracol', '[ASP] Ncu', '[ASP] Mitzio', '[ASP] Sonidero', '[ASP] Hunter', '[ASP] Marucha', '[ASP] Miyamas', '[ASP] Tengu', '[ASP] HardB'],
            'Reclutas': ['[RCT] Abaddon', '[RCT] Angel "Artemiza"', '[RCT] Cerec', '[RCT] Daniel Villalba', '[RCT] Di Campino', '[RCT] Esteban', '[RCT] GuilletreX', '[RCT] Hunter', '[RCT] Janovich', '[RCT] JBMatias', '[RCT] NCU', '[RCT] NejiiDark', '[RCT] Parasyte', '[RCT] Relan', '[RCT] Samurai', '[RCT] strack3322', '[RCT] Tear', '[RCT] Uriel.R', '[RCT] ASUS', '[RCT] Boloncho', '[RCT] Facun', '[RCT] GuardiaN', '[RCT] Tafu', '[RCT] TomiCheddar', '[RCT] sscug']
        };
        //  obsoleto
        let appData = {
            miembros: JSON.parse(JSON.stringify(DEFAULT_MEMBERS)),
            asistencias: {}, // "FECHA": { "NOMBRE": { estado: 'P', comentario: '' } }
            observaciones: {}, // "NOMBRE": "texto"
            historicos: [] // Array de { id: 'Mes 2/26', fechaCierre: '...', html: '...' }
        };


    
        let currentProfileName = "";
        let currentViewingReport = null;

        window.onload = function () {
            loadData();
            document.getElementById('dateSelector').valueAsDate = new Date();
            renderAll();
        };

        function loadData() {
            let savedData = localStorage.getItem('asistencias_eban_v2');

            if (!savedData) {
                const oldData = localStorage.getItem('asistencias_eban_v1');
                if (oldData) {
                    const parsedOld = JSON.parse(oldData);
                    appData.miembros = parsedOld.miembros || appData.miembros;
                    for (let date in parsedOld.asistencias) {
                        appData.asistencias[date] = {};
                        for (let member in parsedOld.asistencias[date]) {
                            const val = parsedOld.asistencias[date][member];
                            if (typeof val === 'string') appData.asistencias[date][member] = { estado: val, comentario: "" };
                            else appData.asistencias[date][member] = val;
                        }
                    }
                    saveData();
                }
            } else {
                appData = JSON.parse(savedData);
                if (!appData.observaciones) appData.observaciones = {};
                if (!appData.historicos) appData.historicos = [];
            }
        }

        function saveData() {
            localStorage.setItem('asistencias_eban_v2', JSON.stringify(appData));
        }


        function renderAll() {
            renderMemberManagement();
            renderAttendanceForms();
            renderStats();
            renderMonthlyReports();
        }

        // --- MIEMBROS ---
        function renderMemberManagement() {
            const container = document.getElementById('memberManagementContainer');
            container.innerHTML = '';
            CATEGORIAS.forEach(cat => {
                container.innerHTML += `
                <div style="margin-bottom: 30px;">
                    <h4 style="color: #bbb; border-bottom: 1px solid #444; padding-bottom: 5px;">${cat}</h4>
                    <div class="add-form">
                        <input type="text" id="newMember_${cat}" placeholder="Nuevo integrante...">
                        <button class="btn-primary" onclick="addMember('${cat}')">Agregar</button>
                    </div>
                    <div class="member-grid">
                        ${appData.miembros[cat].map(m => `
                            <div class="member-item">
                                <span>${m}</span>
                                <button class="btn-delete" onclick="removeMember('${cat}', '${m}')">&times;</button>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
            });
        }




        // --- REGISTRO ---
        function renderAttendanceForms() {
            const container = document.getElementById('attendanceFormsContainer');
            container.innerHTML = '';
            const currentDate = document.getElementById('dateSelector').value;
            const currentData = appData.asistencias[currentDate] || {};

            // quite algo
        }



        // --- ESTADÍSTICAS ---
        function renderStats(isForExport = false) {
            const container = isForExport ? document.createElement('div') : document.getElementById('statsContainer');
            if (!isForExport) container.innerHTML = '';

            const allDates = Object.keys(appData.asistencias);
            CATEGORIAS.forEach(cat => {
                if (appData.miembros[cat].length === 0) return;
                let table = `<h4>${cat}</h4><table class="stats-table"><thead><tr>
                <th>Nombre</th><th>Pres.</th><th>Aus.</th><th>Avisos</th><th>Total %</th>
            </tr></thead><tbody>`;

                appData.miembros[cat].forEach(m => {
                    let p = 0, a = 0, j = 0;
                    allDates.forEach(d => {
                        const e = appData.asistencias[d][m];
                        if (e) {
                            if (e.estado === 'P') p++;
                            else if (e.estado === 'A') a++;
                            else if (e.estado === 'J') j++;
                        }
                    });
                    const total = p + a + j;
                    const pct = total > 0 ? Math.round((p / total) * 100) : 0;
                    table += `<tr>
                    <td class="${isForExport ? '' : 'clickable-name'}" ${isForExport ? '' : `onclick="openProfile('${m}', '${cat}')"`}>${m}</td>
                    <td>${p}</td><td>${a}</td><td>${j}</td>
                    <td style="color:${pct >= 80 ? 'var(--success-color)' : (pct >= 50 ? 'var(--warning-color)' : 'var(--danger-color)')};font-weight:bold">${pct}%</td>
                </tr>`;
                });
                container.innerHTML += table + '</tbody></table>';
            });
            return container.innerHTML;
        }


        function renderMonthlyReports() {
            const container = document.getElementById('monthlyReportsContainer');
            container.innerHTML = appData.historicos.length === 0 ? '<p style="color:#666">No hay meses cerrados registrados.</p>' : '';

            appData.historicos.forEach((rep, index) => {
                container.innerHTML += `
                <div class="report-item" onclick="openReportView(${index})">
                    <div class="report-info">
                        <span class="report-title">🗄️ ${rep.id}</span>
                        <span class="report-date">Cerrado el: ${rep.fechaCierre}</span>
                    </div>
                    <span style="font-size: 1.5em;">➔</span>
                </div>
            `;
            });
        }



  return (
    <>  {isLoading? <div className='loading text-xl'>Cargando...</div>: error?<div className='error'>Error: {error.message}</div>:''}
        <div className="container md:p-2">
            <header>
                <h1>Control de Asistencias</h1>
                <p style={{ color: "#888" }}>Gestión de Personal - V.Comodoro Eban</p>
                <img src="d1.png" alt="Logo Unidad" className="header-logo" />
            </header>
            {
                !user ? <AuthForm />:<DataProvider><ModalProvider> <ModalRenderer></ModalRenderer> <DashboardPage /></ModalProvider> </DataProvider>
            }
            


            



        </div>


    </>
  )
}

export default App
