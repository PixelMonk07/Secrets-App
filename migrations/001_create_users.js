export const up = (pgm) => {
    pgm.createTable("users", {
        id: "id",
        email: { type: "varchar(100)", unique: true },
        password: { type: "text" }
    })
}

export const down = (pgm) => {
    pgm.dropTable("users");
}