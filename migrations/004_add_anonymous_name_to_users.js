export const up = (pgm) => {
  pgm.addColumn("users", {
    anonymous_name: { type: "varchar(100)", unique: true }
  });
};

export const down = (pgm) => {
  pgm.dropColumn("users", "anonymous_name");
};