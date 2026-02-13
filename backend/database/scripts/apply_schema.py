import psycopg2
import os
from dotenv import load_dotenv

def apply_schema():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found in .env")
        return

    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        schema_path = os.path.join("backend", "database", "scripts", "update_schema.sql")
        with open(schema_path, "r") as f:
            sql = f.read()
            
        print(f"Applying schema from {schema_path}...")
        cur.execute(sql)
        conn.commit()
        print("Schema applied successfully!")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error applying schema: {e}")

if __name__ == "__main__":
    apply_schema()
