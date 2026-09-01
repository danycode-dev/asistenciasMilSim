import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { config } from "../config/env";



const DataContext = createContext();

// Provider
export function DataProvider({ children }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const membersById = useMemo(() => {
      return Object.fromEntries(
          data?.members.map(member => [
              member.id,
              member
          ]) ?? []
      );
  }, [data?.members]);

  const ranksById = useMemo(() => {
      return Object.fromEntries(
          data?.ranks.map(rank => [
              rank.id,
              rank
          ]) ?? []
      );
  }, [data?.ranks]);

	const loadAttendancebyId = async (eventId) => {
    try {
      const res = await fetch(`${config.apiUrl}/events/${eventId}/attendance`)
      if (!res.ok) {
        throw new Error("Error fetching attendance data");
      }
      const body = await res.json();
      const newData = formatAttendanceInData(data, body.data, eventId);
      setData(newData);
      return newData.attendances[eventId];
      
    } catch (err) {
      console.error("Error loading attendance:", err);
      throw err;
    }
  };

  const saveNewEventAndAttendace = async (eventData) => {
    try {
      const res = await fetch(`${config.apiUrl}/events`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(eventData)

      });

      if (!res.ok) {
        throw new Error("Error en la petición", await res.text());
      }
      
      const result = await res.json();
      await reloadData();
      return result.data.eventId; // Asumiendo que el backend devuelve el ID del nuevo evento


    }catch (err) {
      console.error("Error saving attendance:", err);
    }

  }

  const updateEventAndAttendace= async(changes, eventId) => {
    
    try {
      const res = await fetch(`${config.apiUrl}/events/${eventId}`, {
        credentials: "include",
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(changes)

      });
      await reloadData()
      return
    }catch(e){
      console.error(e)
    }



  }

  const reloadData = async () => {
    await fetchData();
  }
  const fetchData = async () => {
    console.log("hola mundo");
    try {
        const res = await fetch(`${config.apiUrl}/app/bootstrap`);
    
      if (!res.ok) {
        throw new Error("Error en la petición");
      }
  
      const data = await res.json();
      console.log("data recibida:", data);
    
      // setState aquí
      // setAppData(data);
      const formattedData = formatData(data);
    setData(formattedData);
    
    } catch (err) {
      console.error(err);
    }
  };

  const value = {
    membersById,
    ranksById,
    dashboardData: data,
    setDashboardData: setData,
    isLoading,
    setIsLoading,
    error,
    setError,
    loadAttendancebyId,
    saveNewEventAndAttendace,
    reloadData,
    updateEventAndAttendace
  };

  
  useEffect(() => {
 
		  fetchData();
		}, []);

  useEffect(()=>{console.log('DasboardData: ',data)},  [data])



  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

// Hook 
export function useDashboardData() {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error("useDashboardData debe usarse dentro de DataContextProvider");
  }

  return context;
}



const formatData= (newData) => {
    const data = {
        ranks: newData.ranks ? newData.ranks : [],  // ['Oficiales', 'Cadetes', 'Aspirantes', 'Reclutas']
        members: newData.members ? newData.members : [], // [{ name: 'Pegaso', rank: 'Oficiales' }, ...]
        membersByRank: newData.membersForRank ? newData.membersForRank : {}, // { 'Oficiales': [{name: 'Pegaso', ...}], 'Cadetes': [...], ... }
        attendances: newData.attendances ? newData.attendances : {}, // idEvento: { member_id: { estado: 'P', comentario: '...' }, ... }
        events: newData.events ? newData.events : [] // [{ id: 'idEvento', date: "2025-01-01T03:00:00.000Z", name: 'Evento 1' }, ...]
    };
	return data;
}

function formatAttendanceInData(data, newAttendance, eventId) {
  return {
    ...data,
    attendances: {
      ...data.attendances,
      [eventId]: newAttendance
    }
  };
}