export const up = (pgm) => {
    pgm.createTable("secrets", {
        id: "id",
        user_id: { type: "integer", references: "users" },
        secret: { type: "text" },
        created_at: {type: "timestamp", default: pgm.func("current_timestamp")}
    })
}

export const down = (pgm) => {
    pgm.dropTable("secrets");
}