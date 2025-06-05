//window.CustomBackgroundImage = "https://w.wallhaven.cc/full/q6/wallhaven-q6jvjl.jpg";
window.CustomBackgroundImage = "https://bing.img.run/rand_uhd.php"; /* 页面背景图 */
window.CustomMobileBackgroundImage = "https://bing.img.run/rand_m.php"; /* 移动端页面背景图 */
/* 卡片显示上下行流量 */
window.ShowNetTransfer = "true";
/* 关掉人物插图 */
window.DisableAnimatedMan = "true";
/* 自定义描述 */
window.CustomDesc = "v2.games";

/* 修改页脚, 可使用 HTML 元素, 请保留哪吒版权信息, 与下方 CSS 中的 不显示页脚 冲突 */
/* 左侧哪吒文本 */
const observerFooterLeft = new MutationObserver(() => {
  const footerLeft = document.querySelector(
    ".server-footer-name > div:first-child"
  );
  if (footerLeft) {
    footerLeft.style.visibility = "hidden"; // 隐藏
    observerFooterLeft.disconnect();
  }
});
observerFooterLeft.observe(document.body, { childList: true, subtree: true });
/* 右侧主题文本 */
const observerFooterRight = new MutationObserver(() => {
  const footerRight = document.querySelector(".server-footer-theme");
  if (footerRight) {
    footerRight.innerHTML = "<section></section>";
    observerFooterRight.disconnect();
  }
});
observerFooterRight.observe(document.body, {
  childList: true,
  subtree: true,
});
</script>

<script>
; (function () {
  let trafficTimer = null;
  let trafficCache = null;

  const config = {
    showTrafficStats: true,
    insertPosition: 'replace', // 可选：'after', 'before', 'replace'
    interval: 60000,           // 60秒刷新周期
    style: 1
  };

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
    return (used / total * 100).toFixed(1);
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
  // 返回进度条颜色：绿色（0%）到红色（100%）
  function getGradientColor(percentage) {
    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
    const lerp = (start, end, t) => Math.round(start + (end - start) * t);
    const p = clamp(Number(percentage), 0, 100) / 100;
    const startColor = { r: 16, g: 185, b: 129 }; // #10b981
    const endColor = { r: 239, g: 68, b: 68 };  // #ef4444
    const r = lerp(startColor.r, endColor.r, p);
    const g = lerp(startColor.g, endColor.g, p);
    const b = lerp(startColor.b, endColor.b, p);
    return `rgb(${r}, ${g}, ${b})`;
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
      const progressColor = getGradientColor(percentage);
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
        let oldSection = containerDiv.querySelector('section.flex.items-center.w-full.justify-between.gap-1');
        if (!oldSection) {
          oldSection = containerDiv.querySelector('section.grid.items-center.gap-3');
          insertPosition = 'after';
        }
        if (!oldSection) return;

        const newElement = document.createElement('div');
        newElement.classList.add('space-y-1.5', 'new-inserted-element', uniqueClassName);
        newElement.style.width = '100%';
        if (config.style === 1) {
          newElement.innerHTML = `
              <div class="flex items-center justify-between">
                <div class="flex items-baseline gap-1">
                  <span class="text-[10px] font-medium text-neutral-800 dark:text-neutral-200 used-traffic">${usedFormatted.value}</span>
                  <span class="text-[10px] font-medium text-neutral-800 dark:text-neutral-200 used-unit">${usedFormatted.unit}</span>
                  <span class="text-[10px] text-neutral-500 dark:text-neutral-400">/ </span>
                  <span class="text-[10px] text-neutral-500 dark:text-neutral-400 total-traffic">${totalFormatted.value}</span>
                  <span class="text-[10px] text-neutral-500 dark:text-neutral-400 total-unit">${totalFormatted.unit}</span>
                </div>
                <div class="text-[10px] font-medium text-neutral-600 dark:text-neutral-300">
                  <span class="from-date">${fromFormatted}</span>
                  <span class="text-neutral-500 dark:text-neutral-400">-</span>
                  <span class="to-date">${toFormatted}</span>
                </div>
              </div>
              <div class="relative h-1.5">
                <div class="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 rounded-full"></div>
                <div class="absolute inset-0 bg-emerald-500 rounded-full transition-all duration-300 progress-bar" style="width: ${percentage}%; background-color: ${progressColor};"></div>
              </div>
            `;
        } else if (config.style === 2) {
          newElement.innerHTML = `
              <div class="flex items-center justify-between">
                <div class="flex items-baseline gap-1">
                  <span class="text-[10px] font-medium text-neutral-800 dark:text-neutral-200 used-traffic">${usedFormatted.value}</span>
                  <span class="text-[10px] font-medium text-neutral-800 dark:text-neutral-200 used-unit">${usedFormatted.unit}</span>
                  <span class="text-[10px] text-neutral-500 dark:text-neutral-400">/ </span>
                  <span class="text-[10px] text-neutral-500 dark:text-neutral-400 total-traffic">${totalFormatted.value}</span>
                  <span class="text-[10px] text-neutral-500 dark:text-neutral-400 total-unit">${totalFormatted.unit}</span>
                </div>
                <span class="text-[10px] text-neutral-500 dark:text-neutral-400 percentage-value">${percentage}%</span>
              </div>
              <div class="relative h-1.5">
                <div class="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 rounded-full"></div>
                <div class="absolute inset-0 bg-emerald-500 rounded-full transition-all duration-300 progress-bar" style="width: ${percentage}%; background-color: ${progressColor};"></div>
              </div>
              <div class="flex items-center justify-between">
                <div class="text-[10px] text-neutral-500 dark:text-neutral-400">
                  <span class="from-date">${fromFormatted}</span>
                  <span class="text-neutral-500 dark:text-neutral-400">-</span>
                  <span class="to-date">${toFormatted}</span>
                </div>
                <span class="text-[10px] text-neutral-500 dark:text-neutral-400">next update: ${next_update}</span>
              </div>
            `;
        }
        if (insertPosition === 'before') oldSection.before(newElement);
        else if (insertPosition === 'replace') oldSection.replaceWith(newElement);
        else oldSection.after(newElement);
        console.log(`[renderTrafficStats] 插入新流量条目: ${serverName}，插入方式: ${insertPosition}`);
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
