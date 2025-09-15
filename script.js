// 数据存储
let messages = [];
let password = '123456'; // 默认口令，实际应用中应加密存储
let historyStack = []; // 导航历史栈

// DOM 元素
const welcomePage = document.getElementById('welcome-page');
const questionerPage = document.getElementById('questioner-page');
const developerLogin = document.getElementById('developer-login');
const developerPanel = document.getElementById('developer-panel');
const passwordModal = document.getElementById('password-modal');
const navigation = document.getElementById('navigation');
const backBtn = document.getElementById('back-btn');
const homeBtn = document.getElementById('home-btn');
const passwordError = document.getElementById('password-error');
const oldPasswordError = document.getElementById('old-password-error');
const confirmPasswordError = document.getElementById('confirm-password-error');

// 欢迎页面按钮
const questionerBtn = document.getElementById('questioner-btn');
const developerBtn = document.getElementById('developer-btn');

// 问题提交表单
const questionForm = document.getElementById('question-form');
const cancelBtn = document.getElementById('cancel-btn');
const messagesContainer = document.getElementById('messages-container');

// 开发者登录
const developerForm = document.getElementById('developer-form');
const logoutBtn = document.getElementById('logout-btn');
const adminMessages = document.getElementById('admin-messages');
const sortSelect = document.getElementById('sort-select');
const exportBtn = document.getElementById('export-btn');
const changePasswordBtn = document.getElementById('change-password-btn');

// 密码修改
const changePasswordForm = document.getElementById('change-password-form');
const closeModalBtn = document.getElementById('close-modal-btn');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 从本地存储加载数据
  const savedMessages = localStorage.getItem('messages');
  if (savedMessages) {
    messages = JSON.parse(savedMessages);
    renderMessages();
    renderAdminMessages();
  }

  // 从本地存储加载密码（如果有）
  const savedPassword = localStorage.getItem('adminPassword');
  if (savedPassword) {
    password = savedPassword;
  }

  // 绑定事件监听器
  questionerBtn.addEventListener('click', () => navigateTo('questioner-page'));
  developerBtn.addEventListener('click', () => navigateTo('developer-login'));
  questionForm.addEventListener('submit', handleQuestionSubmit);
  cancelBtn.addEventListener('click', () => navigateBack());
  developerForm.addEventListener('submit', handleDeveloperLogin);
  logoutBtn.addEventListener('click', () => navigateTo('welcome-page'));
  sortSelect.addEventListener('change', handleSortChange);
  exportBtn.addEventListener('click', exportToCSV);
  changePasswordBtn.addEventListener('click', showPasswordModal);
  closeModalBtn.addEventListener('click', hidePasswordModal);
  changePasswordForm.addEventListener('submit', handleChangePassword);
  backBtn.addEventListener('click', navigateBack);
  homeBtn.addEventListener('click', () => navigateTo('welcome-page'));

  // 监听键盘事件，支持返回键
  window.addEventListener('popstate', () => {
    if (historyStack.length > 1) {
      navigateBack();
    } else {
      navigateTo('welcome-page');
    }
  });
});

// 页面导航函数
function navigateTo(pageId) {
  // 隐藏所有页面
  welcomePage.classList.add('hidden');
  questionerPage.classList.add('hidden');
  developerLogin.classList.add('hidden');
  developerPanel.classList.add('hidden');
  passwordModal.classList.add('hidden');

  // 显示目标页面
  document.getElementById(pageId).classList.remove('hidden');

  // 更新导航历史
  if (pageId !== 'welcome-page') {
    historyStack.push(pageId);
    navigation.classList.remove('hidden');
  } else {
    historyStack = [];
    navigation.classList.add('hidden');
  }

  // 更新浏览器历史
  history.pushState({ page: pageId }, pageId, `#${pageId}`);
}

// 返回上一页
function navigateBack() {
  if (historyStack.length > 0) {
    const prevPage = historyStack.pop();
    navigateTo(prevPage);
  } else {
    navigateTo('welcome-page');
  }
}

