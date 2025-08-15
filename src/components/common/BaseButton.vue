<template>
  <Button
    :label="label"
    :icon="mappedIcon"
    :class="buttonClasses"
    :severity="severity"
    :size="size"
    :outlined="outlined"
    :text="text"
    :rounded="rounded"
    :raised="raised"
    v-tooltip="tooltip"
    v-bind="$attrs"
  >
    <template v-if="$slots.default" #default>
      <slot />
    </template>
  </Button>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import Button from 'primevue/button'
import Tooltip from 'primevue/tooltip'

export default defineComponent({
  name: 'BaseButton',
  
  components: {
    Button
  },
  
  directives: {
    tooltip: Tooltip
  },
  
  props: {
    label: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: 'primary'
    },
    size: {
      type: String,
      default: undefined
    },
    flat: {
      type: Boolean,
      default: false
    },
    unelevated: {
      type: Boolean,
      default: false
    },
    outlined: {
      type: Boolean,
      default: false
    },
    text: {
      type: Boolean,
      default: false
    },
    rounded: {
      type: Boolean,
      default: false
    },
    raised: {
      type: Boolean,
      default: false
    },
    tooltip: {
      type: String,
      default: ''
    },
    padding: {
      type: String,
      default: ''
    }
  },
  
  setup(props) {
    const severity = computed(() => {
      const colorMap: Record<string, string> = {
        'primary': 'primary',
        'secondary': 'secondary',
        'positive': 'success',
        'negative': 'danger',
        'warning': 'warn',
        'info': 'info',
        'blue-grey-7': 'secondary'
      }
      return colorMap[props.color] || 'primary'
    })
    
    const mappedIcon = computed(() => {
      if (!props.icon) return undefined
      
      const iconMap: Record<string, string> = {
        'close': 'times',
        'volume_up': 'volume-up',
        'speed': 'gauge',
        'grain': 'bars',
        'equalizer': 'sliders-h',
        'play_arrow': 'play',
        'pause': 'pause',
        'restart_alt': 'refresh'
      }
      
      const mappedName = iconMap[props.icon] || props.icon
      return `pi pi-${mappedName}`
    })
    
    const buttonClasses = computed(() => {
      const classes = []
      
      if (props.flat) {
        classes.push('p-button-text')
      }
      
      if (!props.unelevated && !props.flat) {
        classes.push('p-button-raised')
      }
      
      if (props.padding) {
        const [y, x] = props.padding.split(' ')
        if (y === 'sm') classes.push('py-2')
        if (y === 'md') classes.push('py-3')
        if (x === 'xl') classes.push('px-6')
      }
      
      return classes.join(' ')
    })
    
    return {
      severity,
      buttonClasses,
      mappedIcon
    }
  }
})
</script>