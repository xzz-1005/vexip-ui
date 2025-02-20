<template>
  <Row ref="wrapper" tag="section" :class="prefix">
    <Column>
      <div :class="`${prefix}__example`">
        <NativeScroll
          mode="horizontal"
          width="100%"
          use-x-bar
          :scroll-style="{
            display: 'inline-block',
            padding: '20px 12px 8px'
          }"
        >
          <slot></slot>
        </NativeScroll>
      </div>
      <div :class="`${prefix}__description`">
        <slot name="desc"></slot>
      </div>
    </Column>
    <Column :class="`${prefix}__actions`">
      <Tooltip reverse transfer>
        <template #trigger>
          <button :class="`${prefix}__action`">
            <Icon :scale="1.1" @click="copyCode">
              <CopyR></CopyR>
            </Icon>
          </button>
        </template>
        {{ $t('common.copyCode') }}
      </Tooltip>
      <Tooltip reverse transfer>
        <template #trigger>
          <button :class="`${prefix}__action`">
            <Icon :scale="1.1" :label="$t('common.editInGithub')" @click="editInGithub">
              <PenToSquareR></PenToSquareR>
            </Icon>
          </button>
        </template>
        {{ $t('common.editInGithub') }}
      </Tooltip>
      <Tooltip reverse transfer>
        <template #trigger>
          <button :class="`${prefix}__action`">
            <Icon :scale="1.1" :label="$t('common.editInPlayground')" @click="editOnPlayground">
              <PaperPlaneR></PaperPlaneR>
            </Icon>
          </button>
        </template>
        {{ $t('common.editInPlayground') }}
      </Tooltip>
      <Tooltip reverse transfer>
        <template #trigger>
          <button :class="`${prefix}__action`">
            <Icon
              :scale="1.1"
              :label="codeExpanded ? $t('common.hideCode') : $t('common.showCode')"
              @click="expandCode"
            >
              <Code></Code>
            </Icon>
          </button>
        </template>
        {{ codeExpanded ? $t('common.hideCode') : $t('common.showCode') }}
      </Tooltip>
    </Column>
    <CollapseTransition>
      <Column v-show="codeExpanded" :class="`${prefix}__code`">
        <slot name="code">
          <pre :class="`language-${lang}`"><code ref="codeRef"></code></pre>
        </slot>
        <button :class="`${prefix}__reduce`" @click="expandCode">
          <Icon><ChevronUp></ChevronUp></Icon>
          <span :class="`${prefix}__tip`">
            {{ $t('common.hideCode') }}
          </span>
        </button>
      </Column>
    </CollapseTransition>
  </Row>
</template>

<script setup lang="ts">
import { useSlots, ref, watch, onMounted } from 'vue'
import { highlight, languages } from 'prismjs'
import { Message } from 'vexip-ui'
import { CopyR, PenToSquareR, PaperPlaneR, Code, ChevronUp } from '@vexip-ui/icons'
import { usePlayground } from './playground'

import type { PropType } from 'vue'
import type { Row } from 'vexip-ui'

const extensionMap: Record<string, string> = {
  vue: 'markup',
  html: 'markup',
  md: 'markdown',
  rb: 'ruby',
  ts: 'typescript',
  py: 'python',
  sh: 'bash',
  yml: 'yaml',
  styl: 'stylus',
  kt: 'kotlin',
  rs: 'rust'
}

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  code: {
    type: String,
    default: ''
  },
  lang: {
    type: String,
    default: 'vue'
  },
  github: {
    type: String,
    default: ''
  },
  onMounted: {
    type: Function as PropType<() => any>,
    default: null
  }
})
const slots = useSlots()

const prefix = 'demo'
const codeExpanded = ref(false)
const wrapper = ref<InstanceType<typeof Row> | null>(null)
const codeRef = ref<HTMLElement | null>(null)

watch(
  () => props.code,
  value => {
    if (value) {
      const lang = getCodeLang(props.lang.toLowerCase())

      if (languages[lang] && codeRef.value) {
        codeRef.value.innerHTML = highlight(props.code, languages[lang], lang)
      }
    }
  }
)

onMounted(() => {
  if (props.code && !slots.code && codeRef.value) {
    const lang = getCodeLang(props.lang.toLowerCase())

    if (languages[lang]) {
      codeRef.value.innerHTML = highlight(props.code, languages[lang], lang)
    }
  }

  if (typeof props.onMounted === 'function') {
    props.onMounted()
  }
})

