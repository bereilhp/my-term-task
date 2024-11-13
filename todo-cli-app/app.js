import sqlite3 from "sqlite3";
import inquirer from "inquirer";

const db = new sqlite3.Database("./todos.db");

function initializeDB() {
  db.run(`CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY,
    description TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed'))
  )`);
}

function addTodo() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "description",
        message: "Enter task description:",
      },
    ])
    .then((answer) => {
      db.run(
        `INSERT INTO todos (description, status) VALUES (?, 'pending')`,
        [answer.description],
        function (err) {
          if (err) return console.error(err.message);
          console.log("Task added successfully!");
          mainMenu();
        }
      );
    });
}

function updateTodoStatus() {
  db.all(`SELECT id, description, status FROM todos`, (err, rows) => {
    if (err) {
      console.error(err.message);
      return mainMenu();
    }

    if (rows.length === 0) {
      console.log("No tasks available to update.");
      return mainMenu();
    }

    const taskChoices = rows.map((row) => ({
      name: `${row.id}. ${row.description} - [${row.status}]`,
      value: row.id,
    }));

    inquirer
      .prompt([
        {
          type: "list",
          name: "id",
          message: "Select the task to update:",
          choices: taskChoices,
        },
        {
          type: "list",
          name: "status",
          message: "Set new status:",
          choices: ["pending", "completed"],
        },
      ])
      .then((answer) => {
        db.run(
          `UPDATE todos SET status = ? WHERE id = ?`,
          [answer.status, answer.id],
          function (err) {
            if (err) return console.error(err.message);
            console.log(`Task ID ${answer.id} updated to ${answer.status}!`);
            mainMenu();
          }
        );
      });
  });
}

function listTodos() {
  db.all(`SELECT id, description, status FROM todos`, (err, rows) => {
    if (err) {
      console.error(err.message);
      return mainMenu();
    }

    if (rows.length === 0) {
      console.log("No tasks available.");
    } else {
      console.log("\nTo-Do List:");
      rows.forEach((row) => {
        console.log(`${row.id}. ${row.description} - [${row.status}]`);
      });
    }
    mainMenu();
  });
}

function mainMenu() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          { name: "Add a new task", value: "add" },
          { name: "Update task status", value: "update" },
          { name: "List all tasks", value: "list" },
          { name: "Exit", value: "exit" },
        ],
      },
    ])
    .then((answer) => {
      if (answer.action === "add") {
        addTodo();
      } else if (answer.action === "update") {
        updateTodoStatus();
      } else if (answer.action === "list") {
        listTodos();
      } else if (answer.action === "exit") {
        db.close();
        console.log("Goodbye!");
      }
    });
}

initializeDB();
mainMenu();
