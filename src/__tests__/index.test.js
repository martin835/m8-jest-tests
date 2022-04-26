// Today we cover UNIT testing
// https://kentcdodds.com/blog/static-vs-unit-vs-integration-vs-e2e-tests

// First issue: we cannot use the import syntax in Jest
// To solve this:
// https://jestjs.io/docs/ecmascript-modules

// Second issue: we are starting the server WHILE importing the module
// To solve this:
// we can separate our express app configuration

import app from "../app.js";
import supertest from "supertest";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const client = supertest(app);

describe("Testing the environment", () => {
  beforeAll(async () => {
    console.log("beforeAll");
    await mongoose.connect(process.env.MONGO_URL_TEST);
  });

  test("a very simple check", () => {
    expect(true).toBe(true);
  });

  test("that the test endpoint is returning a success message", async () => {
    const response = await client.get("/test");

    console.table(response.body);
    expect(response.body.message).toBe("Hello, World!");
  });

  const validProduct = {
    name: "Test Product",
    price: 100,
  };

  let productId;

  // "it" and "test" are the same function i.e. "it" is just an alias
  it("should test than when creating a product we are receiving a product id and a 201 status", async () => {
    const response = await client.post("/products").send(validProduct);

    expect(response.status).toBe(201);

    console.table(response.body);
    expect(response.body._id).toBeDefined();

    productId = response.body._id;
  });

  const invalidProduct = {
    price: "100",
  };

  it("should test that when creating a product with invalid data we receive 400", async () => {
    const response = await client.post("/products").send(invalidProduct);

    expect(response.status).toBe(400);
  });

  it("should test that when retrieve a product with ID we are receiving a product", async () => {
    const response = await client.get("/products/" + productId);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe(validProduct.name);
  });

  it("Should test /products/:id endpoint and get 404 for non-existing ID `999999999999999999999999` and get back product for correct id.", async () => {
    const response = await client.get("/products/999999999999999999999999");
    expect(response.status).toBe(404);
  });

  it("Should test /products/:id endpoint and get back product for correct id.", async () => {
    console.log(productId);
    const response = await client.get(`/products/${productId}`);
    console.log(response.body);
    expect(response.body.name && response.body.price).toBe(
      validProduct.name && validProduct.price
    );
  });

  afterAll(async () => {
    console.log("afterAll");
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });
});
