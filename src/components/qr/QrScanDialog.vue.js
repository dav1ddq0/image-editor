import { ref } from 'vue';
const props = defineProps();
const emit = defineEmits();
const copied = ref(false);
async function copyToClipboard() {
    try {
        await navigator.clipboard.writeText(props.text);
        copied.value = true;
        setTimeout(() => { copied.value = false; }, 2000);
    }
    catch {
        // Fallback for environments without Clipboard API
        const ta = document.createElement('textarea');
        ta.value = props.text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        copied.value = true;
        setTimeout(() => { copied.value = false; }, 2000);
    }
}
function close() {
    emit('update:visible', false);
}
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['qr-close']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Teleport | typeof __VLS_components.Teleport} */
Teleport;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    to: "body",
}));
const __VLS_2 = __VLS_1({
    to: "body",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
if (__VLS_ctx.visible) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (__VLS_ctx.close) },
        ...{ class: "qr-backdrop" },
    });
    /** @type {__VLS_StyleScopedClasses['qr-backdrop']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "qr-dialog" },
        role: "dialog",
        'aria-modal': "true",
        'aria-label': "QR Code Scanner",
    });
    /** @type {__VLS_StyleScopedClasses['qr-dialog']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "qr-header" },
    });
    /** @type {__VLS_StyleScopedClasses['qr-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "qr-title" },
    });
    /** @type {__VLS_StyleScopedClasses['qr-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.close) },
        ...{ class: "qr-close" },
        'aria-label': "Close",
    });
    /** @type {__VLS_StyleScopedClasses['qr-close']} */ ;
    if (__VLS_ctx.state === 'scanning') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "qr-body qr-center" },
        });
        /** @type {__VLS_StyleScopedClasses['qr-body']} */ ;
        /** @type {__VLS_StyleScopedClasses['qr-center']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
            ...{ class: "qr-spinner" },
            'aria-label': "Scanning…",
        });
        /** @type {__VLS_StyleScopedClasses['qr-spinner']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "qr-status-text" },
        });
        /** @type {__VLS_StyleScopedClasses['qr-status-text']} */ ;
    }
    else if (__VLS_ctx.state === 'found') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "qr-body" },
        });
        /** @type {__VLS_StyleScopedClasses['qr-body']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "qr-label" },
        });
        /** @type {__VLS_StyleScopedClasses['qr-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.textarea)({
            ...{ class: "qr-textarea" },
            readonly: true,
            value: (__VLS_ctx.text),
            rows: "5",
            'aria-label': "Decoded QR content",
        });
        /** @type {__VLS_StyleScopedClasses['qr-textarea']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.copyToClipboard) },
            ...{ class: "btn btn-primary qr-copy-btn" },
        });
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
        /** @type {__VLS_StyleScopedClasses['qr-copy-btn']} */ ;
        (__VLS_ctx.copied ? '✓ Copied!' : 'Copy to clipboard');
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "qr-body qr-center" },
        });
        /** @type {__VLS_StyleScopedClasses['qr-body']} */ ;
        /** @type {__VLS_StyleScopedClasses['qr-center']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            ...{ class: "qr-warn-icon" },
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "1.8",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
        });
        /** @type {__VLS_StyleScopedClasses['qr-warn-icon']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
            cx: "12",
            cy: "12",
            r: "10",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "12",
            y1: "8",
            x2: "12",
            y2: "12",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
            cx: "12",
            cy: "16",
            r: "0.5",
            fill: "currentColor",
            stroke: "none",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "qr-status-text" },
        });
        /** @type {__VLS_StyleScopedClasses['qr-status-text']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.close) },
            ...{ class: "btn btn-secondary" },
            ...{ style: {} },
        });
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
    }
}
// @ts-ignore
[visible, close, close, close, state, state, text, copyToClipboard, copied,];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
