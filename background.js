// 存储所有正在进行的任务
let tasks = new Map();

// 更新扩展图标上的进度显示
function updateBadge() {
  // 如果没有任务，清空徽章
  if (tasks.size === 0) {
    chrome.action.setBadgeText({ text: '' });
    return;
  }

  // 获取最新的进度
  const latestProgress = Math.max(...Array.from(tasks.values()));
  
  // 设置徽章文本为进度百分比
  chrome.action.setBadgeText({
    text: `${latestProgress}%`
  });

  // 根据进度设置不同的颜色
  const color = latestProgress >= 100 ? '#4CAF50' : '#2196F3';
  chrome.action.setBadgeBackgroundColor({
    color: color
  });
}

// 发送通知
function sendNotification(taskId) {
  chrome.notifications.create(`task-${taskId}`, {
    type: 'basic',
    iconUrl: '/icons/icon128.png',
    title: chrome.i18n.getMessage('videoComplete'),
    message: chrome.i18n.getMessage('videoCompleteMessage'),
    priority: 2
  });
}

// 保存任务状态到存储
async function saveTasks() {
  try {
    const tasksObj = Object.fromEntries(tasks);
    await chrome.storage.local.set({ tasks: tasksObj });
  } catch (error) {
    console.error('保存任务状态失败:', error);
  }
}

// 从存储加载任务状态
async function loadTasks() {
  try {
    const data = await chrome.storage.local.get('tasks');
    if (data.tasks) {
      tasks = new Map(Object.entries(data.tasks));
      updateBadge();
    }
  } catch (error) {
    console.error('加载任务状态失败:', error);
  }
}

// 处理来自content script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('收到消息:', message);
  
  try {
    switch (message.type) {
      case 'GET_TASKS':
        sendResponse({ tasks: Object.fromEntries(tasks) });
        break;
        
      case 'UPDATE_TASK':
        const { taskId, progress } = message.data;
        // 只保留最新的任务
        tasks.clear();
        tasks.set(taskId, progress);
        updateBadge();
        saveTasks();
        // 广播任务更新
        chrome.runtime.sendMessage({
          type: 'TASKS_UPDATED',
          tasks: Object.fromEntries(tasks)
        }).catch(() => {});
        sendResponse({ success: true });
        break;
        
      case 'REMOVE_TASK':
        const removedTaskId = message.data.taskId;
        tasks.delete(removedTaskId);
        updateBadge();
        saveTasks();
        sendNotification(removedTaskId);
        // 广播任务更新
        chrome.runtime.sendMessage({
          type: 'TASKS_UPDATED',
          tasks: Object.fromEntries(tasks)
        }).catch(() => {});
        sendResponse({ success: true });
        break;
    }
  } catch (error) {
    console.error('处理消息时出错:', error);
    sendResponse({ error: error.message });
  }
  
  return true;
});

// 扩展安装或更新时初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('扩展已安装/更新');
  loadTasks();
});

// 浏览器启动时初始化
chrome.runtime.onStartup.addListener(() => {
  console.log('浏览器已启动');
  loadTasks();
}); 