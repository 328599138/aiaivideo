// 基础监控类
class BaseMonitor {
  constructor() {
    // 存储所有正在进行的任务
    this.tasks = new Map();
    
    // 初始化MutationObserver为null
    this.observer = null;
    
    // 添加页面卸载事件处理
    window.addEventListener('unload', () => {
      this.stopMonitoring();
    });

    this.isContextValid = true; // 添加上下文状态标志
  }

  // 初始化观察器
  initObserver() {
    if (!this.isContextValid) return; // 如果上下文已失效，不再初始化

    try {
      this.observer = new MutationObserver((mutations) => {
        this.handleMutations(mutations);
      });
    } catch (error) {
      // 使用 warn 级别，不显示为错误
      console.warn('初始化观察器失败，将在下次重试');
      this.isContextValid = false;
    }
  }

  // 开始监控
  startMonitoring() {
    if (!this.isContextValid) {
      console.warn('扩展上下文已失效，仅进行本地监控');
      return;
    }

    if (!this.observer) {
      this.initObserver();
    }

    try {
      const config = { 
        attributes: true, 
        childList: true, 
        subtree: true 
      };
      this.observer.observe(document.body, config);
    } catch (error) {
      console.warn('启动监控失败，将继续本地运行');
      this.isContextValid = false;
    }
  }

  // 停止监控
  stopMonitoring() {
    if (this.observer) {
      try {
        this.observer.disconnect();
      } catch (error) {
        // 使用 warn 级别，不显示为错误
        console.warn('停止监控时遇到问题，忽略并继续');
      }
      this.observer = null;
    }
  }

  // 发送消息到后台，带重试机制
  async sendMessage(type, data, retryCount = 0) {
    if (!this.isContextValid) return { success: true };

    try {
      const response = await chrome.runtime.sendMessage({
        type: type,
        data: data
      });
      return response;
    } catch (error) {
      if (error.message.includes('Extension context invalidated')) {
        this.isContextValid = false;
        console.warn('扩展上下文已失效，切换到本地模式');
        return { success: true };
      }
      
      // 如果是其他错误且未超过重试次数，则重试
      if (retryCount < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.sendMessage(type, data, retryCount + 1);
      }
      
      // 超过重试次数，降级到本地模式
      console.warn('消息发送失败，切换到本地模式');
      return { success: true };
    }
  }

  // 更新任务状态
  async updateTask(taskId, progress) {
    try {
      await this.sendMessage('UPDATE_TASK', {
        taskId: taskId,
        progress: progress
      });
    } catch (error) {
      // 即使更新失败也继续监控
      console.warn('更新任务状态失败，继续本地监控');
    }
  }

  // 删除任务
  async removeTask(taskId) {
    if (!taskId) return;
    
    try {
      // 先更新本地状态
      this.tasks.delete(taskId);
      console.log(`删除任务: ${taskId}`);
      
      // 尝试发送消息，但不阻塞本地状态更新
      await this.sendMessage('REMOVE_TASK', {
        taskId: taskId
      }).catch(error => {
        console.warn('发送删除消息失败，但本地状态已更新:', error);
      });
    } catch (error) {
      console.error('删除任务失败:', error);
    }
  }

  // 处理DOM变化
  handleMutations(mutations) {
    // 由子类实现具体逻辑
  }
}

// 导出
window.BaseMonitor = BaseMonitor; 