import debug from 'debug';
import Task from '../models/task';
import { validateTask } from '../utils/validator';
import { ACTION_FLG, PAGING } from '../utils/constant';

const debugError = debug('Services:Error>>>'); // eslint-disable-line
const debugInfo = debug('Services:Info>>>'); // eslint-disable-line

export function getTask(req, res) {
  const { taskId } = req.params;
  if (!taskId) {
    return res.status(400).json({ errors: { common: 'Please task id' } });
  } else {
    Task.findById(taskId)
      .where('flg')
      .ne(ACTION_FLG.DELETED)
      .select({ __v: 0, flg: 0 })
      .exec()
      .then((task) => {
        if (task) return res.status(200).json({ task });
        else return res.status(400).json({ errors: { common: 'Not Found' } });
      })
      .catch((error) => {
        return res.status(500).json({
          message: error.message,
          errors: { common: 'Server Error' }
        });
      });
  }
}

export function getTasks(req, res) {
  let page = parseInt(req.query.page) ? parseInt(req.query.page) : PAGING.PAGE;
  let pageSize = parseInt(req.query.pageSize) ? parseInt(req.query.pageSize) : PAGING.PAGE_SIZE;
  let cond = { flg: { $ne: ACTION_FLG.DELETED } };

  const countQuery = Task.count(cond);
  const query = Task.find(cond).select({ __v: 0, flg: 0 }).sort('-createdAt').limit(pageSize);
  if (page !== 0) query.skip(page * pageSize);

  Promise.all([countQuery.exec(), query.exec()])
    .then((result) => {
      return res.status(200).json({
        tasks: result[1],
        paging: {
          page,
          pageSize,
          total: result[0]
        }
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: error.message,
        errors: { common: 'Server Error' }
      });
    });
}

export function createTask(req, res) {
  let errors = validateTask(req.body);
  if (errors) {
    return res.status(400).json({ errors });
  } else {
    const newTask = new Task();
    newTask.title = req.body.title;
    newTask
      .save()
      .then((task) => {
        return res.status(200).json({
          message: 'Create Successful',
          task
        });
      })
      .catch((err) => {
        return res.status(500).json({
          message: err.message,
          errors: { common: 'Server Error' }
        });
      });
  }
}

export function updateTask(req, res) {
  const { taskId } = req.params;
  if (!taskId) {
    return res.status(400).json({
      errors: { common: 'Please provide task id' }
    });
  } else {
    const errors = validateTask(req.body);
    if (errors) {
      return res.status(400).json({ errors });
    } else {
      const updateTask = {
        title: req.body.title,
        done: req.body.done
      };
      Task.findOneAndUpdate(
        {
          _id: taskId,
          flg: { $ne: ACTION_FLG.DELETED }
        },
        { $set: updateTask },
        { new: true }
      )
        .exec()
        .then((task) => {
          return res.status(200).json({
            message: 'Update Successful',
            task
          });
        })
        .catch((err) => {
          return res.status(500).json({
            message: err.message,
            errors: { common: 'Server Error' }
          });
        });
    }
  }
}

export function hardDeleteTask(req, res) {
  let { taskId } = req.params;
  if (!taskId) {
    return res.status(400).json({
      errors: { common: 'Please provide task id' }
    });
  } else {
    Task.findByIdAndRemove(taskId)
      .then((task) => {
        return res.status(200).json({
          message: 'Delete Successful',
          task
        });
      })
      .catch((err) => {
        return res.status(500).json({
          errors: { common: 'Delete Failed' },
          message: err.message
        });
      });
  }
}

export function deleteTask(req, res) {
  const { taskId } = req.params;
  if (!taskId) {
    return res.status(400).json({
      errors: { common: 'Please provide task id' }
    });
  } else {
    Task.findByIdAndUpdate(taskId, { $set: { flg: ACTION_FLG.DELETED } }, { new: true })
      .select('_id title createdAt')
      .exec()
      .then((task) => {
        if (task) {
          return res.status(200).json({
            message: 'Delete Successful',
            task
          });
        } else {
          return res.status(500).json({
            errors: { common: 'Delete Failure' }
          });
        }
      })
      .catch((err) => {
        return res.status(500).json({
          message: err.message,
          errors: { common: 'Server Error' }
        });
      });
  }
}
