const utils = require('./utils');

let baseOptionsStrategy = {
  max: {
    type: 'number',
    verify: v => v === -1 || v > 0,
    default: -1,
    translate: v => ~~v
  },
  newPrior: {
    type: 'boolean',
    default: false
  }
}

const taskSchedulingMode = {

}

let taskOptionsStrategy = {
  concurrency: {
    type: 'number',
    verify: v => v > 0,
    default: 5,
    translate: v => ~~v
  },
  timeout: {
    type: 'number',
    default: 15000,
    verify: v => v === -1 || v > 0,
    translate: v => ~~v
  },
  retry: {
    type: 'number',
    default: -1,
    verify: v => v === -1 || v > 0,
    translate: v => ~~v
  },
  retryPrior: {
    type: 'boolean',
    default: false
  },
  catch: {
    type: 'function',
    default: null
  },
  scheduling: {
    type: 'object',
    subOptions: {
      enable: {
        type: 'string',
        verify: (v, p) => p[v] && v !== 'enable',
        default: 'immediately'
      }
    }
  }
}

// 基本选项
function BaseOptions() {
  let self = this;

  this.concurrency = defaultConcurrency;
  this.timeout = defaultTimeout;
  this.retry = defaultRetry;
  this.scheduling = {
    enable: 'immediately',
    frequency: {
      countPerSecond: 100
    },
    immediately: true
  };
  this.retryPrior = false;
  this.newPrior = false;
  this.catch = null;
  this.max = -1;
  this.isInit = false;

  function init(newOptions) {
    if (!self.isInit) {
      self.isInit = true;
      if (newOptions && newOptions.scheduling && newOptions.scheduling.enable) {
        let schedulingMode = newOptions.scheduling.enable;
        // if schedulingMode is supported
        if (self.scheduling[schedulingMode] !== undefined) {
          self.scheduling.enable = newOptions.scheduling.enable;
          let newModeConfig = newOptions.scheduling[schedulingMode];
          let oldModeConfig = self.scheduling[schedulingMode];
          if (newModeConfig) {
            for (let c in newModeConfig) {
              if (oldModeConfig.hasOwnProperty(c) && typeof oldModeConfig[c] === typeof newModeConfig[c]) {
                oldModeConfig[c] = newModeConfig[c];
              }
            }
          }
        }
      }
    }
  }

  this.update = function (newOptions) {
    init(newOptions);
    if (newOptions) {
      let allowOptions = {};
      newOptions.concurrency !== undefined && (allowOptions.concurrency = utils.reviseValue(newOptions.concurrency, 'number', newOptions.concurrency > 0, defaultConcurrency));
      newOptions.timeout !== undefined && (allowOptions.timeout = utils.reviseValue(newOptions.timeout, 'number', newOptions.timeout >= 0, defaultTimeout));
      newOptions.retry !== undefined && (allowOptions.retry = utils.reviseValue(newOptions.retry, 'number', newOptions.retry >= 0, defaultRetry));
      newOptions.retryPrior !== undefined && (allowOptions.retryPrior = utils.reviseValue(newOptions.retryPrior, 'boolean', newOptions.retryPrior === true, false));
      newOptions.newPrior !== undefined && (allowOptions.newPrior = utils.reviseValue(newOptions.newPrior, 'boolean', newOptions.newPrior === true, false));
      newOptions.catch !== undefined && (allowOptions.catch = utils.reviseValue(newOptions.catch, 'function', true, null));
      newOptions.max !== undefined && (allowOptions.max = utils.reviseValue(newOptions.max, 'number', newOptions.max > 0 || newOptions.max === -1, -1));
      Object.assign(self, allowOptions);
    }
  }

  this.update(options);
}

// 任务队列选项
function TaskQueueOptions() {
  
}

// 数据队列选项
function DataQueueOptions() {
  
}

function Options(options) {

  let self = this;

  this.concurrency = defaultConcurrency;
  this.timeout = defaultTimeout;
  this.retry = defaultRetry;
  this.scheduling = {
    enable: 'immediately',
    frequency: {
      countPerSecond: 100
    },
    immediately: true
  };
  this.retryPrior = false;
  this.newPrior = false;
  this.catch = null;
  this.max = -1;
  this.isInit = false;

  function init(newOptions) {
    if (!self.isInit) {
      self.isInit = true;
      if (newOptions && newOptions.scheduling && newOptions.scheduling.enable) {
        let schedulingMode = newOptions.scheduling.enable;
        // if schedulingMode is supported
        if (self.scheduling[schedulingMode] !== undefined) {
          self.scheduling.enable = newOptions.scheduling.enable;
          let newModeConfig = newOptions.scheduling[schedulingMode];
          let oldModeConfig = self.scheduling[schedulingMode];
          if (newModeConfig) {
            for (let c in newModeConfig) {
              if (oldModeConfig.hasOwnProperty(c) && typeof oldModeConfig[c] === typeof newModeConfig[c]) {
                oldModeConfig[c] = newModeConfig[c];
              }
            }
          }
        }
      }
    }
  }

  this.update = function (newOptions) {
    init(newOptions);
    if (newOptions) {
      let allowOptions = {};
      newOptions.concurrency !== undefined && (allowOptions.concurrency = utils.reviseValue(newOptions.concurrency, 'number', newOptions.concurrency > 0, defaultConcurrency));
      newOptions.timeout !== undefined && (allowOptions.timeout = utils.reviseValue(newOptions.timeout, 'number', newOptions.timeout >= 0, defaultTimeout));
      newOptions.retry !== undefined && (allowOptions.retry = utils.reviseValue(newOptions.retry, 'number', newOptions.retry >= 0, defaultRetry));
      newOptions.retryPrior !== undefined && (allowOptions.retryPrior = utils.reviseValue(newOptions.retryPrior, 'boolean', newOptions.retryPrior === true, false));
      newOptions.newPrior !== undefined && (allowOptions.newPrior = utils.reviseValue(newOptions.newPrior, 'boolean', newOptions.newPrior === true, false));
      newOptions.catch !== undefined && (allowOptions.catch = utils.reviseValue(newOptions.catch, 'function', true, null));
      newOptions.max !== undefined && (allowOptions.max = utils.reviseValue(newOptions.max, 'number', newOptions.max > 0 || newOptions.max === -1, -1));
      Object.assign(self, allowOptions);
    }
  }

  this.update(options);
}




module.exports = Options;