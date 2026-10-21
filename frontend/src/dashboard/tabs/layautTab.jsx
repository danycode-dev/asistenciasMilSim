
import { useEffect, useState } from 'react'
import { useDashboardData } from '../../context/DataContext';

// solo es un template para llegar y copiar para hacer los tabs que quedan

export default function NameTab({}) {

  const { dashboardData, isLoading, error, saveNewEventAndAttendace, loadAttendancebyId, reloadData } = useDashboardData();
  //


  return (
    <>
      <div>No disponible Aun...</div>
        </>
    )
}
