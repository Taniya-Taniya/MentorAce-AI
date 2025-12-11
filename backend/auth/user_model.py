from utils.db import get_db

class UserModel:
    @staticmethod
    def create_user(name, email, password, role):
        db = get_db()
        cur = db.cursor()
        try:
            cur.execute(
                "INSERT INTO users(name, email, password, role) VALUES (?, ?, ?, ?)",
                (name, email, password, role)
            )
            db.commit()
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def get_user(email):
        db = get_db()
        cur = db.cursor()
        cur.execute("SELECT * FROM users WHERE email=?", (email,))
        return cur.fetchone()
