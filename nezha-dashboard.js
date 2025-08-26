// 哪吒探针后台美化 版本 2025.04.11 by TomyJan
// 详细说明与支持请前往: https://www.nodeseek.com/post-311746-1

// ===== 配置区域 =====
const neZhaConfig = {
    disableAnimatedMan: true,        // 是否禁用动画
    adminTitle: 'v2.games',          // 左上角后台名称
    fontUrl: 'https://font.sec.miui.com/font/css?family=MiSans:400,700:MiSans', // 自定义字体
    fontFamily: 'MiSans',            // 字体名称
};
// ====================

// 禁用动画
window.DisableAnimatedMan = neZhaConfig.disableAnimatedMan;

// 引入自定义字体
(function() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = neZhaConfig.fontUrl;
    document.head.appendChild(link);
})();

// 修改后台左上角标题
(function() {
    const observerAdminTitle = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // 元素节点
                    const links = node.matches('.transition-opacity') ? [node] : node.querySelectorAll('.transition-opacity');
                    links.forEach(link => {
                        const textNode = Array.from(link.childNodes)
                            .find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim() === '哪吒监控');
                        if (textNode) {
                            textNode.textContent = neZhaConfig.adminTitle;
                            observerAdminTitle.disconnect();
                        }
                    });
                }
            });
        });
    });
    observerAdminTitle.observe(document.body, { childList: true, subtree: true });
})();
