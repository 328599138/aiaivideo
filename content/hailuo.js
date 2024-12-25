// 继承基础监控类
class HailuoMonitor extends BaseMonitor {
  constructor() {
    super();
    this.currentTaskId = null;
    this.queueStatus = { current: 0, total: 0 };
  }

  // 静态创建方法
  static async create() {
    // 等待DOM就绪
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve, { once: true });
      });
    }

    // 等待body元素存在
    while (!document.body) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      const monitor = new HailuoMonitor();
      monitor.initialize();
      return monitor;
    } catch (error) {
      console.error('创建监控实例失败:', error);
      return null;
    }
  }

  // 初始化方法
  initialize() {
    try {
      // 开始基础监控
      this.startMonitoring();
      // 扫描现有任务
      this.scanExistingTasks();
      console.log('监控初始化完成');
    } catch (error) {
      console.error('初始化失败:', error);
      throw error;
    }
  }

  scanExistingTasks() {
    console.log('扫描现有任务');
    
    // 1. 首先更新队列状态
    const queueElement = document.querySelector('.flex.items-center.text-\\[12px\\].md\\:text-\\[16px\\].h-\\[24px\\]');
    if (queueElement) {
      const text = queueElement.textContent;
      const matches = text.match(/(\d+)\s*\/\s*(\d+)/);
      if (matches) {
        this.queueStatus = {
          current: parseInt(matches[1], 10),
          total: parseInt(matches[2], 10)
        };
        console.log('队列状态:', this.queueStatus);
      }
    }

    // 2. 查找进度条
    const mainProgress = document.querySelector('.ant-progress.creating-progress');
    if (mainProgress) {
      const progress = this.getProgress(mainProgress);
      
      // 只有在有进度的情况下才创建任务
      if (progress > 0 && progress < 100) {
        // 从进度条所在的卡片中获取任务ID
        const card = mainProgress.closest('[class*="card"]');
        let taskId = card?.getAttribute('data-task-id');
        
        // 如果卡片上没有任务ID，生成一个新的
        if (!taskId) {
          taskId = 'task_' + Date.now();
        }

        console.log('找到进度条任务:', taskId, progress);
        this.currentTaskId = taskId;
        this.updateTask(taskId, progress);
      }
    }
  }

  handleMutations(mutations) {
    let hasUpdates = false;

    for (const mutation of mutations) {
      // 1. 检查队列状态变化
      if (mutation.target.matches('.flex.items-center.text-\\[12px\\].md\\:text-\\[16px\\].h-\\[24px\\]')) {
        const text = mutation.target.textContent;
        const matches = text.match(/(\d+)\s*\/\s*(\d+)/);
        if (matches) {
          this.queueStatus = {
            current: parseInt(matches[1], 10),
            total: parseInt(matches[2], 10)
          };
          console.log('队列状态更新:', this.queueStatus);
        }
        continue;
      }

      // 2. 检查进度条变化或消失
      if (mutation.type === 'childList' || mutation.type === 'attributes') {
        // 检查进度条是否存在
        const progressBar = document.querySelector('.ant-progress.creating-progress');
        
        if (!progressBar && this.currentTaskId) {
          // 如果进度条消失且之前有任务，说明任务完成
          console.log('进度条消失，任务完成');
          this.updateTask(this.currentTaskId, 100);
          this.removeTask(this.currentTaskId);
          this.currentTaskId = null;
          hasUpdates = true;
          continue;
        }

        // 检查进度值变化
        if (progressBar && mutation.target.matches('.ant-progress.creating-progress')) {
          const progress = this.getProgress(progressBar);
          
          if (progress >= 0) {
            // 如果没有当前任务ID，从卡片中获取或创建新的
            if (!this.currentTaskId) {
              const card = progressBar.closest('[class*="card"]');
              this.currentTaskId = card?.getAttribute('data-task-id') || 'task_' + Date.now();
            }

            console.log('检测到进度更新:', this.currentTaskId, progress);
            
            if (progress >= 100) {
              this.updateTask(this.currentTaskId, 100);
              this.removeTask(this.currentTaskId);
              this.currentTaskId = null;
            } else {
              this.updateTask(this.currentTaskId, progress);
            }
            hasUpdates = true;
          }
        }
      }
    }

    // 如果有更新，延迟重新扫描
    if (hasUpdates) {
      setTimeout(() => this.scanExistingTasks(), 100);
    }
  }

  getProgress(element) {
    // 从进度条元素获取进度
    const ariaValue = element.getAttribute('aria-valuenow');
    if (ariaValue) {
      return parseInt(ariaValue, 10);
    }
    return 0;
  }
}

// 创建监控实例
console.log('开始创建 HailuoMonitor 实例');
HailuoMonitor.create().then(monitor => {
  if (monitor) {
    console.log('HailuoMonitor 实例创建成功');
  } else {
    console.error('HailuoMonitor 实例创建失败');
  }
}).catch(error => {
  console.error('创建监控实例时出错:', error);
}); 