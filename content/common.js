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
  }

  // 开始监控
  startMonitoring() {
    if (!document.body) {
      throw new Error('DOM未就绪，无法开始监控');
    }

    try {
      // 如果已经有observer，先停止它
      this.stopMonitoring();

      // 创建新的observer
      this.observer = new MutationObserver((mutations) => {
        try {
          this.handleMutations(mutations);
        } catch (error) {
          console.error('处理DOM变化时出错:', error);
        }
      });

      // 开始观察
      const config = { 
        attributes: true, 
        childList: true, 
        subtree: true 
      };
      
      this.observer.observe(document.body, config);
      console.log('开始监控DOM变化');
    } catch (error) {
      console.error('开始监控失败:', error);
      throw error;
    }
  }

  // 停止监控
  stopMonitoring() {
    if (this.observer) {
      try {
        this.observer.disconnect();
        this.observer = null;
        console.log('停止监控');
      } catch (error) {
        console.error('停止监控失败:', error);
      }
    }
  }

  // 向background发送消息
  async sendMessage(type, data) {
    // 如果扩展上下文不可用，只在本地更新状态
    if (!chrome?.runtime?.id) {
      console.warn('扩展上下文不可用');
      return { success: true }; // 返回成功，让业务继续进行
    }

    try {
      // 直接使用sendMessage
      const response = await chrome.runtime.sendMessage({
        type: type,
        data: data
      });
      return response;
    } catch (error) {
      // 如果是扩展上下文失效，不影响本地状态更新
      if (error.message.includes('Extension context invalidated')) {
        console.warn('扩展上下文已失效，忽略消息发送');
        return { success: true }; // 返回成功，让业务继续进行
      }
      // 其他错误则抛出
      console.error('发送消息失败:', error);
      throw error;
    }
  }

  // 更新任务状态
  async updateTask(taskId, progress) {
    if (!taskId) return;
    
    try {
      // 先更新本地状态
      this.tasks.set(taskId, progress);
      console.log(`更新任务状态: ${taskId} -> ${progress}%`);
      
      // 尝试发送消息，但不阻塞本地状态更新
      await this.sendMessage('UPDATE_TASK', {
        taskId: taskId,
        progress: progress
      }).catch(error => {
        console.warn('发送更新消息失败，但本地状态已更新:', error);
      });
    } catch (error) {
      console.error('更新任务失败:', error);
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

  // 处理DOM变化的方法(由子类实现)
  handleMutations(mutations) {
    throw new Error('handleMutations must be implemented by subclass');
  }
}

// 导出
window.BaseMonitor = BaseMonitor; 