const express = require("express");

const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");
const toDate = require("date-fns/toDate");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
let db;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("app started listening at http://localhost:3000");
    });
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

initializeDbAndServer();

const checkRequestsQueries = async (request, response, next) => {
  const { search_q, category, priority, status, date } = request.query;
  const { todoId } = request.params;

  if (category !== undefined) {
    const categoryArray = ["WORK", "HOME", "LEARNING"];
    const isCategoryInArray = categoryArray.includes(category);

    if (isCategoryInArray) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid todo Category");
    }
  }

  if (priority !== undefined) {
    const priorityArray = ["HIGH", "MEDIUM", "LOW"];
    const isPriorityInArray = priority.includes(priority);

    if (isPriorityInArray) {
      request.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid todo Priority");
    }
  }

  if (status !== undefined) {
    const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    const isStatusInArray = statusArray.includes(status);

    if (isStatusInArray) {
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid todo Status");
    }
  }

  if (date !== undefined) {
    try {
      const myDate = new Date(date);

      const formatedDate = format(new Date(date), "yyyy-MM-dd");
      console.log(formatedDate, "f");
      const result = toDate(
        new Date(
          `${myDate.getFullYear()}-${myDate.getMonth() + 1}-${myDate.getDate()}`
        )
      );
      console.log(result, "r");
      console.log(new Date(), "new");

      const isValidDate = await isValid(result);
      console.log(isValidDate, "V");
      if (isValidDate === true) {
        request.date = formatedDate;
      } else {
        response.status(400);
        response.send("Invalid Due Date");
        return;
      }
    } catch (e) {
      response.status(400);
      response.send("Invalid Due Date");
      return;
    }
  }

  request.todoId = todoId;
  request.search_q = search_q;

  next();
};

const checkRequestsBody = async (request, response, next) => {
  const { id, todo, category, priority, status, dueDate } = request.body;

  console.log(id, todo, category, priority, status, dueDate);

  const { todoId } = request.params;

  if (category !== undefined) {
    const categoryArray = ["WORK", "HOME", "LEARNING"];
    const isCategoryInArray = categoryArray.includes(category);

    if (isCategoryInArray) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid todo Category");
      return;
    }
  }

  if (priority !== undefined) {
    const priorityArray = ["HIGH", "MEDIUM", "LOW"];
    const isPriorityInArray = priority.includes(priority);

    if (isPriorityInArray) {
      request.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid todo Priority");
      return;
    }
  }

  if (status !== undefined) {
    const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    const isStatusInArray = statusArray.includes(status);

    if (isStatusInArray) {
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid todo Status");
      return;
    }
  }

  if (dueDate !== undefined) {
    try {
      const myData = new Date(dueDate);

      const formattedDate = format(new Date(dueDate), "yyyy-MM-dd");
      console.log(formattedDate, "f");

      const result = toDate(new Date(formattedDate));

      console.log(result, "s");
      console.log(new Date(), "new");

      const isValidDate = isValid(result);
      console.log(isValidDate, "V");

      if (isValidDate) {
        request.dueDate = formattedDate;
      } else {
        response.status(400);
        response.send("Invalid Due Date");
        return;
      }
    } catch (error) {
      response.status(400);
      response.send("Invalid Due Date");
      return;
    }
  }
  request.id = id;
  request.todoId = todoId;
  request.todo = todo;

  next();
};

//GET Todos API-1
app.get("/todos/", checkRequestsQueries, async (request, response) => {
  const { status = "", search_q = "", priority = "", category = "" } = request;
  console.log(status, search_q, priority, category);

  const getTodosQuery = `SELECT 
                                id, todo,priority,status,category,due_date as dueDate 
                           FROM todo 
                           WHERE todo LIKE '%${search_q}%' AND priority LIKE '%${priority}%' AND category LIKE '%${category}%' AND status LIKE '%${status}%'`;

  const todosArray = await db.all(getTodosQuery);
  response.send(todosArray);
});

//GET Todo API-2
app.get("/todos/:todoId/", checkRequestsQueries, async (request, response) => {
  const todoId = request.todoId;

  const getTodoQuery = `SELECT * FROM todo WHERE id='${todoId}'`;
  const todoDetails = await db.get(getTodoQuery);
  response.send(todoDetails);
});

//GET Todo with specific date API-3
app.get("/agenda/", checkRequestsQueries, async (request, response) => {
  const { date } = request;
  console.log(date, "a");

  const selectDuaDateQuery = `
        SELECT
            id,
            todo,
            priority,
            status,
            category,
            due_date AS dueDate
        FROM 
            todo
        WHERE 
            due_date = '${date}'
        ;`;

  const todosArray = await db.all(selectDuaDateQuery);

  if (todosArray === undefined) {
    response.status(400);
    response.send("Invalid Due Date");
  } else if (todosArray.length < 1) {
    response.send("No todos found with specific due date");
  } else {
    response.send(todosArray);
  }
});

//Add todo API-4
app.post("/todos/", checkRequestsBody, async (request, response) => {
  const { id, todo, category, priority, status, dueDate } = request;

  const postTodoQuery = `INSERT INTO 
                            todo (id,todo,category,priority,status,due_date)
                            values
                            (
                                '${id}','${todo}','${category}','${priority}','${status}','${dueDate}'
                            )
  
  `;

  const createdTodo = await db.run(postTodoQuery);
  console.log(createdTodo, "todo created");
  response.send("todo created successfully");
});

//Update Todo API-5
app.put("/todos/:todoId/", checkRequestsBody, async (request, response) => {
  const { todoId, todo, status, priority, category, dueDate } = request;

  let updateTodoQuery;

  switch (true) {
    case status !== undefined:
      updateTodoQuery = `UPDATE todo SET status='${status}' WHERE id='${todoId}'`;
      await db.run(updateTodoQuery);
      response.send("status updated successfully");
      break;

    case todo !== undefined:
      updateTodoQuery = `UPDATE todo SET todo='${todo}' WHERE id='${todoId}'`;
      await db.run(updateTodoQuery);
      response.send("todo updated successfully");
      break;

    case priority !== undefined:
      updateTodoQuery = `UPDATE todo SET priority='${priority}' WHERE id='${todoId}'`;
      await db.run(updateTodoQuery);
      response.send("priority updated successfully");
      break;

    case category !== undefined:
      updateTodoQuery = `UPDATE todo SET category='${category}' WHERE id='${todoId}'`;
      await db.run(updateTodoQuery);
      response.send("category updated successfully");
      break;

    case dueDate !== undefined:
      updateTodoQuery = `UPDATE todo SET due_date='${dueDate}' WHERE id='${todoId}'`;
      await db.run(updateTodoQuery);
      response.send("Dua Date updated successfully");
      break;
  }
});
