import express from "express";
import { Supplier } from "../models/Supplier";

const router = express.Router();

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

export default router;
