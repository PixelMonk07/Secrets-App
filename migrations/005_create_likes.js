export const up = (pgm) => {
  pgm.createTable("likes", {
    id: "id",
    user_id: {
      type: "integer",
      notNull: true,
      references: "users",
      onDelete: "CASCADE"
    },
    secret_id: {
      type: "integer",
      notNull: true,
      references: "secrets",
      onDelete: "CASCADE"
    },
    created_at: {
      type: "timestamp",
      default: pgm.func("current_timestamp")
    }
  });

  pgm.createIndex("likes", ["user_id", "secret_id"], {
    unique: true
  });
};

export const down = (pgm) => {
  pgm.dropTable("likes");
};