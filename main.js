const express = require("express");
const app = express();
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
const passport = require("passport");
const inizializePassport = require("./passportConfig");
const path = require("path");

inizializePassport(passport);

//*middleware
app.set("view engine", "ejs");
//middleware que permite enviar datos de un formulario a un base de datos
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "secret", // se maneja de forma privada
    resave: false, // sesion abierta o cerrada
    saveUninitialized: false, //se guarda la contraseña al momento de iniciar sesion
  })
);
app.use(flash());
app.use(passport.session());
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

//* routes get
app.get("/", (req, res) => {
  //res.send('Welcome to the app!')
  res.render("index");
});

app.get("/users/register", checkAuthenticated, (req, res) => {
  res.render("register");
});

app.get("/users/login", checkAuthenticated, (req, res) => {
  res.render("login");
});

app.get("/users/olvidoCon", (req, res) => {
  res.render("olvidoCon");
});

app.get("/users/dashboard", checkNotAuthenticated, async (req, res) => {
  try {
    const todoList = await pool.query(`SELECT * FROM todolist`);
    res.render("dashboard", {
      user: req.user.username,
      todoList: todoList.rows,
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/users/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      throw err;
    }
  });
  req.flash("Se cerro la sesion de manera correcta");
  res.redirect("/");
});

//* routes post
app.post("/users/register", async (req, res) => {
  //?desestructuracion de los datos del formulario
  let { username, email, password, password2 } = req.body;

  console.log({
    username,
    email,
    password,
    password2,
  });

  //?validaciones en el formulario de registro
  let errors = [];

  if (!username || !email || !password || !password2) {
    errors.push({ msg: "Por favor ingrese la informacion requerida" });
  }

  if (password !== password2) {
    errors.push({ msg: "Las contraseñas no coinciden" });
  }

  if (password.length < 6) {
    errors.push({ msg: "La contraseña debe tener al menos 6 caracteres" });
  }

  if (errors.length > 0) {
    res.render("register", { errors });
  } else {
    //?encriptacion de contraseña

    const encryptPassword = await bcrypt.hash(password, 10);
    console.log(encryptPassword);

    pool.query(
      `SELECT * FROM loginregister WHERE email = $1`,
      [email],
      (err, result) => {
        if (err) {
          throw err;
        }
        console.log(result.rows);
        if (result.rows.length > 0) {
          errors.push({
            msg: "El email ya esta registrado, Inicie sesión, gracias",
          });
          res.render("register", { errors });
        } else {
          pool.query(
            `INSERT INTO loginregister (username, email, password) 
              VALUES ($1, $2, $3)
              RETURNING id, password`,
            [username, email, encryptPassword],
            (err, result) => {
              if (err) {
                throw err;
              }
              console.log(result.rows);
              req.flash(
                "success_msg",
                "Cuenta creada con exito, Ya puede iniciar sesion"
              );
              res.redirect("/users/login");
            }
          );
        }
      }
    );
  }
});

app.post(
  "/users/login",
  passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })
);

//? route para actualizar la contraseña

app.post("/users/olvidoCon", async (req, res) => {
  const { email, password } = req.body;
  const passwordEncrypted = await bcrypt.hash(password, 10);
  pool.query(
    "UPDATE loginregister SET password = $1 WHERE email = $2",
    [passwordEncrypted, email],
    (err, result) => {
      if (err) {
        throw err;
      }
      req.flash("success_msg", "Contraseña Actualizada, ahora inicia sesion");
      res.redirect("/users/login");
    }
  );
});

//? funciones para verificar si esta autentificado
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/dashboard");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

//*Configuracion de las solicitudes para el todo app

app.post("/users/dashboard", async (req, res) => {
  try {
    const { description } = req.body;
    const newTodo = await pool.query(
      `
      INSERT INTO todolist(description) 
      VALUES($1) RETURNING * `,
      [description]
    );
    todoList.push(newTodo.rows[0]);
    res.render("dashboard", {
      user: req.user.username,
      todoList: todoList.rows,
    });
  } catch (error) {
    console.error(error);
  }
});

app.post("/users/dashboard/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
      pool.query(
      ` UPDATE todolist SET description =$1 WHERE id = $2 RETURNING * `,
      [description, id],
      (err, result) => {
        if (err) throw err;
      }
    );
    res
      .status(200)
      .render("dashboard", {
        user: req.user.username,
        todoList: todoList.rows,
      });
  } catch (error) {
    console.error(error);
  }
});

app.delete("/users/dashboard/:id", async (req, res) => {
  try {
    const { id } = req.params;
      await pool.query(
      `DELETE FROM todolist WHERE id = $1 RETURNING *`,
      [id],
      (err, result) => {
        if (err) throw err;
      }
      );
      const pos = todoList.findIndex((item) => item.id === id)
      if(pos !== -1){
        todoList.splice(pos, 1);
      }
    res.redirect('/users/dashboard')
      .render("dashboard", {
        user: req.user.username,
        todoList: todoList.rows,
      });
  } catch (error) {
    console.error(error);
    res.sendStatus(500)
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
