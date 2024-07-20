const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const createSucess = require("../utils/sucess");
const createError = require("../utils/error");
dotenv.config();

const login = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    if (username == process.env.AUTH_USERNAME) {
      if (password == process.env.AUTH_PASSWORD) {
        const user_log = {
          user_id: 1611,
          user_name: "Olga Constructions",
          auth: true,
        };
        const token = jwt.sign(user_log, process.env.JWT_SECRET, {
          expiresIn: "24h",
        });
        res
          .status(201)
          .json(
            createSucess(201, "Login Success", { auth: true, token: token })
          );
      } else {
        return next(createError(404, "Incorrect password."));
      }
    } else {
      return next(createError(404, "Incorrect User."));
    }
  } catch (error) {
    console.log("Error while login" + "\n" + error);
    return next(createError(500, "Login Failed"));
  }
};

module.exports = { login };
