import { startKafkaConsumer, shutdownKafkaConsumer } from "./../../src/kafka/consumer";
import { Supplier } from "./../../src/models/Supplier";

// Mock kafkajs
jest.mock("kafkajs", () => {
  const mockEachMessage = jest.fn();
  const mockRun = jest.fn().mockImplementation(({ eachMessage }) => {
    mockEachMessage.mockImplementation(eachMessage);
  });

  const mockConsumer = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    subscribe: jest.fn(),
    run: mockRun,
    __eachMessage: mockEachMessage,
  };

  return {
    Kafka: jest.fn().mockImplementation(() => ({
      consumer: jest.fn().mockImplementation((config) => {
        if (!config || !config.groupId) {
          throw new Error("Missing groupId in consumer config");
        }
        return mockConsumer;
      }),
    })),
  };
});

// Mock Supplier model
jest.mock("./../../src/models/Supplier");

const mockSupplier = Supplier as jest.Mocked<typeof Supplier>;

// Setup reusable variables
const sampleCreateMessage = {
  action: "create",
  data: {
    name: "Test Supplier",
    vat_number: "12345678",
  },
};

const sampleUpdateMessage = {
  action: "update",
  data: {
    name: "Updated Supplier",
    vat_number: "12345678",
  },
};

const sampleDeleteMessage = {
  action: "delete",
  data: {
    vat_number: "12345678",
  },
};

describe("Kafka Consumer", () => {
  let eachMessage: any;

  beforeAll(async () => {
    await startKafkaConsumer();
    const { Kafka } = require("kafkajs");
    const instance = new Kafka({});
    const consumer = instance.consumer({ groupId: "supplier-group" });
    eachMessage = consumer.__eachMessage;
  });

  afterAll(async () => {
    await shutdownKafkaConsumer();
    jest.clearAllMocks();
  });

  it("should create a new supplier if not exists", async () => {
    mockSupplier.findOne.mockResolvedValue(null);
    mockSupplier.create.mockResolvedValue({
      _id: "some-id",
      name: "Test Supplier",
      vat_number: "12345678",
      phone_number: "0342384234",
    } as any);
    await eachMessage({
      message: {
        value: Buffer.from(JSON.stringify(sampleCreateMessage)),
      },
    });

    expect(mockSupplier.create).toHaveBeenCalledWith(sampleCreateMessage.data);
  });

  it("should update supplier if already exists", async () => {
    mockSupplier.findOne.mockResolvedValue({ vat_number: "12345678" });
    mockSupplier.updateOne.mockResolvedValue({
      _id: "some-id",
      name: "Test Supplier",
      vat_number: "12345678",
      phone_number: "0342384234",
    } as any);

    await eachMessage({
      message: {
        value: Buffer.from(JSON.stringify(sampleUpdateMessage)),
      },
    });

    expect(mockSupplier.updateOne).toHaveBeenCalledWith(
      { vat_number: "12345678" },
      sampleUpdateMessage.data
    );
  });

  it("should delete supplier if exists", async () => {
    mockSupplier.findOne.mockResolvedValue({ vat_number: "12345678" });
    mockSupplier.deleteOne.mockResolvedValue({
      _id: "some-id",
      name: "Test Supplier",
      vat_number: "12345678",
      phone_number: "0342384234",
    } as any);

    await eachMessage({
      message: {
        value: Buffer.from(JSON.stringify(sampleDeleteMessage)),
      },
    });

    expect(mockSupplier.deleteOne).toHaveBeenCalledWith({
      vat_number: "12345678",
    });
  });

  it("should not delete supplier if not exists", async () => {
    mockSupplier.findOne.mockResolvedValue(null);
    mockSupplier.deleteOne.mockClear();

    await eachMessage({
      message: {
        value: Buffer.from(JSON.stringify(sampleDeleteMessage)),
      },
    });

    expect(mockSupplier.deleteOne).not.toHaveBeenCalled();
  });

  it("should handle invalid JSON message", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    await eachMessage({
      message: {
        value: Buffer.from("invalid-json"),
      },
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
