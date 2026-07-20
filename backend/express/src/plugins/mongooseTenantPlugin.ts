import { Schema, Query } from "mongoose";

export function mongooseTenantPlugin(schema: Schema) {
  schema.add({
    tenantId: {
      type: String,
      required: true,
      default: "default-tenant",
      index: true
    }
  });

  const queryMethods = [
    "find",
    "findOne",
    "findOneAndUpdate",
    "updateMany",
    "updateOne",
    "countDocuments",
    "deleteMany",
    "deleteOne"
  ];

  queryMethods.forEach((method) => {
    schema.pre(method as any, function (this: Query<any, any>, next) {
      const filter = this.getFilter();
      if (!filter.tenantId) {
        // Enforce tenant isolation if tenantId filter is not explicitly set
        this.where({ tenantId: filter.tenantId || "default-tenant" });
      }
      next();
    });
  });
}
