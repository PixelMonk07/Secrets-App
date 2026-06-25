export const up = (pgm) => {
    // For sessions table
    pgm.createTable("session", {
        sid: { type: "varchar", primaryKey: true },
        sess: { type: "json", notNull: true },
        expire: { type: "timestamp", notNull: true }
    })
}

export const down = (pgm) => {
    pgm.dropTable("session");
}