; (function () {
    let trafficTimer = null;
    let trafficCache = null;
    let toggleIndex = 0;
    const toggleElements = [];

    const config = {
        showTrafficStats: true,
        insertPosition: 'replace', // 可选：'after', 'before', 'replace'
        interval: 60000,           // 60秒刷新周期
        toggleInterval: 5000,      // 没5秒切换标签信息, 0 为不切换
        duration: 500              // 切换时缓进缓出动画时间
    };

    if (config.toggleInterval > 0) {
        setInterval(() => {
            toggleIndex = (toggleIndex + 1);
            toggleElements.forEach(({ el, contents }) => {
                if (!document.body.contains(el)) return;
                const index = toggleIndex % contents.length;
                fadeOutIn(el, contents[index], 500);
            });
        }, config.toggleInterval);
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return { value: '0', unit: 'B' };
        const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        let unitIndex = 0;
        let size = bytes;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return {
            value: size.toFixed(unitIndex === 0 ? 0 : 2),
            unit: units[unitIndex]
        };
    }

    function calculatePercentage(used, total) {
        used = Number(used);
        total = Number(total);
        if (used > 1e15 || total > 1e15) {
            used /= 1e10;
            total /= 1e10;
        }
        return (used / total * 100).toFixed(2);
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    function safeSetTextContent(parent, selector, text) {
        const el = parent.querySelector(selector);
        if (el) {
            el.textContent = text;
        }
    }
    // 根据百分比生成渐变颜色（绿色到红色）
    function getHslGradientColor(percentage) {
        const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
        const lerp = (start, end, t) => start + (end - start) * t;
        const p = clamp(Number(percentage), 0, 100);
        let h, s, l;
        if (p <= 35) {
            // green → orange，降低饱和度峰值和亮度峰值
            const t = p / 35;
            h = lerp(142, 32, t);
            s = lerp(69, 85, t);  // 从69到85，替代之前的96
            l = lerp(45, 55, t);  // 从45到55，替代之前的61
        } else if (p <= 85) {
            // orange → red，降低饱和度并压缩亮度范围
            const t = (p - 35) / 50;
            h = lerp(32, 0, t);
            s = lerp(85, 75, t);  // 从85到75，之前是96到84
            l = lerp(55, 50, t);  // 从55到50，之前是61到60
        } else {
            // 红色稍微再深一点
            const t = (p - 85) / 15;
            h = 0;
            s = 75;              // 固定稍低饱和度
            l = lerp(50, 45, t); // 亮度加深但幅度缩小
        }
        return `hsl(${h.toFixed(0)}, ${s.toFixed(0)}%, ${l.toFixed(0)}%)`;
    }
    // 元素内容淡出、替换、再淡入动画，duration 单位毫秒
    function fadeOutIn(element, newContent, duration = 500) {
        element.style.transition = `opacity ${duration / 2}ms`;
        element.style.opacity = '0';

        setTimeout(() => {
            element.innerHTML = newContent;
            element.style.transition = `opacity ${duration / 2}ms`;
            element.style.opacity = '1';
        }, duration / 2);
    }

    function renderTrafficStats(trafficData) {
        const serverMap = new Map();

        for (const cycleId in trafficData) {
            const cycle = trafficData[cycleId];
            if (!cycle.server_name || !cycle.transfer) continue;

            for (const serverId in cycle.server_name) {
                const serverName = cycle.server_name[serverId];
                const transfer = cycle.transfer[serverId];
                const max = cycle.max;
                const from = cycle.from;
                const to = cycle.to;
                const next_update = cycle.next_update[serverId];

                if (serverName && transfer !== undefined && max && from && to) {
                    serverMap.set(serverName, {
                        id: serverId,
                        transfer: transfer,
                        max: max,
                        name: cycle.name,
                        from: from,
                        to: to,
                        next_update: next_update
                    });
                }
            }
        }

        serverMap.forEach((serverData, serverName) => {
            const targetElement = Array.from(document.querySelectorAll('section.grid.items-center.gap-2'))
                .find(section => {
                    const firstText = section.querySelector('p.break-all.font-bold.tracking-tight.text-xs')?.textContent.trim();
                    return firstText === serverName;
                });
            if (!targetElement) {
                //console.warn(`[renderTrafficStats] 未找到服务器 "${serverName}" (ID: ${serverData.id}) 的元素`);
                return;
            }

            const usedFormatted = formatFileSize(serverData.transfer);
            const totalFormatted = formatFileSize(serverData.max);
            const percentage = calculatePercentage(serverData.transfer, serverData.max);
            const fromFormatted = formatDate(serverData.from);
            const toFormatted = formatDate(serverData.to);
            const next_update = new Date(serverData.next_update).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });
            const uniqueClassName = 'traffic-stats-for-server-' + serverData.id;
            const progressColor = getHslGradientColor(percentage);
            let insertPosition = config.insertPosition;

            const containerDiv = targetElement.closest('div');
            if (!containerDiv) return;

            const existing = Array.from(containerDiv.querySelectorAll('.new-inserted-element')).find(el =>
                el.classList.contains(uniqueClassName)
            );
            if (!config.showTrafficStats) {
                if (existing) existing.remove();
                return;
            }

            if (existing) {
                safeSetTextContent(existing, '.used-traffic', usedFormatted.value);
                safeSetTextContent(existing, '.used-unit', usedFormatted.unit);
                safeSetTextContent(existing, '.total-traffic', totalFormatted.value);
                safeSetTextContent(existing, '.total-unit', totalFormatted.unit);
                safeSetTextContent(existing, '.from-date', fromFormatted);
                safeSetTextContent(existing, '.to-date', toFormatted);
                safeSetTextContent(existing, '.percentage-value', percentage + '%');
                safeSetTextContent(existing, '.next-update', `next update: ${next_update}`);
                const progressBar = existing.querySelector('.progress-bar');
                if (progressBar) {
                    progressBar.style.width = percentage + '%';
                    progressBar.style.backgroundColor = progressColor;
                }
                console.log(`[renderTrafficStats] 更新已存在的流量条目: ${serverName}`);
            }
            else {
                const oldSection = containerDiv.querySelector('section.grid.items-center.gap-3');
                if (!oldSection) return;
                // 默认进度条右上角展示内容
                const defaultTimeInfoHTML = `<span class="from-date">${fromFormatted}</span>
                <span class="text-neutral-500 dark:text-neutral-400">-</span>
                <span class="to-date">${toFormatted}</span>`;
                // 右上角切换列表
                const contents = [
                    defaultTimeInfoHTML,
                    `<span class="text-[10px] font-medium text-neutral-800 dark:text-neutral-200 percentage-value">${percentage}%</span>`,
                    `<span class="text-[10px] font-medium text-neutral-600 dark:text-neutral-300">${next_update}</span>`
                ];
                const newElement = document.createElement('div');
                newElement.classList.add('space-y-1.5', 'new-inserted-element', uniqueClassName);
                newElement.style.width = '100%';
                newElement.innerHTML = `
            <div class="flex items-center justify-between">
              <div class="flex items-baseline gap-1">
                <span class="text-[10px] font-medium text-neutral-800 dark:text-neutral-200 used-traffic">${usedFormatted.value}</span>
                <span class="text-[10px] font-medium text-neutral-800 dark:text-neutral-200 used-unit">${usedFormatted.unit}</span>
                <span class="text-[10px] text-neutral-500 dark:text-neutral-400">/ </span>
                <span class="text-[10px] text-neutral-500 dark:text-neutral-400 total-traffic">${totalFormatted.value}</span>
                <span class="text-[10px] text-neutral-500 dark:text-neutral-400 total-unit">${totalFormatted.unit}</span>
              </div>
              <div class="text-[10px] font-medium text-neutral-600 dark:text-neutral-300 time-info" style="opacity:1; transition: opacity 0.3s;">
                ${defaultTimeInfoHTML}
              </div>
            </div>
            <div class="relative h-1.5">
              <div class="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 rounded-full"></div>
              <div class="absolute inset-0 bg-emerald-500 rounded-full transition-all duration-300 progress-bar" style="width: ${percentage}%; background-color: ${progressColor};"></div>
            </div>
          `;
                oldSection.after(newElement);
                console.log(`[renderTrafficStats] 插入新流量条目: ${serverName}`);

                // 定时切换显示内容
                const timeInfoElement = newElement.querySelector('.time-info');
                if (config.toggleInterval > 0 && timeInfoElement) {
                    toggleElements.push({
                        el: timeInfoElement,
                        contents
                    });
                }
            }
        });
    }

    function updateTrafficStats(force = false) {
        const now = Date.now();
        if (!force && trafficCache && (now - trafficCache.timestamp < config.interval)) {
            console.log('[updateTrafficStats] 使用缓存数据');
            renderTrafficStats(trafficCache.data);
            return;
        }

        console.log('[updateTrafficStats] 正在请求新数据...');
        fetch('/api/v1/service')
            .then(res => res.json())
            .then(data => {
                if (!data.success) {
                    console.warn('[updateTrafficStats] 请求成功但返回数据异常');
                    return;
                }
                console.log('[updateTrafficStats] 成功获取新数据');
                const trafficData = data.data.cycle_transfer_stats;
                trafficCache = {
                    timestamp: now,
                    data: trafficData
                };
                renderTrafficStats(trafficData);
            })
            .catch(err => console.error('[updateTrafficStats] 获取失败:', err));
    }

    function startPeriodicRefresh() {
        if (!trafficTimer) {
            console.log('[startPeriodicRefresh] 启动周期刷新任务');
            trafficTimer = setInterval(() => {
                updateTrafficStats();
            }, config.interval);
        }
    }

    function onDomChildListChange() {
        console.log('[onDomChildListChange] 检测到DOM变化, 立即刷新');
        updateTrafficStats();
        if (!trafficTimer) {
            console.log('[onDomChildListChange] 启动定时刷新');
            startPeriodicRefresh();
        }
    }

    const TARGET_SELECTOR = 'section.server-card-list, section.server-inline-list';

    let currentSection = null;
    let childObserver = null;

    function observeSection(section) {
        if (childObserver) {
            childObserver.disconnect();
            console.log('[监听] 断开旧的子节点监听');
        }

        currentSection = section;
        console.log('[监听] 监听新的目标 section 子节点');

        childObserver = new MutationObserver(mutations => {
            for (const m of mutations) {
                if (m.type === 'childList' && (m.addedNodes.length || m.removedNodes.length)) {
                    console.log('[监听] section 子节点变化，触发刷新');
                    onDomChildListChange();
                    break;
                }
            }
        });

        childObserver.observe(currentSection, { childList: true, subtree: false });
        updateTrafficStats();
    }

    const sectionDetector = new MutationObserver(() => {
        const section = document.querySelector(TARGET_SELECTOR);
        if (section && section !== currentSection) {
            observeSection(section);
        }
    });

    const root = document.querySelector('main') || document.body;
    sectionDetector.observe(root, { childList: true, subtree: true });
    console.log('[初始化] 启动 sectionDetector, 持续监听 section 切换');

    startPeriodicRefresh();

    window.addEventListener('beforeunload', () => {
        if (trafficTimer) clearInterval(trafficTimer);
        if (childObserver) childObserver.disconnect();
        sectionDetector.disconnect();
        console.log('[清理] 卸载监听器和定时器');
    });
})();
