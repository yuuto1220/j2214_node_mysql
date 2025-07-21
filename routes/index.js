const express = require('express');
const router = express.Router();
const knex = require('../db/knex');

router.get('/calendar', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  if (!isAuth) {
    return res.redirect('/signin');
  }
  const userId = req.user.id;
  knex("tasks")
    .select("*")
    .where({user_id: userId})
    .then(function (results) {
      // FullCalendar用イベントデータに変換
      const events = results.map(task => ({
        title: task.content,
        start: task.due_date instanceof Date
          ? task.due_date.toISOString().slice(0, 10) // YYYY-MM-DD
          : String(task.due_date).slice(0, 10)
      }));
      res.render('calendar', {
        isAuth: isAuth,
        events: events
      });
    })
    .catch(function (err) {
      res.render('calendar', {
        isAuth: isAuth,
        events: [],
        errorMessage: [err.sqlMessage]
      });
    });
});

router.get('/', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  if (isAuth) {
    const userId = req.user.id;
    knex("tasks")
      .select("*")
      .where({user_id: userId})
      .then(function (results) {
        res.render('index', {
          title: 'ToDo App',
          todos: results,
          isAuth: isAuth,
        });
      })
      .catch(function (err) {
        console.error(err);
        res.render('index', {
          title: 'ToDo App',
          isAuth: isAuth,
          errorMessage: [err.sqlMessage],
        });
      });
  } else {
    res.render('index', {
      title: 'ToDo App',
      isAuth: isAuth,
    });
  }
});

router.post('/', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  const userId = req.user.id;
  const todo = req.body.add;
  const dueDate = req.body.dueDate; // 追加
  knex("tasks")
    .insert({user_id: userId, content: todo, due_date: dueDate}) // 追加
    .then(function () {
      res.redirect('/')
    })
    .catch(function (err) {
      // ...existing code...
    });
});

router.use('/signup', require('./signup'));
router.use('/signin', require('./signin'));
router.use('/logout', require('./logout'));

module.exports = router;