const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");

function inizialize(passport) {
  const authUser = (email, password, relize) => {
    pool.query(
      `SELECT * FROM loginregister WHERE email = $1`,
      [email],
      (err, result) => {
        if (err) throw err; //error en el caso en el que el email no exista
        console.log(result.rows);

        if (result.rows.length > 0) {
          const user = result.rows[0];
          // en el caso en que el email exista se realiza una comparacion de la contraseña con la de la base de datos
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err; //error en el caso en el las contraseñas no coinciden
            if (isMatch) {
              return relize(null, user);
            } else {
              return relize(null, false, {
                message: "Contraseña invalida",
              });
            }
          });
        } else {
          return relize(null, false, {
            message: "Email invalido, por favor registrese",
          });
        }
      }
    );
  };

  //middleware de passport
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      authUser
    )
  );

  // middleware que funciona para almacenar la sesion por medio de la columna ID
  passport.serializeUser((user, relize) => relize(null, user.id));

  // este middleware funciona para que la sesion de mantenga activa
  passport.deserializeUser((id, relize) => {
    pool.query(
      `SELECT * FROM loginregister WHERE id = $1`,
      [id],
      (err, result) => {
        if (err) throw err;
        return relize(null, result.rows[0]);
      }
    );
  });
}

module.exports = inizialize;
