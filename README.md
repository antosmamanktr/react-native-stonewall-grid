# StonewallGrid

**StonewallGrid** is a flexible and performant masonry layout component for React Native. It automatically detects image fields, calculates their aspect ratio, and arranges them into visually balanced columns—just like Pinterest.

## ✨ Features

- Supports remote and local images
- Automatically scales images to fit the column width
- Flexible field detection (`imageFields` prop)
- Adjustable spacing, number of columns, and item order
- Reusable and customizable through `renderItem`

## 📦 Installation

```sh
npm install react-native-stonewall-grid
```

> _Or just copy the `StonewallGrid.js` file directly into your project._

## 🚀 Usage

```jsx
import React from 'react';
import {Image, Text, View} from 'react-native';
import StonewallGrid from './StonewallGrid';

const data = [
  {
    id: '1',
    source: {uri: 'https://example.com/image1.jpg'},
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
      renderItem={({item}) => {
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

## ⚙️ Props

| Prop               | Type          | Default     | Description |
|--------------------|---------------|-------------|-------------|
| `data`             | `Array`       | `[]`        | List of data items |
| `renderItem`       | `Function`    | _required_  | Function to render each item `{item}` |
| `columns`          | `number`      | `2`         | Number of columns |
| `horizontalSpacing`| `number`      | `12`        | Horizontal space between columns |
| `verticalSpacing`  | `number`      | `12`        | Vertical space between items |
| `preserveOrder`    | `boolean`     | `false`     | Maintain original order (vs shortest column first) |
| `imageFields`      | `string[]`    | `['source']`| List of image keys to auto-detect and calculate height for |

## 🖼 Image Format Support

- Remote image URLs (`{ uri: 'https://...' }`)
- Local images via `require()` (number type)
- Direct URL strings (`'https://...'`)
- Deep object fields like `item.cover.image`

## 🧠 Internals

- Caches image sizes to reduce layout thrashing
- Uses `Image.getSize()` and `Image.resolveAssetSource()` safely
- Only the first valid image field is used for layout balancing

## ✅ Best Practices

- Always pass `id` or a unique field for items
- If an item has multiple images, prioritize them in the `imageFields` array
- Avoid using dynamic `require()` for local images

## 🛠 TODO

- Add infinite scroll support
- Optional animated transitions
- RTL layout support

## 📄 License

MIT

---

Made with ❤️ for React Native.
