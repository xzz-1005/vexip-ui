import { defineComponent, computed, h, inject } from 'vue'
import { useNameHelper, useProps } from '@vexip-ui/config'
import { ROW_STATE, breakPoints } from './symbol'

import type { PropType, CSSProperties } from 'vue'
import type { ColumnFlex, ColumnOptions } from './symbol'

type LayerProp = 'span' | 'offset' | 'pull' | 'push' | 'order'

const mediaProp = [Number, Object] as PropType<number | ColumnOptions>
const colProps: LayerProp[] = ['span', 'offset', 'pull', 'push', 'order']

export default defineComponent({
  name: 'Column',
  props: {
    tag: String,
    span: Number,
    offset: Number,
    push: Number,
    pull: Number,
    order: Number,
    xs: mediaProp,
    sm: mediaProp,
    md: mediaProp,
    lg: mediaProp,
    xl: mediaProp,
    xxl: mediaProp,
    flex: [Number, String],
    useFlex: {
      type: [Boolean, Object] as PropType<boolean | Partial<ColumnFlex>>,
      default: null
    }
  },
  setup(_props, { slots }) {
    const props = useProps('column', _props, {
      tag: 'div',
      span: 24,
      offset: null,
      push: null,
      pull: null,
      order: null,
      xs: null,
      sm: null,
      md: null,
      lg: null,
      xl: null,
      xxl: null,
      flex: null,
      useFlex: null
    })

    const rowState = inject(ROW_STATE, null)

    const nh = useNameHelper('column')

    const className = computed(() => {
      const columnFlex = (props.useFlex || rowState?.columnFlex) && {
        ...(rowState?.columnFlex || {}),
        ...(props.useFlex
          ? props.useFlex === true
            ? { justify: 'start', align: 'top' }
            : props.useFlex
          : {})
      }
      const className = [nh.b(), { [nh.bm('flex')]: columnFlex }]

      if (columnFlex) {
        columnFlex.justify && className.push(nh.bm(columnFlex.justify))
        columnFlex.align && className.push(nh.bm(columnFlex.align))
      }

      colProps.forEach(prop => {
        if (typeof props[prop] === 'number') {
          className.push(prop === 'span' ? nh.bm(props[prop]) : nh.bm(`${prop}-${props[prop]}`))
        }
      })

      breakPoints.forEach(size => {
        const sizeProp = props[size]

        if (!sizeProp && sizeProp !== 0) return

        if (typeof sizeProp === 'number') {
          className.push(nh.bm(`${size}-${sizeProp}`))
        } else if (typeof sizeProp === 'object') {
          colProps.forEach(prop => {
            const value = sizeProp[prop]

            if (!value && value !== 0) return

            className.push(prop === 'span' ? nh.bm(value) : nh.bm(`${prop}-${value}`))
          })
        }
      })

      return className
    })
    const style = computed(() => {
      const flex = props.flex
      const style: CSSProperties = {}

      if (rowState) {
        if (typeof rowState.gap === 'number') {
          style.paddingRight = style.paddingLeft = `${rowState.gap / 2}px`
        } else if (Array.isArray(rowState.gap)) {
          const [horizontal, vertical] = rowState.gap

          style.padding = `${vertical / 2}px ${horizontal / 2}px`
        }
      }

      if (flex) {
        if (typeof flex === 'number') {
          style.flex = `${flex} ${flex} auto`
        } else if (typeof flex === 'string') {
          if (/^\d+\s\d+\s\d+(\w+)?$/.test(flex)) {
            style.flex = flex
          } else {
            style.flex = flex === 'auto' ? '1 1 auto' : `0 0 ${flex}`
          }
        }
      }

      return style
    })

    return () =>
      h(
        props.tag || 'div',
        {
          class: className.value,
          style: style.value
        },
        {
          default: () => slots.default && slots.default()
        }
      )
  }
})
