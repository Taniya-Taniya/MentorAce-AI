from utils.db import get_db

class MentorModel:
    @staticmethod
    def save_metrics(mentor_id, metrics, overall=None):
        db = get_db()
        cur = db.cursor()
        # Calculate overall if not provided
        if overall is None:
            overall = sum(metrics.values()) / len(metrics) if metrics else 0
        cur.execute(
            """
            INSERT INTO evaluations(mentor_id, clarity, depth, engagement, pacing, overall)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (mentor_id, metrics["clarity"], metrics["depth"],
             metrics["engagement"], metrics["pacing"], overall)
        )
        db.commit()

    @staticmethod
    def get_latest(mentor_id):
        db = get_db()
        cur = db.cursor()
        cur.execute(
            "SELECT * FROM evaluations WHERE mentor_id=? ORDER BY id DESC LIMIT 1",
            (mentor_id,)
        )
        return cur.fetchone()
