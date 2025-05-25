import request from "supertest";
import app from "../src/index"; // assuming you export app from index.ts

describe("GET /api/suppliers", () => {
  it("should return 200 and a paginated list", async () => {
    const res = await request(app).get("/api/suppliers?page=1&per_page=5");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("pagination");
  });
});
