# Styling

Customize the appearance of Vue Spring Bottom Sheet using CSS custom properties and custom classes.

## CSS Custom Properties

The bottom sheet uses CSS custom properties (CSS variables) for easy theming without writing custom CSS.

### Available Properties

```css
/* Backdrop */
--vsbs-backdrop-bg: rgba(0, 0, 0, 0.5);

/* Sheet container */
--vsbs-background: #fff;
--vsbs-border-radius: 16px;
--vsbs-max-width: 640px;
--vsbs-outer-border-color: transparent;

/* Shadow (non-blocking mode) */
--vsbs-shadow-color: rgba(89, 89, 89, 0.2);

/* Internal borders */
--vsbs-border-color: rgba(46, 59, 66, 0.125);

/* Content padding */
--vsbs-padding-x: 16px;

/* Drag handle */
--vsbs-handle-background: rgba(0, 0, 0, 0.28);
```

## Basic Customization

### Global Styles

Set variables globally to affect all bottom sheets:

```css
/* In your global CSS file or <style> block */
:root {
  --vsbs-background: #f5f5f5;
  --vsbs-border-radius: 24px;
  --vsbs-backdrop-bg: rgba(0, 0, 0, 0.7);
}
```

## Theme Examples

### Dark Theme

```vue
<template>
  <div class="dark-theme">
    <BottomSheet ref="bottomSheet">
      <h2>Dark Mode Sheet</h2>
      <p>Looks great in dark mode!</p>
    </BottomSheet>
  </div>
</template>

<style scoped>
.dark-theme {
  --vsbs-background: #1a1a1a;
  --vsbs-backdrop-bg: rgba(0, 0, 0, 0.8);
  --vsbs-border-color: rgba(255, 255, 255, 0.1);
  --vsbs-handle-background: rgba(255, 255, 255, 0.3);
  --vsbs-outer-border-color: rgba(255, 255, 255, 0.1);
  color: white;
}
</style>
```

## Custom Classes

Use the `headerClass`, `contentClass`, and `footerClass` props for targeted styling:

```vue
<template>
  <BottomSheet
    header-class="custom-header"
    content-class="custom-content"
    footer-class="custom-footer"
  >
    <template #header>
      <h2>Styled Header</h2>
    </template>

    <p>Styled Content</p>

    <template #footer>
      <button>Action</button>
    </template>
  </BottomSheet>
</template>

<style scoped>
.custom-header {
  background: linear-gradient(to right, #667eea, #764ba2);
  color: white;
  padding: 2rem;
  text-align: center;
}

.custom-content {
  font-size: 1.2rem;
  line-height: 1.8;
  padding: 2rem;
}

.custom-footer {
  background: #f5f5f5;
  padding: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style>
```

## Data Attributes Reference

These are the data attributes you can target for styling:

| Attribute                     | Element          | Description                       |
| ----------------------------- | ---------------- | --------------------------------- |
| `[data-vsbs-backdrop]`        | Backdrop overlay | The dark overlay behind the sheet |
| `[data-vsbs-sheet]`           | Sheet container  | Main sheet container              |
| `[data-vsbs-shadow]`          | Sheet container  | Applied when `blocking={false}`   |
| `[data-vsbs-sheet-show]`      | Sheet container  | Applied when sheet is visible     |
| `[data-vsbs-header]`          | Header section   | Header area with drag handle      |
| `[data-vsbs-scroll]`          | Scroll container | Scrollable content wrapper        |
| `[data-vsbs-content-wrapper]` | Content wrapper  | Inner content wrapper             |
| `[data-vsbs-content]`         | Content area     | Main content area                 |
| `[data-vsbs-footer]`          | Footer section   | Footer area                       |

## Next Steps

- [Examples](/examples) - See styling in action
- [Props](/guide/props) - Learn about style-related props
- [GitHub Examples](https://github.com/douxcode/vue-spring-bottom-sheet) - More examples