function expandCode() {
  codeExpanded.value = !codeExpanded.value
}

function copyCode() {
  let isSuccess = false

  if (wrapper.value?.$el) {
    const code = wrapper.value.$el.querySelector('pre code')
    const textarea = document.createElement('textarea')

    textarea.style.height = '0'
    textarea.setAttribute('readonly', 'readonly')

    textarea.value = code?.textContent ?? ''

    document.body.appendChild(textarea)
    textarea.select()

    isSuccess = document.execCommand('copy')

    document.body.removeChild(textarea)
  }

  if (isSuccess) {
    Message.success('复制成功')
  } else {
    Message.error('复制失败')
  }
}

function getCodeLang(extension: string) {
  return extensionMap[extension] ?? extension
}

const githubBaseUrl = 'https://github.com/qmhc/vexip-ui/blob/main/docs/'

function editInGithub() {
  if (props.github) {
    window.open(`${githubBaseUrl}${props.github}`)
  }
}

function editOnPlayground() {
  if (props.code) {
    const { link } = usePlayground(props.code)

    window.open(link)
  }
}
</script>

<style lang="scss">
@use '../style/mixins.scss' as *;

.demo {
  margin-bottom: 1.4em;
  border: var(--vxp-border-light-2);
  border-radius: var(--vxp-radius-base);
  transition: var(--vxp-transition-border), var(--vxp-transition-shadow);

  &:hover {
    box-shadow: var(--vxp-shadow-base);
  }

  &__example {
    padding: 20px 12px 8px;
  }

  &__description {
    padding: 0 14px 14px;

    .markdown p {
      padding: 0 14px;
      margin-bottom: 6px;
    }

    .anchor {
      width: 100%;
      margin: 14px 0;
      font-size: var(--vxp-font-size-primary);
      color: var(--vxp-content-color-base);
      white-space: nowrap;

      &::before,
      &::after {
        position: relative;
        top: 50%;
        content: '';
        border-top: var(--vxp-border-light-2);
        transition: var(--vxp-transition-border);
        transform: translateY(50%);
      }

      &::before {
        width: 14px;
        margin-right: 8px;
      }

      &::after {
        width: calc(100% - 14px);
        margin-left: 8px;
      }

      &__link {
        display: none;
      }
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 0;
    border-top: var(--vxp-border-light-2);
    transition: var(--vxp-transition-border);
  }

  &__action {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin-left: 3px;
    color: var(--vxp-content-color-placeholder);
    cursor: pointer;
    background-color: transparent;
    border: 0;
    outline: 0;
    transition: var(--vxp-transition-color);

    &:hover,
    &:focus {
      color: var(--vxp-color-primary-opacity-2);
    }

    &:first-child {
      margin-left: 0;
    }

    .vxp-tooltip__trigger {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
    }

    .vxp-tooltip__tip {
      white-space: nowrap;
    }

    .vxp-icon {
      width: 100%;
      height: 100%;
    }
  }

  &__actions:hover &__action,
  &__actions:focus-within &__action {
    color: var(--vxp-content-color-third);

    &:hover,
    &:focus {
      color: var(--vxp-color-primary-opacity-2);
    }
  }

  &__code {
    overflow: hidden;
    border-top: var(--vxp-border-light-2);
    border-radius: 0 0 var(--vxp-border-radius-base) var(--vxp-border-radius-base);
  }

  &__reduce {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 32px;
    padding: 6px 0;
    color: var(--vxp-content-color-placeholder);
    cursor: pointer;
    background-color: transparent;
    border: 0;
    border-top: var(--vxp-border-light-2);
    outline: 0;

    &:hover,
    &:focus {
      color: var(--vxp-color-primary-opacity-2);
    }
  }

  &__reduce &__tip {
    width: 80px;
    padding-left: 10px;
    margin-right: -80px;
    white-space: nowrap;
    opacity: 0%;
    transition:
      margin var(--vxp-transition-base),
      var(--vxp-transition-color),
      var(--vxp-transition-opacity);
  }

  &__reduce:hover &__tip,
  &__reduce:focus &__tip {
    margin-right: 0;
    opacity: 100%;
  }
}
</style>
