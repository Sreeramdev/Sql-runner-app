import sqlite3
import os

def setup_database():
    # Use environment variable or default path
    DATABASE_PATH = os.getenv('DATABASE_PATH', os.path.join(os.path.dirname(__file__), '..', 'database', 'sql_runner.db'))

    # Create/connect to database
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    # Create Customers table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Customers (
            customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            age INTEGER,
            country VARCHAR(100)
        )
    ''')

    # Insert sample customers
    customers = [
        ('John', 'Doe', 30, 'USA'),
        ('Robert', 'Luna', 22, 'USA'),
        ('David', 'Robinson', 25, 'UK'),
        ('John', 'Reinhardt', 22, 'UK'),
        ('Betty', 'Doe', 28, 'UAE')
    ]
    cursor.executemany('INSERT INTO Customers (first_name, last_name, age, country) VALUES (?, ?, ?, ?)', customers)

    # Create Orders table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Orders (
            order_id INTEGER PRIMARY KEY AUTOINCREMENT,
            item VARCHAR(100),
            amount INTEGER,
            customer_id INTEGER,
            FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
        )
    ''')

    # Insert sample orders
    orders = [
        ('Keyboard', 400, 4),
        ('Mouse', 300, 4),
        ('Monitor', 12000, 3),
        ('Keyboard', 400, 1),
        ('Mousepad', 250, 2)
    ]
    cursor.executemany('INSERT INTO Orders (item, amount, customer_id) VALUES (?, ?, ?)', orders)

    # Create Shippings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Shippings (
            shipping_id INTEGER PRIMARY KEY AUTOINCREMENT,
            status VARCHAR(100),
            customer INTEGER
        )
    ''')

    # Insert sample shippings
    shippings = [
        ('Pending', 2),
        ('Pending', 4),
        ('Delivered', 3),
        ('Pending', 5),
        ('Delivered', 1)
    ]
    cursor.executemany('INSERT INTO Shippings (status, customer) VALUES (?, ?)', shippings)

    conn.commit()
    conn.close()
    print("✅ Database created successfully!")

if __name__ == '__main__':
    setup_database()
