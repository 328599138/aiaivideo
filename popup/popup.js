// 获取任务列表容器
const taskList = document.getElementById('taskList');

// 更新进度显示
function updateProgress(progress) {
  // 清空任务列表
  taskList.innerHTML = '';
  
  if (progress > 0) {
    // 创建进度显示元素
    const progressItem = document.createElement('div');
    progressItem.className = 'task-item';
    
    progressItem.innerHTML = `
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      <div class="progress-text">${progress}%</div>
    `;
    
    taskList.appendChild(progressItem);
  } else {
    // 如果没有进度，显示提示信息
    taskList.innerHTML = '<div class="no-tasks">暂无生成任务</div>';
  }
}

// 更新任务列表显示
function updateTaskList(tasks) {
  // 如果没有任务，显示提示信息
  if (Object.keys(tasks).length === 0) {
    updateProgress(0);
    return;
  }
  
  // 只显示最新的进度
  const latestProgress = Math.max(...Object.values(tasks));
  updateProgress(latestProgress);
}

// 定时从background获取最新任务状态
function refreshTasks() {
  chrome.runtime.sendMessage({ type: 'GET_TASKS' }, response => {
    if (response && response.tasks) {
      updateTaskList(response.tasks);
    }
  });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 立即获取一次任务状态
  refreshTasks();
  
  // 每秒更新一次任务状态
  setInterval(refreshTasks, 1000);
});

// 监听来自background的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TASKS_UPDATED') {
    updateTaskList(message.tasks);
  }
}); 