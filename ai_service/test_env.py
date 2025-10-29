from dotenv import load_dotenv
import os

print("Testing .env loading...")
print("-" * 40)

# Try loading
result = load_dotenv('config.env')
print(f"load_dotenv() returned: {result}")

# Check values
print(f"PGHOST = {os.getenv('PGHOST')}")
print(f"PGPORT = {os.getenv('PGPORT')}")
print(f"PGDATABASE = {os.getenv('PGDATABASE')}")
print(f"PGUSER = {os.getenv('PGUSER')}")
print("-" * 40)