// 显示开发者面板
function showDeveloperPanel() {
  developerLogin.classList.add('hidden');
  developerPanel.classList.remove('hidden');
  passwordModal.classList.add('hidden');

  renderAdminMessages();
}

// 显示密码模态框
function showPasswordModal() {
  passwordModal.classList.remove('hidden');
  // 重置错误消息
  oldPasswordError.classList.add('hidden');
  confirmPasswordError.classList.add('hidden');
}

// 隐藏密码模态框
function hidePasswordModal() {
  passwordModal.classList.add('hidden');
  // 重置表单
  changePasswordForm.reset();
}

// 处理提问提交
function handleQuestionSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const message = document.getElementById('message').value;
  const isPrivate = document.getElementById('private').checked;

  const newMessage = {
    id: Date.now(),
    name: name || '匿名用户',
    message,
    timestamp: new Date().toISOString(),
    isPrivate
  };

  messages.push(newMessage);
  saveMessages();

  // 清空表单
  questionForm.reset();

  // 显示成功消息
  alert('留言提交成功！');

  // 更新显示
  renderMessages();
  renderAdminMessages();
}

// 处理开发者登录
function handleDeveloperLogin(e) {
  e.preventDefault();

  const inputPassword = document.getElementById('password').value;

  if (!inputPassword) {
    passwordError.textContent = '请输入口令';
    passwordError.classList.remove('hidden');
    return;
  }

  if (inputPassword === password) {
    developerForm.reset();
    passwordError.classList.add('hidden');
    showDeveloperPanel();
  } else {
    passwordError.textContent = '口令错误，请重试';
    passwordError.classList.remove('hidden');
  }
}

// 处理排序变化
function handleSortChange() {
  renderAdminMessages();
}

