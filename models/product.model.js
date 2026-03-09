// src/models/product.model.js
const { GetCommand, PutCommand, UpdateCommand, DeleteCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { docClient } = require("../utils/dynamoclient.js");

const TABLE_NAME = process.env.PRODUCTS_TABLE;

// Estructura esperada del producto:
// {
//   productId: string,
//   name: string,
//   description: string,
//   category: string,
//   price: number,
//   currency: string,
//   stock: number,
//   isActive: boolean,
//   createdAt: ISO_DATE,
//   updatedAt: ISO_DATE
// }

function nowIso() {
  return new Date().toISOString();
}

async function createProduct(product) {
  const item = {
    ...product,
    isActive: product.isActive ?? true,
    createdAt: product.createdAt ?? nowIso(),
    updatedAt: nowIso(),
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
      // evita sobrescribir si ya existe
      ConditionExpression: "attribute_not_exists(productId)",
    })
  );

  return item;
}

async function getProductById(productId) {
  const res = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { productId },
    })
  );
  return res.Item ?? null;
}

async function listProducts() {
  // Simple (para la tarea): Scan
  const res = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );
  return res.Items ?? [];
}

async function updateProduct(productId, patch) {
  // Actualización simple: set campos del patch
  const allowed = ["name", "description", "category", "price", "currency", "stock", "isActive"];
  const toUpdate = {};
  for (const k of allowed) if (patch[k] !== undefined) toUpdate[k] = patch[k];

  // nada que actualizar
  if (Object.keys(toUpdate).length === 0) return await getProductById(productId);

  // construir UpdateExpression dinámico
  const exprNames = {};
  const exprValues = {};
  const sets = [];

  for (const [k, v] of Object.entries(toUpdate)) {
    exprNames[`#${k}`] = k;
    exprValues[`:${k}`] = v;
    sets.push(`#${k} = :${k}`);
  }

  // timestamps
  exprNames["#updatedAt"] = "updatedAt";
  exprValues[":updatedAt"] = nowIso();
  sets.push("#updatedAt = :updatedAt");

  const res = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { productId },
      UpdateExpression: `SET ${sets.join(", ")}`,
      ExpressionAttributeNames: exprNames,
      ExpressionAttributeValues: exprValues,
      ReturnValues: "ALL_NEW",
      ConditionExpression: "attribute_exists(productId)",
    })
  );

  return res.Attributes;
}

async function deleteProduct(productId) {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { productId },
    })
  );
  return { deleted: true };
}

module.exports = {
  createProduct,
  getProductById,
  listProducts,
  updateProduct,
  deleteProduct,
};