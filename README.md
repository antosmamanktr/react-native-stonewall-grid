# 🧱 react-native-stonewall-grid

<table style="border: none">
<tr  style="border: none">
<td style="vertical-align: top; padding-right: 16px; border: none">



**StonewallGrid** is a flexible and performant masonry-style layout component for React Native. It automatically detects image fields, calculates their aspect ratios, and arranges them into balanced columns — just like Pinterest.

Built with TypeScript and supports local or remote images with minimal configuration.

</td>
<td  style="border: none">

<img src="./src/assets/demo-layout.png" alt="StonewallGrid Preview" width="450"/>

</td>
</tr>
</table>


---

## ✨ Features

- 📐 Automatically scales image height by aspect ratio
- 🖼️ Supports remote and local images (`require`, `uri`, or string URLs)
- 🧠 Auto-detects fields via `imageFields` prop
- 🔀 Optional order preservation
- ⚙️ Fully customizable with your own `renderItem`
- 📱 Responsive column layout based on screen width

---

## 📦 Installation

```sh
npm install react-native-stonewall-grid
```

---

## 🚀 Usage

```tsx
import React from 'react';
import { Image, Text, View } from 'react-native';
import StonewallGrid from 'react-native-stonewall-grid';

const data = [
  {
    id: '1',
    source: { uri: 'https://example.com/image1.jpg' },
    title: 'First',
  },
  {
    id: '2',
    source: require('./assets/local-image.jpg'),
    title: 'Second',
  },
  {
    id: '3',
    thumbnail: 'https://example.com/thumb.jpg',
    title: 'Third',
  },
];

const App = () => {
  return (
    <StonewallGrid
      data={data}
      columns={2}
      imageFields={['source', 'thumbnail']}
      renderItem={({ item }) => {
        const field = item.source?.image ? 'source' : 'thumbnail';
        const imageData = item[field];

        return (
          <View>
            <Image
              source={imageData?.image}
              style={{
                width: '100%',
                height: imageData?.height || 100,
                borderRadius: 8,
              }}
              resizeMode="cover"
            />
            <Text>{item.title}</Text>
          </View>
        );
      }}
    />
  );
};

export default App;
```

---

## ⚙️ Props

| Prop               | Type            | Default       | Description |
|--------------------|-----------------|---------------|-------------|
| `data`             | `T[]`           | `[]`          | Array of items to render |
| `renderItem`       | `({ item }) => JSX.Element` | _required_ | Render function per item |
| `columns`          | `number`        | `2`           | Number of columns |
| `horizontalSpacing`| `number`        | `12`          | Space between columns |
| `verticalSpacing`  | `number`        | `12`          | Space between rows |
| `preserveOrder`    | `boolean`       | `false`       | Maintain original order (vs column height logic) |
| `imageFields`      | `string[]`      | `['source']`  | Field keys to inspect for image data |

---

## 🖼 Supported Image Formats

- Remote image objects: `{ uri: 'https://...' }`
- Local image assets: `require('./path/to/image.jpg')`
- Direct string URLs: `'https://example.com/image.jpg'`

---

## 🧠 Best Practices

- Always pass a unique `id` (or use index fallback)
- If an item has multiple image fields, list them in order of priority in `imageFields`
- Don't use dynamic `require()` (e.g., `require(variable)`)

---

## 💡 Tip

This package only reads image dimensions and passes back `{ image, height }` in the specified image fields. You control exactly how the image is rendered using `renderItem`.

---

## 📄 License

[MIT](./LICENSE)

---

Made with ❤️ by [@antosmamanktr](https://github.com/antosmamanktr)
