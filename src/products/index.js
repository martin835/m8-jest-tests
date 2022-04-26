import express from "express";
import Product from "./model.js";

const productsRouter = express.Router();

productsRouter
  .post("/", async (req, res, next) => {
    try {
      const product = new Product(req.body);
      await product.save();
      res.status(201).send(product);
    } catch {
      res.status(400).send();
    }
  })
  .get("/:id", async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).send();
      }
      res.send(product);
    } catch (error) {
      res.status(400).send();
    }
  })
  .delete("/:id", async (req, res, next) => {
    try {
      const deleteProduct = await Product.findByIdAndDelete(req.params.id);
      if (deleteProduct) {
        res.status(204).send();
      } else {
        res.status(404).send();
      }
    } catch (error) {}
  })
  .put("/:id", async (req, res, next) => {
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id, // WHO
        req.body, // HOW
        { new: true, runValidators: true } // OPTIONS by default findByIdAndUpdate returns the record pre-modification, if you want to get back the newly updated record you should use the option new: true
        // by default validation is off here, if you want to have it --> runValidators: true as an option
      );

      // ****************** ALTERNATIVE METHOD *******************
      // const user = await UsersModel.findById(req.params.userId)

      // user.firstName = "John"

      // await user.save()

      if (updatedProduct) {
        res.send(updatedProduct);
      } else {
        res.status(404).send();
      }
    } catch (error) {
      next(error);
    }
  });

export default productsRouter;
