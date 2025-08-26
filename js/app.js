/**
 * 万年历应用主程序
 * Chinese Lunar Calendar PWA Main Application
 */

class CalendarApp {
    constructor() {
        this.calendar = new ChineseCalendar();
        this.currentDate = new Date();
        this.viewDate = new Date();
        this.deferredPrompt = null;

        this.init();
    }

    init() {
        this.bindEvents();
        this.checkInstallPrompt();
        this.checkOnlineStatus();
        this.render();
    }

    bindEvents() {
        // 导航按钮
        document.getElementById('prev-month').addEventListener('click', () => {
            this.viewDate.setMonth(this.viewDate.getMonth() - 1);
            this.render();
            this.updateDatePicker();
        });

        document.getElementById('next-month').addEventListener('click', () => {
            this.viewDate.setMonth(this.viewDate.getMonth() + 1);
            this.render();
            this.updateDatePicker();
        });

        // 今天按钮
        document.getElementById('today-btn').addEventListener('click', () => {
            this.viewDate = new Date();
            this.render();
            this.updateDatePicker();
        });

        // 快速跳转日期
        document.getElementById('goto-date-btn').addEventListener('click', () => {
            this.gotoSelectedDate();
        });

        document.getElementById('date-picker').addEventListener('change', () => {
            this.gotoSelectedDate();
        });

        document.getElementById('date-picker').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.gotoSelectedDate();
            }
        });

        // 安装按钮
        document.getElementById('install-btn').addEventListener('click', () => {
            this.installApp();
        });

        // 帮助按钮
        document.getElementById('help-btn').addEventListener('click', () => {
            this.showHelpModal();
        });

        // 模态框
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('close-help-modal').addEventListener('click', () => {
            this.closeHelpModal();
        });

        document.getElementById('day-modal').addEventListener('click', (e) => {
            if (e.target.id === 'day-modal') {
                this.closeModal();
            }
        });

        document.getElementById('help-modal').addEventListener('click', (e) => {
            if (e.target.id === 'help-modal') {
                this.closeHelpModal();
            }
        });

        // PWA 安装提示
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('beforeinstallprompt 事件触发');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // PWA 安装完成
        window.addEventListener('appinstalled', (e) => {
            console.log('PWA 安装完成');
            this.deferredPrompt = null;
            document.getElementById('install-btn').style.display = 'none';
        });

        // 在线状态检测
        window.addEventListener('online', () => {
            this.updateOnlineStatus(true);
        });

        window.addEventListener('offline', () => {
            this.updateOnlineStatus(false);
        });

        // 键盘导航
        document.addEventListener('keydown', (e) => {
            // 如果用户正在输入日期，不处理快捷键
            if (document.activeElement.id === 'date-picker') {
                return;
            }
            this.handleKeyboardNavigation(e);
        });

        // 触摸滑动手势支持
        this.setupTouchGestures();
    }

    setupTouchGestures() {
        // 使用更大的触摸区域 - 整个app容器
        const appContainer = document.getElementById('app');
        if (!appContainer) {
            console.warn('App container not found for touch gestures');
            return;
        }

        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        let isDragging = false;

        // 触摸开始
        appContainer.addEventListener('touchstart', (e) => {
            // 忽略模态框内的触摸
            if (e.target.closest('.modal')) return;
            
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
        }, { passive: true });

        // 触摸移动
        appContainer.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            // 忽略模态框内的触摸
            if (e.target.closest('.modal')) return;
            
            endX = e.touches[0].clientX;
            endY = e.touches[0].clientY;
            
            // 防止页面滚动（仅在水平滑动时）
            const deltaX = Math.abs(endX - startX);
            const deltaY = Math.abs(endY - startY);
            
            if (deltaX > deltaY && deltaX > 10) {
                e.preventDefault();
            }
        }, { passive: false });

        // 触摸结束
        appContainer.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            // 忽略模态框内的触摸
            if (e.target.closest('.modal')) return;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const minSwipeDistance = 50; // 最小滑动距离
            const maxVerticalDistance = 100; // 最大垂直偏移

            // 检查是否为有效的水平滑动
            if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaY) < maxVerticalDistance) {
                if (deltaX > 0) {
                    // 向右滑动 - 上一个月
                    this.viewDate.setMonth(this.viewDate.getMonth() - 1);
                    this.render();
                    this.updateDatePicker();
                } else {
                    // 向左滑动 - 下一个月
                    this.viewDate.setMonth(this.viewDate.getMonth() + 1);
                    this.render();
                    this.updateDatePicker();
                }
            }
            
            isDragging = false;
        }, { passive: true });

        // 防止拖拽时的默认行为
        appContainer.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });
    }

    render() {
        this.renderHeader();
        this.renderCalendar();
        this.updateDatePicker();
    }

    renderHeader() {
        const monthYearElement = document.getElementById('current-month');
        const lunarElement = document.getElementById('current-lunar');

        const year = this.viewDate.getFullYear();
        const month = this.viewDate.getMonth() + 1;

        monthYearElement.textContent = `${year}年${month}月`;

        // 显示当前月份的农历信息
        const firstDay = new Date(year, this.viewDate.getMonth(), 1);
        const dateInfo = this.calendar.getDateInfo(firstDay);
        lunarElement.textContent = `${dateInfo.lunar.yearGanZhi}年 生肖${dateInfo.lunar.zodiac}`;
    }

    renderCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        calendarGrid.innerHTML = '';

        const year = this.viewDate.getFullYear();
        const month = this.viewDate.getMonth();

        // 获取当月第一天和最后一天
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        // 获取当月第一天是星期几 (0=周日, 1=周一, ..., 6=周六)
        const firstDayWeek = firstDay.getDay();

        // 获取上个月最后一天的日期
        const prevMonthLastDay = new Date(year, month, 0);
        const daysInPrevMonth = prevMonthLastDay.getDate();

        // 计算日历开始日期 (确保从周日开始的第一行)
        const calendarStartDate = new Date(year, month, 1 - firstDayWeek);

        // 填充6周 × 7天 = 42天的完整日历网格
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(calendarStartDate);
            currentDate.setDate(calendarStartDate.getDate() + i);

            // 判断是否是其他月份的日期
            const isOtherMonth = currentDate.getMonth() !== month;

            const dayElement = this.createDayElement(currentDate, isOtherMonth);
            calendarGrid.appendChild(dayElement);
        }
    }

    createDayElement(date, isOtherMonth) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';

        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }

        // 检查是否是今天
        const today = new Date();
        const isToday = date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate();

        if (isToday) {
            dayElement.classList.add('today');
        }

        // 添加weekday类用于样式
        const weekdayClass = `weekday-${date.getDay()}`;
        dayElement.classList.add(weekdayClass);

        let dateInfo;
        try {
            dateInfo = this.calendar.getDateInfo(date);
        } catch (error) {
            console.error('Error getting date info for', date, error);
            // 创建fallback的dateInfo
            dateInfo = {
                solar: {
                    year: date.getFullYear(),
                    month: date.getMonth() + 1,
                    day: date.getDate(),
                    weekday: date.getDay()
                },
                lunar: {
                    year: date.getFullYear(),
                    month: date.getMonth() + 1,
                    day: date.getDate(),
                    monthName: '月',
                    dayName: '日'
                },
                traditionalFestival: null,
                modernFestival: null,
                solarTerm: null
            };
        }

        // 公历日期
        const solarDateElement = document.createElement('div');
        solarDateElement.className = 'solar-date';
        solarDateElement.textContent = date.getDate();
        dayElement.appendChild(solarDateElement);

        // 农历日期
        const lunarDateElement = document.createElement('div');
        lunarDateElement.className = 'lunar-date-small';

        // 优先显示节日、节气
        let displayText = '';
        if (dateInfo.traditionalFestival) {
            displayText = dateInfo.traditionalFestival;
            dayElement.classList.add('traditional-festival');
        } else if (dateInfo.modernFestival) {
            displayText = dateInfo.modernFestival;
            dayElement.classList.add('modern-festival');
        } else if (dateInfo.solarTerm) {
            displayText = dateInfo.solarTerm;
            dayElement.classList.add('solar-term');
        } else if (dateInfo.lunar && dateInfo.lunar.day === 1) {
            // 农历初一显示月份 - 使用lunar库提供的月份名称（包含闰月信息）
            displayText = dateInfo.lunar.monthName.endsWith('月') ?
                dateInfo.lunar.monthName :
                dateInfo.lunar.monthName + '月';
            dayElement.classList.add('lunar-first-day');
        } else if (dateInfo.lunar && dateInfo.lunar.dayName) {
            displayText = dateInfo.lunar.dayName;
        } else {
            // 备用逻辑 - 简单显示日期
            displayText = '农历';
        }

        lunarDateElement.textContent = displayText;
        dayElement.appendChild(lunarDateElement);

        // 添加指示器
        if (dateInfo.traditionalFestival || dateInfo.modernFestival) {
            const festivalIndicator = document.createElement('div');
            festivalIndicator.className = 'festival-indicator';
            dayElement.appendChild(festivalIndicator);
        }

        if (dateInfo.solarTerm) {
            const solarTermIndicator = document.createElement('div');
            solarTermIndicator.className = 'solar-term-indicator';
            dayElement.appendChild(solarTermIndicator);
        }

        // 点击事件
        dayElement.addEventListener('click', () => {
            this.showDayDetails(date);
        });

        return dayElement;
    }

    showDayDetails(date) {
        const modal = document.getElementById('day-modal');

        let dateInfo;
        try {
            dateInfo = this.calendar.getDateInfo(date);
        } catch (error) {
            console.error('Error getting date info for modal:', error);
            // 显示基本信息
            dateInfo = {
                solar: {
                    year: date.getFullYear(),
                    month: date.getMonth() + 1,
                    day: date.getDate(),
                    weekday: date.getDay()
                },
                lunar: {
                    year: date.getFullYear(),
                    month: date.getMonth() + 1,
                    day: date.getDate(),
                    yearGanZhi: '未知',
                    zodiac: '未知'
                },
                formatted: {
                    lunar: '农历信息获取失败',
                    ganZhi: '未知',
                    zodiac: '未知'
                },
                traditionalFestival: null,
                modernFestival: null,
                solarTerm: null
            };
        }

        // 设置标题
        const modalDate = document.getElementById('modal-date');
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const weekdayName = weekdays[date.getDay()];
        modalDate.textContent = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekdayName}`;

        // 农历信息
        const modalLunar = document.getElementById('modal-lunar');
        modalLunar.innerHTML = `
            <h4>农历信息</h4>
            <p>农历：${dateInfo.formatted ? dateInfo.formatted.lunar : '未知'}</p>
            <p>干支：${dateInfo.formatted ? dateInfo.formatted.ganZhi : '未知'}</p>
            <p>年份：${dateInfo.lunar ? dateInfo.lunar.yearGanZhi : '未知'}年</p>
        `;

        // 生肖信息
        const modalZodiac = document.getElementById('modal-zodiac');
        modalZodiac.innerHTML = `
            <h4>生肖</h4>
            <p>生肖：${dateInfo.formatted ? dateInfo.formatted.zodiac : '未知'}</p>
        `;

        // 节日信息
        const modalFestivals = document.getElementById('modal-festivals');
        let festivalsHTML = '<h4>节日</h4>';
        if (dateInfo.traditionalFestival) {
            festivalsHTML += `<p>传统节日：${dateInfo.traditionalFestival}</p>`;
        }
        if (dateInfo.modernFestival) {
            festivalsHTML += `<p>现代节日：${dateInfo.modernFestival}</p>`;
        }
        if (!dateInfo.traditionalFestival && !dateInfo.modernFestival) {
            festivalsHTML += '<p>无特殊节日</p>';
        }
        modalFestivals.innerHTML = festivalsHTML;

        // 节气信息
        const modalSolarTerm = document.getElementById('modal-solar-term');
        let solarTermHTML = '<h4>节气</h4>';
        if (dateInfo.solarTerm) {
            solarTermHTML += `<p>节气：${dateInfo.solarTerm}</p>`;
        } else {
            solarTermHTML += '<p>无节气</p>';
        }
        modalSolarTerm.innerHTML = solarTermHTML;

        modal.style.display = 'flex';
    }

    closeModal() {
        const modal = document.getElementById('day-modal');
        modal.style.display = 'none';
    }

    showHelpModal() {
        const modal = document.getElementById('help-modal');
        modal.style.display = 'flex';
    }

    closeHelpModal() {
        const modal = document.getElementById('help-modal');
        modal.style.display = 'none';
    }

    checkInstallPrompt() {
        // 检查是否已经安装
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('PWA已安装');
            return;
        }

        // 检查是否支持PWA安装
        if (!('serviceWorker' in navigator)) {
            console.log('浏览器不支持Service Worker');
            return;
        }

        console.log('PWA安装检查完成，等待beforeinstallprompt事件');

        // 如果已经有延迟的提示，显示安装按钮
        if (this.deferredPrompt) {
            this.showInstallButton();
        }
    }

    showInstallButton() {
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.style.display = 'block';
            console.log('安装按钮已显示');
        } else {
            console.error('未找到安装按钮元素');
        }
    }

    async installApp() {
        if (!this.deferredPrompt) {
            alert('应用已安装或浏览器不支持安装');
            return;
        }

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('用户同意安装PWA');
        } else {
            console.log('用户拒绝安装PWA');
        }

        this.deferredPrompt = null;
        document.getElementById('install-btn').style.display = 'none';
    }

    checkOnlineStatus() {
        this.updateOnlineStatus(navigator.onLine);
    }

    updateOnlineStatus(isOnline) {
        const offlineIndicator = document.getElementById('offline-indicator');
        if (isOnline) {
            offlineIndicator.style.display = 'none';
        } else {
            offlineIndicator.style.display = 'block';
        }
    }

    handleKeyboardNavigation(e) {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.viewDate.setMonth(this.viewDate.getMonth() - 1);
                this.render();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.viewDate.setMonth(this.viewDate.getMonth() + 1);
                this.render();
                break;
            case 'Home':
                e.preventDefault();
                this.viewDate = new Date();
                this.render();
                break;
            case 'Escape':
                e.preventDefault();
                this.closeModal();
                this.closeHelpModal();
                break;
            case 'g':
            case 'G':
                // 按 G 键快速聚焦到日期选择器
                if (!e.ctrlKey && !e.altKey) {
                    e.preventDefault();
                    document.getElementById('date-picker').focus();
                }
                break;
            case 't':
            case 'T':
                // 按 T 键快速回到今天
                if (!e.ctrlKey && !e.altKey) {
                    e.preventDefault();
                    this.viewDate = new Date();
                    this.render();
                }
                break;
            case 'h':
            case 'H':
            case '?':
                // 按 H 或 ? 键显示帮助
                if (!e.ctrlKey && !e.altKey) {
                    e.preventDefault();
                    this.showHelpModal();
                }
                break;
        }
    }

    /**
     * 跳转到选定的日期
     */
    gotoSelectedDate() {
        const datePicker = document.getElementById('date-picker');
        const selectedDate = datePicker.value;

        if (selectedDate) {
            const [year, month, day] = selectedDate.split('-').map(Number);

            // 验证日期范围（1900-2100，与农历数据范围一致）
            if (year < 1900 || year > 2100) {
                this.showDateNavigationError('日期范围应在1900年到2100年之间');
                return;
            }

            this.viewDate = new Date(year, month - 1, day);
            this.render();

            // 提供用户反馈
            this.showDateNavigationFeedback(year, month, day);
        } else {
            this.showDateNavigationError('请选择有效的日期');
        }
    }

    /**
     * 更新日期选择器的值
     */
    updateDatePicker() {
        const datePicker = document.getElementById('date-picker');
        const year = this.viewDate.getFullYear();
        const month = String(this.viewDate.getMonth() + 1).padStart(2, '0');
        const day = String(this.viewDate.getDate()).padStart(2, '0');
        datePicker.value = `${year}-${month}-${day}`;
    }

    /**
     * 显示日期导航反馈
     */
    showDateNavigationFeedback(year, month, day) {
        // 创建临时提示元素
        const feedback = document.createElement('div');
        feedback.className = 'date-navigation-feedback';
        feedback.textContent = `已跳转到 ${year}年${month}月${day}日`;

        // 添加到页面
        document.body.appendChild(feedback);

        // 显示动画
        requestAnimationFrame(() => {
            feedback.style.opacity = '1';
            feedback.style.transform = 'translateY(0)';
        });

        // 2秒后移除
        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 2000);
    }

    /**
     * 显示日期导航错误
     */
    showDateNavigationError(message) {
        // 创建错误提示元素
        const feedback = document.createElement('div');
        feedback.className = 'date-navigation-feedback error';
        feedback.textContent = message;

        // 添加到页面
        document.body.appendChild(feedback);

        // 显示动画
        requestAnimationFrame(() => {
            feedback.style.opacity = '1';
            feedback.style.transform = 'translateY(0)';
        });

        // 3秒后移除
        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 3000);
    }

    /**
     * 测试方法：验证日历渲染正确性
     */
    testCalendarRendering() {
        console.log('Testing calendar rendering...');

        // 测试几个特殊日期
        const testDates = [
            new Date(2023, 0, 1),   // 2023年1月1日 (星期日)
            new Date(2023, 11, 25), // 2023年12月25日 (星期一)
            new Date(2024, 0, 1),   // 2024年1月1日 (星期一)
            new Date(2024, 11, 25), // 2024年12月25日 (星期三)
            new Date()              // 今天
        ];

        testDates.forEach(date => {
            const weekday = date.getDay();
            const weekdayNames = ['日', '一', '二', '三', '四', '五', '六'];
            console.log(`${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 星期${weekdayNames[weekday]} (${weekday})`);
        });

        return true;
    }
}

// 应用启动
document.addEventListener('DOMContentLoaded', () => {
    new CalendarApp();
});

// 错误处理
window.addEventListener('error', (e) => {
    console.error('应用错误:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('未处理的Promise拒绝:', e.reason);
    e.preventDefault();
});