from utils.db import get_db

def get_dashboard_data():
    db = get_db()
    
    # Total video uploads count
    uploads = db.execute("SELECT COUNT(*) FROM evaluations").fetchone()[0]

    # Average score across all mentors
    avg_score = db.execute("SELECT AVG(score) FROM evaluations").fetchone()[0]
    avg_score = round(avg_score, 2) if avg_score else 0

    # Top 5 mentors with highest avg score
    top_mentors = db.execute("""
        SELECT mentor_id, AVG(score) as avg_score
        FROM evaluations
        GROUP BY mentor_id
        ORDER BY avg_score DESC
        LIMIT 5
    """).fetchall()

    top_mentors_list = [
        {"mentor_id": m[0], "avg_score": round(m[1], 2)}
        for m in top_mentors
    ]

    # Graph: daily uploads
    graph_data = db.execute("""
        SELECT date(created_at), COUNT(*)
        FROM evaluations
        GROUP BY date(created_at)
        ORDER BY date(created_at)
    """).fetchall()

    graph = [{"date": g[0], "count": g[1]} for g in graph_data]

    return {
        "total_uploads": uploads,
        "avg_score": avg_score,
        "top_mentors": top_mentors_list,
        "graph": graph
    }
