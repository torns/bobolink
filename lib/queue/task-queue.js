const constants = require('../constants');
const Options = require('../options');
const utils = require('../utils');

/**
 *
 * 任务队列
 *
 * 至少有两张调度方式:
 *
 *  1. 立即调度: 只要一有空闲就会调度任务
 *  2. 按频率调度
 *
 */
function DataQueue() {

  let schedulingModes = {
    frequency: {
      putThenRun: false,
      replenish: false,
      init: frequencyInit
    },
    immediately: {
      putThenRun: true,
      replenish: true
    }
  }

  function frequencyInit() {
    let countPerSecond = ~~queueOptions.scheduling.frequency.countPerSecond;
    countPerSecond < 1 && (countPerSecond = 100);
    let gcd = utils.getGCD(1000, countPerSecond);
    let interval = 1000 / gcd;
    let taskNumber = countPerSecond / gcd;
    frequencyController = setInterval(() => {
      let rest = queueOptions.concurrency - self.runningTasksCount;
      if (rest > 0) {
        runTask(Math.min(rest, taskNumber));
      }
    }, interval);
  }

}