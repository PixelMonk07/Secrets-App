export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  if (req.path.startsWith("/like/")) {
    return res.status(401).json({
      success: false,
      message: "Login required"
    });
  }

  res.redirect("/login");
};

export const isNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/secrets");
};