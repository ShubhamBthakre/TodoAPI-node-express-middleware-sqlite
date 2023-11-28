const express = require("express");

const app = express();
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
      const myData = new Date(date);

      const formattedDate = format(myData, "yyyy-MM-dd");
      console.log(formattedDate, "f");

      const result = toDate(
        new Date(
          `${myDate.getFullYear()}-${myDate.getMonth() + 1}-${myDate.getDate()}`
        )
      );

      console.log(result, "s");
      console.log(new Date(), "new");

      const isValidDate = await isValid(result);
      console.log(isValidDate, "V");

      if (isValidDate) {
        request.date = formattedDate;
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
    } catch (error) {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }

  request.todoId = todoId;
  request.search_q = search_q;

  next();
};

const checkRequestsBody = async (request, response, next) => {
  const { search_q, category, priority, status, date } = request.body;
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
      const myData = new Date(date);

      const formattedDate = format(myData, "yyyy-MM-dd");
      console.log(formattedDate, "f");

      const result = toDate(
        new Date(
          `${myDate.getFullYear()}-${myDate.getMonth() + 1}-${myDate.getDate()}`
        )
      );

      console.log(result, "s");
      console.log(new Date(), "new");

      const isValidDate = await isValid(result);
      console.log(isValidDate, "V");

      if (isValidDate) {
        request.date = formattedDate;
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
    } catch (error) {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }

  request.todoId = todoId;
  request.search_q = search_q;
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
  const { todoId } = request;

  const getTodoQuery = `SELECT * FROM todo WHERE id='${todoId}'`;
  const todoDetails = await db.get(getTodoQuery);
  response.send(todoDetails);
});
