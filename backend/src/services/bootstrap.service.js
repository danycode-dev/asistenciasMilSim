import pool from "../db/pool.js";

export async function getBootstrap() {
    const client = await pool.connect();
    try {
        const [members, ranks, events] = await Promise.all([
            client.query(`
                SELECT 
                    m.id, 
                    m.nickname, 
                    m.rank_id, 
                    m.join_date,
                    s.consecutive_absences,
                    s.events_attended,
                    s.total_present,
                    s.total_absences,
                    s.total_justified
                FROM members m
                LEFT JOIN events_member_stats s
                ON s.member_id = m.id;
                
            `),
            client.query("SELECT id, rank_name, display_order, short_name, plural_name FROM ranks ORDER BY display_order ASC;"),
            client.query("SELECT id, name, event_date FROM events")
        ]);
        
        const rankMap = {};
        for (const rank of ranks.rows) {
            rankMap[rank.id] = rank.rank_name;
        }
        // preparar ranks
        const ranksFormat = []
        for (const rank of ranks.rows) {
            ranksFormat.push({
                id:rank.id, 
                name:rank.rank_name, 
                display_order:rank.display_order,
                short_name:rank.short_name,
                plural_name:rank.plural_name,
            });
        }
        const formatMembers=[]
        for (const member of members.rows){  
            const stats={
                consecutive_absences:member.consecutive_absences,
                events_attended:member.events_attended,
                total_present:member.total_present,
                total_absences:member.total_absences,
                total_justified:member.total_justified

            }
            const newMember ={
                id: member.id,
                nickname:member.nickname,
                rank_id:member.rank_id,
                rank_name: rankMap[member.rank_id] || "Unknown",  //  quitar esto despues
                join_date:member.join_date,
                stats:stats
            }
            formatMembers.push(newMember)
        }
        const membersForRank = {}
        for (const member of formatMembers) {
            if (!membersForRank[member.rank_id]) {
                membersForRank[member.rank_id] = [];
            }
            membersForRank[member.rank_id].push(member);
        }

        return {
            ranks: ranksFormat,
            membersForRank: membersForRank,
            events: events.rows,
            members: formatMembers
        };
    } finally {
        client.release();
    }
}
