
import { useEffect, useState } from 'react'
import { useDashboardData } from '../../context/DataContext';



export default function StatsTab({}) {

  const { dashboardData, isLoading, error, saveNewEventAndAttendace, loadAttendancebyId, reloadData } = useDashboardData();
  

    

  

  const openProfile = ()=>{
    // pass
  }


  return (
  <>
    {/* TAB: ESTADÍSTICAS */}
    <div id="estadisticas" className="tab-content active">
        <div className="section-card">
            <h3>📊 Resumen de Rendimiento</h3>
            <p style={{ fontSize: "0.8em", color: "#888", marginBottom: "20px" }}>
                * Haz clic en el nombre de un integrante para ver su historial y observaciones.
            </p>
            <div id="statsContainer">
                {/* Tablas generadas con JS */}


  {dashboardData.ranks.map((cat) => {
      if (!dashboardData.membersByRank[cat.id] || dashboardData.membersByRank[cat.id].length === 0) {
        return null;
      }


      return (
        <div key={cat.id}>
          <h4>{cat.plural_name}</h4>

          <table className="stats-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Pres.</th>
                <th>Aus.</th>
                <th>Avisos</th>
                <th>Total %</th>
              </tr>
            </thead>

            <tbody>
              {dashboardData.membersByRank[cat.id].map((m) => {
                let p = m.stats.total_present || 0,
                  a = m.stats.total_absences || 0,
                  j = m.stats.total_justified || 0
                // sacar los stats de cada mismbro, Pendiente

                const total = p + a + j;
                const pct = total > 0 ? Math.round((p / total) * 100) : 0;

                let color = "var(--danger-color)";
                if (pct >= 80) color = "var(--success-color)";
                else if (pct >= 50) color = "var(--warning-color)";

                return (
                  <tr key={`${m.id} k`}>
                    <td
                      className="clickable-name"
                      onClick={() => openProfile(m, cat.id)}
                    >
                      {m.nickname}
                    </td>
                    <td>{p}</td>
                    <td>{a}</td>
                    <td>{j}</td>
                    <td
                      style={{
                        color,
                        fontWeight: "bold",
                      }}
                    >
                      {pct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    })}

            </div>
        </div>
    </div>


  </>
  )
}
