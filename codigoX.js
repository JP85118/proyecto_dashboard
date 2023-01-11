/* app.post("/users/dashboard/:id", (req, res) => {
  let todoList = [];
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
  let todoList = [];
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
}); */