import os
import csv
import psycopg2
from psycopg2.extras import execute_values

DB_URL = "postgresql://neondb_owner:npg_Fg4UWAG2nhMR@ep-autumn-truth-aelpp7kz-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.path.dirname(CURRENT_DIR), 'data', 'raw', 'data_test')

def seed_database():
    print("Connecting to Neon DB...")
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    print("Creating tables...")
    cur.execute("""
        DROP TABLE IF EXISTS telemetry;
        DROP TABLE IF EXISTS transformers;
        
        CREATE TABLE transformers (
            id SERIAL PRIMARY KEY,
            asset_id VARCHAR(100) UNIQUE NOT NULL
        );

        CREATE TABLE telemetry (
            id SERIAL PRIMARY KEY,
            transformer_id INTEGER REFERENCES transformers(id),
            step INTEGER NOT NULL,
            h2 FLOAT,
            co FLOAT,
            c2h4 FLOAT,
            c2h2 FLOAT
        );
    """)
    conn.commit()

    if not os.path.exists(DATA_DIR):
        print(f"Data directory {DATA_DIR} not found.")
        return

    files = [f for f in os.listdir(DATA_DIR) if f.endswith('.csv')]
    print(f"Found {len(files)} CSV files to import.")

    total_files = len(files)
    
    # We will process in batches to avoid huge memory usage
    for idx, file in enumerate(files):
        asset_id = file.replace('.csv', '')
        filepath = os.path.join(DATA_DIR, file)
        
        # Insert transformer
        cur.execute("INSERT INTO transformers (asset_id) VALUES (%s) RETURNING id", (asset_id,))
        transformer_id = cur.fetchone()[0]
        
        # Read CSV
        telemetry_data = []
        with open(filepath, 'r') as f:
            reader = csv.DictReader(f)
            step = 0
            for row in reader:
                try:
                    h2 = float(row.get('H2', 0))
                    co = float(row.get('CO', 0))
                    c2h4 = float(row.get('C2H4', 0))
                    c2h2 = float(row.get('C2H2', 0))
                    telemetry_data.append((transformer_id, step, h2, co, c2h4, c2h2))
                    step += 1
                except ValueError:
                    continue
                    
        # Insert telemetry
        if telemetry_data:
            execute_values(
                cur,
                "INSERT INTO telemetry (transformer_id, step, h2, co, c2h4, c2h2) VALUES %s",
                telemetry_data
            )
            
        if (idx + 1) % 50 == 0:
            print(f"Processed {idx + 1}/{total_files} files...")
            conn.commit()
            
    conn.commit()
    cur.close()
    conn.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