// 处理修改口令
function handleChangePassword(e) {
  e.preventDefault();

  const oldPassword = document.getElementById('old-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  // 重置错误消息
  oldPasswordError.classList.add('hidden');
  confirmPasswordError.classList.add('hidden');

  if (oldPassword !== password) {
    oldPasswordError.classList.remove('hidden');
    return;
  }

  if (newPassword !== confirmPassword) {
    confirmPasswordError.classList.remove('hidden');
    return;
  }

  password = newPassword;
  localStorage.setItem('adminPassword', password);
  changePasswordForm.reset();
  hidePasswordModal();
  alert('口令修改成功！');
}

// 导出为 CSV
function exportToCSV() {
  let sortedMessages = [...messages];

  // 根据当前选择的排序方式排序
  const sortValue = sortSelect.value;
  switch (sortValue) {
    case 'time-desc':
      sortedMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      break;
    case 'time-asc':
      sortedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      break;
    case 'length-desc':
      sortedMessages.sort((a, b) => b.message.length - a.message.length);
      break;
    case 'length-asc':
      sortedMessages.sort((a, b) => a.message.length - b.message.length);
      break;
  }

  // 构建 CSV 内容
  let csvContent = "ID,姓名,内容,时间,是否私密\n";

  sortedMessages.forEach(msg => {
    const row = `${msg.id},"${msg.name}","${msg.message.replace(/"/g, '""')}",${new Date(msg.timestamp).toLocaleString()},${msg.isPrivate ? '是' : '否'}\n`;
    csvContent += row;
  });

  // 创建下载链接
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `提问箱留言_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 渲染留言
function renderMessages() {
  // 过滤出公开的留言
  const publicMessages = messages.filter(msg => !msg.isPrivate);

  if (publicMessages.length === 0) {
    messagesContainer.innerHTML = `
      <div class="text-center text-gray-500 py-10">
        <i class="fa fa-comments-o text-4xl mb-3"></i>
        <p>暂无公开留言，快来留下你的想法吧！</p>
      </div>
    `;
    return;
  }

  // 按时间降序排列
  const sortedMessages = [...publicMessages].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  messagesContainer.innerHTML = '';

  sortedMessages.forEach(msg => {
    const messageCard = document.createElement('div');
    messageCard.className = 'message-card';

    const formattedTime = new Date(msg.timestamp).toLocaleString();

    messageCard.innerHTML = `
      <div class="flex justify-between items-start mb-2">
        <h3 class="font-bold text-primary">${msg.name}</h3>
        <span class="text-sm text-gray-500">${formattedTime}</span>
      </div>
      <p class="text-gray-800 mb-3">${msg.message}</p>
      
      <div class="comment-box">
        <h4 class="font-medium text-gray-700 mb-2">评论</h4>
        <div class="space-y-2 comments-${msg.id}">
          <!-- 评论将在这里动态加载 -->
        </div>
        <div class="mt-3">
          <form class="flex gap-2 comment-form-${msg.id}">
            <input type="text" placeholder="添加评论..." class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all">
            <button type="submit" class="btn-hover bg-primary text-white font-medium py-2 px-4 rounded-lg">
              <i class="fa fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </div>
    `;

    messagesContainer.appendChild(messageCard);

    // 渲染评论
    renderComments(msg.id);

    // 绑定评论表单提交事件
    const commentForm = document.querySelector(`.comment-form-${msg.id}`);
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const commentInput = commentForm.querySelector('input');
      const commentText = commentInput.value.trim();

      if (commentText) {
        addComment(msg.id, commentText);
        commentInput.value = '';
      }
    });
  });
}

// 添加评论
function addComment(messageId, commentText) {
  // 查找对应的消息
  const message = messages.find(msg => msg.id === messageId);

  if (!message.comments) {
    message.comments = [];
  }

  // 添加新评论
  message.comments.push({
    id: Date.now(),
    text: commentText,
    timestamp: new Date().toISOString()
  });

  saveMessages();
  renderComments(messageId);
}

// 渲染评论
function renderComments(messageId) {
  const message = messages.find(msg => msg.id === messageId);
  const commentsContainer = document.querySelector(`.comments-${messageId}`);

  if (!message.comments || message.comments.length === 0) {
    commentsContainer.innerHTML = `
      <p class="text-gray-500 italic">暂无评论</p>
    `;
    return;
  }

  commentsContainer.innerHTML = '';

  // 按时间降序排列
  const sortedComments = [...message.comments].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  sortedComments.forEach(comment => {
    const formattedTime = new Date(comment.timestamp).toLocaleString();

    const commentElement = document.createElement('div');
    commentElement.className = 'bg-white p-2 rounded border border-gray-100';
    commentElement.innerHTML = `
      <div class="flex justify-between items-start">
        <span class="font-medium text-gray-700">匿名用户</span>
        <span class="text-xs text-gray-500">${formattedTime}</span>
      </div>
      <p class="text-sm text-gray-600 mt-1">${comment.text}</p>
    `;

    commentsContainer.appendChild(commentElement);
  });
}

// 渲染管理员消息列表
function renderAdminMessages() {
  let sortedMessages = [...messages];

  // 根据当前选择的排序方式排序
  const sortValue = sortSelect.value;
  switch (sortValue) {
    case 'time-desc':
      sortedMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      break;
    case 'time-asc':
      sortedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      break;
    case 'length-desc':
      sortedMessages.sort((a, b) => b.message.length - a.message.length);
      break;
    case 'length-asc':
      sortedMessages.sort((a, b) => a.message.length - b.message.length);
      break;
  }

  if (sortedMessages.length === 0) {
    adminMessages.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-10 text-center text-gray-500">
          <i class="fa fa-inbox text-4xl mb-3"></i>
          <p>暂无留言</p>
        </td>
      </tr>
    `;
    return;
  }

  adminMessages.innerHTML = '';

  sortedMessages.forEach(msg => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50 transition-colors';

    const formattedTime = new Date(msg.timestamp).toLocaleString();
    const privateBadge = msg.isPrivate 
      ? '<span class="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">私密</span>'
      : '<span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">公开</span>';

    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${msg.id}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${msg.name}</td>
      <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">${msg.message}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formattedTime}</td>
      <td class="px-6 py-4 whitespace-nowrap">${privateBadge}</td>
    `;

    adminMessages.appendChild(row);
  });
}

// 保存消息到本地存储
function saveMessages() {
  localStorage.setItem('messages', JSON.stringify(messages));
}