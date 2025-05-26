
# MongoDB Kafka API - TypeScript

This project integrates MongoDB, Kafka, and ExpressJS, utilizing TypeScript to provide a scalable solution for handling data from Kafka topics and interacting with a MongoDB database.

### Technologies Used:
- MongoDB 8.0.10 (latest RC)
- Kafka + Zookeeper
- ExpressJS with TypeScript
- KafkaJS to consume data from Kafka and store it in MongoDB

## 🧾 Key Features
- Listens to the `suppliers` topic in Kafka.
- Handles `insert`, `update`, and `delete` operations based on `vat_number`.
- Provides a search API with support for keyword search, filtering, sorting, and pagination.

---

## 🚀 Running the Application with Docker

### 1. Clone the Repository and Install Dependencies

```bash
npm install
```

### 2. Create a `.env` File

Ensure that the `.env` file is created in the root directory with the following content:

```env
PORT=27017
DB_USER=admin
DB_PASS=admin123
APP_PORT=3001

NODE_ENV=test npm test

KAFKA_ID=KARKA_ID_IN_CONTAINER
KAFKA_HOST=kafka:9092
FOLDER_NAME_OF_MAIN_BE=space-be
```

### 3. Run the Application with Docker

Use Docker Compose to set up and start all the necessary services:

```bash
docker-compose up --build -d
```

After the application starts:
- **MongoDB** will be available at: `mongodb://admin:admin123@localhost:27017`
- **Mongo Express** will be accessible via: [http://localhost:8081](http://localhost:8081)
- **Kafka** will be available at: `localhost:9092`

### 4. Get Kafka Container ID (Optional)

To retrieve the Kafka container ID, run the following command:

```bash
docker inspect --format '{{.Id}}' $(docker ps -qf "name=kafka")
```

### 5. Shut Down the Services

To stop and remove the containers:

```bash
docker-compose down
```

---

## 📡 Sending Sample Data to Kafka

Use `kafkacat` to send sample data to Kafka. Below is an example command for inserting a supplier:

```bash
echo '{ "vat_number": "VN001", "name": "Company A", "city": "HCM", "phone_number": "0123", "action": "insert" }' | kafkacat -b localhost:9092 -t suppliers
```

---

## 📘 Search API

The search API allows querying of suppliers with various filters and sorting options.

### Endpoint:
```
POST v1/api/suppliers
```

### Query Body:
- `keyword`: Searches across `name`, `vat_number`, `city`, and `phone_number`.
- `sort_by=name`: Sort results by the specified field (default is `name`).
- `sort_desc=true`: Sort in descending order.
- `page=1`: Page number (default is `1`).
- `per_page=10`: Number of results per page (default is `10`).

---

## 📦 Useful Scripts

- **`npm start`**: Run in development mode using `ts-node-dev`.
- **`npm run build`**: Compile TypeScript code into JavaScript and output it to the `dist/` directory.

---

## 📁 Project Structure

```
mongo-kafka-api/
├── docker-compose.yml      # Docker Compose configuration
├── .env                    # Environment variables file (required)
├── .gitignore              # Git ignore file
├── .dockerignore           # Docker ignore file
├── package.json            # NPM dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── src/
    ├── index.ts            # Main entry point
    ├── kafka/
    │   └── consumer.ts     # Kafka consumer logic
    ├── models/
    │   └── Supplier.ts     # Supplier model definition
    └── api/
        └── supplier.ts     # API routes for handling suppliers
```

---

## 🧠 Notes

- Ensure **Kafka** is running before starting the consumer. You can use `docker-compose up` to start all services.
- MongoDB requires a **Replica Set** for Change Streams, but this is not utilized in this setup.
- The project can be extended with a **Kafka producer**, **authentication**, or **full Docker containerization** for deployment.
- Run **docker network ls** to retrieve **${FOLDER_NAME_OF_MAIN_BE}_app-network** and replace it in **docker-compose.yml** if the network name differs from space-be_app-network at the end of the file.
```
networks:
  space-be_app-network:
    external: true
```

---

## 📝 Need Help?

If you need assistance with deployment or adding advanced features, feel free to reach out. I'm here to help!
