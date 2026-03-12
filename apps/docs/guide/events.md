# Events

Vue Spring Bottom Sheet emits events throughout its lifecycle, allowing you to respond to user interactions and state changes.

## Events Overview

| Event                                   | Payload          | Description                            |
| --------------------------------------- | ---------------- | -------------------------------------- |
| [opened](#opened)                       | -                | Emitted when sheet finishes opening    |
| [opening-started](#opening-started)     | -                | Emitted when sheet starts opening      |
| [closed](#closed)                       | -                | Emitted when sheet finishes closing    |
| [closing-started](#closing-started)     | -                | Emitted when sheet starts closing      |
| [dragging-up](#dragging-up)             | -                | Emitted when user drags sheet upward   |
| [dragging-down](#dragging-down)         | -                | Emitted when user drags sheet downward |
| [snapped](#snapped)                     | `index: number`  | Emitted when sheet snaps to a point    |
| [instinct-height](#instinct-height)     | `height: number` | Emitted when content height changes    |
| [update:modelValue](#update-modelvalue) | `value: boolean` | Emitted for v-model sync               |

## Next Steps

- [Methods](/guide/methods) - Programmatic control
- [Props Reference](/guide/props) - Configuration options
- [Examples](/examples) - Practical examples
