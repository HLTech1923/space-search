# MongoDB Kafka API - TypeScript

This project uses:
- MongoDB 8.0.10 (latest RC)
- Kafka + Zookeeper
- ExpressJS with TypeScript
- KafkaJS to consume data from Kafka and store it in MongoDB

## 🧾 Main Features
- Listens to the `suppliers` topic in Kafka.
- Handles `insert`, `update`, and `delete` actions based on `vat_number`.
- Search API with support for keyword search, filtering, sorting, and pagination.

---

## 🚀 Run with Docker

### 1. Clone and install dependencies

```bash
npm install
```

### 2. Create `.env` file

```env
PORT=27017
DB_USER=admin
DB_PASS=admin123
APP_PORT=3000
```

### 3. Run Docker

```bash
docker-compose up -d
```

After startup:
- MongoDB: `mongodb://admin:admin123@localhost:27017`
- Mongo Express: http://localhost:8081
- Kafka: localhost:9092

---

## 📡 Send Sample Data to Kafka

Example using `kafkacat`:

```bash
echo '{ "vat_number": "VN001", "name": "Company A", "city": "HCM", "phone_number": "0123", "action": "insert" }' | kafkacat -b localhost:9092 -t suppliers
```

---

## 📘 Search API

Endpoint:
```
GET /api/suppliers
```

Query params:
- `keyword` (searches name, VAT, city, phone number)
- `filter_by_field=value` (e.g., city=HCM)
- `sort_by=name`, `sort_desc=true`
- `page=1`, `per_page=10`

---

## 📦 Useful Scripts

- `npm start`: run in dev mode using ts-node-dev
- `npm run build`: compile to JavaScript in the `dist/` folder

---

## 📁 Project Structure

```
mongo-kafka-api/
├── docker-compose.yml
├── .env
├── .gitignore
├── .dockerignore
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts
    ├── kafka/
    │   └── consumer.ts
    ├── models/
    │   └── Supplier.ts
    └── api/
        └── supplier.ts
```

---

## 🧠 Notes

- Make sure Kafka is running before starting the consumer.
- MongoDB needs Replica Set for Change Streams (not used here).
- Can be extended with a Kafka producer, authentication, or Dockerfile for full containerization.

---

Need help adding deployment or advanced features? I'm here to help!
