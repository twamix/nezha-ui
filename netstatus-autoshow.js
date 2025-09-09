// ==UserScript==
// @version      1.0
// @description  哪吒详情页直接展示网络波动卡片
// @author       https://www.nodeseek.com/post-349102-1
// ==/UserScript==

(function () {
    'use strict';

    const selectorButton = '#root > div > main > div.mx-auto.w-full.max-w-5xl.px-0.flex.flex-col.gap-4.server-info > section > div.flex.justify-center.w-full.max-w-\\[200px\\] > div > div > div.relative.cursor-pointer.rounded-3xl.px-2\\.5.py-\\[8px\\].text-\\[13px\\].font-\\[600\\].transition-all.duration-500.text-stone-400.dark\\:text-stone-500';
    const selectorSection = '#root > div > main > div.mx-auto.w-full.max-w-5xl.px-0.flex.flex-col.gap-4.server-info > section';

    const selector3 = '#root > div > main > div.mx-auto.w-full.max-w-5xl.px-0.flex.flex-col.gap-4.server-info > div:nth-child(3)';
    const selector4 = '#root > div > main > div.mx-auto.w-full.max-w-5xl.px-0.flex.flex-col.gap-4.server-info > div:nth-child(4)';

    let hasClicked = false;
    let divVisible = false;

    function forceBothVisible() {
        const div3 = document.querySelector(selector3);
        const div4 = document.querySelector(selector4);
        if (div3 && div4) {
            div3.style.display = 'block';
            div4.style.display = 'block';
        }
    }

    function hideSection() {
        const section = document.querySelector(selectorSection);
        if (section) {
            section.style.display = 'none';
        }
    }

    function tryClickButton() {
        const btn = document.querySelector(selectorButton);
        if (btn && !hasClicked) {
            btn.click();
            hasClicked = true;
            setTimeout(forceBothVisible, 500);
        }
    }

    function tryClickPeak() {
        const peakBtn = document.querySelector('#Peak');
        if (peakBtn) {
            peakBtn.click();
            console.log('[UserScript] 已点击 Peak 按钮');
        } else {
            console.log('[UserScript] 未找到 Peak 按钮');
        }
    }

    const observer = new MutationObserver(() => {
        const div3 = document.querySelector(selector3);
        const div4 = document.querySelector(selector4);

        const isDiv3Visible = div3 && getComputedStyle(div3).display !== 'none';
        const isDiv4Visible = div4 && getComputedStyle(div4).display !== 'none';

        const isAnyDivVisible = isDiv3Visible || isDiv4Visible;

        if (isAnyDivVisible && !divVisible) {
            hideSection();
            tryClickButton();
            setTimeout(tryClickPeak, 300);
        } else if (!isAnyDivVisible && divVisible) {
            hasClicked = false;
        }

        divVisible = isAnyDivVisible;

        if (div3 && div4) {
            if (!isDiv3Visible || !isDiv4Visible) {
                forceBothVisible();
            }
        }
    });

    const root = document.querySelector('#root');
    if (root) {
        observer.observe(root, {
            childList: true,
            attributes: true,
            subtree: true,
            attributeFilter: ['style', 'class']
        });
    }
})();
