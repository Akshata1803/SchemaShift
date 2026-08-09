import { faker } from "@faker-js/faker";

export function generateSyntheticSchemaDDL(): string {
  return `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        order_number VARCHAR(100) NOT NULL,
        total_amount NUMERIC(10, 2) NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INT NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        unit_price NUMERIC(10, 2) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INT,
        action VARCHAR(100) NOT NULL,
        ip_address VARCHAR(45),
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

export function generateSyntheticDataInserts(targetRows: number = 10000): string {
  const usersCount = Math.max(1000, Math.floor(targetRows / 5));
  const ordersCount = targetRows;
  const itemsCount = targetRows * 2;
  const logsCount = Math.floor(targetRows / 2);

  const roles = ["admin", "customer", "editor", "analyst", "manager"];
  const statuses = ["active", "pending", "suspended", "verified"];
  const orderStatuses = ["completed", "shipped", "processing", "cancelled", "refunded"];
  const products = [
    "Glass Terrarium Jar",
    "Soil Moisture Monitor",
    "Automated Drip Kit",
    "LED Growth Light",
    "Moss Starter Kit"
  ];
  const actions = ["USER_LOGIN", "ORDER_CREATED", "PASSWORD_RESET", "PAYMENT_PROCESSED", "EXPORT_DATA"];

  const sqlChunks: string[] = [];

  // 1. Users batch
  const userRows: string[] = [];
  for (let i = 1; i <= usersCount; i++) {
    const fn = faker.person.firstName().replace(/'/g, "''");
    const ln = faker.person.lastName().replace(/'/g, "''");
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`;
    const role = roles[Math.floor(Math.random() * roles.length)];
    const st = statuses[Math.floor(Math.random() * statuses.length)];
    userRows.push(`('${email}', '${fn} ${ln}', '${role}', '${st}', NOW() - INTERVAL '${Math.floor(Math.random() * 365)} days')`);
  }
  appendBatchedInserts(sqlChunks, "users", "email, full_name, role, status, created_at", userRows);

  // 2. Orders batch
  const orderRows: string[] = [];
  for (let i = 1; i <= ordersCount; i++) {
    const uid = Math.floor(Math.random() * usersCount) + 1;
    const ordNum = `ORD-2026-${10000 + i}`;
    const amount = Number((15.5 + Math.random() * 480).toFixed(2));
    const st = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
    orderRows.push(`(${uid}, '${ordNum}', ${amount}, '${st}', NOW() - INTERVAL '${Math.floor(Math.random() * 180)} days')`);
  }
  appendBatchedInserts(sqlChunks, "orders", "user_id, order_number, total_amount, status, created_at", orderRows);

  // 3. Order Items batch
  const itemRows: string[] = [];
  for (let i = 1; i <= itemsCount; i++) {
    const oid = Math.floor(Math.random() * ordersCount) + 1;
    const pname = products[Math.floor(Math.random() * products.length)].replace(/'/g, "''");
    const qty = Math.floor(Math.random() * 5) + 1;
    const uprice = Number((9.99 + Math.random() * 140).toFixed(2));
    itemRows.push(`(${oid}, '${pname}', ${qty}, ${uprice})`);
  }
  appendBatchedInserts(sqlChunks, "order_items", "order_id, product_name, quantity, unit_price", itemRows);

  // 4. Audit Logs batch
  const logRows: string[] = [];
  for (let i = 1; i <= logsCount; i++) {
    const uid = Math.floor(Math.random() * usersCount) + 1;
    const act = actions[Math.floor(Math.random() * actions.length)];
    const ip = `192.168.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 250)}`;
    logRows.push(`(${uid}, '${act}', '${ip}', NOW() - INTERVAL '${Math.floor(Math.random() * 60)} days')`);
  }
  appendBatchedInserts(sqlChunks, "audit_logs", "user_id, action, ip_address, created_at", logRows);

  return sqlChunks.join("\n\n");
}

function appendBatchedInserts(sqlChunks: string[], table: string, columns: string, rows: string[]) {
  const chunkSize = 1000;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    sqlChunks.push(`INSERT INTO ${table} (${columns}) VALUES\n` + chunk.join(",\n") + ";");
  }
}
