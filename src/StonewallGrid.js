import React, { useEffect, useState } from "react";
import { Dimensions, View, Image } from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const imageSizeCache = {};

function getImageSize(source) {
  return new Promise((resolve, reject) => {
    if (typeof source === "number") {
      const { width, height } = Image.resolveAssetSource(source);
      resolve({ width, height });
    } else if (typeof source === "string") {
      if (imageSizeCache[source]) {
        resolve(imageSizeCache[source]);
      } else {
        Image.getSize(
          source,
          (width, height) => {
            imageSizeCache[source] = { width, height };
            resolve({ width, height });
          },
          (error) => reject(error)
        );
      }
    } else if (source?.uri) {
      const uri = source.uri;
      if (imageSizeCache[uri]) {
        resolve(imageSizeCache[uri]);
      } else {
        Image.getSize(
          uri,
          (width, height) => {
            imageSizeCache[uri] = { width, height };
            resolve({ width, height });
          },
          (error) => reject(error)
        );
      }
    } else {
      reject(new Error("Invalid image source"));
    }
  });
}

function isImageLike(value) {
  return (
    typeof value === "number" || // require()
    (typeof value === "string" &&
      (value.startsWith("http") || value.startsWith("file"))) ||
    (typeof value === "object" && value?.uri)
  );
}

const StonewallGrid = ({
  data = [],
  renderItem,
  columns = 2,
  horizontalSpacing = 12,
  verticalSpacing = 12,
  preserveOrder = false,
}) => {
  const [columnsData, setColumnsData] = useState([]);

  useEffect(() => {
    const prepareGrid = async () => {
      const columnHeights = Array(columns).fill(0);
      const tempColumns = Array.from({ length: columns }, () => []);

      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const columnWidth =
          (screenWidth - horizontalSpacing * (columns - 1)) / columns;

        let modifiedItem = { ...item };
        let totalHeight = 0;

        const keys = Object.keys(item);
        for (let key of keys) {
          const value = item[key];
          if (isImageLike(value)) {
            try {
              const resolvedSource =
                typeof value === "string" ? { uri: value } : value;
              const { width, height } = await getImageSize(resolvedSource);
              const scaledHeight = (height / width) * columnWidth;
              totalHeight += scaledHeight;

              modifiedItem[key] = {
                image: value,
                height: scaledHeight,
              };
            } catch (err) {
              console.warn("Image load failed:", err);
            }
          }
        }

        const columnIndex = preserveOrder
          ? i % columns
          : columnHeights.indexOf(Math.min(...columnHeights));

        columnHeights[columnIndex] += totalHeight + verticalSpacing;
        tempColumns[columnIndex].push(modifiedItem);
      }

      setColumnsData(tempColumns);
    };

    prepareGrid();
  }, [data, columns, horizontalSpacing, verticalSpacing, preserveOrder]);

  return (
    <View style={{ flexDirection: "row", paddingHorizontal: 2 }}>
      {columnsData.map((columnItems, colIndex) => (
        <View
          key={`col-${colIndex}`}
          style={{
            flex: 1,
            marginLeft: colIndex === 0 ? 0 : horizontalSpacing / 2,
            marginRight: colIndex === columns - 1 ? 0 : horizontalSpacing / 2,
          }}
        >
          {columnItems.map((item, index) => (
            <View
              key={item.id ?? index}
              style={{ marginBottom: verticalSpacing }}
            >
              {renderItem({ item })}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

export default StonewallGrid;
