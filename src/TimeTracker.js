import React, { useState, useEffect } from 'react';

const TimeTracker = () => {
  // 状态管理
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('timeTrackerTasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [newTask, setNewTask] = useState('');
  const [activeTask, setActiveTask] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [view, setView] = useState('today'); // 'today', 'week', 'month'
  const [taskCategory, setTaskCategory] = useState('工作'); // 默认类别

  // 存储任务到本地
  useEffect(() => {
    localStorage.setItem('timeTrackerTasks', JSON.stringify(tasks));
  }, [tasks]);

  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 添加新任务
  const handleAddTask = () => {
    if (newTask.trim() === '') return;
    
    const task = {
      id: Date.now(),
      name: newTask,
      records: [],
      totalTime: 0,
      category: taskCategory,
      color: getRandomColor()
    };
    
    setTasks([...tasks, task]);
    setNewTask('');
  };

  // 开始记录时间
  const startTracking = (taskId) => {
    if (isTracking) return;
    
    setActiveTask(taskId);
    setIsTracking(true);
    setStartTime(new Date());
  };

  // 停止记录时间
  const stopTracking = () => {
    if (!isTracking || activeTask === null) return;
    
    const endTime = new Date();
    const elapsedTime = Math.floor((endTime - startTime) / 1000); // 转换为秒
    
    const updatedTasks = tasks.map(task => {
      if (task.id === activeTask) {
        const newRecord = {
          id: Date.now(),
          startTime: startTime,
          endTime: endTime,
          duration: elapsedTime,
          date: startTime.toISOString().split('T')[0]
        };
        
        return {
          ...task,
          records: [...task.records, newRecord],
          totalTime: task.totalTime + elapsedTime
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    setIsTracking(false);
    setActiveTask(null);
    setStartTime(null);
  };

  // 删除任务
  const deleteTask = (taskId) => {
    if (activeTask === taskId) {
      stopTracking();
    }
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // 格式化时间显示 (秒 -> HH:MM:SS)
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 获取随机颜色
  const getRandomColor = () => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // 获取当前任务的运行时间
  const getCurrentTaskTime = () => {
    if (!isTracking || activeTask === null || startTime === null) return 0;
    
    const elapsedTime = Math.floor((currentTime - startTime) / 1000);
    const task = tasks.find(t => t.id === activeTask);
    return task ? task.totalTime + elapsedTime : 0;
  };

  // 根据视图过滤任务记录
  const getFilteredRecords = (records) => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const monthAgoStr = monthAgo.toISOString().split('T')[0];
    
    switch(view) {
      case 'today':
        return records.filter(record => record.date === today);
      case 'week':
        return records.filter(record => record.date >= weekAgoStr);
      case 'month':
        return records.filter(record => record.date >= monthAgoStr);
      default:
        return records;
    }
  };

  // 计算过滤后的总时间
  const getFilteredTotalTime = (task) => {
    const filteredRecords = getFilteredRecords(task.records);
    return filteredRecords.reduce((total, record) => total + record.duration, 0);
  };

  // 可选的任务分类列表
  const categories = ['工作', '学习', '娱乐', '健康', '个人'];
  
  // 切换任务类别
  const handleCategoryChange = (category) => {
    setTaskCategory(category);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center my-6 text-gray-800">时间管理助手</h1>
      
      {/* 添加新任务 */}
      <div className="mb-6">
        <div className="flex mb-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="添加新任务..."
            className="flex-grow p-2 border border-gray-300 rounded-l"
          />
          <button
            onClick={handleAddTask}
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
          >
            添加
          </button>
        </div>
        
        {/* 类别选择器 */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-3 py-1 rounded text-sm ${taskCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {/* 视图切换 */}
      <div className="flex justify-center mb-6 space-x-4">
        <button
          onClick={() => setView('today')}
          className={`px-4 py-2 rounded ${view === 'today' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          今日
        </button>
        <button
          onClick={() => setView('week')}
          className={`px-4 py-2 rounded ${view === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          本周
        </button>
        <button
          onClick={() => setView('month')}
          className={`px-4 py-2 rounded ${view === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          本月
        </button>
      </div>
      
      {/* 当前活动任务 */}
      {isTracking && activeTask !== null && (
        <div className="mb-6 p-4 border rounded-lg bg-blue-50 border-blue-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold">正在追踪: {tasks.find(t => t.id === activeTask)?.name}</h3>
              <p className="text-gray-600">开始时间: {startTime.toLocaleTimeString()}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{formatTime(getCurrentTaskTime())}</p>
              <button
                onClick={stopTracking}
                className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                停止
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 任务列表 */}
      <div className="space-y-4">
        {tasks.map(task => (
          <div key={task.id} className="p-4 border rounded-lg bg-white shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full ${task.color} mr-3`}></div>
                <h3 className="text-lg font-semibold">{task.name}</h3>
                <span className="ml-2 px-2 py-1 bg-gray-100 text-xs rounded">{task.category}</span>
              </div>
              <div className="flex items-center space-x-2">
                <p className="font-mono">{formatTime(getFilteredTotalTime(task))}</p>
                {!isTracking && (
                  <button
                    onClick={() => startTracking(task.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                  >
                    开始
                  </button>
                )}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  删除
                </button>
              </div>
            </div>
            
            {/* 任务记录 */}
            {getFilteredRecords(task.records).length > 0 && (
              <div className="mt-4 ml-7">
                <h4 className="text-sm font-semibold text-gray-500 mb-2">记录历史:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {getFilteredRecords(task.records).slice().reverse().map(record => (
                    <div key={record.id} className="text-sm text-gray-600 flex justify-between">
                      <span>{new Date(record.startTime).toLocaleString()} - {new Date(record.endTime).toLocaleTimeString()}</span>
                      <span>{formatTime(record.duration)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>还没有任务，开始添加吧！</p>
          </div>
        )}
      </div>
      
      {/* 简单统计 */}
      {tasks.length > 0 && (
        <div className="mt-8 p-4 border rounded-lg bg-white">
          <h3 className="text-lg font-semibold mb-4">统计摘要</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">总任务数</p>
              <p className="text-xl font-bold">{tasks.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">总记录时间</p>
              <p className="text-xl font-bold">
                {formatTime(tasks.reduce((total, task) => total + getFilteredTotalTime(task), 0))}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTracker;
