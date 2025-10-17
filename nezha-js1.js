    window.CustomBackgroundImage = 'https://tuapi.xmix.one'; 
    window.CustomMobileBackgroundImage = 'https://tuapi.xmix.one'; 
    window.CustomLogo = 'https://xmix.one/favicon.ico'; 
    window.CustomDesc = 'Love'; 
    window.ShowNetTransfer = true; 
    window.DisableAnimatedMan = true; 
    window.CustomIllustration = 'https://xmix.one/fj3EXY7umsyR9NW.webp'; 
    window.FixedTopServerName = true; 
    window.CustomLinks = '[{\"link\":\"https://n.xmix.one/\",\"name\":\"首页\"}]'; /* 自定义导航栏链接 */
    /* window.ForceTheme = 'dark'; /* 强制主题色, 可选值为 light 或 dark */
    /* window.ForceUseSvgFlag = false; /* 是否强制使用 svg 旗帜 */

    /* 自定义字体, 注意需要同步修改下方 CSS 中的 font-family */
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://font.sec.miui.com/font/css?family=MiSans:400,700:MiSans'; // MiSans
    // link.href = 'https://npm.elemecdn.com/lxgw-wenkai-screen-webfont@1.7.0/style.css'; // 霞鹜文楷, font-family: 'LXGW WenKai Screen'
    document.head.appendChild(link);

    /* 修改页脚, 可使用 HTML 元素, 请保留哪吒版权信息, 与下方 CSS 中的 不显示页脚 冲突 */
    /* 左侧哪吒文本 */
    const observerFooterLeft = new MutationObserver(() => {
        const footerLeft = document.querySelector('.server-footer-name > div:first-child');
        if (footerLeft) {
            // footerLeft.innerHTML = 'Powered by <a href="https://github.com/nezhahq/nezha" target="_blank">NeZha</a>';
            footerLeft.style.visibility = 'hidden'; // 隐藏
            observerFooterLeft.disconnect();
        }
    });
    observerFooterLeft.observe(document.body, { childList: true, subtree: true });
    /* 右侧主题文本 */
    const observerFooterRight = new MutationObserver(() => {
        const footerRight = document.querySelector('.server-footer-theme');
        if (footerRight) {
            footerRight.innerHTML = '<section>Powered by <a href="https://github.com/nezhahq/nezha" target="_blank">NeZha</a></section>';
            // footerRight.style.visibility = 'hidden'; // 隐藏
            observerFooterRight.disconnect();
        }
    });
    observerFooterRight.observe(document.body, { childList: true, subtree: true });
