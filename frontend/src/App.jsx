import { useState } from 'react'

import './App.css'
import DashboardPage from './dashboard/DashboardPage';
import { DataProvider } from './context/DataContext';
import { useUser } from './context/UserContext';
import AuthForm from './auth/AuthForm';
import { ModalProvider } from './context/ModalContext';


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

        function openTab(tabName) {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

            const targetContent = document.getElementById(tabName);
            if (targetContent) targetContent.classList.add('active');

            const buttons = document.getElementsByClassName('tab-btn');
            for (let btn of buttons) {
                const btnText = btn.innerText.toLowerCase();
                if (btnText.includes(tabName.substring(0, 4)) || (tabName === 'meses' && btnText.includes('meses'))) {
                    btn.classList.add('active');
                }
            }
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

        function addMember(cat) {
            const val = document.getElementById(`newMember_${cat}`).value.trim();
            if (val) {
                appData.miembros[cat].push(val);
                document.getElementById(`newMember_${cat}`).value = '';
                saveData(); renderAll();
            }
        }

        function removeMember(cat, name) {
            if (confirm(`¿Eliminar a ${name}?`)) {
                appData.miembros[cat] = appData.miembros[cat].filter(m => m !== name);
                saveData(); renderAll();
            }
        }

        // --- REGISTRO ---
        function renderAttendanceForms() {
            const container = document.getElementById('attendanceFormsContainer');
            container.innerHTML = '';
            const currentDate = document.getElementById('dateSelector').value;
            const currentData = appData.asistencias[currentDate] || {};

            // quite algo
        }


        function loadAttendanceForDate() { renderAttendanceForms(); }


        function showToast(message) {
            const toast = document.getElementById("toast");
            toast.innerText = message;
            toast.className = "show";
            setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
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

        // --- MODALES ---
        function openProfile(name, cat) {
            currentProfileName = name;
            document.getElementById('modalName').innerText = name;
            document.getElementById('modalCategory').innerText = cat;
            document.getElementById('modalObservations').value = appData.observaciones[name] || "";
            const hist = document.getElementById('modalHistory'); hist.innerHTML = '';
            const dates = Object.keys(appData.asistencias).sort().reverse();
            dates.forEach(d => {
                const e = appData.asistencias[d][name];
                if (e && (e.comentario || e.estado)) {
                    const label = e.estado === 'P' ? 'Presente' : (e.estado === 'A' ? 'Ausente' : 'Aviso');
                    hist.innerHTML += `<div class="history-item"><span class="history-date">${d}</span><span class="history-status">[${label}]</span><span class="history-comment">${e.comentario ? `"${e.comentario}"` : ''}</span></div>`;
                }
            });
            document.getElementById('profileModal').style.display = 'block';
        }

        function saveObservationFromModal() {
            appData.observaciones[currentProfileName] = document.getElementById('modalObservations').value;
            saveData(); alert("Observación guardada.");
        }

        function closeModal() { document.getElementById('profileModal').style.display = 'none'; }

        // --- CIERRE DE MES ---
        function closeMonth() {
            const now = new Date();
            const monthYear = `Mes ${now.getMonth() + 1}/${now.getFullYear().toString().slice(-2)}`;

            if (!confirm(`¿Estás seguro de que quieres CERRAR EL MES actual (${monthYear})?\n\nEsto guardará un historial de hoy y generará un reporte externo.`)) return;

            // Foto de las estadísticas actuales
            const reportContent = renderStats(true); // Generar el HTML de las tablas

            const reportObj = {
                id: monthYear,
                fechaCierre: now.toLocaleString(),
                html: reportContent
            };

            appData.historicos.unshift(reportObj); // Añadir al principio
            saveData();
            renderMonthlyReports();

            // Exportación automática del reporte HTML mensual
            currentViewingReport = reportObj;
            downloadCurrentReportHtml();

            alert("Mes cerrado correctamente y guardado en la pestaña 'Meses'. El registro principal sigue igual.");
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

        function openReportView(index) {
            currentViewingReport = appData.historicos[index];
            document.getElementById('reportModalTitle').innerText = `Reporte: ${currentViewingReport.id}`;
            document.getElementById('reportModalContent').innerHTML = currentViewingReport.html;
            document.getElementById('reportModal').style.display = 'block';
        }

        function closeReportModal() { document.getElementById('reportModal').style.display = 'none'; }

        function downloadCurrentReportHtml() {
            if (!currentViewingReport) return;

            const styles = Array.from(document.styleSheets[0].cssRules).map(r => r.cssText).join('\n');

            const fullHtml = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Reporte Mensual - ${currentViewingReport.id}</title>
            <style>
                ${styles}
                body { background-color: #1a1a1a; padding: 50px; color: #e0e0e0; font-family: sans-serif; }
                .report-header { text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 20px; margin-bottom: 30px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="report-header">
                    <h1 style="color:#d4af37; text-transform:uppercase;">REPORTE MENSUAL DE ASISTENCIAS</h1>
                    <h2>${currentViewingReport.id}</h2>
                    <p style="color:#888;">Cierre generado el: ${currentViewingReport.fechaCierre}</p>
                </div>
                ${currentViewingReport.html}
                <div style="margin-top: 50px; text-align: center; font-size: 0.8em; color: #555;">Sistema de Asistencia V.Comodoro Eban</div>
            </div>
        </body>
        </html>`;

            const blob = new Blob([fullHtml], { type: 'text/html' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `Reporte_Asistencia_${currentViewingReport.id.replace(/ /g, '_').replace(/\//g, '-')}.html`;
            a.click();
        }

        // --- SISTEMA ---
        function exportData() {
            const blob = new Blob([JSON.stringify(appData)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `asistencias_FULL_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
        }

        function importData(input) {
            const file = input.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                try { appData = JSON.parse(e.target.result); saveData(); renderAll(); alert("Importado con éxito."); }
                catch (err) { alert("Archivo no válido"); }
            };
            reader.readAsText(file);
        }

        function resetApp() {
            if (confirm("¿Estás seguro de que quieres resetear TODO el sistema?\n\nSe borrarán todos los miembros, asistencias, observaciones e historial permanentemente.")) {
                localStorage.removeItem('asistencias_eban_v2');
                localStorage.removeItem('asistencias_eban_v1');
                location.reload();
            }
        }

        window.onclick = function (event) {
            if (event.target == document.getElementById('profileModal')) closeModal();
            if (event.target == document.getElementById('reportModal')) closeReportModal();
        }

  return (
    <>  {isLoading? <div className='loading text-xl'>Cargando...</div>: error?<div className='error'>Error: {error.message}</div>:''}
        <div className="container">
            <header>
                <h1>Control de Asistencias</h1>
                <p style={{ color: "#888" }}>Gestión de Personal - V.Comodoro Eban</p>
                <img src="d1.png" alt="Logo Unidad" className="header-logo" />
            </header>
            {
                !user ? <AuthForm />:<DataProvider><ModalProvider>  <DashboardPage /></ModalProvider> </DataProvider>
            }
            


            



        </div>


    </>
  )
}

export default App
