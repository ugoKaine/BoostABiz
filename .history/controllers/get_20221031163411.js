exports.getLogin = (req, res, next) => {
  res.render("auth/login");
};

exports.getReceipt = (req, res, next) => {
  res.render("user/generateReceipt");
};
exports.getAddproduct = (req, res, next) => {
  res.render("admin/addproduct");
};

exports.getCreateUser = (req, res, next) => {
  res.render("admin/createUser");
};
exports.getCheckUser = (req, res, next) => {
  res.render("admin/checkUser");
};
exports.getIndex = (req, res, next) => {
  res.render("user/index");
};
