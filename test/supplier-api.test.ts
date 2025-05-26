import request from 'supertest';
import express from 'express';
import { Router } from 'express';
import { Supplier } from '../src/models/Supplier';

// Define the router directly in the test file
const router = Router();

router.post("/suppliers", async (req, res) => {
  const {
    page = 1,
    per_page = 10,
    keyword = "",
    sort_by = "name",
    sort_desc = "false",
    ...filters
  } = req.body;
  const query: any = {};

  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { vat_number: { $regex: keyword, $options: "i" } },
      { city: { $regex: keyword, $options: "i" } },
      { phone_number: { $regex: keyword, $options: "i" } },
    ];
  }

  for (const key in filters) {
    if (filters[key]) {
      query[key] = filters[key];
    }
  }

  const sortOptions: any = {};
  sortOptions[sort_by as string] = sort_desc === "true" ? -1 : 1;

  const total = await Supplier.countDocuments(query);
  const data = await Supplier.find(query)
    .sort(sortOptions)
    .skip((+page - 1) * +per_page)
    .limit(+per_page);

  res.json({
    data,
    pagination: {
      total,
      page: +page,
      per_page: +per_page,
      totalPages: Math.ceil(total / +per_page),
    },
  });
});

// Mock the Supplier model
jest.mock('../src/models/Supplier');

// Set up Express app for testing
const app = express();
app.use(express.json());
app.use(router);

describe('POST /suppliers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated suppliers with default parameters', async () => {
    const mockSuppliers = [
      { _id: '1', name: 'Supplier A', vat_number: 'VAT123', city: 'Hanoi', phone_number: '1234567890' },
      { _id: '2', name: 'Supplier B', vat_number: 'VAT456', city: 'Saigon', phone_number: '0987654321' },
    ];

    (Supplier.countDocuments as jest.Mock).mockResolvedValue(2);
    (Supplier.find as jest.Mock)
      .mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockSuppliers),
      });

    const response = await request(app)
      .post('/suppliers')
      .send({ page: 1, per_page: 10 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: mockSuppliers,
      pagination: {
        total: 2,
        page: 1,
        per_page: 10,
        totalPages: 1,
      },
    });

    expect(Supplier.countDocuments).toHaveBeenCalledWith({});
    expect(Supplier.find).toHaveBeenCalledWith({});
    expect(Supplier.find().sort).toHaveBeenCalledWith({ name: 1 });
    expect(Supplier.find().skip).toHaveBeenCalledWith(0);
    expect(Supplier.find().limit).toHaveBeenCalledWith(10);
  });

  it('should filter suppliers by keyword across multiple fields', async () => {
    const mockSuppliers = [
      { _id: '1', name: 'Supplier A', vat_number: 'VAT123', city: 'Hanoi', phone_number: '1234567890' },
    ];

    (Supplier.countDocuments as jest.Mock).mockResolvedValue(1);
    (Supplier.find as jest.Mock)
      .mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockSuppliers),
      });

    const response = await request(app)
      .post('/suppliers')
      .send({ keyword: 'Hanoi', page: 1, per_page: 5 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: mockSuppliers,
      pagination: {
        total: 1,
        page: 1,
        per_page: 5,
        totalPages: 1,
      },
    });

    expect(Supplier.countDocuments).toHaveBeenCalledWith({
      $or: [
        { name: { $regex: 'Hanoi', $options: 'i' } },
        { vat_number: { $regex: 'Hanoi', $options: 'i' } },
        { city: { $regex: 'Hanoi', $options: 'i' } },
        { phone_number: { $regex: 'Hanoi', $options: 'i' } },
      ],
    });
  });

  it('should apply filters and sort in descending order', async () => {
    const mockSuppliers = [
      { _id: '2', name: 'Supplier B', vat_number: 'VAT456', city: 'Saigon', phone_number: '0987654321' },
    ];

    (Supplier.countDocuments as jest.Mock).mockResolvedValue(1);
    (Supplier.find as jest.Mock)
      .mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockSuppliers),
      });

    const response = await request(app)
      .post('/suppliers')
      .send({
        city: 'Saigon',
        sort_by: 'name',
        sort_desc: 'true',
        page: 1,
        per_page: 10,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: mockSuppliers,
      pagination: {
        total: 1,
        page: 1,
        per_page: 10,
        totalPages: 1,
      },
    });

    expect(Supplier.countDocuments).toHaveBeenCalledWith({ city: 'Saigon' });
    expect(Supplier.find).toHaveBeenCalledWith({ city: 'Saigon' });
    expect(Supplier.find().sort).toHaveBeenCalledWith({ name: -1 });
  });

  it('should handle empty results', async () => {
    (Supplier.countDocuments as jest.Mock).mockResolvedValue(0);
    (Supplier.find as jest.Mock)
      .mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });

    const response = await request(app)
      .post('/suppliers')
      .send({ keyword: 'Nonexistent', page: 2, per_page: 5 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: [],
      pagination: {
        total: 0,
        page: 2,
        per_page: 5,
        totalPages: 0,
      },
    });
  });
});